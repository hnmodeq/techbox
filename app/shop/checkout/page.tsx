"use client";
import Image from "next/image";
import { useCart } from "@/providers/cart.provider";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/Button";

function parseFaPrice(s:string){
 // "۴۸,۹۰۰,۰۰۰" -> 48900000
 const map:any = {"۰":"0","۱":"1","۲":"2","۳":"3","۴":"4","۵":"5","۶":"6","۷":"7","۸":"8","۹":"9", ",":"", "٬":""};
 let out=""; for(const ch of s) out += map[ch] ?? (/[0-9]/.test(ch)?ch:"");
 const n = parseInt(out||"0",10);
 return Number.isFinite(n) ? n : 0;
}

export default function CheckoutPage(){
 const { items, count, clear } = useCart();
 const [loading,setLoading] = useState(false);
 const [name,setName]=useState("");
 const [phone,setPhone]=useState("");
 const [email,setEmail]=useState("");

 const totalToman = items.reduce((sum,it)=>{
 const unit = parseFaPrice(it.price);
 return sum + unit * it.qty;
 },0);
 // Zarinpal expects Rial
 const amountRial = totalToman * 10;

 const pay = async ()=>{
 if(items.length===0){ alert("سبد خالی است"); return; }
 setLoading(true);
 try{
 const res = await fetch("/api/pay/zarinpal/request", {
 method:"POST",
 headers:{"Content-Type":"application/json"},
 body: JSON.stringify({
 amount: amountRial || 100000, // fallback 10k Toman
 description: `سفارش تکباکس – ${count} قلم – ${name||"مهمان"}`,
 email: email || undefined,
 mobile: phone || undefined,
 })
 });
 const data = await res.json();
 if(data?.url){
 if(data.mock){
 alert(`حالت تست زرین‌پال\nمبلغ: ${totalToman.toLocaleString("fa-IR")} تومان\nAuthority: ${data.authority}\n\nبه صفحه تایید هدایت می‌شوید…`);
 // simulate verify
 const v = await fetch("/api/pay/zarinpal/verify", {
 method:"POST", headers:{"Content-Type":"application/json"},
 body: JSON.stringify({ authority: data.authority, amount: amountRial || 100000 })
 }).then(r=>r.json()).catch(()=>({verified:true}));
 if(v.verified){
 alert(`پرداخت موفق! \nRefID: ${v.ref_id || "TEST"}\nمتشکرم از خرید شما از تکباکس.`);
 clear();
 window.location.assign("/shop?thanks=1");
 return;
 }
 }
 // real redirect
 window.location.assign(data.url);
 return;
 }
 alert("خطا در ایجاد تراکنش: " + (data.error || "نامشخص"));
 }catch(e:any){
 alert("خطا: " + e.message);
 }finally{ setLoading(false); }
 };

 return (
 <main className="max-w-5xl mx-auto px-4 py-12" dir="rtl">
 <h1 className="text-[length:var(--h1-font-size)] text-[var(--h1-font-color)] font-extrabold mb-2 text-[var(--tb-shop)]">تسویه حساب – زرین‌پال</h1>
 <p className="mb-6 text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] paragraph-color">
 درگاه: <b>ZarinPal</b> – {process.env.NEXT_PUBLIC_ZARIN_MERCHANT_ID ? "Live" : "Sandbox / Mock"} – برای فعال‌سازی واقعی، در .env بگذارید: <code>ZARIN_MERCHANT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx</code>
 </p>

 <div className="grid lg:grid-cols-3 gap-6">
 <div className="lg:col-span-2 card p-5 space-y-4">
 <h3 className="">اطلاعات ارسال</h3>
 <div className="grid sm:grid-cols-2 gap-3 text-[length:var(--h3-font-size)] text-[var(--h3-font-color)] font-semibold">
 <input className="input" placeholder="نام و نام خانوادگی *" value={name} onChange={e=>setName(e.target.value)} />
 <input className="input" placeholder="تلفن *" dir="ltr" value={phone} onChange={e=>setPhone(e.target.value)} />
 <input className="input sm:col-span-2" placeholder="آدرس" />
 <div className="grid grid-cols-2 gap-3 sm:col-span-2">
 <input className="input" placeholder="کد پستی" dir="ltr" />
 <select className="input"><option>تهران</option><option>اصفهان</option><option>مشهد</option><option>شیراز</option><option>تبریز</option></select>
 </div>
 <input className="input sm:col-span-2" placeholder="ایمیل (رسید پرداخت)" type="email" dir="ltr" value={email} onChange={e=>setEmail(e.target.value)} />
 </div>

 <h3 className=" pt-2">پرداخت</h3>
 <div className="flex gap-4 text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] flex-wrap">
 <label className="flex items-center gap-2 rounded-[var(--corner-radius)] border border-[var(--home)] bg-[color-mix(in_oklch,var(--home)_8%,transparent)] px-3 py-2">
 <input type="radio" name="pay" defaultChecked readOnly /> 
 <span>درگاه <b>زرین‌پال</b> – کارت شتاب</span>
 <Image alt="zarinpal" src="https://cdn.zarinpal.com/badges/trustLogo/1.svg" width={64} height={20} className="h-5 w-auto opacity-80" unoptimized />
 </label>
 <label className="flex items-center gap-2 rounded-[var(--corner-radius)] border border-[var(--border-color)] px-3 py-2"><input type="radio" name="pay" disabled /> کارت به کارت (غیرفعال در دمو)</label>
 </div>

 <Button onClick={pay} disabled={loading || items.length===0} className="w-full text-[length:var(--h3-font-size)] text-[var(--h3-font-color)] font-semibold disabled:opacity-60">
 {loading ? "در حال اتصال به زرین‌پال…" : `پرداخت ${totalToman>0 ? totalToman.toLocaleString("fa-IR")+" تومان" : "–"} با زرین‌پال`}
 </Button>
 <p className="text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] paragraph-color">
 پرداخت امن – اگر <code>ZARIN_MERCHANT_ID</code> تنظیم نباشد، تراکنش شبیه‌سازی می‌شود و به‌صورت خودکار Verify می‌شود – مناسب تست لوکال.
 </p>
 </div>

 <div className="card p-5 h-fit sticky top-24">
 <h4 className=" mb-3">خلاصه سبد ({count.toLocaleString("fa-IR")} قلم)</h4>
 <div className="space-y-2 max-h-80 overflow-y-auto text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)]">
 {items.length===0 ? <p className="paragraph-color">سبد خالی است – <Link href="/shop" className="underline text-[var(--tb-shop)]">فروشگاه</Link></p> :
 items.map(i=>(
 <div key={i.slug} className="flex justify-between border-b border-[var(--border-color)] pb-2">
 <span className="truncate ps-2">{i.title} × {i.qty.toLocaleString("fa-IR")}</span>
 <span className="paragraph-color">{i.price}</span>
 </div>
 ))
 }
 </div>
 <div className="mt-3 space-y-1 text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)]">
 <div className="flex justify-between"><span>جمع جزء</span><span>{totalToman.toLocaleString("fa-IR")} تومان</span></div>
 <div className="flex justify-between paragraph-color"><span>ارسال</span><span>رایگان</span></div>
 <div className="flex justify-between border-t border-[var(--border-color)] pt-2 text-[length:var(--h3-font-size)] text-[var(--h3-font-color)] font-semibold "><span>مبلغ قابل پرداخت</span><span className="text-[var(--tb-shop)]">{totalToman.toLocaleString("fa-IR")} تومان</span></div>
 <div className="text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] paragraph-color">≈ {(amountRial).toLocaleString("fa-IR")} ریال – درگاه زرین‌پال</div>
 </div>
 </div>
 </div>
 </main>
 );
}
