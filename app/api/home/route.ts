import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const [postCount, userCount] = await Promise.all([
      prisma.post.count({ where: { published: true, deletedAt: null } }),
      prisma.user.count({ where: { status: "active" } }),
    ]);

    // Module count from the static config
    const moduleCount = 9; // blog, news, media, forum, download, tools, review, timeline, shop

    return NextResponse.json({ postCount, userCount, moduleCount });
  } catch {
    return NextResponse.json({ postCount: null, userCount: null, moduleCount: null });
  }
}

export const revalidate = 60; // Cache for 1 minute
