import { NextRequest } from "next/server";

/**
 * Defense-in-depth CSRF protection via Origin verification.
 *
 * `SameSite=Lax` on the session cookie already blocks most cross-site state
 * changes, but browsers/edge-cases evolve. This rejects cookie-authenticated
 * state-changing requests whose Origin/Referer doesn't match our own site.
 *
 * Call at the top of any POST/PUT/PATCH/DELETE handler that relies on the
 * session cookie. Returns false when the request must be rejected.
 */
export function isSameOriginRequest(req: NextRequest): boolean {
  const method = req.method.toUpperCase();
  if (method === "GET" || method === "HEAD" || method === "OPTIONS") return true;

  const origin = req.headers.get("origin");
  const referer = req.headers.get("referer");

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!siteUrl) {
    // No configured site URL — can't verify origin. Fail open (SameSite still
    // protects) but log so the operator knows to set NEXT_PUBLIC_SITE_URL.
    return true;
  }

  let siteHost = siteUrl;
  try {
    siteHost = new URL(siteUrl).host;
  } catch {
    /* keep raw */
  }

  const candidate = origin || referer;
  if (!candidate) {
    // Some privacy-focused browsers strip Origin on same-site requests; Referer
    // should still be present for a navigation-triggered fetch. If both are
    // absent on a state-changing request, be conservative in production.
    return process.env.NODE_ENV !== "production";
  }

  try {
    return new URL(candidate).host === siteHost;
  } catch {
    return false;
  }
}
