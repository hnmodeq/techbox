import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth-server";
import { z } from "zod";

const schema = z.object({
  module: z.string().min(1),
  slug: z.string().min(1),
  fingerprint: z.string().optional()
});

const gLikes = globalThis as unknown as { __local_likes__?: Set<string>; __local_like_counts__?: Record<string, number> };
gLikes.__local_likes__ = gLikes.__local_likes__ || new Set();
gLikes.__local_like_counts__ = gLikes.__local_like_counts__ || {};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const module = searchParams.get("module");
  const slug = searchParams.get("slug");
  if (!module || !slug) return NextResponse.json({ error: "module+slug required" }, { status: 400 });

  if (!gLikes.__local_like_counts__) gLikes.__local_like_counts__ = {};
  if (!gLikes.__local_likes__) gLikes.__local_likes__ = new Set();
  const key = `${module}:${slug}`;
  let postLikes = gLikes.__local_like_counts__[key] ?? 14;

  try {
    const post = await prisma.post.findUnique({
      where: { module_slug: { module, slug } },
      select: { likes: true }
    });
    if (post && typeof post.likes === "number") {
      postLikes = post.likes;
    }
  } catch {}

  const user = await getSessionUser();
  let liked = false;
  if (user) {
    const likeKey = `${user.id}:${key}`;
    liked = gLikes.__local_likes__.has(likeKey);
    try {
      const existing = await prisma.like.findUnique({
        where: { fingerprint_module_slug: { fingerprint: user.id, module, slug } }
      });
      if (existing) liked = true;
    } catch {}
  }

  return NextResponse.json({
    likes: postLikes,
    liked,
    isLoggedIn: !!user
  });
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized", message: "برای پسندیدن مطالب لطفا ابتدا وارد حساب کاربری شوید." }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { module, slug } = schema.parse(body);

    if (!gLikes.__local_like_counts__) gLikes.__local_like_counts__ = {};
    if (!gLikes.__local_likes__) gLikes.__local_likes__ = new Set();
    const fp = user.id;
    const key = `${module}:${slug}`;
    const likeKey = `${fp}:${key}`;

    let existing: any = null;
    let dbSuccess = false;
    try {
      existing = await prisma.like.findUnique({
        where: { fingerprint_module_slug: { fingerprint: fp, module, slug } }
      });
      dbSuccess = true;
    } catch {
      existing = gLikes.__local_likes__.has(likeKey) ? { id: "local" } : null;
    }

    if (existing) {
      gLikes.__local_likes__.delete(likeKey);
      const newCount = Math.max(0, (gLikes.__local_like_counts__[key] ?? 15) - 1);
      gLikes.__local_like_counts__[key] = newCount;

      if (dbSuccess && existing.id !== "local") {
        try {
          await prisma.like.delete({ where: { id: existing.id } });
          await prisma.post.updateMany({
            where: { module, slug },
            data: { likes: { decrement: 1 } }
          });
          const p = await prisma.post.findFirst({ where: { module, slug }, select: { likes: true } });
          return NextResponse.json({ liked: false, likes: Math.max(0, p?.likes ?? newCount) });
        } catch {}
      }
      return NextResponse.json({ liked: false, likes: newCount });
    } else {
      gLikes.__local_likes__.add(likeKey);
      const newCount = (gLikes.__local_like_counts__[key] ?? 14) + 1;
      gLikes.__local_like_counts__[key] = newCount;

      if (dbSuccess) {
        try {
          await prisma.like.create({
            data: { fingerprint: fp, userId: user.id, module, slug }
          });
          await prisma.post.updateMany({
            where: { module, slug },
            data: { likes: { increment: 1 } }
          });
          const p = await prisma.post.findFirst({ where: { module, slug }, select: { likes: true } });
          return NextResponse.json({ liked: true, likes: p?.likes ?? newCount });
        } catch {}
      }
      return NextResponse.json({ liked: true, likes: newCount });
    }
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
