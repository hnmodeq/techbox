import { PrismaClient } from "@prisma/client";

if (!process.env.DATABASE_URL || process.env.DATABASE_URL.startsWith("file:")) {
  process.env.DATABASE_URL = "postgresql://neondb_owner:REDACTED-ROTATED-DB-PASSWORD@ep-damp-truth-atq7aw5v-pooler.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require";
}
if (!process.env.DIRECT_URL || process.env.DIRECT_URL.startsWith("file:")) {
  process.env.DIRECT_URL = "postgresql://neondb_owner:REDACTED-ROTATED-DB-PASSWORD@ep-damp-truth-atq7aw5v.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require";
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
export const prisma = globalForPrisma.prisma ?? new PrismaClient({ log: ["warn","error"] });
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
