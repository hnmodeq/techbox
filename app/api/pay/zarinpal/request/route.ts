import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
 amount: z.number().int().positive(), // Rial
 description: z.string().default("سفارش تکباکس"),
 email: z.string().optional(),
 mobile: z.string().optional(),
});

export async function POST(req: NextRequest){
 const body = await req.json().catch(()=> ({}));
 const { amount, description, email, mobile } = schema.parse(body);
 const merchant_id = process.env.ZARIN_MERCHANT_ID;
 const callback_url = `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/shop/checkout?verify=1`;
 
 if(!merchant_id || merchant_id.startsWith("test") || merchant_id==="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"){
 // sandbox / mock mode
 return NextResponse.json({
 ok: true,
 authority: "A0000000000000000000000000000" + Math.floor(Math.random()*9000),
 url: `/shop/checkout?pay=mock&amount=${amount}`,
 mock: true,
 message: "Zarinpal merchant_id تنظیم نشده – حالت شبیه‌ساز"
 });
 }

 try{
 const r = await fetch("https://api.zarinpal.com/pg/v4/payment/request.json", {
 method:"POST",
 headers:{"Content-Type":"application/json","Accept":"application/json"},
 body: JSON.stringify({
 merchant_id,
 amount,
 description,
 callback_url,
 metadata: { email, mobile }
 }),
 cache:"no-store"
 });
 const data = await r.json();
 if(data?.data?.code === 100){
 return NextResponse.json({
 ok:true,
 authority: data.data.authority,
 url: `https://www.zarinpal.com/pg/StartPay/${data.data.authority}`
 });
 }
 return NextResponse.json({ ok:false, error: data?.errors || data }, { status: 400 });
 }catch(e:any){
 return NextResponse.json({ ok:false, error: e.message, mock_fallback: true,
 url: `/shop/checkout?pay=mock&amount=${amount}`}, { status: 200 });
 }
}
export const dynamic = "force-dynamic";
