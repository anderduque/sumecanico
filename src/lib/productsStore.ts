import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { revalidateTag, unstable_cache } from "next/cache";
import { getProductCoverImage, getProductImageUrls, type Product } from "@/lib/productTypes";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

const productsFilePath = path.join(process.cwd(), "data", "products.json");
const firestoreDocumentSoftLimitBytes = 900_000;
const firestoreBatchOperationLimit = 450;

export type ProductsStoreErrorCode =
  | "invalid_product"
  | "invalid_payload"
  | "payload_too_large"
  | "permission_denied"
  | "unauthenticated"
  | "invalid_argument"
  | "resource_exhausted"
  | "unavailable"
  | "firestore_config_invalid"
  | "read_failed"
  | "write_failed"
  | "unknown";

export class ProductsStoreError extends Error {
  code: ProductsStoreErrorCode;

  constructor(code: ProductsStoreErrorCode, message: string, options?: { cause?: unknown }) {
    super(message);
    this.name = "ProductsStoreError";
    this.code = code;
    if (options?.cause !== undefined) {
      this.cause = options.cause;
    }
  }
}

function getConfiguredStorageBucketName() {
  const explicit = process.env.FIREBASE_STORAGE_BUCKET;
  if (typeof explicit === "string" && explicit.trim() !== "") {
    return explicit.trim();
  }
  const projectId = process.env.FIREBASE_PROJECT_ID;
  if (typeof projectId === "string" && projectId.trim() !== "") {
    return `${projectId.trim()}.appspot.com`;
  }
  return null;
}

function getFirebaseAdminApp() {
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;

  const hasServiceJson = typeof serviceAccountJson === "string" && serviceAccountJson.trim() !== "";
  const hasPieces =
    typeof projectId === "string" &&
    projectId.trim() !== "" &&
    typeof clientEmail === "string" &&
    clientEmail.trim() !== "" &&
    typeof privateKey === "string" &&
    privateKey.trim() !== "";

  if (!hasServiceJson && !hasPieces) return null;

  try {
    if (getApps().length === 0) {
      const credential = hasServiceJson
        ? cert(JSON.parse(serviceAccountJson as string) as object)
        : cert({
            projectId: projectId as string,
            clientEmail: clientEmail as string,
            privateKey: (privateKey as string).replace(/\\n/g, "\n"),
          });
      initializeApp({ credential, storageBucket: getConfiguredStorageBucketName() ?? undefined });
    }
    return getApps()[0]!;
  } catch (err) {
    throw new ProductsStoreError(
      "firestore_config_invalid",
      "La configuración de credenciales de Firebase Admin es inválida.",
      { cause: err },
    );
  }
}

function classifyStoreErrorCode(err: unknown): ProductsStoreErrorCode {
  if (err instanceof ProductsStoreError) return err.code;
  const codeRaw = (err as { code?: unknown } | null)?.code;
  const code = typeof codeRaw === "string" ? codeRaw.toLowerCase() : "";
  const message = err instanceof Error ? err.message.toLowerCase() : String(err).toLowerCase();

  if (
    code.includes("permission-denied") ||
    message.includes("permission_denied") ||
    message.includes("permission denied")
  ) {
    return "permission_denied";
  }
  if (
    code.includes("unauthenticated") ||
    message.includes("unauthenticated")
  ) {
    return "unauthenticated";
  }
  if (
    code.includes("invalid-argument") ||
    message.includes("invalid_argument") ||
    message.includes("invalid argument")
  ) {
    return "invalid_argument";
  }
  if (
    code.includes("resource-exhausted") ||
    message.includes("resource_exhausted") ||
    (message.includes("maximum") && message.includes("size")) ||
    message.includes("too large")
  ) {
    return "payload_too_large";
  }
  if (
    code.includes("unavailable") ||
    code.includes("deadline-exceeded") ||
    message.includes("unavailable") ||
    message.includes("deadline exceeded")
  ) {
    return "unavailable";
  }
  return "unknown";
}

function wrapStoreReadError(err: unknown, message = "No se pudieron cargar los productos.") {
  if (err instanceof ProductsStoreError) return err;
  const code = classifyStoreErrorCode(err);
  if (code === "payload_too_large") {
    return new ProductsStoreError(code, "Un producto excede el tamaño soportado por Firestore.", { cause: err });
  }
  if (code === "permission_denied") {
    return new ProductsStoreError(code, "Firestore negó permisos para leer productos.", { cause: err });
  }
  if (code === "unauthenticated") {
    return new ProductsStoreError(code, "Firestore rechazó la autenticación al leer productos.", { cause: err });
  }
  if (code === "invalid_argument") {
    return new ProductsStoreError(code, "La consulta de productos a Firestore es inválida.", { cause: err });
  }
  if (code === "unavailable") {
    return new ProductsStoreError(code, "Firestore no está disponible temporalmente.", { cause: err });
  }
  return new ProductsStoreError("read_failed", message, { cause: err });
}

function wrapStoreWriteError(err: unknown, message = "No se pudo guardar el producto.") {
  if (err instanceof ProductsStoreError) return err;
  const code = classifyStoreErrorCode(err);
  if (code === "payload_too_large") {
    return new ProductsStoreError(code, "El producto excede el tamaño máximo permitido por Firestore.", { cause: err });
  }
  if (code === "permission_denied") {
    return new ProductsStoreError(code, "Firestore negó permisos para guardar productos.", { cause: err });
  }
  if (code === "unauthenticated") {
    return new ProductsStoreError(code, "Firestore rechazó la autenticación al guardar productos.", { cause: err });
  }
  if (code === "invalid_argument") {
    return new ProductsStoreError(code, "Los datos enviados a Firestore son inválidos.", { cause: err });
  }
  if (code === "unavailable") {
    return new ProductsStoreError(code, "Firestore no está disponible temporalmente.", { cause: err });
  }
  return new ProductsStoreError("write_failed", message, { cause: err });
}

function estimateUtf8Bytes(input: string) {
  return Buffer.byteLength(input, "utf8");
}

function estimateProductDocumentBytes(product: Product) {
  const serialized = JSON.stringify(
    removeUndefined({
      ...product,
      updatedAt: "__server_timestamp__",
    } as Record<string, unknown>),
  );
  return estimateUtf8Bytes(serialized);
}

function assertProductFitsFirestore(product: Product) {
  const bytes = estimateProductDocumentBytes(product);
  if (bytes > firestoreDocumentSoftLimitBytes) {
    throw new ProductsStoreError(
      "payload_too_large",
      `El producto excede el tamaño permitido para Firestore (${bytes} bytes).`,
    );
  }
}

function getDefaultStorageBucketName() {
  const explicit = process.env.FIREBASE_STORAGE_BUCKET;
  if (typeof explicit === "string" && explicit.trim() !== "") return explicit.trim();
  const projectId = process.env.FIREBASE_PROJECT_ID;
  if (typeof projectId === "string" && projectId.trim() !== "") return `${projectId.trim()}.appspot.com`;
  return "";
}

function buildFirebaseStoragePublicUrl(bucket: string, objectPath: string) {
  const cleanedBucket = bucket.trim();
  const cleanedObjectPath = objectPath.trim().replace(/^\/+/, "");
  if (!cleanedBucket || !cleanedObjectPath) return "";
  return `https://firebasestorage.googleapis.com/v0/b/${cleanedBucket}/o/${encodeURIComponent(cleanedObjectPath)}?alt=media`;
}

function normalizeProductImageUrl(raw: string) {
  const value = raw.trim();
  if (!value) return "";
  if (value.startsWith("data:")) return value;
  if (value.startsWith("http://") || value.startsWith("https://")) return value;

  if (value.startsWith("gs://")) {
    const withoutScheme = value.slice(5);
    const slashIndex = withoutScheme.indexOf("/");
    if (slashIndex <= 0) return value;
    const bucket = withoutScheme.slice(0, slashIndex);
    const objectPath = withoutScheme.slice(slashIndex + 1);
    return buildFirebaseStoragePublicUrl(bucket, objectPath) || value;
  }

  // Legacy format saved as object path only (e.g. products/slug/file.jpg)
  if (!value.includes("://")) {
    const bucket = getDefaultStorageBucketName();
    const normalized = buildFirebaseStoragePublicUrl(bucket, value);
    if (normalized) return normalized;
  }

  return value;
}

function normalizeSlugForLookup(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function buildSlugCandidates(rawSlug: string) {
  const candidates = new Set<string>();
  const direct = rawSlug.trim();
  if (direct) candidates.add(direct);
  try {
    const decoded = decodeURIComponent(direct);
    if (decoded.trim()) candidates.add(decoded.trim());
  } catch {
    // ignore malformed URI sequences
  }
  const normalized = normalizeSlugForLookup(direct);
  if (normalized) candidates.add(normalized);
  return Array.from(candidates);
}

function isProduct(x: unknown): x is Product {
  if (!x || typeof x !== "object") return false;
  const p = x as Product;
  if (typeof p.slug !== "string" || p.slug.trim() === "") return false;
  if (typeof p.name !== "string" || p.name.trim() === "") return false;
  if (typeof p.summary !== "string") return false;
  if (typeof p.category !== "string") return false;
  if (p.shockPosition !== undefined && p.shockPosition !== "delantero" && p.shockPosition !== "trasero") {
    return false;
  }
  if (p.sku !== undefined && typeof p.sku !== "string") return false;
  if (
    p.shockBrand !== undefined &&
    !["GREKIS", "NOR", "OKAMI", "TOKICO", "GABRIEL", "MONROE", "OLDMAN EMU", "MASTER KING", "CIC", "TOYOTA ORIGINAL"].includes(
      p.shockBrand,
    )
  ) {
    return false;
  }
  if (p.imageUrl !== undefined && typeof p.imageUrl !== "string") return false;
  if (p.imageUrls !== undefined) {
    if (!Array.isArray(p.imageUrls)) return false;
    for (const item of p.imageUrls) {
      if (typeof item !== "string") return false;
    }
  }
  if (p.pricingMode !== undefined && p.pricingMode !== "fixed" && p.pricingMode !== "check_availability") {
    return false;
  }
  if (typeof p.priceCents !== "number" || !Number.isFinite(p.priceCents)) return false;
  if (typeof p.currency !== "string" || p.currency.trim() === "") return false;
  if (p.stockStatus !== "in_stock" && p.stockStatus !== "on_request") return false;
  if (p.inventoryQty !== undefined) {
    if (typeof p.inventoryQty !== "number" || !Number.isFinite(p.inventoryQty)) return false;
    if (p.inventoryQty < 0) return false;
  }
  if (p.compatibleWith !== undefined && !Array.isArray(p.compatibleWith)) return false;
  if (p.specs !== undefined) {
    if (!Array.isArray(p.specs)) return false;
    for (const s of p.specs) {
      if (!s || typeof s !== "object") return false;
      const item = s as { label?: unknown; value?: unknown };
      if (typeof item.label !== "string") return false;
      if (typeof item.value !== "string") return false;
    }
  }
  return true;
}

export function getFirestoreDb() {
  const app = getFirebaseAdminApp();
  if (!app) return null;
  return getFirestore(app);
}

export function getStorageBucket() {
  const app = getFirebaseAdminApp();
  if (!app) return null;
  const bucketName = getConfiguredStorageBucketName();
  if (!bucketName) {
    throw new ProductsStoreError(
      "firestore_config_invalid",
      "Falta configurar FIREBASE_STORAGE_BUCKET para subir imágenes.",
    );
  }
  return getStorage(app).bucket(bucketName);
}

function removeUndefined<T extends Record<string, unknown>>(value: T) {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(value)) {
    if (v !== undefined) out[k] = v;
  }
  return out as T;
}

async function readProductsFile(): Promise<Product[]> {
  const raw = await readFile(productsFilePath, "utf8");
  const parsed = JSON.parse(raw) as unknown;
  if (!Array.isArray(parsed)) return [];
  return parsed.filter(isProduct).map(normalizeProduct);
}

async function writeProductsFile(products: Product[]) {
  await mkdir(path.dirname(productsFilePath), { recursive: true });
  await writeFile(productsFilePath, `${JSON.stringify(products, null, 2)}\n`, "utf8");
}

async function getProductsUncached(): Promise<Product[]> {
  const db = getFirestoreDb();
  if (db) {
    try {
      const snap = await db.collection("products").get();
      const list: Product[] = snap.docs
        .map((d: { data: () => unknown }) => d.data())
        .filter(isProduct)
        .map(normalizeProduct)
        .sort((a: Product, b: Product) => a.name.localeCompare(b.name));
      try {
        await writeProductsFile(list);
      } catch {
      }
      return list;
    } catch (err) {
      try {
        return await readProductsFile();
      } catch {
        throw wrapStoreReadError(err);
      }
    }
  }

  try {
    return await readProductsFile();
  } catch (err) {
    throw wrapStoreReadError(err);
  }
}

export async function getProductsNoCache(): Promise<Product[]> {
  return getProductsUncached();
}

function normalizeProduct(product: Product): Product {
  const imageUrls = getProductImageUrls(product).map(normalizeProductImageUrl);
  return {
    ...product,
    slug: product.slug.trim(),
    name: product.name.trim(),
    category: product.category.trim(),
    shockPosition:
      product.category.trim() === "Amortiguadores" ? product.shockPosition : undefined,
    sku: product.category.trim() === "Amortiguadores" ? product.sku?.trim() || undefined : undefined,
    shockBrand: product.category.trim() === "Amortiguadores" ? product.shockBrand : undefined,
    pricingMode: product.pricingMode === "check_availability" ? "check_availability" : "fixed",
    currency: product.currency.trim().toUpperCase(),
    imageUrl: getProductCoverImage({ imageUrl: product.imageUrl, imageUrls }),
    imageUrls: imageUrls.length ? imageUrls : undefined,
    priceCents:
      product.pricingMode === "check_availability" ? 0 : Math.max(0, Math.trunc(product.priceCents)),
    inventoryQty:
      typeof product.inventoryQty === "number" ? Math.max(0, Math.trunc(product.inventoryQty)) : undefined,
    specs:
      product.specs
        ?.map((s) => ({ label: s.label.trim(), value: s.value.trim() }))
        .filter((s) => s.label && s.value) ?? undefined,
  };
}

export const getProducts = unstable_cache(getProductsUncached, ["products"], {
  revalidate: 60,
  tags: ["products"],
});

async function getProductBySlugUncached(slug: string): Promise<Product | undefined> {
  const candidates = buildSlugCandidates(slug);
  const normalizedLookup = normalizeSlugForLookup(slug);
  const db = getFirestoreDb();
  if (db) {
    try {
      for (const candidate of candidates) {
        const byId = await db.collection("products").doc(candidate).get();
        if (byId.exists) {
          const data = byId.data() as unknown;
          if (isProduct(data)) return normalizeProduct(data);
        }
      }

      for (const candidate of candidates) {
        const snap = await db
          .collection("products")
          .where("slug", "==", candidate)
          .limit(1)
          .get();
        const found = snap.docs[0]?.data() as unknown;
        if (isProduct(found)) return normalizeProduct(found);
      }

      const list = await getProducts();
      for (const candidate of candidates) {
        const exact = list.find((p) => p.slug === candidate);
        if (exact) return exact;
      }
      if (!normalizedLookup) return undefined;
      return list.find((p) => normalizeSlugForLookup(p.slug) === normalizedLookup);
    } catch (err) {
      try {
        const list = await getProducts();
        for (const candidate of candidates) {
          const exact = list.find((p) => p.slug === candidate);
          if (exact) return exact;
        }
        if (normalizedLookup) {
          const normalizedMatch = list.find((p) => normalizeSlugForLookup(p.slug) === normalizedLookup);
          if (normalizedMatch) return normalizedMatch;
        }
      } catch {}

      try {
        const list = await readProductsFile();
        for (const candidate of candidates) {
          const exact = list.find((p) => p.slug === candidate);
          if (exact) return exact;
        }
        if (normalizedLookup) {
          return list.find((p) => normalizeSlugForLookup(p.slug) === normalizedLookup);
        }
      } catch {}

      throw wrapStoreReadError(err);
    }
  }

  const list = await getProducts();
  for (const candidate of candidates) {
    const exact = list.find((p) => p.slug === candidate);
    if (exact) return exact;
  }
  if (!normalizedLookup) return undefined;
  return list.find((p) => normalizeSlugForLookup(p.slug) === normalizedLookup);
}

export const getProductBySlug = unstable_cache(getProductBySlugUncached, ["productBySlug"], {
  revalidate: 60,
  tags: ["products"],
});

export async function saveProducts(nextProducts: Product[]) {
  const normalized = nextProducts.filter((p) => isProduct(p)).map(normalizeProduct);

  const bySlug = new Map<string, Product>();
  for (const p of normalized) bySlug.set(p.slug, p);
  const deduped = Array.from(bySlug.values());

  const db = getFirestoreDb();
  if (db) {
    try {
      const col = db.collection("products");
      const nextSlugs = new Set(deduped.map((p) => p.slug));
      const existing = await col.listDocuments();
      const ops: Array<
        | { kind: "delete"; slug: string }
        | { kind: "set"; slug: string; data: Record<string, unknown> }
      > = [];

      for (const ref of existing) {
        if (!nextSlugs.has(ref.id)) {
          ops.push({ kind: "delete", slug: ref.id });
        }
      }

      for (const p of deduped) {
        assertProductFitsFirestore(p);
        ops.push({
          kind: "set",
          slug: p.slug,
          data: removeUndefined({ ...p, updatedAt: FieldValue.serverTimestamp() } as Record<string, unknown>),
        });
      }

      for (let i = 0; i < ops.length; i += firestoreBatchOperationLimit) {
        const chunk = ops.slice(i, i + firestoreBatchOperationLimit);
        const batch = db.batch();
        for (const op of chunk) {
          const ref = col.doc(op.slug);
          if (op.kind === "delete") {
            batch.delete(ref);
          } else {
            batch.set(ref, op.data);
          }
        }
        await batch.commit();
      }

      revalidateTag("products", "max");
      return;
    } catch (err) {
      throw wrapStoreWriteError(err, "No se pudieron guardar los productos.");
    }
  }

  try {
    const json = JSON.stringify(deduped, null, 2) + "\n";
    await writeFile(productsFilePath, json, "utf8");
    revalidateTag("products", "max");
  } catch (err) {
    throw wrapStoreWriteError(err, "No se pudieron guardar los productos.");
  }
}

export async function upsertProduct(next: Product) {
  if (!isProduct(next)) {
    throw new ProductsStoreError("invalid_product", "El payload del producto no es válido.");
  }
  const product = normalizeProduct(next);

  const db = getFirestoreDb();
  if (db) {
    try {
      assertProductFitsFirestore(product);
      await db
        .collection("products")
        .doc(product.slug)
        .set(
          removeUndefined({
            ...product,
            updatedAt: FieldValue.serverTimestamp(),
          } as Record<string, unknown>),
          { merge: true },
        );
      try {
        const list = await readProductsFile();
        const bySlug = new Map<string, Product>(list.map((p) => [p.slug, p]));
        bySlug.set(product.slug, product);
        await writeProductsFile(
          Array.from(bySlug.values()).sort((a: Product, b: Product) => a.name.localeCompare(b.name)),
        );
      } catch {}
      revalidateTag("products", "max");
      return;
    } catch (err) {
      throw wrapStoreWriteError(err);
    }
  }

  const list = await getProductsUncached();
  const bySlug = new Map<string, Product>(list.map((p) => [p.slug, p]));
  bySlug.set(product.slug, product);
  await saveProducts(Array.from(bySlug.values()));
}

export async function deleteProduct(slug: string) {
  const cleaned = slug.trim();
  if (!cleaned) return;

  const db = getFirestoreDb();
  if (db) {
    try {
      await db.collection("products").doc(cleaned).delete();
      try {
        const list = await readProductsFile();
        await writeProductsFile(list.filter((p) => p.slug !== cleaned));
      } catch {}
      revalidateTag("products", "max");
      return;
    } catch (err) {
      throw wrapStoreWriteError(err, "No se pudo eliminar el producto.");
    }
  }

  const list = await getProductsUncached();
  const next = list.filter((p) => p.slug !== cleaned);
  await saveProducts(next);
}
