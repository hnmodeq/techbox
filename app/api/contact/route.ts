import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { sendEmail } from "@/lib/email";

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
  const rate = await checkRateLimit(ip, "comments");
  if (!rate.success) {
    return NextResponse.json(
      { error: "too_many_requests", message: "تعداد درخواست‌ها بیش از حد مجاز است." },
      { status: 429 }
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

  const html = `
    <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color:#111;">پیام جدید از فرم ارتباط با ما</h2>
      <p><strong>نام:</strong> ${name}</p>
      <p><strong>ایمیل:</strong> ${email}</p>
      <p><strong>موضوع:</strong> ${subject}</p>
      <blockquote style="border-left:4px solid #ddd; padding-left:16px; color:#555; white-space:pre-wrap;">${message}</blockquote>
    </div>`;

  const result = await sendEmail({
    to: CONTACT_TO,
    subject: `تماس تکباکس: ${subject}`,
    html,
  });

  // Even if email delivery is not configured in this environment, we treat the
  // submission as accepted (the message was validated) rather than faking data.
  return NextResponse.json({
    ok: true,
    delivered: result.success,
  });
}
