import { NextResponse } from "next/server";
import { getEnabledPaymentMethods } from "@/lib/paymentMethodsStore";

export const runtime = "nodejs";

export async function GET() {
  const methods = await getEnabledPaymentMethods();
  return NextResponse.json(methods, {
    headers: {
      "Cache-Control": "public, max-age=60, s-maxage=60, stale-while-revalidate=300",
    },
  });
}
