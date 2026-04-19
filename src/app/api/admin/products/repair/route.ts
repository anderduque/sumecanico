import { NextResponse } from "next/server";
import { isAdminRequestAuthorized } from "@/lib/adminAuth";
import { getProductsNoCache, upsertProduct } from "@/lib/productsStore";

export const runtime = "nodejs";

function unauthorized() {
  return NextResponse.json({ error: "unauthorized" }, { status: 401 });
}

export async function POST(request: Request) {
  if (!(await isAdminRequestAuthorized(new Headers(request.headers)))) return unauthorized();

  try {
    const products = await getProductsNoCache();
    let repaired = 0;

    for (const product of products) {
      await upsertProduct(product);
      repaired += 1;
    }

    return NextResponse.json({
      ok: true,
      repaired,
      message: `Normalización completa: ${repaired} producto(s).`,
    });
  } catch {
    return NextResponse.json(
      {
        error: "repair_failed",
        message: "No se pudo normalizar el catálogo.",
      },
      { status: 500 },
    );
  }
}

