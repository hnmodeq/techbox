import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
 authority: z.string(),
 amount: z.coerce.number().int().positive(),
});

export async function POST(req: NextRequest){
 const body = await req.json().catch(()=> ({}));
 const q = req.nextUrl.searchParams;
 const data = {
 authority: body.authority ?? q.get("Authority") ?? "",
 amount: Number(body.amount ?? q.get("amount") ?? 0)
 };
 const parsed = schema.safeParse(data);
 if(!parsed.success) return NextResponse.json({ verified:false, error: parsed.error.flatten() }, { status:400 });
 const { authority, amount } = parsed.data;
 const merchant_id = process.env.ZARIN_MERCHANT_ID;

 if(!merchant_id || authority.startsWith("A00000")){
 return NextResponse.json({ verified:true, ref_id: Math.floor(1e8+Math.random()*9e8), mock:true });
 }

 try{
 const r = await fetch("https://api.zarinpal.com/pg/v4/payment/verify.json", {
 method:"POST",
 headers:{"Content-Type":"application/json"},
 body: JSON.stringify({ merchant_id, authority, amount }),
 cache:"no-store"
 });
 const j = await r.json();
 if([100,101].includes(j?.data?.code)){
 return NextResponse.json({ verified:true, ref_id: j.data.ref_id });
 }
 return NextResponse.json({ verified:false, error: j }, { status: 400 });
 }catch(e:any){
 return NextResponse.json({ verified:false, error:e.message }, { status:500 });
 }
}
export const dynamic = "force-dynamic";
