import { NextResponse } from "next/server";
import { getProducts } from "@/lib/productsStore";

export const runtime = "nodejs";

export async function GET() {
  const products = await getProducts();
  return NextResponse.json(products, {
    headers: {
      "Cache-Control": "public, max-age=60, s-maxage=60, stale-while-revalidate=300",
    },
  });
}
