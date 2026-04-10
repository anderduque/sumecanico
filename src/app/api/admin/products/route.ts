import { NextResponse } from "next/server";
import { isAdminRequestAuthorized } from "@/lib/adminAuth";
import type { Product } from "@/lib/productTypes";
import { deleteProduct, getProducts, upsertProduct } from "@/lib/productsStore";

export const runtime = "nodejs";

function unauthorized() {
  return new NextResponse("Unauthorized", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Admin"' },
  });
}

function isProductPayload(x: unknown): x is Product {
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

export async function GET(request: Request) {
  if (!isAdminRequestAuthorized(new Headers(request.headers))) return unauthorized();
  const products = await getProducts();
  return NextResponse.json(products, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  if (!isAdminRequestAuthorized(new Headers(request.headers))) return unauthorized();
  const body = (await request.json()) as unknown;
  if (!isProductPayload(body)) {
    return NextResponse.json({ error: "invalid_product" }, { status: 400 });
  }
  const existing = await getProducts();
  if (existing.some((p) => p.slug === body.slug.trim())) {
    return NextResponse.json({ error: "slug_exists" }, { status: 409 });
  }
  await upsertProduct(body);
  return NextResponse.json({ ok: true });
}

export async function PUT(request: Request) {
  if (!isAdminRequestAuthorized(new Headers(request.headers))) return unauthorized();
  const body = (await request.json()) as unknown;
  if (!isProductPayload(body)) {
    return NextResponse.json({ error: "invalid_product" }, { status: 400 });
  }
  await upsertProduct(body);
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  if (!isAdminRequestAuthorized(new Headers(request.headers))) return unauthorized();
  const body = (await request.json()) as unknown;
  const slug = typeof (body as { slug?: unknown })?.slug === "string" ? (body as { slug: string }).slug : "";
  if (!slug.trim()) return NextResponse.json({ error: "missing_slug" }, { status: 400 });
  await deleteProduct(slug);
  return NextResponse.json({ ok: true });
}

