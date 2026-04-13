import { NextResponse } from "next/server";
import { isAdminRequestAuthorized } from "@/lib/adminAuth";
import type { PaymentMethod } from "@/lib/paymentMethodsStore";
import { getPaymentMethods, savePaymentMethods } from "@/lib/paymentMethodsStore";

export const runtime = "nodejs";

function unauthorized() {
  return NextResponse.json({ error: "unauthorized" }, { status: 401 });
}

function isPaymentMethodPayload(x: unknown): x is PaymentMethod {
  if (!x || typeof x !== "object") return false;
  const m = x as PaymentMethod;
  if (typeof m.id !== "string" || m.id.trim() === "") return false;
  if (typeof m.name !== "string" || m.name.trim() === "") return false;
  if (typeof m.details !== "string") return false;
  if (typeof m.enabled !== "boolean") return false;
  if (typeof m.sort !== "number" || !Number.isFinite(m.sort)) return false;
  return true;
}

export async function GET(request: Request) {
  if (!(await isAdminRequestAuthorized(new Headers(request.headers)))) return unauthorized();
  const methods = await getPaymentMethods();
  return NextResponse.json(methods, { headers: { "Cache-Control": "no-store" } });
}

export async function PUT(request: Request) {
  if (!(await isAdminRequestAuthorized(new Headers(request.headers)))) return unauthorized();
  const body = (await request.json()) as unknown;
  if (!Array.isArray(body) || !body.every(isPaymentMethodPayload)) {
    return NextResponse.json({ error: "invalid_payment_methods" }, { status: 400 });
  }
  await savePaymentMethods(body);
  return NextResponse.json({ ok: true });
}
