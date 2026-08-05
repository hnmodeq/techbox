import { PrismaClient } from "@prisma/client";
import { isDbUnreachable } from "@/lib/db-error";

// IMPORTANT: never hardcode database credentials here. Set DATABASE_URL and
// DIRECT_URL in your environment (.env / .env.local for local dev, or your
// hosting provider's Environment Variables for deployments). Prisma reads
// these automatically via `env("DATABASE_URL")` / `env("DIRECT_URL")` in
// prisma/schema.prisma.
//
// Keep Prisma client creation lazy. Next/Vercel import many server modules while
// collecting build metadata; if the Prisma client has not been generated yet, a
// top-level `new PrismaClient()` throws before route/page code can catch and
// degrade to `db_unavailable`. With this proxy, missing DB/client problems fail
// when a query is attempted, not when the module is imported.
type PrismaClientInstance = InstanceType<typeof PrismaClient>;

/**
 * Bump when the PrismaClient CONSTRUCTOR options below change.
 *
 * The client is cached on globalThis so HMR reuses one pool instead of
 * leaking a connection per edit. But the cache was keyed on nothing, so a
 * client built with old options survived every hot reload: changing `log`
 * or the pool settings appeared to do nothing until the dev server was
 * fully restarted, which is a genuinely confusing way to lose an hour.
 *
 * Versioning the key means a config change discards the stale client and
 * builds a fresh one on the next request.
 */
const CLIENT_CONFIG_VERSION = 6;

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClientInstance;
  prismaConfigVersion?: number;
  /** Exact effective URL, kept in memory only so an env-file reload can retire
   * the old pool. It is never logged or returned. */
  prismaUrl?: string;
  /** Monotonic identity used to stop late failures from disconnecting a newer
   * healthy pool that another request has already created. */
  prismaGeneration?: number;
};

function runtimeDatabaseUrl(): { dbUrl: string; isDev: boolean } {
  // One Prisma connection per serverless instance is the safe Neon default.
  // Local development is one long-lived process serving page renders and API
  // requests together, so it needs a bounded multi-connection pool.
  const isDev = process.env.NODE_ENV !== "production";
  let dbUrl = process.env.DATABASE_URL || "";

  // The checked-in example carries production-safe values. Replace them only
  // in development; production must honour the deployment URL exactly.
  if (dbUrl && isDev) {
    dbUrl = dbUrl
      .replace(/([?&])connection_limit=\d+/g, "$1")
      .replace(/([?&])pool_timeout=\d+/g, "$1")
      .replace(/[?&]+$/, "")
      .replace(/\?&+/, "?")
      .replace(/&&+/g, "&");
  }

  if (dbUrl && !dbUrl.includes("connection_limit=")) {
    const fallbackLimit = isDev ? 8 : 1;
    const configuredLimit = Number(process.env.PRISMA_CONNECTION_LIMIT || String(fallbackLimit));
    const connectionLimit =
      Number.isInteger(configuredLimit) && configuredLimit > 0 && configuredLimit <= 10
        ? configuredLimit
        : fallbackLimit;

    // A healthy local Neon query can still queue behind the homepage render,
    // auth hydration and a module navigation. Ten seconds was shorter than a
    // measured cold dev render and produced false P2024 failures even though
    // the isolated doctor was green. Keep production fail-fast, but give the
    // single local process enough time for its bounded queue to drain.
    const fallbackPoolTimeout = isDev ? 30 : 15;
    const configuredPoolTimeout = Number(
      process.env.PRISMA_POOL_TIMEOUT || String(fallbackPoolTimeout),
    );
    const poolTimeout =
      Number.isInteger(configuredPoolTimeout) &&
      configuredPoolTimeout >= 5 &&
      configuredPoolTimeout <= 60
        ? configuredPoolTimeout
        : fallbackPoolTimeout;

    const sep = dbUrl.includes("?") ? "&" : "?";
    dbUrl = `${dbUrl}${sep}connection_limit=${connectionLimit}&pool_timeout=${poolTimeout}`;
  }

  return { dbUrl, isDev };
}

function getPrismaClient(): PrismaClientInstance {
  const { dbUrl, isDev } = runtimeDatabaseUrl();

  // Next reloads .env files without necessarily restarting its Node process.
  // Version-only caching therefore retained a pool built from the previous URL.
  // Compare the effective URL too, while never printing or exporting it.
  if (
    globalForPrisma.prisma &&
    globalForPrisma.prismaConfigVersion === CLIENT_CONFIG_VERSION &&
    globalForPrisma.prismaUrl === dbUrl
  ) {
    return globalForPrisma.prisma;
  }

  if (globalForPrisma.prisma) {
    const staleClient = globalForPrisma.prisma;
    globalForPrisma.prisma = undefined;
    void staleClient.$disconnect().catch(() => {});
  }

  // Say which database this process actually connects to. Host/database/pool
  // only — the URL and credentials are never logged.
  if (isDev && dbUrl) {
    try {
      const parsed = new URL(dbUrl);
      const params = new URLSearchParams(parsed.search);
      console.log(
        `[db] ${parsed.hostname}${parsed.pathname} ` +
          `(pool ${params.get("connection_limit") ?? "?"}, timeout ${params.get("pool_timeout") ?? "?"}s)`,
      );
    } catch {
      console.warn("[db] DATABASE_URL is not a parseable URL");
    }
  }

  const client = new PrismaClient({
    // Callers receive and classify every exception. Keeping Prisma's raw error
    // channel quiet prevents one handled outage from becoming many dev overlays.
    log: process.env.PRISMA_VERBOSE === "1" ? ["query", "warn", "error"] : ["warn"],
    datasources: { db: { url: dbUrl } },
  });

  globalForPrisma.prisma = client;
  globalForPrisma.prismaConfigVersion = CLIENT_CONFIG_VERSION;
  globalForPrisma.prismaUrl = dbUrl;
  globalForPrisma.prismaGeneration = (globalForPrisma.prismaGeneration ?? 0) + 1;
  return client;
}

let resetInFlight: Promise<void> | null = null;

/** Drop a poisoned/stale pool once, then let the next proxy access build a
 * fresh client. Concurrent failures share the same reset instead of creating
 * a disconnect/reconnect storm. `expectedGeneration` prevents a late P2024
 * from an old pool from disconnecting the healthy replacement pool. */
export function resetPrismaPool(expectedGeneration?: number): Promise<void> {
  if (resetInFlight) return resetInFlight;
  if (
    expectedGeneration !== undefined &&
    globalForPrisma.prismaGeneration !== expectedGeneration
  ) {
    return Promise.resolve();
  }

  resetInFlight = (async () => {
    // Re-check after entering the async reset in case another request replaced
    // the pool between the caller's failure and this task starting.
    if (
      expectedGeneration !== undefined &&
      globalForPrisma.prismaGeneration !== expectedGeneration
    ) {
      return;
    }
    const client = globalForPrisma.prisma;
    globalForPrisma.prisma = undefined;
    globalForPrisma.prismaConfigVersion = undefined;
    globalForPrisma.prismaUrl = undefined;
    if (client) {
      await Promise.race([
        client.$disconnect().catch(() => {}),
        new Promise<void>((resolve) => setTimeout(resolve, 750)),
      ]);
    }
  })().finally(() => { resetInFlight = null; });
  return resetInFlight;
}

/** Retry one connectivity/pool failure through a newly-created Prisma pool.
 * Never retries validation, uniqueness, permission, or other application errors. */
export async function withFreshPrismaRetry<T>(run: () => Promise<T>): Promise<T> {
  // Materialize the lazy client before recording its generation. Otherwise a
  // concurrent reset could make this attempt appear to belong to the wrong pool.
  getPrismaClient();
  const attemptGeneration = globalForPrisma.prismaGeneration;
  try {
    return await run();
  } catch (error) {
    if (!isDbUnreachable(error)) throw error;
    await resetPrismaPool(attemptGeneration);
    return run();
  }
}

export const prisma = new Proxy({} as PrismaClientInstance, {
  get(_target, prop, _receiver) {
    const client = getPrismaClient();
    const value = Reflect.get(client, prop, client);
    return typeof value === "function" ? value.bind(client) : value;
  },
}) as PrismaClientInstance;
