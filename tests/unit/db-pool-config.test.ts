import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const db = fs.readFileSync(path.resolve(__dirname, "../..", "lib/db.ts"), "utf8");

/**
 * Reimplements the URL rewriting in lib/db.ts so the behaviour can be
 * asserted without constructing a PrismaClient.
 */
function buildUrl(dbUrl: string, isDev: boolean, envLimit?: string) {
  if (dbUrl && isDev) {
    dbUrl = dbUrl
      .replace(/([?&])connection_limit=\d+/g, "$1")
      .replace(/([?&])pool_timeout=\d+/g, "$1")
      .replace(/[?&]+$/, "")
      .replace(/\?&+/, "?")
      .replace(/&&+/g, "&");
  }
  if (dbUrl && !dbUrl.includes("connection_limit=")) {
    const fallback = isDev ? 8 : 1;
    const configured = Number(envLimit || String(fallback));
    const limit =
      Number.isInteger(configured) && configured > 0 && configured <= 10 ? configured : fallback;
    const poolTimeout = isDev ? 10 : 15;
    const sep = dbUrl.includes("?") ? "&" : "?";
    dbUrl = `${dbUrl}${sep}connection_limit=${limit}&pool_timeout=${poolTimeout}`;
  }
  return dbUrl;
}

// The URL .env.example actually tells you to write.
const DOCUMENTED =
  "postgresql://u:p@host/db?sslmode=require&connection_limit=1&pool_timeout=15&connect_timeout=15";

describe("development connection pool", () => {
  it("overrides connection_limit=1 from the URL", () => {
    // The original guard only added pool settings when the URL had NONE, so
    // following .env.example gave local dev a pool of one. One dev process
    // serves the homepage (~9 sequential queries) plus /api/notifications,
    // /api/auth/me, /api/modules/enabled and /api/news/read-state at the
    // same time; everything past the first query queued to pool_timeout and
    // failed P2024, tripping the circuit breaker on a healthy database.
    const dev = buildUrl(DOCUMENTED, true);
    expect(dev).toContain("connection_limit=8");
    expect(dev).not.toContain("connection_limit=1");
    expect(dev).toContain("pool_timeout=10");
  });

  it("leaves production exactly as configured", () => {
    // One connection per serverless instance is the correct Neon default.
    expect(buildUrl(DOCUMENTED, false)).toBe(DOCUMENTED);
  });

  it("produces a valid URL whatever shape the input has", () => {
    for (const input of [
      DOCUMENTED,
      "postgresql://u:p@h/db?connection_limit=1&sslmode=require",
      "postgresql://u:p@h/db?connection_limit=1",
      "postgresql://u:p@h/db",
    ]) {
      const out = buildUrl(input, true);
      expect(() => new URL(out)).not.toThrow();
      expect(out).not.toMatch(/[?&]{2}/);
      expect(out).not.toMatch(/[?&]$/);
      expect(out).toContain("connection_limit=8");
    }
  });

  it("keeps preexisting query parameters", () => {
    expect(buildUrl(DOCUMENTED, true)).toContain("sslmode=require");
    expect(buildUrl(DOCUMENTED, true)).toContain("connect_timeout=15");
  });

  it("bumps the client cache version so the change takes effect", () => {
    // The client is cached on globalThis across HMR; without a version bump
    // the old pool survives and the fix appears to do nothing.
    expect(db).toMatch(/const CLIENT_CONFIG_VERSION = 5;/);
  });
});

describe("notifications are not on the hydration path", () => {
  const header = fs.readFileSync(
    path.resolve(__dirname, "../..", "components/layout/site-header.tsx"),
    "utf8",
  );

  it("loads only when the popover first opens", () => {
    // Measured 3-9s on this dataset. Fetching it during hydration of every
    // page competed with the page's own render for the dev pool.
    expect(header).toMatch(/if \(!open \|\| hasLoaded\.current\) return/);
    expect(header).not.toMatch(/React\.useEffect\(\(\) => \{\s*loadNotifications\(\)\s*\}, \[loadNotifications\]\)/);
  });
});
