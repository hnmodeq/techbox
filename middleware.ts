import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const COOKIE = "tb_session";

// Routes that should be accessible without authentication
const PUBLIC_ADMIN_ROUTES = ["/admin/login"];

function getSecret(): Uint8Array {
  return new TextEncoder().encode(process.env.AUTH_SECRET || "dev-secret-please-change-32char!");
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Only protect /admin/* routes
  if (!pathname.startsWith("/admin")) return NextResponse.next();

  // Allow public admin routes (login page)
  if (PUBLIC_ADMIN_ROUTES.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Static files and API routes are handled separately
  if (pathname.startsWith("/admin/") && pathname.includes(".")) {
    return NextResponse.next();
  }

  // Check for session cookie
  const token = req.cookies.get(COOKIE)?.value;

  if (!token) {
    const loginUrl = new URL("/admin/login", req.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Verify the JWT
  try {
    const secret = getSecret();
    const { payload } = await jwtVerify(token, secret);

    if (!payload.sub) {
      throw new Error("No subject in token");
    }

    // We can't do a DB lookup in middleware (edge runtime),
    // but we verify the JWT is valid. Role checks happen in API routes.
    // Redirect to login if token is invalid
    return NextResponse.next();
  } catch {
    // Invalid or expired token → redirect to login
    const loginUrl = new URL("/admin/login", req.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: ["/admin/:path*"],
};
