import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUserPublic } from "@/lib/auth-server";

export async function GET(req: NextRequest) {
  const user = await getSessionUserPublic();
  if (!user || user.role !== "super_admin") {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const days = Math.min(Number(req.nextUrl.searchParams.get("days") || "30"), 90);
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // Top search queries
    const topQueries = await prisma.$queryRaw<{ query: string; count: bigint; avgResults: number }[]>`
      SELECT "query", COUNT(*)::int as count, AVG("results")::int as "avgResults"
      FROM "SearchLog"
      WHERE "createdAt" >= ${since}
      GROUP BY "query"
      ORDER BY count DESC
      LIMIT 50
    `;

    // Searches with zero results (content gaps)
    const zeroResults = await prisma.$queryRaw<{ query: string; count: bigint }[]>`
      SELECT "query", COUNT(*)::int as count
      FROM "SearchLog"
      WHERE "results" = 0 AND "createdAt" >= ${since}
      GROUP BY "query"
      ORDER BY count DESC
      LIMIT 30
    `;

    // Total searches per day
    const searchesPerDay = await prisma.$queryRaw<{ date: string; count: bigint }[]>`
      SELECT DATE("createdAt") as date, COUNT(*)::int as count
      FROM "SearchLog"
      WHERE "createdAt" >= ${since}
      GROUP BY DATE("createdAt")
      ORDER BY date ASC
    `;

    const totalSearches = await prisma.searchLog.count({ where: { createdAt: { gte: since } } });

    return NextResponse.json({
      totalSearches,
      days,
      topQueries: topQueries.map((q) => ({ query: q.query, count: Number(q.count), avgResults: q.avgResults })),
      zeroResults: zeroResults.map((q) => ({ query: q.query, count: Number(q.count) })),
      searchesPerDay: searchesPerDay.map((d) => ({ date: String(d.date), count: Number(d.count) })),
    });
  } catch (error) {
    console.error("[search-analytics]", error);
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}
