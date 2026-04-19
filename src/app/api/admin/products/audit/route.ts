import { NextResponse } from "next/server";
import { isAdminRequestAuthorized } from "@/lib/adminAuth";
import { getProductImageUrls } from "@/lib/productTypes";
import { getFirestoreDb, getProductsNoCache } from "@/lib/productsStore";

export const runtime = "nodejs";

function unauthorized() {
  return NextResponse.json({ error: "unauthorized" }, { status: 401 });
}

function isDataUrl(value: string) {
  return value.startsWith("data:");
}

export async function GET(request: Request) {
  if (!(await isAdminRequestAuthorized(new Headers(request.headers)))) return unauthorized();

  const db = getFirestoreDb();
  let totalDocs = 0;
  let invalidDocs = 0;
  const invalidDocIds: string[] = [];

  if (db) {
    const snap = await db.collection("products").get();
    totalDocs = snap.size;
    for (const doc of snap.docs) {
      const raw = doc.data() as unknown;
      const isValid = !!raw && typeof raw === "object" && typeof (raw as { slug?: unknown }).slug === "string";
      if (!isValid) {
        invalidDocs += 1;
        if (invalidDocIds.length < 10) invalidDocIds.push(doc.id);
      }
    }
  }

  const products = await getProductsNoCache();
  let productsWithLegacyImages = 0;
  let legacyImagesTotal = 0;
  let productsWithoutImages = 0;

  for (const product of products) {
    const urls = getProductImageUrls(product);
    if (urls.length === 0) productsWithoutImages += 1;
    const legacy = urls.filter(isDataUrl);
    if (legacy.length > 0) {
      productsWithLegacyImages += 1;
      legacyImagesTotal += legacy.length;
    }
  }

  return NextResponse.json({
    ok: true,
    totalDocs,
    invalidDocs,
    invalidDocIds,
    totalProducts: products.length,
    productsWithLegacyImages,
    legacyImagesTotal,
    productsWithoutImages,
  });
}

