import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const module = searchParams.get("module");
  const slug = searchParams.get("slug");

  try {
    if (module && slug) {
      const post = await prisma.post.findUnique({
        where: { module_slug: { module, slug } },
        select: { id: true, views: true, likes: true }
      });
      if (!post) {
        return NextResponse.json({ views: 0, likes: 0, comments: 0 });
      }
      const commentsCount = await prisma.comment.count({
        where: { postId: post.id }
      });
      return NextResponse.json({
        views: post.views,
        likes: post.likes,
        comments: commentsCount
      });
    }

    // Bulk stats for all posts
    const posts = await prisma.post.findMany({
      select: { id: true, module: true, slug: true, views: true, likes: true }
    });

    const commentCounts = await prisma.comment.groupBy({
      by: ["postId"],
      _count: { _all: true }
    });
    const commentMap = new Map(commentCounts.map(c => [c.postId, c._count._all]));

    const stats: Record<string, { views: number; likes: number; comments: number }> = {};
    for (const p of posts) {
      stats[`${p.module}:${p.slug}`] = {
        views: p.views,
        likes: p.likes,
        comments: commentMap.get(p.id) || 0
      };
    }
    return NextResponse.json(stats);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
