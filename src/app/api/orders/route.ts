import { NextResponse } from "next/server";
import { createOrder } from "@/lib/ordersStore";

export const runtime = "nodejs";

function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

export async function POST(request: Request) {
  const body = (await request.json()) as unknown;
  if (!body || typeof body !== "object") return badRequest("invalid_payload");
  const payload = body as Record<string, unknown>;

  const customer = payload.customer as Record<string, unknown> | undefined;
  const payment = payload.payment as Record<string, unknown> | undefined;
  const items = Array.isArray(payload.items) ? (payload.items as unknown[]) : [];

  if (!customer || typeof customer !== "object") return badRequest("missing_customer");
  if (!payment || typeof payment !== "object") return badRequest("missing_payment");
  if (items.length === 0) return badRequest("missing_items");

  const fullName = typeof customer.fullName === "string" ? customer.fullName : "";
  const idNumber = typeof customer.idNumber === "string" ? customer.idNumber : "";
  const phoneE164 = typeof customer.phoneE164 === "string" ? customer.phoneE164 : "";
  const email = typeof customer.email === "string" ? customer.email : undefined;
  const address = typeof customer.address === "string" ? customer.address : "";

  if (!fullName.trim() || !idNumber.trim() || !phoneE164.trim() || !address.trim()) {
    return badRequest("missing_required_fields");
  }

  const methodId = typeof payment.methodId === "string" ? payment.methodId : "";
  const methodName = typeof payment.methodName === "string" ? payment.methodName : "";
  const reference = typeof payment.reference === "string" ? payment.reference : undefined;
  if (!methodId.trim() || !methodName.trim()) return badRequest("missing_payment_method");

  const totalCents = typeof payload.totalCents === "number" ? payload.totalCents : Number(payload.totalCents);
  if (!Number.isFinite(totalCents) || totalCents < 0) return badRequest("invalid_total");
  const currency = typeof payload.currency === "string" ? payload.currency : "USD";
  const message = typeof payload.message === "string" ? payload.message : "";

  const normalizedItems = items
    .map((x) => (x && typeof x === "object" ? (x as Record<string, unknown>) : null))
    .filter((x) => x !== null)
    .map((x) => ({
      productSlug: typeof x.productSlug === "string" ? x.productSlug : "",
      name: typeof x.name === "string" ? x.name : "",
      quantity: typeof x.quantity === "number" ? x.quantity : Number(x.quantity),
      priceCents: typeof x.priceCents === "number" ? x.priceCents : Number(x.priceCents),
      currency: typeof x.currency === "string" ? x.currency : currency,
    }))
    .filter((x) => x.name.trim() && Number.isFinite(x.quantity) && x.quantity > 0);

  if (normalizedItems.length === 0) return badRequest("invalid_items");

  const created = await createOrder({
    customer: {
      fullName,
      idNumber,
      phoneE164,
      email,
      address,
    },
    items: normalizedItems,
    totalCents,
    currency,
    payment: { methodId, methodName, reference },
    message,
  });

  return NextResponse.json({ ok: true, id: created.id }, { headers: { "Cache-Control": "no-store" } });
}

