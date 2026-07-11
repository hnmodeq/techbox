import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { sendEmail } from "@/lib/email";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const subscribeSchema = z.object({
  email: z.string().email("ایمیل معتبر نیست"),
  name: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const rateLimit = await checkRateLimit(ip, "newsletter");

  if (!rateLimit.success) {
    return NextResponse.json(
      { error: "too_many_requests", message: "تعداد درخواست‌ها بیش از حد مجاز است. لطفاً بعداً دوباره تلاش کنید." },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const { email, name } = subscribeSchema.parse(body);

    const normalizedEmail = email.toLowerCase().trim();

    // Check if already subscribed
    const existing = await prisma.newsletterSubscriber.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      if (existing.active) {
        return NextResponse.json({ 
          ok: true, 
          message: "شما قبلاً عضو خبرنامه هستید." 
        });
      } else {
        // Reactivate
        await prisma.newsletterSubscriber.update({
          where: { email: normalizedEmail },
          data: { active: true, name: name || existing.name },
        });
        return NextResponse.json({ 
          ok: true, 
          message: "عضویت شما مجدداً فعال شد." 
        });
      }
    }

    // Create new subscriber
    await prisma.newsletterSubscriber.create({
      data: {
        email: normalizedEmail,
        name: name || null,
        active: true,
      },
    });

    // Send welcome email (optional)
    try {
      await sendEmail({
        to: normalizedEmail,
        subject: "عضویت موفق در خبرنامه تکباکس",
        html: `
          <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2>خوش آمدید به خبرنامه تکباکس!</h2>
            <p>از این پس آخرین مقالات، اخبار و محتوای تخصصی زیرساخت را در ایمیل خود دریافت خواهید کرد.</p>
            <p style="margin-top: 24px; font-size: 13px; color: #666;">
              برای لغو عضویت، روی لینک لغو عضویت در پایین ایمیل‌های ما کلیک کنید.
            </p>
          </div>
        `,
      });
    } catch (e) {
      console.log("[Newsletter] Welcome email failed (non-critical)");
    }

    return NextResponse.json({ 
      ok: true, 
      message: "با موفقیت عضو خبرنامه شدید." 
    });

  } catch (e: any) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: e.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "خطا در ثبت‌نام" }, { status: 500 });
  }
}
