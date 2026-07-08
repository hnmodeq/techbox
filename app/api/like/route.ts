import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth-server";
import { z } from "zod";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const schema = z.object({
  module: z.string().min(1),
  slug: z.string().min(1),
  fingerprint: z.string().optional(),
});

// Make sure a Post row exists for module+slug so a like can be attached even
// for content that has not been seeded yet. All seeded posts already exist,
// so this only runs for brand-new slugs (e.g. topics created on the fly).
async function ensurePost(moduleKey: string, slug: string) {
  const existing = await prisma.post.findUnique({
    where: { module_slug: { module: moduleKey, slug } },
    select: { id: true },
  });
  if (!existing) {
    throw new Error("not_found");
  }
  return existing;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const moduleKey = searchParams.get("module");
  const slug = searchParams.get("slug");
  if (!moduleKey || !slug)
    return NextResponse.json({ error: "module+slug required" }, { status: 400 });

  try {
    // The like count lives on the Post row (seeded + incremented on each like).
    const post = await prisma.post.findUnique({
      where: { module_slug: { module: moduleKey, slug } },
      select: { likes: true },
    });

    const user = await getSessionUser();
    let liked = false;
    if (user) {
      const existing = await prisma.like.findUnique({
        where: { fingerprint_module_slug: { fingerprint: user.id, module: moduleKey, slug } },
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

  const ip = getClientIp(req);
  const rateLimit = await checkRateLimit(`${user.id}:${ip}`, "like");

  if (!rateLimit.success) {
    return NextResponse.json(
      { error: "too_many_requests", message: "تعداد پسندها بیش از حد مجاز است." },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const { module: moduleKey, slug } = schema.parse(body);

    try {
      await ensurePost(moduleKey, slug);
    } catch (e) {
      return NextResponse.json({ error: "post_not_found", message: "مطلب مورد نظر یافت نشد." }, { status: 404 });
    }

    const fp = user.id;
    const existing = await prisma.like.findUnique({
      where: { fingerprint_module_slug: { fingerprint: fp, module: moduleKey, slug } },
    });

    let liked: boolean;
    if (existing) {
      // Unlike: remove the user's Like row and decrement the counter.
      await prisma.like.delete({ where: { id: existing.id } });
      await prisma.post.updateMany({
        where: { module: moduleKey, slug },
        data: { likes: { decrement: 1 } },
      });
      liked = false;
    } else {
      // Like: record the user's Like row and increment the counter.
      await prisma.like.create({
        data: { fingerprint: fp, userId: user.id, module: moduleKey, slug },
      });
      await prisma.post.updateMany({
        where: { module: moduleKey, slug },
        data: { likes: { increment: 1 } },
      });
      liked = true;
    }

    const post = await prisma.post.findFirst({
      where: { module: moduleKey, slug },
      select: { likes: true },
    });
    return NextResponse.json({ liked, likes: Math.max(0, post?.likes ?? 0) });
  } catch {
    return NextResponse.json({ error: "db_unavailable" }, { status: 503 });
  }
}

export const dynamic = "force-dynamic";
export const revalidate = 0;
