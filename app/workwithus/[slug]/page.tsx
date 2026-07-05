"use client";
import jobs from "@/data/jobs.json";
import Link from "next/link";
import { use } from "react";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export default function JobPage({ params }: { params: Promise<{slug:string}> }){
 const { slug } = use(params);
 const job = (jobs as any[]).find((j:any)=>j.slug===slug);
 if(!job) return <div className="p-10 text-center">یافت نشد</div>;

 return (
 <main className="max-w-3xl mx-auto px-4 py-12" dir="rtl">
 <div className="text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] text-muted-foreground mb-2"><Link href="/workwithus" className="hover:text-foreground">فرصت‌های شغلی</Link> / {job.title}</div>
 <h1 className="text-[length:var(--h1-font-size)] text-[var(--h1-font-color)] font-extrabold md:text-[length:var(--h1-font-size)] text-[var(--h1-font-color)] font-extrabold ">{job.title}</h1>
 <div className="flex flex-wrap gap-2 mt-3 text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)]">
 <Badge variant="brand">{job.type}</Badge>
 <Badge variant="secondary">{job.remote}</Badge>
 <Badge variant="outline">{job.team}</Badge>
 <span className="text-muted-foreground">{job.date_fa}</span>
 </div>
 <div className="card mt-6 p-5 text-[length:var(--h3-font-size)] text-[var(--h3-font-color)] font-semibold paragraph-color">
 {job.description}
 <ul className="pr-5 mt-4 space-y-1 text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)]" style={{listStyle:"disc"}}>
 <li>رزومه + نمونه کار</li>
 <li>مصاحبه فنی آنلاین</li>
 <li>شروع همکاری: مرداد ۱۴۰۵</li>
 </ul>
 </div>

 <form className="card p-5 mt-6 space-y-3" onSubmit={(e)=>{e.preventDefault(); alert("درخواست شما ثبت شد – تیم منابع انسانی تکباکس بررسی می‌کند.");}}>
 <h3 className="">ارسال درخواست</h3>
 <div className="grid sm:grid-cols-2 gap-3">
 <input className="input text-[length:var(--h3-font-size)] text-[var(--h3-font-color)] font-semibold" placeholder="نام و نام خانوادگی *" required />
 <input className="input text-[length:var(--h3-font-size)] text-[var(--h3-font-color)] font-semibold" placeholder="ایمیل *" type="email" required dir="ltr" />
 <input className="input text-[length:var(--h3-font-size)] text-[var(--h3-font-color)] font-semibold" placeholder="تلفن" dir="ltr" />
 <input className="input text-[length:var(--h3-font-size)] text-[var(--h3-font-color)] font-semibold" placeholder="لینک رزومه / لینکدین" dir="ltr" />
 </div>
 <textarea className="input min-h-[120px] text-[length:var(--h3-font-size)] text-[var(--h3-font-color)] font-semibold" placeholder="کمی درباره خودتان و چرا تکباکس…" />
 <label className="block text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)]">آپلود CV (PDF)
 <input type="file" accept=".pdf,.doc,.docx" className="block mt-1 text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)]" />
 </label>
 <div className="flex justify-end gap-2">
 <ButtonLink href="/workwithus" variant="ghost">بازگشت</ButtonLink>
 <Button type="submit">ارسال درخواست</Button>
 </div>
 <p className="text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] paragraph-color">با استفاده از اطلاعات پروفایل شما پر می‌شود – می‌توانید در <Link href="/account" className="text-[var(--home)] underline">حساب کاربری</Link> تکمیل کنید.</p>
 </form>
 </main>
 );
}
