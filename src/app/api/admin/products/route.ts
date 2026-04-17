import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { isAdminRequestAuthorized } from "@/lib/adminAuth";
import type { Product } from "@/lib/productTypes";
import { deleteProduct, getProducts, upsertProduct } from "@/lib/productsStore";

export const runtime = "nodejs";

function unauthorized() {
  return NextResponse.json({ error: "unauthorized" }, { status: 401 });
}

function isProductPayload(x: unknown): x is Product {
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

function classifySaveError(err: unknown) {
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
  const products = await getProducts();
  return NextResponse.json(products, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  if (!(await isAdminRequestAuthorized(new Headers(request.headers)))) return unauthorized();
  const body = (await request.json()) as unknown;
  if (!isProductPayload(body)) {
    return NextResponse.json({ error: "invalid_product" }, { status: 400 });
  }
  const existing = await getProducts();
  if (existing.some((p) => p.slug === body.slug.trim())) {
    return NextResponse.json({ error: "slug_exists" }, { status: 409 });
  }
  try {
    await upsertProduct(body);
    revalidateTag("products", "max");
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: "save_failed", detail: classifySaveError(err) }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  if (!(await isAdminRequestAuthorized(new Headers(request.headers)))) return unauthorized();
  const body = (await request.json()) as unknown;
  if (!isProductPayload(body)) {
    return NextResponse.json({ error: "invalid_product" }, { status: 400 });
  }
  try {
    await upsertProduct(body);
    revalidateTag("products", "max");
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: "save_failed", detail: classifySaveError(err) }, { status: 500 });
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
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "delete_failed" }, { status: 500 });
  }
}
