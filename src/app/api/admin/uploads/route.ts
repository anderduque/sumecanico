import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { isAdminRequestAuthorized } from "@/lib/adminAuth";
import { ProductsStoreError, getStorageBucket } from "@/lib/productsStore";

export const runtime = "nodejs";

const maxUploadImageBytes = 2_000_000;
const allowedImageMimeTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

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

function classifyUploadError(err: unknown) {
  if (err instanceof ProductsStoreError) return err.code;
  const codeRaw = (err as { code?: unknown } | null)?.code;
  const code = typeof codeRaw === "string" ? codeRaw.toLowerCase() : "";
  const message = err instanceof Error ? err.message.toLowerCase() : String(err).toLowerCase();
  if (code.includes("permission-denied") || message.includes("permission denied")) return "permission_denied";
  if (code.includes("unauthenticated") || message.includes("unauthenticated")) return "unauthenticated";
  if (code.includes("invalid-argument") || message.includes("invalid argument")) return "invalid_argument";
  if (code.includes("resource-exhausted") || message.includes("too large")) return "payload_too_large";
  if (code.includes("unavailable") || message.includes("unavailable")) return "unavailable";
  return "unknown";
}

export async function POST(request: Request) {
  if (!(await isAdminRequestAuthorized(new Headers(request.headers)))) return unauthorized();

  try {
    const form = await request.formData();
    const image = form.get("image");
    const productSlugRaw = typeof form.get("productSlug") === "string" ? String(form.get("productSlug")) : "";
    const productSlug = sanitizeSlug(productSlugRaw);

    if (!(image instanceof File)) {
      return NextResponse.json(
        { error: "invalid_image", message: "No se recibió un archivo de imagen válido." },
        { status: 400 },
      );
    }
    if (!allowedImageMimeTypes.has(image.type)) {
      return NextResponse.json(
        { error: "invalid_image_type", message: "Formato no soportado. Usa JPG, PNG o WEBP." },
        { status: 400 },
      );
    }
    if (image.size <= 0) {
      return NextResponse.json({ error: "empty_image", message: "La imagen está vacía." }, { status: 400 });
    }
    if (image.size > maxUploadImageBytes) {
      return NextResponse.json(
        { error: "payload_too_large", message: "La imagen excede el límite de 2MB." },
        { status: 413 },
      );
    }

    const bucket = getStorageBucket();
    if (!bucket) {
      return NextResponse.json(
        { error: "storage_not_configured", message: "Firebase Storage no está configurado en el servidor." },
        { status: 500 },
      );
    }

    const fileExt = extensionFromMimeType(image.type);
    const fileName = `${Date.now()}-${randomUUID().slice(0, 8)}.${fileExt}`;
    const objectPath = `products/${productSlug}/${fileName}`;
    const downloadToken = randomUUID();
    const bytes = Buffer.from(await image.arrayBuffer());

    const file = bucket.file(objectPath);
    await file.save(bytes, {
      resumable: false,
      metadata: {
        contentType: image.type,
        cacheControl: "public,max-age=31536000,immutable",
        metadata: {
          firebaseStorageDownloadTokens: downloadToken,
        },
      },
    });

    const encodedPath = encodeURIComponent(objectPath);
    const url = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodedPath}?alt=media&token=${downloadToken}`;

    return NextResponse.json({ ok: true, url });
  } catch (err) {
    const detail = classifyUploadError(err);
    return NextResponse.json(
      {
        error: "upload_failed",
        detail,
        message:
          detail === "permission_denied"
            ? "No se pudo subir la imagen: permisos insuficientes en Storage."
            : detail === "firestore_config_invalid"
              ? "No se pudo subir la imagen: configuración de Firebase inválida."
              : "No se pudo subir la imagen. Intenta de nuevo.",
      },
      { status: 500 },
    );
  }
}
