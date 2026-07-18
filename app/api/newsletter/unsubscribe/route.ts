import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const unsubscribeSchema = z.object({
  email: z.string().email(),
});

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const rateLimit = await checkRateLimit(ip, "newsletter");
  if (!rateLimit.success) {
    return NextResponse.json(
      { error: "too_many_requests", message: "تعداد درخواست‌ها بیش از حد مجاز است." },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const { email } = unsubscribeSchema.parse(body);

    await prisma.newsletterSubscriber.updateMany({
      where: { email: email.toLowerCase().trim() },
      data: { active: false },
    });

    return NextResponse.json({ 
      ok: true, 
      message: "عضویت شما لغو شد." 
    });

  } catch (e: any) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: e.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "خطا در لغو عضویت" }, { status: 500 });
  }
}
