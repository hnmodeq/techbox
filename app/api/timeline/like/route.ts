import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { getSessionUserPublic } from "@/lib/auth-server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { z } from "zod";

const schema = z.object({ eventId: z.string().min(1) });

export async function GET(req: NextRequest) {
  const eventId = new URL(req.url).searchParams.get("eventId");
  if (!eventId) return NextResponse.json({ error: "eventId_required" }, { status: 400 });

  const event = await prisma.timelineEvent.findFirst({
    where: { id: eventId, published: true },
    select: { id: true },
  });
  if (!event) {
    return NextResponse.json({ likes: 0, liked: false, isLoggedIn: false }, { status: 404 });
  }

  const user = await getSessionUserPublic();
  // Keep these sequential: production deliberately uses one Prisma connection
  // per serverless instance.
  const likes = await prisma.timelineLike.count({ where: { eventId } });
  const existing = user
    ? await prisma.timelineLike.findUnique({
        where: { timeline_fingerprint_eventId: { fingerprint: user.id, eventId } },
        select: { id: true },
      })
    : null;

  return NextResponse.json({ likes, liked: Boolean(existing), isLoggedIn: Boolean(user) });
}

export async function POST(req: NextRequest) {
  const user = await getSessionUserPublic();
  if (!user) {
    return NextResponse.json(
      {
        error: "unauthorized",
        message: "برای پسندیدن رویدادهای گاه‌شمار لطفاً ابتدا وارد حساب کاربری شوید.",
      },
      { status: 401 },
    );
  }

  if (user.status === "muted") {
    const stillMuted = !user.mutedUntil || new Date(user.mutedUntil) > new Date();
    if (stillMuted) {
      return NextResponse.json(
        { error: "muted", message: "حساب شما در حالت سکوت است و امکان پسندیدن ندارد." },
        { status: 403 },
      );
    }
  }

  const rateLimit = await checkRateLimit(`${user.id}:${getClientIp(req)}`, "like");
  if (!rateLimit.success) {
    return NextResponse.json({ error: "too_many_requests" }, { status: 429 });
  }

  let parsedEventId = "";
  try {
    const { eventId } = schema.parse(await req.json());
    parsedEventId = eventId;
    const event = await prisma.timelineEvent.findFirst({
      where: { id: eventId, published: true },
      select: { id: true },
    });
    if (!event) return NextResponse.json({ error: "event_not_found" }, { status: 404 });

    const key = { fingerprint: user.id, eventId };
    const existing = await prisma.timelineLike.findUnique({
      where: { timeline_fingerprint_eventId: key },
      select: { id: true },
    });

    let liked: boolean;
    if (existing) {
      await prisma.timelineLike.delete({ where: { id: existing.id } });
      liked = false;
    } else {
      await prisma.timelineLike.create({
        data: { ...key, userId: user.id },
      });
      liked = true;
    }

    const likes = await prisma.timelineLike.count({ where: { eventId } });
    revalidateTag("home-data", "max");
    revalidatePath("/");
    revalidatePath("/timeline");
    return NextResponse.json({ liked, likes });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "invalid_like", issues: error.issues }, { status: 400 });
    }
    // A double click arriving in two serverless instances can race the unique
    // key. Treat the winning row as the source of truth instead of returning
    // a misleading 500 after the interaction was actually recorded.
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      const likes = parsedEventId
        ? await prisma.timelineLike.count({ where: { eventId: parsedEventId } })
        : 0;
      return NextResponse.json({ liked: true, likes });
    }
    return NextResponse.json({ error: "timeline_like_failed" }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
export const revalidate = 0;
