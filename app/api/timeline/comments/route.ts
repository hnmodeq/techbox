import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth-server";
import { z } from "zod";

const schema = z.object({
  eventId: z.string().min(1),
  text: z.string().min(2).max(1000)
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const eventId = searchParams.get("eventId");
  if (!eventId) return NextResponse.json({ error: "eventId required" }, { status: 400 });

  const comments = await prisma.timelineComment.findMany({
    where: { eventId },
    orderBy: { createdAt: "desc" }
  });
  return NextResponse.json(comments);
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({
      error: "unauthorized",
      message: "برای ثبت نظر در تایم‌لاین لطفا ابتدا وارد حساب کاربری شوید."
    }, { status: 401 });
  }

  try {
    const { eventId, text } = schema.parse(await req.json());
    const comment = await prisma.timelineComment.create({
      data: {
        eventId,
        text: text.trim(),
        authorName: user.name || user.username || "عضو تکباکس"
      }
    });
    return NextResponse.json(comment, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "failed to create comment" }, { status: 400 });
  }
}

export const dynamic = "force-dynamic";
export const revalidate = 0;
