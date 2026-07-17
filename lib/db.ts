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

  // Append connection_limit query param to avoid exhausting the Neon
  // serverless connection pool during dev (Turbopack fires many parallel
  // SSR queries). Default Neon free-tier pool is 3-5 connections.
  let dbUrl = process.env.DATABASE_URL || "";
  if (dbUrl && !dbUrl.includes("connection_limit=")) {
    const sep = dbUrl.includes("?") ? "&" : "?";
    dbUrl = dbUrl + sep + "connection_limit=5&pool_timeout=30";
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
