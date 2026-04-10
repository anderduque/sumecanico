import { NextResponse } from "next/server";
import { getEnabledPaymentMethods } from "@/lib/paymentMethodsStore";

export const runtime = "nodejs";

export async function GET() {
  const methods = await getEnabledPaymentMethods();
  return NextResponse.json(methods, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

