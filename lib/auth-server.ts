import { cookies } from "next/headers";
import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { prisma } from "./db";
import bcrypt from "bcryptjs";

function isDeployedEnv() {
  return process.env.NODE_ENV === "production" || Boolean(process.env.VERCEL_ENV);
}

function getAuthSecret(): Uint8Array {
  const envSecret = process.env.AUTH_SECRET;

  // In production/preview: AUTH_SECRET must be set and at least 32 chars.
  // Keep this check lazy so importing auth helpers during `next build` does not
  // fail while Next is collecting route/page metadata. Runtime auth operations
  // still fail closed when the secret is missing or weak.
  if (isDeployedEnv()) {
    if (!envSecret || envSecret.length < 32) {
      throw new Error(
        "[auth-server] AUTH_SECRET must be set and at least 32 characters in production/preview. " +
        "Set it in your Vercel project settings → Environment Variables. " +
        "Generate one with: openssl rand -base64 48"
      );
    }
  }

  // Local dev: allow fallback (not recommended) so contributors can run pages
  // before they create a .env file. This fallback is never allowed in deploys.
  const fallback = "dev-secret-please-change-32char!";
  if (!envSecret) {
    console.warn("[auth-server] WARNING: AUTH_SECRET not set. Using dev fallback. Do NOT use in production.");
  }
  return new TextEncoder().encode(envSecret || fallback);
}

const COOKIE = "tb_session";

export async function hashPassword(p: string){ return bcrypt.hash(p, 10); }
export async function verifyPassword(p: string, hash: string){ return bcrypt.compare(p, hash); }

/**
 * SHA-256 hash a raw token before storing it. We never store raw verification /
 * reset tokens — only their hash — so a DB leak cannot be used to impersonate.
 */
export async function hashTokenSha256(token: string): Promise<string> {
  const data = new TextEncoder().encode(token);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Reject a session if the user has invalidated all sessions after the token
 * was issued. `sessionsInvalidatedAt` is stamped on password change/reset and
 * any other "revoke everywhere" event. Tokens issued *before* that moment die.
 */
function isSessionRevoked(payload: JWTPayload, invalidatedAt: Date | null): boolean {
  if (!invalidatedAt) return false;
  const revokedAtSec = Math.floor(invalidatedAt.getTime() / 1000);
  const iat = typeof payload.iat === "number" ? payload.iat : 0;
  return iat < revokedAtSec;
}

/** Invalidate every active JWT for a user by moving the revocation watermark forward. */
export async function invalidateAllSessions(userId: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: { sessionsInvalidatedAt: new Date() },
  });
}

/**
 * Create a fresh, hashed, single-use email-verification token for a user.
 * Old unused tokens for the user are deleted first. Returns the RAW token
 * (only safe to put in an email link) — only the hash is stored.
 */
export async function createEmailVerification(userId: string): Promise<{ rawToken: string; expiresAt: Date }> {
  await prisma.emailVerificationToken.deleteMany({
    where: { userId, used: false },
  });
  const rawToken = crypto.randomUUID();
  const tokenHash = await hashTokenSha256(rawToken);
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24h
  await prisma.emailVerificationToken.create({
    data: { userId, token: tokenHash, expiresAt },
  });
  return { rawToken, expiresAt };
}

export async function createSession(userId: string){
  return await new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(getAuthSecret());
}

export async function getSessionUser(){
  const c = await cookies();
  const token = c.get(COOKIE)?.value;

  if (!token) return null;

  let payload: JWTPayload;
  try {
    const verified = await jwtVerify(token, getAuthSecret());
    payload = verified.payload;
  } catch {
    return null; // Invalid, expired, or unverifiable token
  }

  const sub = String(payload.sub);
  if (!sub) return null;

  try {
    const user = await prisma.user.findUnique({ where: { id: sub }});
    if (!user) return null;

    // Reject banned/suspended users
    if (user.status === "banned" || user.status === "suspended") return null;

    // Reject tokens issued before the user's last "revoke everywhere"
    if (isSessionRevoked(payload, user.sessionsInvalidatedAt)) return null;

    return user;
  } catch (err) {
    console.error("[auth-server] Failed to fetch session user:", err);
  }
  
  return null;
}

/**
 * Like getSessionUser but omits the password hash from the result.
 * Use this for general-purpose auth checks. Only use getSessionUser
 * directly when you explicitly need the password (e.g. change-password).
 */
export async function getSessionUserPublic(){
  const c = await cookies();
  const token = c.get(COOKIE)?.value;

  if (!token) return null;

  let payload: JWTPayload;
  try {
    const verified = await jwtVerify(token, getAuthSecret());
    payload = verified.payload;
  } catch {
    return null;
  }

  const sub = String(payload.sub);
  if (!sub) return null;

  try {
    const user = await prisma.user.findUnique({
      where: { id: sub },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        role: true,
        roleFa: true,
        status: true,
        job: true,
        birthday: true,
        modules: true,
        avatar: true,
        emailVerified: true,
        sessionsInvalidatedAt: true,
      },
    });
    if (!user) return null;
    if (user.status === "banned" || user.status === "suspended") return null;
    if (isSessionRevoked(payload, user.sessionsInvalidatedAt)) return null;
    return user;
  } catch (err) {
    console.error("[auth-server] Failed to fetch session user:", err);
  }

  return null;
}

export async function setSessionCookie(token: string){
  const c = await cookies();
  c.set(COOKIE, token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60*60*24*30 });
}
export async function clearSession(){
  const c = await cookies();
  c.delete(COOKIE);
}

export function canEditModule(
  user: { role: string; modules?: string | string[] | null } | null,
  module: string
) {
  if (!user) return false;
  if (user.role === "super_admin") return true;
  const mods = Array.isArray(user.modules) ? (user.modules as string[]) : [];
  return mods.includes(module);
}
