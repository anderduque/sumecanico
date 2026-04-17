import { NextResponse } from "next/server";
import { getProducts } from "@/lib/productsStore";

export const runtime = "nodejs";

export async function GET() {
  try {
    const products = await getProducts();
    return NextResponse.json(products, {
      headers: {
        "Cache-Control": "public, max-age=60, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch {
    return NextResponse.json(
      {
        error: "load_failed",
        message: "No se pudieron cargar los repuestos en este momento. Intenta nuevamente.",
      },
      { status: 503 },
    );
  }
}
