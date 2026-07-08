import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth-server";
import { z } from "zod";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const schema = z.object({ module: z.string(), slug: z.string(), value: z.number().int().min(1).max(5) });

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const moduleKey = searchParams.get("module") || "review";
  const slug = searchParams.get("slug") || "";
  const user = await getSessionUser();
  const post = await prisma.post.findUnique({ where: { module_slug: { module: moduleKey, slug } }, select: { id: true, rating: true, ratingCount: true } });
  if (!post) return NextResponse.json({ rating: null, ratingCount: 0, myRating: null });
  const mine = user ? await prisma.rating.findUnique({ where: { postId_userId: { postId: post.id, userId: user.id } } }) : null;
  return NextResponse.json({ rating: post.rating, ratingCount: post.ratingCount, myRating: mine?.value ?? null });
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const ip = getClientIp(req);
  const rateLimit = await checkRateLimit(`${user.id}:${ip}`, "rating");

  if (!rateLimit.success) {
    return NextResponse.json(
      { error: "too_many_requests", message: "تعداد امتیازدهی بیش از حد مجاز است." },
      { status: 429 }
    );
  }

  const { module: moduleKey, slug, value } = schema.parse(await req.json());
  const post = await prisma.post.findUnique({ where: { module_slug: { module: moduleKey, slug } }, select: { id: true } });
  if (!post) return NextResponse.json({ error: "not_found" }, { status: 404 });
  await prisma.rating.upsert({ where: { postId_userId: { postId: post.id, userId: user.id } }, update: { value }, create: { postId: post.id, userId: user.id, value } });
  const agg = await prisma.rating.aggregate({ where: { postId: post.id }, _avg: { value: true }, _count: { value: true } });
  const rating = Math.round((agg._avg.value || 0) * 10) / 10;
  const ratingCount = agg._count.value;
  await prisma.post.update({ where: { id: post.id }, data: { rating, ratingCount } });
  return NextResponse.json({ rating, ratingCount, myRating: value });
}

export const dynamic = "force-dynamic";
