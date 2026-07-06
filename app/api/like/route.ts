import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth-server";
import { z } from "zod";

const schema = z.object({
  module: z.string().min(1),
  slug: z.string().min(1),
  fingerprint: z.string().optional(),
});

// Make sure a Post row exists for module+slug so a like can be attached even
// for content that has not been seeded yet. All seeded posts already exist,
// so this only runs for brand-new slugs (e.g. topics created on the fly).
async function ensurePost(module: string, slug: string) {
  const existing = await prisma.post.findUnique({
    where: { module_slug: { module, slug } },
    select: { id: true },
  });
  if (existing) return existing;
  return prisma.post.create({
    data: {
      module,
      slug,
      title: slug,
      authorName: "تحریریه",
      dateFa: "۱۴۰۵",
      published: true,
    },
    select: { id: true },
  });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const module = searchParams.get("module");
  const slug = searchParams.get("slug");
  if (!module || !slug)
    return NextResponse.json({ error: "module+slug required" }, { status: 400 });

  try {
    // The like count lives on the Post row (seeded + incremented on each like).
    const post = await prisma.post.findUnique({
      where: { module_slug: { module, slug } },
      select: { likes: true },
    });

    const user = await getSessionUser();
    let liked = false;
    if (user) {
      const existing = await prisma.like.findUnique({
        where: { fingerprint_module_slug: { fingerprint: user.id, module, slug } },
      });
      liked = !!existing;
    }
    return NextResponse.json({
      likes: post?.likes ?? 0,
      liked,
      isLoggedIn: !!user,
    });
  } catch {
    // Database unreachable: tell the client (it keeps its initial value).
    return NextResponse.json({ error: "db_unavailable" }, { status: 503 });
  }
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json(
      { error: "unauthorized", message: "برای پسندیدن مطالب لطفا ابتدا وارد حساب کاربری شوید." },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const { module, slug } = schema.parse(body);

    await ensurePost(module, slug);

    const fp = user.id;
    const existing = await prisma.like.findUnique({
      where: { fingerprint_module_slug: { fingerprint: fp, module, slug } },
    });

    let liked: boolean;
    if (existing) {
      // Unlike: remove the user's Like row and decrement the counter.
      await prisma.like.delete({ where: { id: existing.id } });
      await prisma.post.updateMany({
        where: { module, slug },
        data: { likes: { decrement: 1 } },
      });
      liked = false;
    } else {
      // Like: record the user's Like row and increment the counter.
      await prisma.like.create({
        data: { fingerprint: fp, userId: user.id, module, slug },
      });
      await prisma.post.updateMany({
        where: { module, slug },
        data: { likes: { increment: 1 } },
      });
      liked = true;
    }

    const post = await prisma.post.findFirst({
      where: { module, slug },
      select: { likes: true },
    });
    return NextResponse.json({ liked, likes: Math.max(0, post?.likes ?? 0) });
  } catch {
    return NextResponse.json({ error: "db_unavailable" }, { status: 503 });
  }
}

export const dynamic = "force-dynamic";
export const revalidate = 0;
