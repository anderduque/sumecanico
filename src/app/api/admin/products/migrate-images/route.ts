import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { isAdminRequestAuthorized } from "@/lib/adminAuth";
import { getProductImageUrls, type Product } from "@/lib/productTypes";
import { getProductsNoCache, getStorageBucket, upsertProduct } from "@/lib/productsStore";

export const runtime = "nodejs";

type DataUrlDecoded = {
  mimeType: string;
  bytes: Buffer;
};

function unauthorized() {
  return NextResponse.json({ error: "unauthorized" }, { status: 401 });
}

function sanitizeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "producto";
}

function extensionFromMimeType(mimeType: string) {
  if (mimeType === "image/png") return "png";
  if (mimeType === "image/webp") return "webp";
  return "jpg";
}

function decodeDataUrl(dataUrl: string): DataUrlDecoded | null {
  const match = dataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
  if (!match) return null;
  const mimeType = match[1]!;
  const base64 = match[2]!;
  const bytes = Buffer.from(base64, "base64");
  if (!bytes.length) return null;
  return { mimeType, bytes };
}

async function uploadImageToStorage(dataUrl: string, productSlug: string, index: number) {
  const decoded = decodeDataUrl(dataUrl);
  if (!decoded) return null;
  const bucket = getStorageBucket();
  if (!bucket) return null;

  const ext = extensionFromMimeType(decoded.mimeType);
  const fileName = `${Date.now()}-${index + 1}-${randomUUID().slice(0, 8)}.${ext}`;
  const objectPath = `products/${sanitizeSlug(productSlug)}/${fileName}`;
  const token = randomUUID();

  const file = bucket.file(objectPath);
  await file.save(decoded.bytes, {
    resumable: false,
    metadata: {
      contentType: decoded.mimeType,
      cacheControl: "public,max-age=31536000,immutable",
      metadata: {
        firebaseStorageDownloadTokens: token,
      },
    },
  });

  return `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(objectPath)}?alt=media&token=${token}`;
}

async function migrateProductImages(product: Product) {
  const imageUrls = getProductImageUrls(product);
  if (!imageUrls.length) {
    return { changed: false, migratedImages: 0, nextProduct: product };
  }

  let changed = false;
  let migratedImages = 0;
  const nextUrls: string[] = [];

  for (let i = 0; i < imageUrls.length; i += 1) {
    const current = imageUrls[i]!;
    if (!current.startsWith("data:")) {
      nextUrls.push(current);
      continue;
    }
    const uploaded = await uploadImageToStorage(current, product.slug, i);
    if (uploaded) {
      nextUrls.push(uploaded);
      changed = true;
      migratedImages += 1;
    } else {
      nextUrls.push(current);
    }
  }

  if (!changed) {
    return { changed: false, migratedImages: 0, nextProduct: product };
  }

  const nextProduct: Product = {
    ...product,
    imageUrl: nextUrls[0] ?? "",
    imageUrls: nextUrls,
  };
  return { changed: true, migratedImages, nextProduct };
}

export async function POST(request: Request) {
  if (!(await isAdminRequestAuthorized(new Headers(request.headers)))) return unauthorized();

  try {
    const products = await getProductsNoCache();
    let migratedProducts = 0;
    let migratedImages = 0;

    for (const product of products) {
      const result = await migrateProductImages(product);
      if (!result.changed) continue;
      await upsertProduct(result.nextProduct);
      migratedProducts += 1;
      migratedImages += result.migratedImages;
    }

    return NextResponse.json({
      ok: true,
      migratedProducts,
      migratedImages,
      message:
        migratedProducts > 0
          ? `Migración completa: ${migratedProducts} producto(s), ${migratedImages} imagen(es).`
          : "No se encontraron imágenes legacy para migrar.",
    });
  } catch {
    return NextResponse.json(
      {
        error: "migration_failed",
        message: "No se pudo ejecutar la migración de imágenes a Storage.",
      },
      { status: 500 },
    );
  }
}
