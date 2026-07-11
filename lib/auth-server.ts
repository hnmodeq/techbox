import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
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
        "Set it in .env or Vercel environment variables."
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

  let sub = "";
  try {
    const { payload } = await jwtVerify(token, getAuthSecret());
    sub = String(payload.sub);
  } catch {
    return null; // Invalid, expired, or unverifiable token
  }

  if (!sub) return null;

  try {
    const user = await prisma.user.findUnique({ where: { id: sub }});
    if (!user) return null;

    // Reject banned/suspended users
    if (user.status === "banned" || user.status === "suspended") return null;

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

  let sub = "";
  try {
    const { payload } = await jwtVerify(token, getAuthSecret());
    sub = String(payload.sub);
  } catch {
    return null;
  }

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
      },
    });
    if (!user) return null;
    if (user.status === "banned" || user.status === "suspended") return null;
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

export function canEditModule(user: {role:string, modules:string}|null, module: string){
  if(!user) return false;
  if(user.role === "super_admin") return true;
  try{
    const mods: string[] = JSON.parse(user.modules || "[]");
    return mods.includes(module);
  }catch{ return false; }
}
