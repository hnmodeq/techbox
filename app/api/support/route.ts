import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUserPublic } from "@/lib/auth-server";
import {
  createSupportAccessToken,
  hashSupportAccessToken,
} from "@/lib/support-access";
import { z } from "zod";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { cacheHeaders, PRIVATE_NO_STORE } from "@/lib/cache-headers";

const schema = z.object({
  name: z.string().max(100).optional(),
  email: z.string().email("ایمیل نامعتبر است"),
  subject: z.string().min(2, "موضوع الزامی است").max(200),
  message: z.string().min(5, "حداقل ۵ کاراکتر").max(2000),
});

const MAX_OPEN_TICKETS = 3;

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
    const body = schema.parse(await req.json());
    const sessionUser = await getSessionUserPublic();
    const cleanEmail = (sessionUser?.email || body.email).toLowerCase().trim();

    // Enforce a maximum number of OPEN (non-closed) tickets per user.
    const openCount = await prisma.contactSubmission.count({
      where: { email: cleanEmail, type: "support", status: { not: "closed" } },
    });
    if (openCount >= MAX_OPEN_TICKETS) {
      return NextResponse.json(
        { error: "too_many_tickets", message: `شما در حال حاضر ${MAX_OPEN_TICKETS.toLocaleString("fa-IR")} درخواست مشاوره باز دارید` },
        { status: 400, headers: cacheHeaders(PRIVATE_NO_STORE) }
      );
    }

    const accessToken = createSupportAccessToken();
    const ticket = await prisma.contactSubmission.create({
      data: {
        type: "support",
        name: sessionUser?.name || body.name?.trim() || "کاربر",
        email: cleanEmail,
        subject: body.subject.trim(),
        message: body.message.trim(),
        accessTokenHash: hashSupportAccessToken(accessToken),
      },
      select: { id: true },
    });
    return NextResponse.json(
      {
        ok: true,
        ticketId: ticket.id,
        accessToken,
        message: "درخواست مشاوره شما ثبت شد. تیم فنی به‌زودی پاسخ می‌دهد.",
      },
      { headers: cacheHeaders(PRIVATE_NO_STORE) }
    );
  } catch (e: any) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: e.errors[0].message }, { status: 400, headers: cacheHeaders(PRIVATE_NO_STORE) });
    }
    return NextResponse.json({ error: "خطا در ثبت درخواست مشاوره" }, { status: 500, headers: cacheHeaders(PRIVATE_NO_STORE) });
  }
}

export const dynamic = "force-dynamic";
