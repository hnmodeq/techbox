import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUserPublic } from "@/lib/auth-server";
import { z } from "zod";

const schema = z.object({
  eventId: z.string().min(1)
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const eventId = searchParams.get("eventId");
  if (!eventId) return NextResponse.json({ error: "eventId required" }, { status: 400 });

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

  try {
    const { eventId } = schema.parse(await req.json());
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
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "failed to like timeline event" }, { status: 400 });
  }
}

export const dynamic = "force-dynamic";
export const revalidate = 0;
