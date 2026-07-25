import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SYSTEM_FA = `تو «دستیار تکباکس» هستی — دستیار هوشمند فارسی متخصص در حوزه زیرساخت، شبکه، سرور، ذخیره‌سازی و امنیت.

قوانین پاسخ‌دهی:
- همیشه به فارسی روان و مودبانه پاسخ بده.
- پاسخ‌ها را کوتاه، دقیق و کاربردی نگه دار (حداکثر ۴-۵ جمله).
- اگر کاربر درباره محصول خاصی (مثل QNAP، Dell، MikroTik) پرسید، مشخصات + کاربرد + لینک مرتبط بده.
- برای سوالات فنی: راه‌حل قدم‌به‌قدم + هشدارهای امنیتی بده.
- همیشه در انتهای پاسخ ۲ تا ۳ لینک مرتبط از تکباکس پیشنهاد بده (از این الگوها استفاده کن):
  • /blog/...
  • /media/...
  • /review/...
  • /shop/...
  • /forum/...
- اگر اطلاعات نداشتی بگو: «مطمئن نیستم، بهتره در انجمن /forum بپرسی.»
- از اصطلاحات فنی انگلیسی فقط وقتی لازم است استفاده کن و ترجمه فارسی‌اش را هم بگو.`;

const MAX_MESSAGES = 12;
const MAX_CHARS_PER_MESSAGE = 2000;
const MAX_TOTAL_CHARS = 24000; // 12 * 2000
const SERVER_MODEL = process.env.CHAT_MODEL || "gpt-4o-mini";
const MAX_TEMPERATURE = 1.0;
const MIN_TEMPERATURE = 0.0;

const requestSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(["user", "assistant"]),
    content: z.string().max(MAX_CHARS_PER_MESSAGE),
  })).max(MAX_MESSAGES).default([]),
  temperature: z.number().finite().optional(),
});

type Msg = z.infer<typeof requestSchema>["messages"][number];

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const rateLimit = await checkRateLimit(ip, "chat");

  if (!rateLimit.success) {
    return NextResponse.json(
      { error: "too_many_requests", message: "تعداد پیام‌های چت بیش از حد مجاز است." },
      { status: 429 }
    );
  }

  try {
    const { messages, temperature: clientTemp } = requestSchema.parse(await req.json());

    // The schema permits only user/assistant roles; the trusted system prompt
    // is always supplied by the server.
    const sanitizedMessages: Msg[] = messages.map((message) => ({
      role: message.role,
      content: message.content,
    }));

    // Reject if total content is absurdly large
    const totalChars = sanitizedMessages.reduce((sum, m) => sum + m.content.length, 0);
    if (totalChars > MAX_TOTAL_CHARS) {
      return NextResponse.json(
        { error: "payload_too_large", message: "حجم پیام‌ها بیش از حد مجاز است." },
        { status: 400 }
      );
    }

    // Clamp temperature server-side (ignore client model entirely)
    const temperature = Math.min(MAX_TEMPERATURE, Math.max(MIN_TEMPERATURE, clientTemp ?? 0.5));

    const apiKey = process.env.CHAT_API_KEY;
    const baseUrl = process.env.CHAT_BASE_URL || "https://api.openai.com/v1";

    if (!apiKey) {
      const last = sanitizedMessages.filter((m) => m.role === "user").pop()?.content || "";
      return NextResponse.json({
        reply: `🤖 (حالت دمو)\n\nسوال شما: «${last}»\n\nپاسخ آزمایشی تکباکس:\n• اگر منظورتان QNAP-2277 است → بررسی ویدیویی: /media/qnap-2277-review-video\n• نقد تخصصی: /review/qnap-2277-full-review\n• خرید: /shop/qnap-ts-2277\n• فریم‌ور: /download/qnap-2277-firmware\n\nبرای فعال‌سازی واقعی، CHAT_API_KEY را در .env تنظیم کنید.`,
        mock: true,
      });
    }

    const body = {
      model: SERVER_MODEL, // Always use server-configured model
      messages: [{ role: "system" as const, content: SYSTEM_FA }, ...sanitizedMessages],
      temperature,
      max_tokens: 900,
      stream: false,
    };

    const r = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
      cache: "no-store" as any,
    });

    if (!r.ok) {
      console.error("[chat] provider rejected request", { status: r.status });
      return NextResponse.json({ error: "chat_provider_unavailable" }, { status: 502 });
    }

    const data = await r.json();
    const reply = data?.choices?.[0]?.message?.content || "پاسخی دریافت نشد.";
    return NextResponse.json({ reply, usage: data?.usage });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "invalid_request", issues: error.flatten() }, { status: 400 });
    }
    console.error("[chat] request failed", error);
    return NextResponse.json({ error: "chat_failed" }, { status: 500 });
  }
}
