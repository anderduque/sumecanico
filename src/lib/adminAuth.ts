export function isAdminRequestAuthorized(headers: { get(name: string): string | null }) {
  const expectedUser = process.env.ADMIN_USER;
  const expectedPassword = process.env.ADMIN_PASSWORD;
  if (!expectedUser || !expectedPassword) return false;

  const auth = headers.get("authorization");
  if (!auth) return false;
  const match = auth.match(/^Basic\s+(.+)$/i);
  if (!match) return false;

  let decoded = "";
  try {
    decoded = Buffer.from(match[1], "base64").toString("utf8");
  } catch {
    return false;
  }

  const idx = decoded.indexOf(":");
  if (idx === -1) return false;
  const user = decoded.slice(0, idx);
  const password = decoded.slice(idx + 1);

  return user === expectedUser && password === expectedPassword;
}
