import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const module = searchParams.get("module");
  const slug = searchParams.get("slug");

  if (module && slug) {
    try {
      const post = await prisma.post.findUnique({
        where: { module_slug: { module, slug } },
        select: { id: true, views: true, likes: true, solved: true, fileSize: true },
      });
      if (!post) {
        return NextResponse.json({
          views: 0,
          likes: 0,
          comments: 0,
          solved: false,
          fileSize: null,
        });
      }
      const commentsCount = await prisma.comment.count({
        where: { postId: post.id },
      });
      return NextResponse.json({
        views: post.views || 0,
        likes: post.likes || 0,
        comments: commentsCount || 0,
        solved: post.solved ?? false,
        fileSize: post.fileSize || null,
      });
    } catch {
      return NextResponse.json({ error: "db_unavailable" }, { status: 503 });
    }
  }

  // Bulk stats for every post, fetched once per page load.
  try {
    const posts = await prisma.post.findMany({
      select: {
        id: true,
        module: true,
        slug: true,
        views: true,
        likes: true,
        solved: true,
        fileSize: true,
      },
    });

    const commentCounts = await prisma.comment
      .groupBy({ by: ["postId"], _count: { _all: true } })
      .catch(() => []);

    const commentMap = new Map(
      (commentCounts as any[]).map((c) => [c.postId, c._count?._all || 0])
    );

    const stats: Record<string, { views: number; likes: number; comments: number; solved?: boolean; fileSize?: string | null }> = {};
    for (const p of posts) {
      stats[`${p.module}:${p.slug}`] = {
        views: p.views || 0,
        likes: p.likes || 0,
        comments: commentMap.get(p.id) || 0,
        solved: p.solved ?? false,
        fileSize: p.fileSize || null,
      };
    }
    return NextResponse.json(stats);
  } catch {
    return NextResponse.json({ error: "db_unavailable" }, { status: 503 });
  }
}

export const dynamic = "force-dynamic";
export const revalidate = 0;
