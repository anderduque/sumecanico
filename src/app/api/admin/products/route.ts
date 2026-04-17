import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { isAdminRequestAuthorized } from "@/lib/adminAuth";
import type { Product } from "@/lib/productTypes";
import { ProductsStoreError, deleteProduct, getProductsNoCache, upsertProduct } from "@/lib/productsStore";

export const runtime = "nodejs";

function unauthorized() {
  return NextResponse.json({ error: "unauthorized" }, { status: 401 });
}

function validateProductPayload(x: unknown): { ok: true; product: Product } | { ok: false; detail: string; message: string } {
  if (!x || typeof x !== "object") {
    return { ok: false, detail: "invalid_payload", message: "El payload del producto es inválido." };
  }
  const p = x as Product;
  if (typeof p.slug !== "string" || p.slug.trim() === "") {
    return { ok: false, detail: "missing_slug", message: "El identificador (slug) es requerido." };
  }
  if (p.slug.trim().length > 120) {
    return { ok: false, detail: "slug_too_long", message: "El identificador (slug) es demasiado largo." };
  }
  if (typeof p.name !== "string" || p.name.trim() === "") {
    return { ok: false, detail: "missing_name", message: "El nombre del repuesto es requerido." };
  }
  if (p.name.trim().length > 180) {
    return { ok: false, detail: "name_too_long", message: "El nombre del repuesto es demasiado largo." };
  }
  if (typeof p.summary !== "string" || p.summary.trim() === "") {
    return { ok: false, detail: "missing_summary", message: "La descripción corta es requerida." };
  }
  if (typeof p.category !== "string" || p.category.trim() === "") {
    return { ok: false, detail: "missing_category", message: "La categoría es requerida." };
  }
  if (p.shockPosition !== undefined && p.shockPosition !== "delantero" && p.shockPosition !== "trasero") {
    return { ok: false, detail: "invalid_shock_position", message: "La posición del amortiguador es inválida." };
  }
  if (p.sku !== undefined && typeof p.sku !== "string") {
    return { ok: false, detail: "invalid_sku", message: "El SKU es inválido." };
  }
  if (
    p.shockBrand !== undefined &&
    !["GREKIS", "NOR", "OKAMI", "TOKICO", "GABRIEL", "MONROE", "OLDMAN EMU", "MASTER KING", "CIC", "TOYOTA ORIGINAL"].includes(
      p.shockBrand,
    )
  ) {
    return { ok: false, detail: "invalid_shock_brand", message: "La marca del amortiguador es inválida." };
  }
  if (p.imageUrl !== undefined && typeof p.imageUrl !== "string") {
    return { ok: false, detail: "invalid_image_url", message: "La portada del producto es inválida." };
  }
  if (p.imageUrls !== undefined) {
    if (!Array.isArray(p.imageUrls)) {
      return { ok: false, detail: "invalid_image_urls", message: "La lista de imágenes es inválida." };
    }
    if (p.imageUrls.length > 10) {
      return { ok: false, detail: "too_many_images", message: "Solo se permiten hasta 10 imágenes por producto." };
    }
    for (const item of p.imageUrls) {
      if (typeof item !== "string" || item.trim() === "") {
        return { ok: false, detail: "invalid_image_item", message: "Hay una imagen inválida en la galería." };
      }
    }
  }
  if (p.pricingMode !== undefined && p.pricingMode !== "fixed" && p.pricingMode !== "check_availability") {
    return { ok: false, detail: "invalid_pricing_mode", message: "El modo de precio es inválido." };
  }
  if (typeof p.priceCents !== "number" || !Number.isFinite(p.priceCents)) {
    return { ok: false, detail: "invalid_price", message: "El precio del producto es inválido." };
  }
  if ((p.pricingMode ?? "fixed") === "fixed" && p.priceCents <= 0) {
    return { ok: false, detail: "missing_price", message: "El precio debe ser mayor a cero." };
  }
  if (typeof p.currency !== "string" || p.currency.trim() === "") {
    return { ok: false, detail: "missing_currency", message: "La moneda es requerida." };
  }
  if (p.stockStatus !== "in_stock" && p.stockStatus !== "on_request") {
    return { ok: false, detail: "invalid_stock_status", message: "El estado de inventario es inválido." };
  }
  if (p.inventoryQty !== undefined) {
    if (typeof p.inventoryQty !== "number" || !Number.isFinite(p.inventoryQty)) {
      return { ok: false, detail: "invalid_inventory_qty", message: "La cantidad de inventario es inválida." };
    }
    if (p.inventoryQty < 0) {
      return { ok: false, detail: "invalid_inventory_qty", message: "La cantidad de inventario no puede ser negativa." };
    }
  }
  if (p.compatibleWith !== undefined && !Array.isArray(p.compatibleWith)) {
    return { ok: false, detail: "invalid_compatible_with", message: "La compatibilidad del producto es inválida." };
  }
  if (p.specs !== undefined) {
    if (!Array.isArray(p.specs)) {
      return { ok: false, detail: "invalid_specs", message: "Las especificaciones son inválidas." };
    }
    for (const s of p.specs) {
      if (!s || typeof s !== "object") {
        return { ok: false, detail: "invalid_specs_item", message: "Hay una especificación inválida." };
      }
      const item = s as { label?: unknown; value?: unknown };
      if (typeof item.label !== "string") {
        return { ok: false, detail: "invalid_specs_label", message: "Una etiqueta de especificación es inválida." };
      }
      if (typeof item.value !== "string") {
        return { ok: false, detail: "invalid_specs_value", message: "Un valor de especificación es inválido." };
      }
    }
  }
  return { ok: true, product: p };
}

function classifySaveError(err: unknown) {
  if (err instanceof ProductsStoreError) {
    return err.code;
  }
  const message = err instanceof Error ? err.message : String(err);
  const normalized = message.toLowerCase();
  if (normalized.includes("maximum") && normalized.includes("size")) return "payload_too_large";
  if (normalized.includes("too large")) return "payload_too_large";
  if (normalized.includes("resource_exhausted")) return "payload_too_large";
  if (normalized.includes("permission_denied")) return "permission_denied";
  if (normalized.includes("unauthenticated")) return "unauthenticated";
  if (normalized.includes("invalid_argument")) return "invalid_argument";
  return "unknown";
}

export async function GET(request: Request) {
  if (!(await isAdminRequestAuthorized(new Headers(request.headers)))) return unauthorized();
  try {
    const products = await getProductsNoCache();
    return NextResponse.json(products, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    return NextResponse.json(
      {
        error: "load_failed",
        detail: classifySaveError(err),
        message: "No se pudo cargar el catálogo. Verifica la conexión con Firestore e intenta de nuevo.",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  if (!(await isAdminRequestAuthorized(new Headers(request.headers)))) return unauthorized();
  let body: unknown;
  try {
    body = (await request.json()) as unknown;
  } catch {
    return NextResponse.json({ error: "invalid_json", message: "El cuerpo JSON del producto es inválido." }, { status: 400 });
  }
  const validation = validateProductPayload(body);
  if (!validation.ok) {
    return NextResponse.json(
      { error: "invalid_product", detail: validation.detail, message: validation.message },
      { status: 400 },
    );
  }
  const product = validation.product;
  try {
    const existing = await getProductsNoCache();
    if (existing.some((p) => p.slug === product.slug.trim())) {
      return NextResponse.json(
        { error: "slug_exists", detail: "slug_exists", message: "Ya existe un repuesto con ese identificador." },
        { status: 409 },
      );
    }
    await upsertProduct(product);
    revalidateTag("products", "max");
    return NextResponse.json({ ok: true, message: "Repuesto guardado correctamente." });
  } catch (err) {
    const detail = classifySaveError(err);
    return NextResponse.json(
      {
        error: "save_failed",
        detail,
        message:
          detail === "payload_too_large"
            ? "El producto es demasiado pesado para Firestore. Reduce cantidad o tamaño de imágenes."
            : "No se pudo guardar el producto en Firestore. Revisa la configuración y permisos.",
      },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  if (!(await isAdminRequestAuthorized(new Headers(request.headers)))) return unauthorized();
  let body: unknown;
  try {
    body = (await request.json()) as unknown;
  } catch {
    return NextResponse.json({ error: "invalid_json", message: "El cuerpo JSON del producto es inválido." }, { status: 400 });
  }
  const validation = validateProductPayload(body);
  if (!validation.ok) {
    return NextResponse.json(
      { error: "invalid_product", detail: validation.detail, message: validation.message },
      { status: 400 },
    );
  }
  try {
    await upsertProduct(validation.product);
    revalidateTag("products", "max");
    return NextResponse.json({ ok: true, message: "Repuesto actualizado correctamente." });
  } catch (err) {
    const detail = classifySaveError(err);
    return NextResponse.json(
      {
        error: "save_failed",
        detail,
        message:
          detail === "payload_too_large"
            ? "El producto es demasiado pesado para Firestore. Reduce cantidad o tamaño de imágenes."
            : "No se pudo actualizar el producto en Firestore. Revisa la configuración y permisos.",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  if (!(await isAdminRequestAuthorized(new Headers(request.headers)))) return unauthorized();
  const body = (await request.json()) as unknown;
  const slug = typeof (body as { slug?: unknown })?.slug === "string" ? (body as { slug: string }).slug : "";
  if (!slug.trim()) return NextResponse.json({ error: "missing_slug" }, { status: 400 });
  try {
    await deleteProduct(slug);
    revalidateTag("products", "max");
    return NextResponse.json({ ok: true, message: "Repuesto eliminado correctamente." });
  } catch (err) {
    return NextResponse.json(
      {
        error: "delete_failed",
        detail: classifySaveError(err),
        message: "No se pudo eliminar el producto. Revisa la conexión con Firestore.",
      },
      { status: 500 },
    );
  }
}
