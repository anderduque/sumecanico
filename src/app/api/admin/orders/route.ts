import { NextResponse } from "next/server";
import { isAdminRequestAuthorized } from "@/lib/adminAuth";
import { getOrders, updateOrder } from "@/lib/ordersStore";

export const runtime = "nodejs";

function unauthorized() {
  return NextResponse.json({ error: "unauthorized" }, { status: 401 });
}

export async function GET(request: Request) {
  if (!(await isAdminRequestAuthorized(new Headers(request.headers)))) return unauthorized();
  const orders = await getOrders();
  return NextResponse.json(orders, { headers: { "Cache-Control": "no-store" } });
}

export async function PUT(request: Request) {
  if (!(await isAdminRequestAuthorized(new Headers(request.headers)))) return unauthorized();
  const body = (await request.json()) as unknown;
  const id = typeof (body as { id?: unknown })?.id === "string" ? (body as { id: string }).id : "";
  const status =
    typeof (body as { status?: unknown })?.status === "string"
      ? ((body as { status: string }).status as "new" | "taken" | "closed")
      : undefined;

  if (!id.trim()) return NextResponse.json({ error: "missing_id" }, { status: 400 });
  if (status && status !== "new" && status !== "taken" && status !== "closed") {
    return NextResponse.json({ error: "invalid_status" }, { status: 400 });
  }

  const nowIso = new Date().toISOString();
  const patch =
    status === "taken"
      ? { status, takenAt: nowIso }
      : status === "closed"
      ? { status, closedAt: nowIso }
      : status
      ? { status }
      : {};

  const ok = await updateOrder(id, patch);
  if (!ok) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
