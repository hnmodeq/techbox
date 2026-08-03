import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { prisma } from "@/lib/db";
import { getSessionUserPublic } from "@/lib/auth-server";
import { getSettings } from "@/lib/settings";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { z } from "zod";

const schema = z.object({
  eventId: z.string().min(1),
  text: z.string().trim().min(2).max(1000),
});

export async function GET(req: NextRequest) {
  const eventId = new URL(req.url).searchParams.get("eventId");
  if (!eventId) return NextResponse.json({ error: "eventId_required" }, { status: 400 });

  const settings = await getSettings(["comments.hidden_globally"]);
  if (settings["comments.hidden_globally"] === "true") {
    return NextResponse.json([], { headers: { "X-Comments-Hidden": "true" } });
  }

  try {
    const event = await prisma.timelineEvent.findFirst({
      where: { id: eventId, published: true },
      select: { id: true },
    });
    if (!event) return NextResponse.json({ error: "event_not_found" }, { status: 404 });

    const rows = await prisma.timelineComment.findMany({
      where: { eventId, status: "approved" },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: 100,
      select: {
        id: true,
        text: true,
        authorName: true,
        createdAt: true,
        author: { select: { name: true, status: true } },
      },
    });

    // Keep historical comments whose account was deleted, but do not surface
    // comments currently linked to banned or suspended accounts.
    return NextResponse.json(
      rows
        .filter((comment) => !comment.author || comment.author.status === "active")
        .map((comment) => ({
          id: comment.id,
          text: comment.text,
          authorName: comment.author?.name || comment.authorName || "عضو تکباکس",
          createdAt: comment.createdAt,
        })),
    );
  } catch {
    return NextResponse.json({ error: "comments_unavailable" }, { status: 503 });
  }
}

export async function POST(req: NextRequest) {
  const user = await getSessionUserPublic();
  if (!user) {
    return NextResponse.json(
      {
        error: "unauthorized",
        message: "برای ثبت نظر در گاه‌شمار لطفاً ابتدا وارد حساب کاربری شوید.",
      },
      { status: 401 },
    );
  }

  if (user.status === "muted") {
    const stillMuted = !user.mutedUntil || new Date(user.mutedUntil) > new Date();
    if (stillMuted) {
      return NextResponse.json(
        { error: "muted", message: "حساب شما در حالت سکوت است و امکان ثبت دیدگاه ندارد." },
        { status: 403 },
      );
    }
  }

  const settings = await getSettings(["comments.hidden_globally", "comments.mode"]);
  if (settings["comments.hidden_globally"] === "true") {
    return NextResponse.json(
      { error: "comments_disabled", message: "دیدگاه‌ها موقتاً غیرفعال شده‌اند." },
      { status: 403 },
    );
  }

  const rateLimit = await checkRateLimit(`${user.id}:${getClientIp(req)}`, "comments");
  if (!rateLimit.success) {
    return NextResponse.json(
      { error: "too_many_requests", message: "تعداد دیدگاه‌ها بیش از حد مجاز است." },
      { status: 429 },
    );
  }

  try {
    const { eventId, text } = schema.parse(await req.json());
    const event = await prisma.timelineEvent.findFirst({
      where: { id: eventId, published: true },
      select: { id: true },
    });
    if (!event) return NextResponse.json({ error: "event_not_found" }, { status: 404 });

    const status = settings["comments.mode"] === "require_approval" ? "pending" : "approved";
    const comment = await prisma.timelineComment.create({
      data: {
        eventId,
        userId: user.id,
        text,
        authorName: user.name || user.username || "عضو تکباکس",
        status,
      },
      select: { id: true, text: true, authorName: true, createdAt: true, status: true },
    });

    if (status === "approved") {
      revalidateTag("home-data", "max");
      revalidatePath("/");
      revalidatePath("/timeline");
    }

    return NextResponse.json(
      {
        ...comment,
        message: status === "pending"
          ? "دیدگاه شما ثبت شد و پس از تأیید نمایش داده می‌شود."
          : "دیدگاه شما ثبت شد.",
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "invalid_comment", issues: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "comment_create_failed" }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
export const revalidate = 0;
