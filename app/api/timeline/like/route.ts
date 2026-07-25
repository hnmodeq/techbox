import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUserPublic } from "@/lib/auth-server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { z } from "zod";

const schema = z.object({
  eventId: z.string().min(1)
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const eventId = searchParams.get("eventId");
  if (!eventId) return NextResponse.json({ error: "eventId required" }, { status: 400 });

  const event = await prisma.timelineEvent.findFirst({
    where: { id: eventId, published: true },
    select: { id: true },
  });
  if (!event) {
    return NextResponse.json({ likes: 0, liked: false, isLoggedIn: false }, { status: 404 });
  }

  const likesCount = await prisma.timelineLike.count({ where: { eventId } });
  const user = await getSessionUserPublic();
  let liked = false;
  if (user) {
    const existing = await prisma.timelineLike.findUnique({
      where: { timeline_fingerprint_eventId: { fingerprint: user.id, eventId } }
    });
    liked = !!existing;
  }

  return NextResponse.json({ likes: likesCount, liked, isLoggedIn: !!user });
}

export async function POST(req: NextRequest) {
  const user = await getSessionUserPublic();
  if (!user) {
    return NextResponse.json({
      error: "unauthorized",
      message: "برای پسندیدن رویدادهای تایم‌لاین لطفا ابتدا وارد حساب کاربری شوید."
    }, { status: 401 });
  }

  const rateLimit = await checkRateLimit(`${user.id}:${getClientIp(req)}`, "like");
  if (!rateLimit.success) {
    return NextResponse.json({ error: "too_many_requests" }, { status: 429 });
  }

  try {
    const { eventId } = schema.parse(await req.json());
    const event = await prisma.timelineEvent.findFirst({
      where: { id: eventId, published: true },
      select: { id: true },
    });
    if (!event) {
      return NextResponse.json({ error: "event_not_found" }, { status: 404 });
    }
    const fp = user.id;

    const existing = await prisma.timelineLike.findUnique({
      where: { timeline_fingerprint_eventId: { fingerprint: fp, eventId } }
    });

    if (existing) {
      await prisma.timelineLike.delete({ where: { id: existing.id } });
      const count = await prisma.timelineLike.count({ where: { eventId } });
      return NextResponse.json({ liked: false, likes: count });
    } else {
      await prisma.timelineLike.create({
        data: { fingerprint: fp, userId: user.id, eventId }
      });
      const count = await prisma.timelineLike.count({ where: { eventId } });
      return NextResponse.json({ liked: true, likes: count });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "invalid_like", issues: error.issues }, { status: 400 });
    }
    console.error("[timeline:like]", error);
    return NextResponse.json({ error: "timeline_like_failed" }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
export const revalidate = 0;
