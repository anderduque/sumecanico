import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Product } from "@/lib/productTypes";
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
  if (p.imageUrl !== undefined && typeof p.imageUrl !== "string") return false;
  if (typeof p.priceCents !== "number" || !Number.isFinite(p.priceCents)) return false;
  if (typeof p.currency !== "string" || p.currency.trim() === "") return false;
  if (p.stockStatus !== "in_stock" && p.stockStatus !== "on_request") return false;
  if (p.inventoryQty !== undefined) {
    if (typeof p.inventoryQty !== "number" || !Number.isFinite(p.inventoryQty)) return false;
    if (p.inventoryQty < 0) return false;
  }
  if (p.compatibleWith !== undefined && !Array.isArray(p.compatibleWith)) return false;
  return true;
}

function getFirestoreDb() {
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

export async function getProducts(): Promise<Product[]> {
  const db = getFirestoreDb();
  if (db) {
    const snap = await db.collection("products").get();
    const list: Product[] = snap.docs
      .map((d: { data: () => unknown }) => d.data())
      .filter(isProduct)
      .sort((a: Product, b: Product) => a.name.localeCompare(b.name));
    return list;
  }

  const raw = await readFile(productsFilePath, "utf8");
  const parsed = JSON.parse(raw) as unknown;
  if (!Array.isArray(parsed)) return [];
  const list = parsed.filter(isProduct);
  return list;
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  const db = getFirestoreDb();
  if (db) {
    const doc = await db.collection("products").doc(slug).get();
    if (!doc.exists) return undefined;
    const data = doc.data() as unknown;
    return isProduct(data) ? data : undefined;
  }

  const list = await getProducts();
  return list.find((p) => p.slug === slug);
}

export async function saveProducts(nextProducts: Product[]) {
  const normalized = nextProducts
    .filter((p) => isProduct(p))
    .map((p) => ({
      ...p,
      slug: p.slug.trim(),
      name: p.name.trim(),
      category: p.category.trim(),
      currency: p.currency.trim().toUpperCase(),
      imageUrl: p.imageUrl?.trim() ? p.imageUrl.trim() : undefined,
      inventoryQty:
        typeof p.inventoryQty === "number" ? Math.max(0, Math.trunc(p.inventoryQty)) : undefined,
    }));

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
    return;
  }

  const json = JSON.stringify(deduped, null, 2) + "\n";
  await writeFile(productsFilePath, json, "utf8");
}

export async function upsertProduct(next: Product) {
  if (!isProduct(next)) return;
  const product: Product = {
    ...next,
    slug: next.slug.trim(),
    name: next.name.trim(),
    category: next.category.trim(),
    currency: next.currency.trim().toUpperCase(),
    imageUrl: next.imageUrl?.trim() ? next.imageUrl.trim() : undefined,
    inventoryQty:
      typeof next.inventoryQty === "number" ? Math.max(0, Math.trunc(next.inventoryQty)) : undefined,
  };

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
    return;
  }

  const list = await getProducts();
  const next = list.filter((p) => p.slug !== cleaned);
  await saveProducts(next);
}
