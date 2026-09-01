import { getCookie, setCookie, deleteCookie } from "@tanstack/react-start/server";

export const SESSION_COOKIE = "wr_admin_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 8; // 8h

export async function sha256(value: string): Promise<string> {
  const data = new TextEncoder().encode(value);
  const digest = await globalThis.crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function randomToken(): string {
  const bytes = new Uint8Array(32);
  globalThis.crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function timingSafeEqualStr(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function getAdminDb() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

export async function createSession(): Promise<void> {
  const db = await getAdminDb();
  const token = randomToken();
  const tokenHash = await sha256(token);
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

  await db.from("admin_sessions").insert({
    token_hash: tokenHash,
    expires_at: expiresAt.toISOString(),
  });

  setCookie(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: Math.floor(SESSION_TTL_MS / 1000),
  });
}

export async function destroySession(): Promise<void> {
  const token = getCookie(SESSION_COOKIE);
  if (token) {
    const db = await getAdminDb();
    await db.from("admin_sessions").delete().eq("token_hash", await sha256(token));
  }
  deleteCookie(SESSION_COOKIE, { path: "/" });
}

/** Zwraca true gdy bieżące żądanie ma ważną sesję administratora. */
export async function isAuthenticated(): Promise<boolean> {
  const token = getCookie(SESSION_COOKIE);
  if (!token) return false;
  const db = await getAdminDb();
  const { data } = await db
    .from("admin_sessions")
    .select("id, expires_at")
    .eq("token_hash", await sha256(token))
    .maybeSingle();
  if (!data) return false;
  if (new Date(data.expires_at).getTime() < Date.now()) {
    await db.from("admin_sessions").delete().eq("id", data.id);
    return false;
  }
  return true;
}

export async function requireAdmin() {
  if (!(await isAuthenticated())) {
    throw new Error("UNAUTHORIZED");
  }
  return getAdminDb();
}

export async function logAudit(
  action: string,
  employeeId: string | null,
  details: string,
): Promise<void> {
  const db = await getAdminDb();
  await db.from("audit_log").insert({ action, employee_id: employeeId, details });
}
