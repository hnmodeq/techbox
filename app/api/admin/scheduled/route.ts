import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUserPublic } from "@/lib/auth-server";

/**
 * POST /api/admin/scheduled
 * Publishes all scheduled posts whose date has passed.
 * Called by Vercel Cron Jobs every 5 minutes.
 * Also callable manually by admins or via CRON_SECRET.
 */
export async function POST(req?: NextRequest) {
  // Allow access via Vercel Cron Secret or admin session
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = req?.headers.get("authorization");
    const isCronCall = authHeader === `Bearer ${cronSecret}`;
    if (!isCronCall) {
      // Not a cron call — require admin auth
      const user = await getSessionUserPublic();
      if (!user || user.role !== "super_admin") {
        return NextResponse.json({ error: "unauthorized" }, { status: 401 });
      }
    }
  }
  try {
    const now = new Date();

    // Find all scheduled posts whose date has passed
    const scheduled = await prisma.post.findMany({
      where: {
        status: "scheduled",
        date: { lte: now },
      },
      select: { id: true, title: true, module: true, slug: true },
    });

    if (scheduled.length === 0) {
      return NextResponse.json({ ok: true, published: 0, message: "No scheduled posts to publish." });
    }

    // Publish them all
    const result = await prisma.post.updateMany({
      where: {
        status: "scheduled",
        date: { lte: now },
      },
      data: {
        status: "published",
        published: true,
      },
    });

    return NextResponse.json({
      ok: true,
      published: result.count,
      posts: scheduled.map((p) => ({ module: p.module, slug: p.slug, title: p.title })),
    });
  } catch (error) {
    console.error("[scheduled]", error);
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}

/**
 * GET /api/admin/scheduled
 * Returns count of pending scheduled posts.
 */
export async function GET() {
  try {
    const now = new Date();
    const count = await prisma.post.count({
      where: {
        status: "scheduled",
        date: { lte: now },
      },
    });
    const upcoming = await prisma.post.count({
      where: {
        status: "scheduled",
        date: { gt: now },
      },
    });
    return NextResponse.json({ readyToPublish: count, upcoming });
  } catch (error) {
    console.error("[scheduled]", error);
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}
