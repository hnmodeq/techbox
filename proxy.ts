import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const COOKIE = "tb_session";

function getSecret(): Uint8Array {
  const envSecret = process.env.AUTH_SECRET;
  if (!envSecret || envSecret.length < 32) {
    throw new Error("[proxy] AUTH_SECRET must be set and at least 32 characters.");
  }
  return new TextEncoder().encode(envSecret);
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const protectedAdmin = pathname.startsWith("/admin") && pathname !== "/admin/login";
  const protectedAccount = pathname === "/account" || pathname.startsWith("/account/");
  if (!protectedAdmin && !protectedAccount) return NextResponse.next();

  const loginUrl = new URL("/login", req.url);
  loginUrl.searchParams.set("redirect", pathname);
  const token = req.cookies.get(COOKIE)?.value;
  if (!token) return NextResponse.redirect(loginUrl);

  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (!payload.sub) throw new Error("No subject in token");
    // Database-backed role and status checks remain authoritative in pages/APIs.
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: ["/admin/:path*", "/account/:path*", "/account"],
};
