import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getHomeData } from "@/lib/home-server";

export async function GET() {
  const [homeData, stats] = await Promise.all([
    getHomeData(),
    getHomeStats(),
  ]);

  return NextResponse.json({
    ...homeData,
    ...stats,
  });
}

async function getHomeStats() {
  try {
    const [postCount, userCount] = await Promise.all([
      prisma.post.count({ where: { published: true, deletedAt: null } }),
      prisma.user.count({ where: { status: "active" } }),
    ]);

    const moduleCount = 9;

    return { postCount, userCount, moduleCount };
  } catch {
    return { postCount: null, userCount: null, moduleCount: null };
  }
}

export const revalidate = 60;