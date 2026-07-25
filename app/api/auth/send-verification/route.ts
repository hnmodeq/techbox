import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createEmailVerification } from "@/lib/auth-server";
import { z } from "zod";
import { sendEmail, emailTemplates } from "@/lib/email";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { siteUrl } from "@/lib/seo";

const schema = z.object({ email: z.string().email() });
const GENERIC_RESPONSE = {
  ok: true,
  message: "اگر حسابی با این ایمیل نیاز به تأیید داشته باشد، لینک ارسال شد.",
};

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

    // Always return the same payload so callers cannot enumerate accounts or
    // learn whether an address is already verified.
    if (!user || user.emailVerified) {
      return NextResponse.json(GENERIC_RESPONSE);
    }

    const { rawToken } = await createEmailVerification(user.id);
    const base = siteUrl();
    const verifyLink = `${base}/auth/verify-email?token=${rawToken}&email=${encodeURIComponent(user.email)}`;

    const { subject, html } = emailTemplates.emailVerification(verifyLink);
    await sendEmail({ to: user.email, subject, html });

    return NextResponse.json(GENERIC_RESPONSE);
  } catch (e: any) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: e.errors[0].message }, { status: 400 });
    }
    console.error("[auth:send-verification]", e);
    return NextResponse.json(GENERIC_RESPONSE);
  }
}
