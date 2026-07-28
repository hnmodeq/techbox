import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

interface PostStats {
  views: number;
  likes: number;
  comments: number;
  solved: boolean | null;
  rating: number | null;
  ratingCount: number;
  fileName: string | null;
  fileSize: string | null;
  downloadCount: number;
}

/** Cache for bulk stats (per module) — avoids loading all posts on every request. */
const statsCache = new Map<string, { data: Record<string, PostStats>; ts: number }>();
const CACHE_TTL_MS = 3_600_000; // 1 hour
const STATS_CACHE_CONTROL = "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400";

function statsJson(body: unknown, init?: ResponseInit) {
  const response = NextResponse.json(body, init);
  response.headers.set("Cache-Control", STATS_CACHE_CONTROL);
  return response;
}
const PUBLIC_POST_MODULES = new Set([
  "blog", "news", "media", "forum", "download", "tools", "review", "shop",
]);

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const moduleKey = searchParams.get("module");
  const slug = searchParams.get("slug");

  if (moduleKey && !PUBLIC_POST_MODULES.has(moduleKey)) {
    return NextResponse.json({ error: "invalid_module" }, { status: 400 });
  }

  if (moduleKey && slug) {
    // Single-post stats — cheap, no caching needed
    try {
      const post = await prisma.post.findFirst({
        where: { module: moduleKey, slug, published: true, deletedAt: null },
        select: {
          id: true,
          views: true,
          likes: true,
          rating: true,
          ratingCount: true,
          solved: true,
          fileName: true,
          fileSize: true,
          downloadCount: true,
        },
      });
      if (!post) {
        return statsJson({
          views: 0,
          likes: 0,
          comments: 0,
          solved: false,
          fileName: null,
          fileSize: null,
          downloadCount: 0,
          rating: null,
          ratingCount: 0,
        });
      }
      const commentsCount = await prisma.comment.count({
        where: { postId: post.id, status: "approved" },
      });
      return statsJson({
        views: post.views || 0,
        likes: post.likes || 0,
        comments: commentsCount || 0,
        solved: post.solved ?? false,
        fileName: post.fileName || null,
        fileSize: post.fileSize || null,
        downloadCount: post.downloadCount || 0,
        rating: post.rating ?? null,
        ratingCount: post.ratingCount || 0,
      });
    } catch {
      return NextResponse.json({ error: "db_unavailable" }, { status: 503 });
    }
  }

  // Bulk stats — scoped to a single module to avoid loading all posts.
  // Clients should request ?module=blog etc. instead of fetching everything.
  if (moduleKey) {
    try {
      const cached = statsCache.get(moduleKey);
      if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
        return statsJson(cached.data);
      }

      const posts: { id: string; slug: string; views: number; likes: number; solved: boolean | null; rating: number | null; ratingCount: number; fileName: string | null; fileSize: string | null; downloadCount: number }[] = await prisma.post.findMany({
        where: { module: moduleKey, published: true, deletedAt: null },
        select: {
          id: true,
          slug: true,
          views: true,
          likes: true,
          solved: true,
          rating: true,
          ratingCount: true,
          fileName: true,
          fileSize: true,
          downloadCount: true,
        },
      });

      const postIds = posts.map((p) => p.id);
      const commentCounts = postIds.length
        ? await prisma.comment
            .groupBy({ by: ["postId"], _count: { _all: true }, where: { postId: { in: postIds }, status: "approved" } })
            .catch(() => [] as { postId: string; _count: { _all: number } }[])
        : [];

      const commentMap = new Map(
        (commentCounts as { postId: string; _count: { _all: number } }[]).map((c) => [c.postId, c._count._all || 0]),
      );

      const stats: Record<string, PostStats> = {};
      for (const p of posts) {
        stats[`${moduleKey}:${p.slug}`] = {
          views: p.views || 0,
          likes: p.likes || 0,
          comments: commentMap.get(p.id) || 0,
          solved: p.solved ?? false,
          rating: p.rating ?? null,
          ratingCount: p.ratingCount || 0,
          fileName: p.fileName || null,
          fileSize: p.fileSize || null,
          downloadCount: p.downloadCount || 0,
        };
      }

      statsCache.set(moduleKey, { data: stats, ts: Date.now() });
      return statsJson(stats);
    } catch {
      return NextResponse.json({ error: "db_unavailable" }, { status: 503 });
    }
  }

  // No module specified — return summary counts only (not all posts)
  try {
    const [postCount, commentCount, userCount] = await Promise.all([
      prisma.post.count({ where: { published: true, deletedAt: null } }),
      prisma.comment.count({ where: { status: "approved" } }),
      prisma.user.count({ where: { status: "active" } }),
    ]);
    return statsJson({ postCount, commentCount, userCount });
  } catch {
    return NextResponse.json({ error: "db_unavailable" }, { status: 503 });
  }
}

export const dynamic = "force-dynamic";
export const revalidate = 0;
