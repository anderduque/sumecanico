import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { revalidateTag, unstable_cache } from "next/cache";
import { getProductCoverImage, getProductImageUrls, type Product } from "@/lib/productTypes";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { FieldValue, getFirestore } from "firebase-admin/firestore";

const productsFilePath = path.join(process.cwd(), "data", "products.json");

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
    !["GREKIS", "GREBIS", "NOR", "OKAMI", "TOKICO", "GABRIEL", "MONROE", "OLDMAN EMU", "MASTER KING", "CIC", "TOYOTA ORIGINAL"].includes(
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

  if (getApps().length === 0) {
    const credential = hasServiceJson
      ? cert(JSON.parse(serviceAccountJson as string) as object)
      : cert({
          projectId: projectId as string,
          clientEmail: clientEmail as string,
          privateKey: (privateKey as string).replace(/\\n/g, "\n"),
        });
    initializeApp({ credential });
  }

  return getFirestore();
}

function removeUndefined<T extends Record<string, unknown>>(value: T) {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(value)) {
    if (v !== undefined) out[k] = v;
  }
  return out as T;
}

async function getProductsUncached(): Promise<Product[]> {
  const db = getFirestoreDb();
  if (db) {
    const snap = await db.collection("products").get();
    const list: Product[] = snap.docs
      .map((d: { data: () => unknown }) => d.data())
      .filter(isProduct)
      .map(normalizeProduct)
      .sort((a: Product, b: Product) => a.name.localeCompare(b.name));
    return list;
  }

  const raw = await readFile(productsFilePath, "utf8");
  const parsed = JSON.parse(raw) as unknown;
  if (!Array.isArray(parsed)) return [];
  const list = parsed.filter(isProduct).map(normalizeProduct);
  return list;
}

function normalizeProduct(product: Product): Product {
  const imageUrls = getProductImageUrls(product);
  const normalizedShockBrand =
    product.shockBrand === "GREBIS" ? "GREKIS" : product.shockBrand;
  return {
    ...product,
    slug: product.slug.trim(),
    name: product.name.trim(),
    category: product.category.trim(),
    shockPosition:
      product.category.trim() === "Amortiguadores" ? product.shockPosition : undefined,
    sku: product.category.trim() === "Amortiguadores" ? product.sku?.trim() || undefined : undefined,
    shockBrand: product.category.trim() === "Amortiguadores" ? normalizedShockBrand : undefined,
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
  const db = getFirestoreDb();
  if (db) {
    const byId = await db.collection("products").doc(slug).get();
    if (byId.exists) {
      const data = byId.data() as unknown;
      return isProduct(data) ? normalizeProduct(data) : undefined;
    }

    const snap = await db
      .collection("products")
      .where("slug", "==", slug)
      .limit(1)
      .get();
    const found = snap.docs[0]?.data() as unknown;
    return isProduct(found) ? normalizeProduct(found) : undefined;
  }

  const list = await getProducts();
  return list.find((p) => p.slug === slug);
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
    const col = db.collection("products");
    const nextSlugs = new Set(deduped.map((p) => p.slug));
    const existing = await col.listDocuments();
    const batch = db.batch();

    for (const ref of existing) {
      if (!nextSlugs.has(ref.id)) batch.delete(ref);
    }

    for (const p of deduped) {
      batch.set(
        col.doc(p.slug),
        removeUndefined({ ...p, updatedAt: FieldValue.serverTimestamp() } as Record<string, unknown>),
      );
    }

    await batch.commit();
    revalidateTag("products", "max");
    return;
  }

  const json = JSON.stringify(deduped, null, 2) + "\n";
  await writeFile(productsFilePath, json, "utf8");
  revalidateTag("products", "max");
}

export async function upsertProduct(next: Product) {
  if (!isProduct(next)) return;
  const product = normalizeProduct(next);

  const db = getFirestoreDb();
  if (db) {
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
    revalidateTag("products", "max");
    return;
  }

  const list = await getProducts();
  const bySlug = new Map<string, Product>(list.map((p) => [p.slug, p]));
  bySlug.set(product.slug, product);
  await saveProducts(Array.from(bySlug.values()));
}

export async function deleteProduct(slug: string) {
  const cleaned = slug.trim();
  if (!cleaned) return;

  const db = getFirestoreDb();
  if (db) {
    await db.collection("products").doc(cleaned).delete();
    revalidateTag("products", "max");
    return;
  }

  const list = await getProducts();
  const next = list.filter((p) => p.slug !== cleaned);
  await saveProducts(next);
}
