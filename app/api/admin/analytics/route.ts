import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUserPublic } from "@/lib/auth-server";

export async function GET() {
  const user = await getSessionUserPublic();
  if (!user || (user.role !== "super_admin" && user.role !== "editor")) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Run all queries in parallel
    const [
      totalPosts,
      totalUsers,
      totalComments,
      totalViewsResult,
      postsByModule,
      topPosts,
      recentPosts,
      recentUsers,
      recentComments,
      postsLast30Days,
      usersLast30Days,
      pendingConsultations,
      pendingVerifications,
      pendingInbox,
    ] = await Promise.all([
      // Total counts
      prisma.post.count({ where: { published: true } }),
      prisma.user.count({ where: { status: "active" } }),
      prisma.comment.count(),
      prisma.post.aggregate({ _sum: { views: true } }),

      // Posts by module
      prisma.post.groupBy({
        by: ["module"],
        where: { published: true },
        _count: { id: true },
        _sum: { views: true, likes: true },
      }),

      // Top10 posts by views
      prisma.post.findMany({
        where: { published: true },
        select: { id: true, title: true, module: true, slug: true, views: true, likes: true, date: true },
        orderBy: { views: "desc" },
        take: 10,
      }),

      // Recent5 posts
      prisma.post.findMany({
        select: { id: true, title: true, module: true, slug: true, published: true, date: true, author: { select: { name: true } } },
        orderBy: { date: "desc" },
        take: 5,
      }),

      // Recent5 users
      prisma.user.findMany({
        select: { id: true, name: true, username: true, role: true },
        orderBy: { id: "desc" },
        take: 5,
      }),

      // Recent5 comments
      prisma.comment.findMany({
        select: { id: true, text: true, status: true, createdAt: true, authorName: true, post: { select: { title: true, module: true, slug: true } } },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),

      // Posts created per day (last30 days)
      prisma.$queryRaw<{ date: string; count: bigint }[]>`
        SELECT DATE("date") as date, COUNT(*)::int as count
        FROM "Post"
        WHERE "date" >= ${thirtyDaysAgo}
        GROUP BY DATE("date")
        ORDER BY date ASC
      `,

      // Users by month (since no createdAt on User, count all)
      Promise.resolve([] as { date: string; count: bigint }[]),

      // Pending items count
      prisma.consultationRequest.count({ where: { status: "pending" } }),
      prisma.verificationRequest.count({ where: { status: "pending" } }),
      prisma.contactSubmission.count({ where: { status: "new" } }),
    ]);

    // Format posts by module
    const moduleStats = postsByModule.map((m) => ({
      module: m.module,
      count: m._count.id,
      views: m._sum.views || 0,
      likes: m._sum.likes || 0,
    }));

    // Format time series (fill missing days with 0)
    const fillDays = (data: { date: string; count: bigint }[], days: number) => {
      const map = new Map<string, number>();
      for (const row of data) {
        map.set(String(row.date), Number(row.count));
      }
      const result: { date: string; count: number }[] = [];
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const key = d.toISOString().slice(0, 10);
        result.push({ date: key, count: map.get(key) || 0 });
      }
      return result;
    };

    return NextResponse.json({
      totals: {
        posts: totalPosts,
        users: totalUsers,
        comments: totalComments,
        views: totalViewsResult._sum.views || 0,
      },
      pending: {
        consultations: pendingConsultations,
        verifications: pendingVerifications,
        inbox: pendingInbox,
        total: pendingConsultations + pendingVerifications + pendingInbox,
      },
      moduleStats: moduleStats.sort((a, b) => b.views - a.views),
      topPosts,
      recentPosts,
      recentUsers,
      recentComments,
      charts: {
        postsPerDay: fillDays(postsLast30Days, 30),
        usersPerDay: fillDays(usersLast30Days, 30),
      },
    });
  } catch (error) {
    console.error("[analytics]", error);
    return NextResponse.json({ error: "analytics_failed" }, { status: 500 });
  }
}
