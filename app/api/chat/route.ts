import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

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

type Msg = { role: "system"|"user"|"assistant"; content: string };

export async function POST(req: NextRequest){
  const ip = getClientIp(req);
  const rateLimit = await checkRateLimit(ip, "chat");

  if (!rateLimit.success) {
    return NextResponse.json(
      { error: "too_many_requests", message: "تعداد پیام‌های چت بیش از حد مجاز است." },
      { status: 429 }
    );
  }

 try{
 const { messages = [], model, temperature = 0.5 } : {messages: Msg[], model?:string, temperature?:number} = await req.json();

 const apiKey = process.env.CHAT_API_KEY;
 const baseUrl = process.env.CHAT_BASE_URL || "https://api.openai.com/v1";
 const chatModel = model || process.env.CHAT_MODEL || "gpt-4o-mini";

 if (!apiKey) {
   const last = messages.filter((m) => m.role === "user").pop()?.content || "";
   return NextResponse.json({
     reply: `🤖 (حالت دمو)\n\nسوال شما: «${last}»\n\nپاسخ آزمایشی تکباکس:\n• اگر منظورتان QNAP-2277 است → بررسی ویدیویی: /media/qnap-2277-review-video\n• نقد تخصصی: /review/qnap-2277-full-review\n• خرید: /shop/qnap-ts-2277\n• فریم‌ور: /download/qnap-2277-firmware\n\nبرای فعال‌سازی واقعی، CHAT_API_KEY را در .env تنظیم کنید.`,
     mock: true,
   });
 }

 const body = {
 model: chatModel,
 messages: [{role:"system", content: SYSTEM_FA}, ...messages],
 temperature,
 max_tokens: 900,
 stream: false,
 };

 const r = await fetch(`${baseUrl.replace(/\/$/,"")}/chat/completions`, {
 method: "POST",
 headers: {
 "Content-Type": "application/json",
 "Authorization": `Bearer ${apiKey}`,
 },
 body: JSON.stringify(body),
 // Next 16 – no cache
 cache: "no-store" as any,
 });

 if(!r.ok){
 const txt = await r.text();
 return NextResponse.json({ error: `chat provider ${r.status}`, detail: txt.slice(0,500) }, { status: 502 });
 }
 const data = await r.json();
 const reply = data?.choices?.[0]?.message?.content || "پاسخی دریافت نشد.";
 return NextResponse.json({ reply, usage: data?.usage });
 }catch(e:any){
 return NextResponse.json({ error: e?.message || "chat_failed" }, { status: 500 });
 }
}
