import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { getSessionUser } from "@/lib/auth-server";

const postSchema = z.object({
  postModule: z.string(),
  postSlug: z.string(),
  text: z.string().min(2).max(2000),
  authorName: z.string().min(1).max(60).optional(),
  parentId: z.string().nullable().optional()
});

const gComments = globalThis as unknown as { __local_comments__?: Record<string, any[]> };
gComments.__local_comments__ = gComments.__local_comments__ || {};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const postModule = searchParams.get("module");
  const slug = searchParams.get("slug");
  if (!postModule || !slug) return NextResponse.json({ error: "module+slug required" }, { status: 400 });

  const key = `${postModule}:${slug}`;
  const localList = gComments.__local_comments__?.[key] || [];

  try {
    const post = await prisma.post.findUnique({
      where: { module_slug: { module: postModule as any, slug } },
      select: { id: true }
    });
    if (!post) {
      // Return fallback or local comments
      try {
        const mockComments = require("@/prisma/mock-data/comments.json");
        return NextResponse.json([...mockComments.slice(0, 3), ...localList]);
      } catch {
        return NextResponse.json(localList);
      }
    }

    const comments = await prisma.comment.findMany({
      where: { postId: post.id },
      orderBy: { createdAt: "asc" },
      include: { replies: { orderBy: { createdAt: "asc" } } }
    });
    return NextResponse.json([...comments, ...localList]);
  } catch {
    try {
      const mockComments = require("@/prisma/mock-data/comments.json");
      return NextResponse.json([...mockComments.slice(0, 3), ...localList]);
    } catch {
      return NextResponse.json(localList);
    }
  }
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized", message: "برای ثبت نظر ابتدا وارد حساب کاربری شوید." }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { postModule, postSlug, text, parentId } = postSchema.parse(body);
    const key = `${postModule}:${postSlug}`;

    try {
      let post = await prisma.post.findUnique({
        where: { module_slug: { module: postModule as any, slug: postSlug } }
      });
      if (!post) {
        post = await prisma.post.create({
          data: {
            module: postModule,
            slug: postSlug,
            title: postSlug,
            authorName: "تحریریه",
            dateFa: "۱۴۰۵",
            published: true
          }
        });
      }

      const comment = await prisma.comment.create({
        data: {
          postId: post.id,
          parentId: parentId || null,
          authorId: user.id,
          authorName: user.name || user.username,
          text
        }
      });
      return NextResponse.json(comment, { status: 201 });
    } catch {
      // Fallback local persistence if database is offline or local session
      const newComment = {
        id: `local_c_${Date.now()}`,
        postId: key,
        parentId: parentId || null,
        authorId: user.id,
        authorName: user.name || user.username,
        text,
        createdAt: new Date().toISOString(),
        likes: 0,
        dislikes: 0,
        replies: []
      };
      if (!gComments.__local_comments__) gComments.__local_comments__ = {};
      gComments.__local_comments__[key] = gComments.__local_comments__[key] || [];
      gComments.__local_comments__[key].push(newComment);
      return NextResponse.json(newComment, { status: 201 });
    }
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}

export const dynamic = "force-dynamic";
export const revalidate = 0;
