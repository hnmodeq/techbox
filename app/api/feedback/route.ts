import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { cacheHeaders, PRIVATE_NO_STORE } from "@/lib/cache-headers";

const schema = z.object({
  name: z.string().min(1, "نام الزامی است").max(100),
  email: z.string().email("ایمیل نامعتبر است"),
  message: z.string().min(5, "حداقل ۵ کاراکتر").max(2000),
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
    const body = schema.parse(await req.json());
    await prisma.contactSubmission.create({
      data: {
        type: "feedback",
        name: body.name.trim(),
        email: body.email.toLowerCase().trim(),
        message: body.message.trim(),
      },
    });
    return NextResponse.json({ ok: true, message: "بازخورد شما ثبت شد. سپس از وقتتان!" }, { headers: cacheHeaders(PRIVATE_NO_STORE) });
  } catch (e: any) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: e.errors[0].message }, { status: 400, headers: cacheHeaders(PRIVATE_NO_STORE) });
    }
    return NextResponse.json({ error: "خطا در ثبت بازخورد" }, { status: 500, headers: cacheHeaders(PRIVATE_NO_STORE) });
  }
}

export const dynamic = "force-dynamic";
