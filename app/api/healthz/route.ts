import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const status: Record<string, any> = {
    status: "ok",
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
    services: {
      database: "unknown",
    },
  };

  try {
    await prisma.$queryRaw`SELECT 1`;
    status.services.database = "healthy";
  } catch {
    status.status = "degraded";
    status.services.database = "unhealthy";
    // Do not expose internal error details (connection strings, hostnames, etc.)
  }

  return NextResponse.json(status, {
    status: status.status === "ok" ? 200 : 503,
  });
}

export const dynamic = "force-dynamic";
