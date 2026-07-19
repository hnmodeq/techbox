import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { cacheHeaders, PRIVATE_NO_STORE } from "@/lib/cache-headers";

// GET: user looks up their tickets by email → returns tickets + replies
export async function GET(req: NextRequest) {
  const email = new URL(req.url).searchParams.get("email");
  if (!email) {
    return NextResponse.json({ tickets: [] }, { headers: cacheHeaders(PRIVATE_NO_STORE) });
  }

  try {
    const tickets = await prisma.contactSubmission.findMany({
      where: { email: email.toLowerCase().trim(), type: "support" },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        replies: { orderBy: { createdAt: "asc" } },
      },
    });
    return NextResponse.json({ tickets }, { headers: cacheHeaders(PRIVATE_NO_STORE) });
  } catch {
    return NextResponse.json({ tickets: [] }, { headers: cacheHeaders(PRIVATE_NO_STORE) });
  }
}

// POST: user adds a reply to their own ticket
const replySchema = z.object({
  ticketId: z.string().min(1),
  email: z.string().email(),
  name: z.string().min(1).max(100),
  message: z.string().min(2, "حداقل ۲ کاراکتر").max(2000),
});

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const rateLimit = await checkRateLimit(ip, "contact");
  if (!rateLimit.success) {
    return NextResponse.json(
      { error: "too_many_requests", message: "تعداد درخواست‌ها بیش از حد مجاز است." },
      { status: 429, headers: cacheHeaders(PRIVATE_NO_STORE) }
    );
  }

  try {
    const body = replySchema.parse(await req.json());
    const cleanEmail = body.email.toLowerCase().trim();

    // Verify the ticket belongs to this email
    const ticket = await prisma.contactSubmission.findFirst({
      where: { id: body.ticketId, email: cleanEmail, type: "support" },
    });
    if (!ticket) {
      return NextResponse.json({ error: "ticket_not_found" }, { status: 404, headers: cacheHeaders(PRIVATE_NO_STORE) });
    }

    // Mark ticket as read again (user activity)
    await prisma.contactSubmission.update({
      where: { id: body.ticketId },
      data: { status: "read" },
    });

    const reply = await prisma.ticketReply.create({
      data: {
        ticketId: body.ticketId,
        authorName: body.name.trim(),
        authorEmail: cleanEmail,
        authorRole: "user",
        message: body.message.trim(),
      },
    });

    return NextResponse.json({ ok: true, reply }, { headers: cacheHeaders(PRIVATE_NO_STORE) });
  } catch (e: any) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: e.errors[0].message }, { status: 400, headers: cacheHeaders(PRIVATE_NO_STORE) });
    }
    return NextResponse.json({ error: "خطا در ثبت پاسخ" }, { status: 500, headers: cacheHeaders(PRIVATE_NO_STORE) });
  }
}

export const dynamic = "force-dynamic";
