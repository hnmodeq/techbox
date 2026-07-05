import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const module = searchParams.get("module");
  const slug = searchParams.get("slug");

  if (module && slug) {
    try {
      let post: any;
      try {
        post = await prisma.post.findUnique({
          where: { module_slug: { module, slug } },
          select: { id: true, views: true, likes: true, solved: true, fileSize: true }
        });
      } catch (clientErr: any) {
        if (String(clientErr?.message).includes("Can't reach database") || String(clientErr?.message).includes("Authentication failed") || String(clientErr?.message).includes("InitializationError")) {
          throw clientErr;
        }
        post = await prisma.post.findUnique({
          where: { module_slug: { module, slug } },
          select: { id: true, views: true, likes: true }
        });
      }

      if (!post) {
        return NextResponse.json({ views: 0, likes: 0, comments: 0, solved: false, fileSize: "۶۸۰ مگابایت" });
      }

      const commentsCount = await prisma.comment.count({
        where: { postId: post.id }
      });

      return NextResponse.json({
        views: post.views || 0,
        likes: post.likes || 0,
        comments: commentsCount || 0,
        solved: post.solved ?? false,
        fileSize: post.fileSize || "۶۸۰ مگابایت"
      });
    } catch (e: any) {
      let isSolved = false;
      if (module === "forum") {
        try {
          const mockForum = require("@/prisma/mock-data/forum.json");
          const found = mockForum.find((f: any) => f.slug === slug);
          isSolved = found ? (found.solved ?? (found.likes % 2 === 0)) : (slug?.length ? slug.length % 2 === 0 : false);
        } catch {
          isSolved = slug ? !slug.includes("proxmox") && !slug.includes("wifi7") : false;
        }
      }
      const gLikes = globalThis as unknown as { __local_like_counts__?: Record<string, number> };
      const likeCount = gLikes.__local_like_counts__?.[`${module}:${slug}`] ?? 14;
      return NextResponse.json({ views: 340, likes: likeCount, comments: 4, solved: isSolved, fileSize: "۶۸۰ مگابایت" });
    }
  }

  // Bulk stats for all posts
  try {
    let posts: any[];
    try {
      posts = await prisma.post.findMany({
        select: { id: true, module: true, slug: true, views: true, likes: true, solved: true, fileSize: true }
      });
    } catch (clientErr: any) {
      if (String(clientErr?.message).includes("Can't reach database") || String(clientErr?.message).includes("Authentication failed") || String(clientErr?.message).includes("InitializationError")) {
        throw clientErr;
      }
      posts = await prisma.post.findMany({
        select: { id: true, module: true, slug: true, views: true, likes: true }
      });
    }

    const commentCounts = await prisma.comment.groupBy({
      by: ["postId"],
      _count: { _all: true }
    }).catch(() => []);

    const commentMap = new Map((commentCounts as any[]).map(c => [c.postId, c._count?._all || 0]));

    const stats: Record<string, { views: number; likes: number; comments: number; solved?: boolean; fileSize?: string }> = {};
    for (const p of posts) {
      stats[`${p.module}:${p.slug}`] = {
        views: p.views || 0,
        likes: p.likes || 0,
        comments: commentMap.get(p.id) || 0,
        solved: p.solved ?? false,
        fileSize: p.fileSize || "۶۸۰ مگابایت"
      };
    }
    return NextResponse.json(stats);
  } catch (e: any) {
    const stats: Record<string, any> = {};
    const gLikes = globalThis as unknown as { __local_like_counts__?: Record<string, number> };
    try {
      ["forum", "blog", "news", "media", "review", "download", "shop", "tools"].forEach(mod => {
        try {
          const list = require(`@/prisma/mock-data/${mod}.json`);
          if (Array.isArray(list)) {
            list.forEach((item: any) => {
              const key = `${mod}:${item.slug}`;
              const likeCount = gLikes.__local_like_counts__?.[key] ?? (item.likes || 15);
              const isSolved = mod === "forum" ? (item.solved ?? (item.likes % 2 === 0)) : false;
              stats[key] = {
                views: item.views || 320,
                likes: likeCount,
                comments: 4,
                solved: isSolved,
                fileSize: item.fileSize || "۶۸۰ مگابایت"
              };
            });
          }
        } catch {}
      });
    } catch {}
    return NextResponse.json(stats);
  }
}

export const dynamic = "force-dynamic";
export const revalidate = 0;
