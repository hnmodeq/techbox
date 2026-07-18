import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createEmailVerification } from "@/lib/auth-server";
import { z } from "zod";
import { sendEmail, emailTemplates } from "@/lib/email";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const schema = z.object({ email: z.string().email() });

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const rateLimit = await checkRateLimit(ip, "forgotPassword"); // reuse 3/hour bucket

  if (!rateLimit.success) {
    return NextResponse.json(
      { error: "too_many_requests", message: "تعداد درخواست‌ها بیش از حد مجاز است. لطفاً بعداً دوباره تلاش کنید." },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const { email } = schema.parse(body);

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    // Always respond ok — never reveal whether an account exists.
    if (!user) {
      return NextResponse.json({ ok: true, message: "اگر ایمیل معتبر باشد، لینک تأیید ارسال شد." });
    }

    // Already verified — nothing to do. Still return ok.
    if (user.emailVerified) {
      return NextResponse.json({ ok: true, alreadyVerified: true, message: "این ایمیل قبلاً تأیید شده است." });
    }

    const { rawToken } = await createEmailVerification(user.id);
    const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const verifyLink = `${base}/auth/verify-email?token=${rawToken}&email=${encodeURIComponent(user.email)}`;

    const { subject, html } = emailTemplates.emailVerification(verifyLink);
    await sendEmail({ to: user.email, subject, html });

    return NextResponse.json({
      ok: true,
      message: "لینک تأیید ایمیل ارسال شد.",
    });
  } catch (e: any) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: e.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "خطا در ارسال ایمیل" }, { status: 500 });
  }
}
