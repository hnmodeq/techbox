import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getHomeData } from "@/lib/home-server";
import { publicPostDateWhere } from "@/lib/post-date";
import { cacheHeaders, PUBLIC_CONTENT_CACHE } from "@/lib/cache-headers";

export async function GET() {
  const [homeData, stats] = await Promise.all([
    getHomeData(),
    getHomeStats(),
  ]);

  return NextResponse.json({
    ...homeData,
    ...stats,
  }, {
    headers: cacheHeaders(PUBLIC_CONTENT_CACHE),
  });
}

async function getHomeStats() {
  try {
    const [postCount, userCount] = await Promise.all([
      prisma.post.count({ where: { published: true, deletedAt: null, date: publicPostDateWhere() } }),
      prisma.user.count({ where: { status: "active" } }),
    ]);

    const moduleCount = 9;

    return { postCount, userCount, moduleCount };
  } catch {
    return { postCount: null, userCount: null, moduleCount: null };
  }
}
