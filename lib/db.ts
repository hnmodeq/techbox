import { PrismaClient } from "@prisma/client";

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

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClientInstance };

function getPrismaClient(): PrismaClientInstance {
  if (globalForPrisma.prisma) return globalForPrisma.prisma;

  // One Prisma connection per serverless instance is the safe Neon default.
  // Concurrency comes from independent Vercel instances and Neon's pooler, not
  // from opening ten PostgreSQL sessions inside every function instance.
  //
  // Local dev is the opposite situation: a single long-lived Node process
  // serves every request, Turbopack re-renders on each save, and React
  // Strict Mode double-invokes. With connection_limit=1 a page that issues
  // a few dozen sequential queries can queue past pool_timeout and fail
  // with P2024 even though the database is perfectly healthy. So dev gets
  // a small pool; production keeps the serverless-safe default of 1.
  const isDev = process.env.NODE_ENV !== "production";
  let dbUrl = process.env.DATABASE_URL || "";
  if (dbUrl && !dbUrl.includes("connection_limit=")) {
    const fallback = isDev ? 5 : 1;
    const configured = Number(process.env.PRISMA_CONNECTION_LIMIT || String(fallback));
    const connectionLimit =
      Number.isInteger(configured) && configured > 0 && configured <= 10 ? configured : fallback;
    const poolTimeout = isDev ? 30 : 15;
    const sep = dbUrl.includes("?") ? "&" : "?";
    dbUrl = `${dbUrl}${sep}connection_limit=${connectionLimit}&pool_timeout=${poolTimeout}`;
  }

  const client = new PrismaClient({
    log: ["warn", "error"],
    datasources: { db: { url: dbUrl } },
  });
  if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = client;
  return client;
}

export const prisma = new Proxy({} as PrismaClientInstance, {
  get(_target, prop, _receiver) {
    const client = getPrismaClient();
    const value = Reflect.get(client, prop, client);
    return typeof value === "function" ? value.bind(client) : value;
  },
}) as PrismaClientInstance;
