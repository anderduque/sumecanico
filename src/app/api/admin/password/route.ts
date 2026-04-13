import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { generatePasswordHash, isAdminRequestAuthorized } from "@/lib/adminAuth";
import { getFirestoreDb } from "@/lib/productsStore";

export const runtime = "nodejs";

function unauthorized() {
  return NextResponse.json({ error: "unauthorized" }, { status: 401 });
}

function isAlphanumericPassword(value: string) {
  if (!/^[A-Za-z0-9]+$/.test(value)) return false;
  if (value.length < 8) return false;
  if (!/[A-Za-z]/.test(value)) return false;
  if (!/[0-9]/.test(value)) return false;
  return true;
}

export async function GET() {
  const db = getFirestoreDb();
  if (!db) return NextResponse.json({ canPersist: false, hasStoredPassword: false });
  const snap = await db.collection("admin").doc("auth").get();
  const data = snap.data() as { hash?: unknown; salt?: unknown } | undefined;
  const hasStoredPassword = !!data && typeof data.hash === "string" && typeof data.salt === "string";
  return NextResponse.json({ canPersist: true, hasStoredPassword });
}

export async function PUT(request: Request) {
  if (!(await isAdminRequestAuthorized(new Headers(request.headers)))) return unauthorized();

  const db = getFirestoreDb();
  if (!db) return NextResponse.json({ error: "no_persistence" }, { status: 501 });

  const body = (await request.json()) as unknown;
  const newPassword =
    typeof (body as { newPassword?: unknown })?.newPassword === "string"
      ? ((body as { newPassword: string }).newPassword ?? "")
      : "";

  if (!isAlphanumericPassword(newPassword)) {
    return NextResponse.json(
      { error: "invalid_password" },
      { status: 400 },
    );
  }

  const hashed = generatePasswordHash(newPassword);
  await db.collection("admin").doc("auth").set(
    {
      salt: hashed.salt,
      hash: hashed.hash,
      iterations: hashed.iterations,
      keylen: hashed.keylen,
      digest: hashed.digest,
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );

  return NextResponse.json({ ok: true });
}
