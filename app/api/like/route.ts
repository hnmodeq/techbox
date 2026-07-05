import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth-server";
import { z } from "zod";

const schema = z.object({
  module: z.string().min(1),
  slug: z.string().min(1),
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const module = searchParams.get("module");
  const slug = searchParams.get("slug");
  if (!module || !slug) return NextResponse.json({ error: "module+slug required" }, { status: 400 });

  let postLikes = 0;

  try {
    const post = await prisma.post.findUnique({
      where: { module_slug: { module, slug } },
      select: { likes: true }
    });
    if (post && typeof post.likes === "number") {
      postLikes = post.likes;
    }
  } catch {
    return NextResponse.json({ error: "Database error" }, { status: 503 });
  }

  const user = await getSessionUser();
  let liked = false;
  if (user) {
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

    const fp = user.id;

    let existing: any = null;
    try {
      existing = await prisma.like.findUnique({
        where: { fingerprint_module_slug: { fingerprint: fp, module, slug } }
      });
    } catch {
      return NextResponse.json({ error: "Database error" }, { status: 503 });
    }

    if (existing) {
      // Unlike
      await prisma.like.delete({ where: { id: existing.id } });
      await prisma.post.updateMany({
        where: { module, slug },
        data: { likes: { decrement: 1 } }
      });
      const p = await prisma.post.findFirst({ where: { module, slug }, select: { likes: true } });
      return NextResponse.json({ liked: false, likes: Math.max(0, p?.likes ?? 0) });
    } else {
      // Like
      await prisma.like.create({
        data: { fingerprint: fp, userId: user.id, module, slug }
      });
      await prisma.post.updateMany({
        where: { module, slug },
        data: { likes: { increment: 1 } }
      });
      const p = await prisma.post.findFirst({ where: { module, slug }, select: { likes: true } });
      return NextResponse.json({ liked: true, likes: p?.likes ?? 1 });
    }
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}

export const dynamic = "force-dynamic";
export const revalidate = 0;