import { pbkdf2Sync, randomBytes, timingSafeEqual } from "node:crypto";
import { getFirestoreDb } from "@/lib/productsStore";

type StoredAdminAuth = {
  salt: string;
  hash: string;
  iterations: number;
  keylen: number;
  digest: string;
};

function safeEqual(a: string, b: string) {
  const aBuf = Buffer.from(a, "utf8");
  const bBuf = Buffer.from(b, "utf8");
  if (aBuf.length !== bBuf.length) return false;
  return timingSafeEqual(aBuf, bBuf);
}

function parseBasicAuth(headers: { get(name: string): string | null }) {
  const auth = headers.get("authorization");
  if (!auth) return null;
  const match = auth.match(/^Basic\s+(.+)$/i);
  if (!match) return null;

  let decoded = "";
  try {
    decoded = Buffer.from(match[1], "base64").toString("utf8");
  } catch {
    return null;
  }

  const idx = decoded.indexOf(":");
  if (idx === -1) return null;
  const user = decoded.slice(0, idx);
  const password = decoded.slice(idx + 1);
  return { user, password };
}

async function getStoredAuth(): Promise<StoredAdminAuth | null> {
  const db = getFirestoreDb();
  if (!db) return null;

  try {
    const snap = await db.collection("admin").doc("auth").get();
    if (!snap.exists) return null;
    const data = snap.data() as Partial<StoredAdminAuth> | undefined;
    if (!data) return null;
    if (typeof data.salt !== "string" || !data.salt) return null;
    if (typeof data.hash !== "string" || !data.hash) return null;
    if (typeof data.iterations !== "number" || !Number.isFinite(data.iterations)) return null;
    if (typeof data.keylen !== "number" || !Number.isFinite(data.keylen)) return null;
    if (typeof data.digest !== "string" || !data.digest) return null;
    return {
      salt: data.salt,
      hash: data.hash,
      iterations: Math.trunc(data.iterations),
      keylen: Math.trunc(data.keylen),
      digest: data.digest,
    };
  } catch {
    return null;
  }
}

function derivePasswordHash(password: string, saltBase64: string, params: StoredAdminAuth) {
  const salt = Buffer.from(saltBase64, "base64");
  const key = pbkdf2Sync(password, salt, params.iterations, params.keylen, params.digest);
  return key.toString("base64");
}

export function generatePasswordHash(password: string) {
  const salt = randomBytes(16).toString("base64");
  const params: StoredAdminAuth = {
    salt,
    hash: "",
    iterations: 150_000,
    keylen: 32,
    digest: "sha256",
  };
  const hash = derivePasswordHash(password, salt, params);
  return { ...params, hash };
}

export async function isAdminRequestAuthorized(headers: { get(name: string): string | null }) {
  const expectedUser = process.env.ADMIN_USER;
  const expectedPassword = process.env.ADMIN_PASSWORD;
  if (!expectedUser) return false;

  const parsed = parseBasicAuth(headers);
  if (!parsed) return false;
  if (!safeEqual(parsed.user, expectedUser)) return false;

  const stored = await getStoredAuth();
  if (!stored) {
    if (!expectedPassword) return false;
    return safeEqual(parsed.password, expectedPassword);
  }

  const derived = derivePasswordHash(parsed.password, stored.salt, stored);
  return safeEqual(derived, stored.hash);
}
