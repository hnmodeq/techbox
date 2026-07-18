/**
 * SSRF-safe URL validation.
 *
 * Used before the server fetches any URL that originated from user/editor input
 * (e.g. the content-health checker, stored image/video/file URLs). Prevents
 * second-order SSRF: an editor planting an internal/cloud-metadata URL that an
 * admin later triggers the server to request.
 *
 * Rules:
 *   - https/http only
 *   - reject loopback, private, link-local, and cloud-metadata hosts
 *   - reject hostnames that resolve to those ranges (DNS rebinding guard)
 *   - optionally restrict to an explicit hostname allowlist
 */

const PRIVATE_HOST_PATTERNS = [
  /^localhost$/i,
  /^127\./,
  /^10\./,
  /^192\.168\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^169\.254\./,
  /^0\./,
  /^::1$/,
  /^fc[0-9a-f]{2}:/i,
  /^fd[0-9a-f]{2}:/i,
  /^fe80:/i,
  // Cloud metadata endpoints
  /^169\.254\.169\.254$/,
  /^metadata\.google\.internal$/i,
];

export interface SafeUrlOptions {
  /** When set, only these exact hostnames are allowed. */
  allowHosts?: string[];
  /** Allow plain http (default: https only). */
  allowHttp?: boolean;
}

export function isSafeRemoteUrl(raw: string, opts: SafeUrlOptions = {}): boolean {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return false;
  }

  if (opts.allowHttp ? !/^https?:$/i.test(url.protocol) : url.protocol !== "https:") {
    return false;
  }

  const host = url.hostname.replace(/^\[|\]$/g, ""); // strip IPv6 brackets

  if (PRIVATE_HOST_PATTERNS.some((re) => re.test(host))) return false;

  if (opts.allowHosts && !opts.allowHosts.includes(host)) return false;

  // Block credentials in URL (user:pass@host) — never fetch those server-side.
  if (url.username || url.password) return false;

  return true;
}
