import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { cacheHeaders, PRIVATE_NO_STORE } from "@/lib/cache-headers";

// Accept either a secure per-subscriber token (from the email link — preferred)
// or an email address (legacy / footer form).
const unsubscribeSchema = z
  .object({
    token: z.string().min(1).optional(),
    email: z.string().email().optional(),
  })
  .refine((d) => d.token || d.email, { message: "token یا email الزامی است" });

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const rateLimit = await checkRateLimit(ip, "newsletter");
  if (!rateLimit.success) {
    return NextResponse.json(
      { error: "too_many_requests", message: "تعداد درخواست‌ها بیش از حد مجاز است." },
      { status: 429, headers: cacheHeaders(PRIVATE_NO_STORE) }
    );
  }

  try {
    const body = await req.json();
    const { token, email } = unsubscribeSchema.parse(body);

    if (token) {
      // Token path (from the newsletter email link): set inactive by token.
      await prisma.newsletterSubscriber.updateMany({
        where: { unsubscribeToken: token },
        data: { active: false, unsubscribedAt: new Date() },
      });
    } else if (email) {
      await prisma.newsletterSubscriber.updateMany({
        where: { email: email.toLowerCase().trim() },
        data: { active: false, unsubscribedAt: new Date() },
      });
    }

    return NextResponse.json(
      { ok: true, message: "عضویت شما لغو شد." },
      { headers: cacheHeaders(PRIVATE_NO_STORE) }
    );
  } catch (e: any) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: e.errors[0].message }, { status: 400, headers: cacheHeaders(PRIVATE_NO_STORE) });
    }
    return NextResponse.json({ error: "خطا در لغو عضویت" }, { status: 500, headers: cacheHeaders(PRIVATE_NO_STORE) });
  }
}

export const dynamic = "force-dynamic";
