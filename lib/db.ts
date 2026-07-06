import { PrismaClient } from "@prisma/client";

// IMPORTANT: never hardcode database credentials here. Set DATABASE_URL and
// DIRECT_URL in your environment (.env / .env.local for local dev, or your
// hosting provider's Environment Variables for deployments). Prisma reads
// these automatically via `env("DATABASE_URL")` / `env("DIRECT_URL")` in
// prisma/schema.prisma — this file must not override or fall back to a
// baked-in connection string, since a stale/invalid one causes every DB
// call to fail (or hang while retrying) instead of failing fast.
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL is not set. Copy .env.example to .env (or .env.local) and fill in your real Neon connection string."
  );
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
export const prisma = globalForPrisma.prisma ?? new PrismaClient({ log: ["warn", "error"] });
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
