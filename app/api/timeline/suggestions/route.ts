import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUserPublic } from "@/lib/auth-server";
import { z } from "zod";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const SUGGESTIONS_EVENT_ID = "__timeline_suggestions";

const schema = z.object({
  text: z.string().min(3, "حداقل ۳ کاراکتر").max(500, "حداکثر ۵۰۰ کاراکتر"),
});

/** Ensure the special suggestions event exists in the DB. Uses upsert to
 *  avoid unique-constraint collisions on dateGr / dateFa. */
async function ensureSuggestionsEvent() {
  await prisma.timelineEvent.upsert({
    where: { id: SUGGESTIONS_EVENT_ID },
    update: {}, // already exists — nothing to update
    create: {
      id: SUGGESTIONS_EVENT_ID,
      title: "پیشنهادات کاربران برای تایم‌لاین",
      description: "این رویداد برای جمع‌آوری پیشنهادات کاربران ایجاد شده است.",
      dateGr: new Date("2099-01-01T00:00:00Z"),
      dateFa: "پیشنهادات-تایم‌لاین",
      year: 2099,
      yearFa: 1477,
      importance: 0,
      published: false,
    },
  });
}

export async function GET() {
  try {
    await ensureSuggestionsEvent();
  } catch {}

  const suggestions = await prisma.timelineComment.findMany({
    where: { eventId: SUGGESTIONS_EVENT_ID },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return NextResponse.json(suggestions);
}

export async function POST(req: NextRequest) {
  const user = await getSessionUserPublic();
  if (!user) {
    return NextResponse.json(
      { error: "unauthorized", message: "برای ثبت پیشنهاد لطفا ابتدا وارد حساب کاربری شوید." },
      { status: 401 }
    );
  }

  const ip = getClientIp(req);
  const rateLimit = await checkRateLimit(`${user.id}:${ip}`, "comments");
  if (!rateLimit.success) {
    return NextResponse.json(
      { error: "too_many_requests", message: "تعداد درخواست‌ها بیش از حد مجاز است." },
      { status: 429 }
    );
  }

  try {
    const { text } = schema.parse(await req.json());

    // Ensure the special event exists before inserting a comment
    await ensureSuggestionsEvent();

    const suggestion = await prisma.timelineComment.create({
      data: {
        eventId: SUGGESTIONS_EVENT_ID,
        text: text.trim(),
        authorName: user.name || user.username || "عضو تکباکس",
      },
    });
    return NextResponse.json(suggestion, { status: 201 });
  } catch (e: any) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: "validation", issues: e.errors }, { status: 400 });
    }
    return NextResponse.json({ error: e?.message || "failed" }, { status: 400 });
  }
}

export const dynamic = "force-dynamic";
export const revalidate = 0;
