import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { sendEmail, escapeHtml } from "@/lib/email";
import { prisma } from "@/lib/db";
import { cacheHeaders, PRIVATE_NO_STORE } from "@/lib/cache-headers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CONTACT_TO = process.env.CONTACT_EMAIL || "info@techbox.ir";

const schema = z.object({
  name: z.string().trim().min(2, "نام بسیار کوتاه است").max(80),
  email: z.string().trim().email("ایمیل نامعتبر است"),
  subject: z.string().trim().min(2).max(120).default("پیام از تکباکس"),
  message: z.string().trim().min(5, "پیام بسیار کوتاه است").max(4000),
});

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const rate = await checkRateLimit(ip, "contact");
  if (!rate.success) {
    return NextResponse.json(
      { error: "too_many_requests", message: "تعداد درخواست‌ها بیش از حد مجاز است. لطفاً ساعتی دیگر تلاش کنید." },
      { status: 429, headers: cacheHeaders(PRIVATE_NO_STORE) }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "validation", issues: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  const { name, email, subject, message } = parsed.data;

  try {
    // 1. Persist to DB first so we never lose the message
    await prisma.contactSubmission.create({
      data: { name, email, subject, message },
    });

    // 2. Attempt to send email
    const html = `
      <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; direction: rtl; text-align: right;">
        <h2 style="color:#111;">پیام جدید از فرم ارتباط با ما</h2>
        <p><strong>نام:</strong> ${escapeHtml(name)}</p>
        <p><strong>ایمیل:</strong> ${escapeHtml(email)}</p>
        <p><strong>موضوع:</strong> ${escapeHtml(subject)}</p>
        <blockquote style="border-right:4px solid #ddd; padding-right:16px; color:#555; white-space:pre-wrap; direction: rtl;">${escapeHtml(message)}</blockquote>
      </div>`;

    const result = await sendEmail({
      to: CONTACT_TO,
      subject: `تماس تکباکس: ${subject}`,
      html,
    });

    return NextResponse.json({
      ok: true,
      delivered: result.success,
    }, { headers: cacheHeaders(PRIVATE_NO_STORE) });
  } catch (error: any) {
    console.error("Contact submission error:", error);
    return NextResponse.json({ error: "internal_error", message: "خطایی در ثبت پیام رخ داد." }, { status: 500 });
  }
}
