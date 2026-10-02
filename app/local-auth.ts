import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { env } from "cloudflare:workers";

export type LocalUser = {
  userId: string;
  displayName: string;
  email: string;
  role: string;
};

const COOKIE_NAME = "eco_session";
const OWNER = "louis.sittler2012@gmail.com";

function enc(input: string) {
  return new TextEncoder().encode(input);
}

function hex(buffer: ArrayBuffer) {
  return [...new Uint8Array(buffer)].map((x) => x.toString(16).padStart(2, "0")).join("");
}

function b64url(input: string) {
  return btoa(input).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

function fromB64url(input: string) {
  const base64 = input.replaceAll("-", "+").replaceAll("_", "/").padEnd(Math.ceil(input.length / 4) * 4, "=");
  return atob(base64);
}

async function secretKey() {
  const secret = (env as any).AUTH_SECRET || "eco-delegues-local-auth-secret";
  return crypto.subtle.importKey("raw", enc(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}

async function sign(value: string) {
  const key = await secretKey();
  return hex(await crypto.subtle.sign("HMAC", key, enc(value)));
}

export async function hashPassword(password: string) {
  const salt = crypto.randomUUID();
  const digest = await crypto.subtle.digest("SHA-256", enc(`${salt}:${password}`));
  return `${salt}:${hex(digest)}`;
}

export async function verifyPassword(password: string, stored: string | null) {
  if (!stored) return false;
  const [salt, expected] = stored.split(":");
  if (!salt || !expected) return false;
  const digest = await crypto.subtle.digest("SHA-256", enc(`${salt}:${password}`));
  return hex(digest) === expected;
}

export async function ensureAuthSchema() {
  await env.DB.prepare("ALTER TABLE members ADD COLUMN password_hash TEXT").run().catch(() => null);
  await env.DB.prepare("ALTER TABLE account_requests ADD COLUMN password_hash TEXT").run().catch(() => null);
}

export async function createSession(user: LocalUser) {
  const payload = b64url(JSON.stringify({ ...user, exp: Date.now() + 1000 * 60 * 60 * 24 * 14 }));
  const signature = await sign(payload);
  const jar = await cookies();
  jar.set(COOKIE_NAME, `${payload}.${signature}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  });
}

export async function clearSession() {
  const jar = await cookies();
  jar.set(COOKIE_NAME, "", { path: "/", maxAge: 0 });
}

export async function getLocalUser(): Promise<LocalUser | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (!token) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature || (await sign(payload)) !== signature) return null;
  try {
    const data = JSON.parse(fromB64url(payload));
    if (!data.exp || data.exp < Date.now()) return null;
    return {
      userId: String(data.userId),
      displayName: String(data.displayName),
      email: String(data.email),
      role: String(data.role),
    };
  } catch {
    return null;
  }
}

export async function requireLocalUser(): Promise<LocalUser> {
  const user = await getLocalUser();
  if (user) return user;
  redirect("/connexion");
}

export function ownerEmail() {
  return OWNER;
}
