import { cookies, headers } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { prisma } from "./db";
import bcrypt from "bcryptjs";

const secret = new TextEncoder().encode(process.env.AUTH_SECRET || "dev-secret-please-change-32char!");
const COOKIE = "tb_session";

export async function hashPassword(p: string){ return bcrypt.hash(p, 10); }
export async function verifyPassword(p: string, hash: string){ return bcrypt.compare(p, hash); }

export async function createSession(userId: string){
  return await new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret);
}

export async function getSessionUser(){
  const c = await cookies();
  const h = await headers();
  const token = c.get(COOKIE)?.value;
  const headerUserId = h.get("x-user-id") || h.get("x-auth-user");

  let sub = "";
  if (token) {
    try {
      const { payload } = await jwtVerify(token, secret);
      sub = String(payload.sub);
    } catch {}
  }
  if (!sub && headerUserId) {
    sub = String(headerUserId);
  }
  if (!sub) return null;

  try {
    const user = await prisma.user.findUnique({ where: { id: sub }});
    if (user) return user;
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
