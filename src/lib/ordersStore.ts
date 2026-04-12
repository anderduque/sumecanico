import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { FieldValue } from "firebase-admin/firestore";
import { getFirestoreDb } from "@/lib/productsStore";

export type OrderStatus = "new" | "taken" | "closed";

export type OrderItem = {
  productSlug: string;
  name: string;
  quantity: number;
  priceCents: number;
  currency: string;
};

export type OrderCustomer = {
  fullName: string;
  idNumber: string;
  phoneE164: string;
  email?: string;
  address: string;
};

export type OrderPayment = {
  methodId: string;
  methodName: string;
  reference?: string;
};

export type OrderRecord = {
  id: string;
  status: OrderStatus;
  createdAt: string;
  updatedAt?: string;
  takenAt?: string;
  closedAt?: string;
  customer: OrderCustomer;
  items: OrderItem[];
  totalCents: number;
  currency: string;
  payment: OrderPayment;
  message: string;
};

export type CreateOrderInput = {
  customer: OrderCustomer;
  items: OrderItem[];
  totalCents: number;
  currency: string;
  payment: OrderPayment;
  message: string;
};

const ordersFilePath = path.join(process.cwd(), "data", "orders.json");

function trimOrEmpty(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function clampInt(value: unknown, min: number, max: number) {
  const num = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(num)) return min;
  return Math.max(min, Math.min(max, Math.trunc(num)));
}

function isOrderRecord(x: unknown): x is OrderRecord {
  if (!x || typeof x !== "object") return false;
  const o = x as OrderRecord;
  if (typeof o.id !== "string" || o.id.trim() === "") return false;
  if (o.status !== "new" && o.status !== "taken" && o.status !== "closed") return false;
  if (typeof o.createdAt !== "string" || o.createdAt.trim() === "") return false;
  if (typeof o.totalCents !== "number" || !Number.isFinite(o.totalCents)) return false;
  if (typeof o.currency !== "string" || o.currency.trim() === "") return false;
  if (!o.customer || typeof o.customer !== "object") return false;
  if (typeof o.customer.fullName !== "string" || o.customer.fullName.trim() === "") return false;
  if (typeof o.customer.idNumber !== "string" || o.customer.idNumber.trim() === "") return false;
  if (typeof o.customer.phoneE164 !== "string" || o.customer.phoneE164.trim() === "") return false;
  if (o.customer.email !== undefined && typeof o.customer.email !== "string") return false;
  if (typeof o.customer.address !== "string" || o.customer.address.trim() === "") return false;
  if (!Array.isArray(o.items) || o.items.length === 0) return false;
  for (const item of o.items) {
    if (!item || typeof item !== "object") return false;
    const i = item as OrderItem;
    if (typeof i.productSlug !== "string") return false;
    if (typeof i.name !== "string" || i.name.trim() === "") return false;
    if (typeof i.quantity !== "number" || !Number.isFinite(i.quantity) || i.quantity <= 0) return false;
    if (typeof i.priceCents !== "number" || !Number.isFinite(i.priceCents) || i.priceCents < 0) return false;
    if (typeof i.currency !== "string" || i.currency.trim() === "") return false;
  }
  if (!o.payment || typeof o.payment !== "object") return false;
  if (typeof o.payment.methodId !== "string") return false;
  if (typeof o.payment.methodName !== "string") return false;
  if (o.payment.reference !== undefined && typeof o.payment.reference !== "string") return false;
  if (typeof o.message !== "string") return false;
  return true;
}

function toIsoString(value: unknown): string | undefined {
  if (!value) return undefined;
  if (typeof value === "string" && value.trim()) return value;
  const maybeTimestamp = value as { toDate?: () => Date };
  if (maybeTimestamp && typeof maybeTimestamp.toDate === "function") {
    try {
      return maybeTimestamp.toDate().toISOString();
    } catch {
      return undefined;
    }
  }
  return undefined;
}

async function readOrdersFile(): Promise<OrderRecord[]> {
  try {
    const raw = await readFile(ordersFilePath, "utf8");
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isOrderRecord);
  } catch {
    return [];
  }
}

async function writeOrdersFile(next: OrderRecord[]) {
  const json = JSON.stringify(next, null, 2) + "\n";
  await writeFile(ordersFilePath, json, "utf8");
}

function normalizeCreateInput(input: CreateOrderInput): CreateOrderInput {
  const items: OrderItem[] = (Array.isArray(input.items) ? input.items : [])
    .map((item) => ({
      productSlug: trimOrEmpty(item?.productSlug).slice(0, 120),
      name: trimOrEmpty(item?.name).slice(0, 180),
      quantity: clampInt(item?.quantity, 1, 999),
      priceCents: clampInt(item?.priceCents, 0, 10_000_000_00),
      currency: trimOrEmpty(item?.currency).toUpperCase().slice(0, 8),
    }))
    .filter((item) => item.name);

  return {
    customer: {
      fullName: trimOrEmpty(input.customer?.fullName).replace(/\s+/g, " ").slice(0, 120),
      idNumber: trimOrEmpty(input.customer?.idNumber).slice(0, 32),
      phoneE164: trimOrEmpty(input.customer?.phoneE164).slice(0, 32),
      email: trimOrEmpty(input.customer?.email).slice(0, 180) || undefined,
      address: trimOrEmpty(input.customer?.address).slice(0, 220),
    },
    items,
    totalCents: clampInt(input.totalCents, 0, 10_000_000_00),
    currency: trimOrEmpty(input.currency).toUpperCase().slice(0, 8) || "USD",
    payment: {
      methodId: trimOrEmpty(input.payment?.methodId).slice(0, 80),
      methodName: trimOrEmpty(input.payment?.methodName).slice(0, 120),
      reference: trimOrEmpty(input.payment?.reference).slice(0, 120) || undefined,
    },
    message: typeof input.message === "string" ? input.message.trim().slice(0, 4000) : "",
  };
}

export async function createOrder(input: CreateOrderInput): Promise<OrderRecord> {
  const normalized = normalizeCreateInput(input);
  const now = new Date().toISOString();

  const db = getFirestoreDb();
  if (db) {
    const docRef = await db.collection("orders").add({
      status: "new",
      createdAt: FieldValue.serverTimestamp(),
      customer: normalized.customer,
      items: normalized.items,
      totalCents: normalized.totalCents,
      currency: normalized.currency,
      payment: normalized.payment,
      message: normalized.message,
    });
    return {
      id: docRef.id,
      status: "new",
      createdAt: now,
      customer: normalized.customer,
      items: normalized.items,
      totalCents: normalized.totalCents,
      currency: normalized.currency,
      payment: normalized.payment,
      message: normalized.message,
    };
  }

  const list = await readOrdersFile();
  const record: OrderRecord = {
    id: randomUUID(),
    status: "new",
    createdAt: now,
    customer: normalized.customer,
    items: normalized.items,
    totalCents: normalized.totalCents,
    currency: normalized.currency,
    payment: normalized.payment,
    message: normalized.message,
  };
  const next = [record, ...list].slice(0, 2000);
  await writeOrdersFile(next);
  return record;
}

export async function getOrders(): Promise<OrderRecord[]> {
  const db = getFirestoreDb();
  if (db) {
    const snap = await db.collection("orders").orderBy("createdAt", "desc").limit(200).get();
    const list: OrderRecord[] = snap.docs
      .map((doc) => {
        const data = doc.data() as Record<string, unknown>;
        const createdAt = toIsoString(data.createdAt) ?? "";
        const updatedAt = toIsoString(data.updatedAt);
        const takenAt = toIsoString(data.takenAt);
        const closedAt = toIsoString(data.closedAt);
        const record: OrderRecord = {
          id: doc.id,
          status:
            data.status === "taken" || data.status === "closed" || data.status === "new"
              ? (data.status as OrderStatus)
              : "new",
          createdAt: createdAt || new Date().toISOString(),
          updatedAt,
          takenAt,
          closedAt,
          customer: data.customer as OrderCustomer,
          items: data.items as OrderItem[],
          totalCents: typeof data.totalCents === "number" ? data.totalCents : 0,
          currency: typeof data.currency === "string" ? data.currency : "USD",
          payment: data.payment as OrderPayment,
          message: typeof data.message === "string" ? data.message : "",
        };
        return isOrderRecord(record) ? record : null;
      })
      .filter((x) => x !== null);
    return list;
  }

  const list = await readOrdersFile();
  return list
    .slice()
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 200);
}

export async function updateOrder(
  id: string,
  patch: Partial<Pick<OrderRecord, "status" | "takenAt" | "closedAt">>,
): Promise<boolean> {
  const cleaned = id.trim();
  if (!cleaned) return false;

  const db = getFirestoreDb();
  if (db) {
    const update: Record<string, unknown> = {
      updatedAt: FieldValue.serverTimestamp(),
    };
    if (patch.status) update.status = patch.status;
    if (patch.takenAt) update.takenAt = patch.takenAt;
    if (patch.closedAt) update.closedAt = patch.closedAt;
    await db.collection("orders").doc(cleaned).set(update, { merge: true });
    return true;
  }

  const list = await readOrdersFile();
  const idx = list.findIndex((o) => o.id === cleaned);
  if (idx === -1) return false;
  const current = list[idx];
  const next: OrderRecord = {
    ...current,
    status: patch.status ?? current.status,
    takenAt: patch.takenAt ?? current.takenAt,
    closedAt: patch.closedAt ?? current.closedAt,
    updatedAt: new Date().toISOString(),
  };
  const updated = list.slice();
  updated[idx] = next;
  await writeOrdersFile(updated);
  return true;
}

