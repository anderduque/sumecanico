import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { revalidateTag, unstable_cache } from "next/cache";
import { FieldValue } from "firebase-admin/firestore";
import { getFirestoreDb } from "@/lib/productsStore";

export type PaymentMethod = {
  id: string;
  name: string;
  details: string;
  enabled: boolean;
  sort: number;
};

const paymentMethodsFilePath = path.join(process.cwd(), "data", "payment-methods.json");

function isPaymentMethod(x: unknown): x is PaymentMethod {
  if (!x || typeof x !== "object") return false;
  const m = x as PaymentMethod;
  if (typeof m.id !== "string" || m.id.trim() === "") return false;
  if (typeof m.name !== "string" || m.name.trim() === "") return false;
  if (typeof m.details !== "string") return false;
  if (typeof m.enabled !== "boolean") return false;
  if (typeof m.sort !== "number" || !Number.isFinite(m.sort)) return false;
  return true;
}

function removeUndefined<T extends Record<string, unknown>>(value: T) {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(value)) {
    if (v !== undefined) out[k] = v;
  }
  return out as T;
}

function normalize(method: PaymentMethod): PaymentMethod {
  return {
    id: method.id.trim(),
    name: method.name.trim(),
    details: method.details ?? "",
    enabled: !!method.enabled,
    sort: Number.isFinite(method.sort) ? Math.trunc(method.sort) : 0,
  };
}

async function getPaymentMethodsUncached(): Promise<PaymentMethod[]> {
  const db = getFirestoreDb();
  if (db) {
    const snap = await db.collection("paymentMethods").get();
    const list = snap.docs
      .map((d: { data: () => unknown }) => d.data())
      .filter(isPaymentMethod)
      .map(normalize)
      .sort((a, b) => (a.sort - b.sort) || a.name.localeCompare(b.name));
    return list;
  }

  try {
    const raw = await readFile(paymentMethodsFilePath, "utf8");
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(isPaymentMethod)
      .map(normalize)
      .sort((a, b) => (a.sort - b.sort) || a.name.localeCompare(b.name));
  } catch {
    return [];
  }
}

export const getPaymentMethods = unstable_cache(getPaymentMethodsUncached, ["payment-methods"], {
  revalidate: 60,
  tags: ["payment-methods"],
});

export async function getEnabledPaymentMethods(): Promise<PaymentMethod[]> {
  const all = await getPaymentMethods();
  return all.filter((m) => m.enabled);
}

export async function savePaymentMethods(nextMethods: PaymentMethod[]) {
  const normalized = nextMethods.filter(isPaymentMethod).map(normalize);
  const byId = new Map<string, PaymentMethod>();
  for (const m of normalized) byId.set(m.id, m);
  const deduped = Array.from(byId.values());

  const db = getFirestoreDb();
  if (db) {
    const col = db.collection("paymentMethods");
    const nextIds = new Set(deduped.map((m) => m.id));
    const existing = await col.listDocuments();
    const batch = db.batch();

    for (const ref of existing) {
      if (!nextIds.has(ref.id)) batch.delete(ref);
    }

    for (const m of deduped) {
      batch.set(
        col.doc(m.id),
        removeUndefined({
          ...m,
          updatedAt: FieldValue.serverTimestamp(),
        } as Record<string, unknown>),
      );
    }

    await batch.commit();
    revalidateTag("payment-methods", "max");
    return;
  }

  const json = JSON.stringify(deduped, null, 2) + "\n";
  await writeFile(paymentMethodsFilePath, json, "utf8");
  revalidateTag("payment-methods", "max");
}
