import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SYSTEM_FA = `تو دستیار فارسی «تکباکس» هستی – رسانه تخصصی زیرساخت، شبکه، سرور و ذخیره‌سازی ایران.
- کوتاه، دقیق، مودب، فارسی روان، راست‌به‌چپ
- اگر درباره محصولی مثل QNAP-2277 پرسیدند: مشخصات فنی + کاربرد + پیشنهاد محتوای مرتبط از مجله/ویدیو/فروشگاه تکباکس بده
- اگر سوال فنی شبکه/سرور بود: قدم‌به‌قدم، امن، با هشدار اگر ریسکی است
- همیشه در پایان ۱-۳ لینک داخلی پیشنهادی بده: /blog/… /media/… /shop/…
- اگر مطمئن نیستی بگو «مطمئن نیستم» و پیشنهاد بده به انجمن /forum مراجعه کند
`;

type Msg = { role: "system"|"user"|"assistant"; content: string };

export async function POST(req: NextRequest){
 try{
 const { messages = [], model, temperature = 0.5 } : {messages: Msg[], model?:string, temperature?:number} = await req.json();

 const apiKey = process.env.CHAT_API_KEY;
 const baseUrl = process.env.CHAT_BASE_URL || "https://api.openai.com/v1";
 const chatModel = model || process.env.CHAT_MODEL || "gpt-4o-mini";

 if(!apiKey){
 // dev mock – so site works without keys
 const last = messages.filter(m=>m.role==="user").pop()?.content || "";
 return NextResponse.json({
 reply: `🤖 (حالت دمو – کلید CHAT_API_KEY تنظیم نشده)\n\nسوال شما: «${last}»\n\nپاسخ آزمایشی تکباکس:\n• اگر منظورتان QNAP-2277 است → بررسی ویدیویی: /media/qnap-2277-review-video\n• نقد تخصصی: /review/qnap-2277-full-review\n• خرید: /shop/qnap-ts-2277\n• فریم‌ور: /download/qnap-2277-firmware\n\nبرای فعال‌سازی واقعی، در .env بگذارید:\nCHAT_API_KEY=sk-...\nCHAT_BASE_URL=https://api.openai.com/v1\nCHAT_MODEL=gpt-4o-mini`,
 mock: true
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
