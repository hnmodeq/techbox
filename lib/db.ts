import { PrismaClient } from "@prisma/client";

// IMPORTANT: never hardcode database credentials here. Set DATABASE_URL and
// DIRECT_URL in your environment (.env / .env.local for local dev, or your
// hosting provider's Environment Variables for deployments). Prisma reads
// these automatically via `env("DATABASE_URL")` / `env("DIRECT_URL")` in
// prisma/schema.prisma.
//
// Do not throw during module import when DATABASE_URL is absent: Next/Vercel
// imports route handlers while collecting build metadata, and an import-time
// throw fails the entire deployment before the route is ever executed. Missing
// or invalid database configuration will still fail safely when a Prisma query
// runs, and the API routes catch those errors and return db_unavailable.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
export const prisma = globalForPrisma.prisma ?? new PrismaClient({ log: ["warn", "error"] });
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
