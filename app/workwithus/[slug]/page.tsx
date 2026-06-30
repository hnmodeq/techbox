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
      <div className="text-[11px] text-muted-foreground mb-2"><Link href="/workwithus" className="hover:text-foreground">فرصت‌های شغلی</Link> / {job.title}</div>
      <h1 className="text-2xl md:text-3xl font-black">{job.title}</h1>
      <div className="flex flex-wrap gap-2 mt-3 text-[11px]">
        <Badge variant="brand">{job.type}</Badge>
        <Badge variant="secondary">{job.remote}</Badge>
        <Badge variant="outline">{job.team}</Badge>
        <span className="text-muted-foreground">{job.date_fa}</span>
      </div>
      <div className="card mt-6 p-5 text-[14px] leading-8 text-[var(--tb-muted-foreground)]">
        {job.description}
        <ul className="pr-5 mt-4 space-y-1 text-[13px]" style={{listStyle:"disc"}}>
          <li>رزومه + نمونه کار</li>
          <li>مصاحبه فنی آنلاین</li>
          <li>شروع همکاری: مرداد ۱۴۰۵</li>
        </ul>
      </div>

      <form className="card p-5 mt-6 space-y-3" onSubmit={(e)=>{e.preventDefault(); alert("درخواست شما ثبت شد – تیم منابع انسانی تکباکس بررسی می‌کند.");}}>
        <h3 className="font-bold">ارسال درخواست</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          <input className="input text-sm" placeholder="نام و نام خانوادگی *" required />
          <input className="input text-sm" placeholder="ایمیل *" type="email" required dir="ltr" />
          <input className="input text-sm" placeholder="تلفن" dir="ltr" />
          <input className="input text-sm" placeholder="لینک رزومه / لینکدین" dir="ltr" />
        </div>
        <textarea className="input min-h-[120px] text-sm" placeholder="کمی درباره خودتان و چرا تکباکس…" />
        <label className="block text-xs">آپلود CV (PDF)
          <input type="file" accept=".pdf,.doc,.docx" className="block mt-1 text-[11px]" />
        </label>
        <div className="flex justify-end gap-2">
          <ButtonLink href="/workwithus" variant="ghost">بازگشت</ButtonLink>
          <Button type="submit">ارسال درخواست</Button>
        </div>
        <p className="text-[11px] text-[var(--tb-muted-foreground)]">با استفاده از اطلاعات پروفایل شما پر می‌شود – می‌توانید در <Link href="/account" className="text-[var(--tb-brand)] underline">حساب کاربری</Link> تکمیل کنید.</p>
      </form>
    </main>
  );
}
