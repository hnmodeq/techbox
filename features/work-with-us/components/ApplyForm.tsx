"use client";

import { useState } from "react";
import { Button, ButtonLink } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";

export default function ApplyForm({ jobSlug }: { jobSlug: string }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);

    try {
      const res = await fetch(`/api/jobs/${jobSlug}/apply`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || data.error || "خطایی رخ داد");
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="bg-[var(--card-background)] text-[var(--primary-text)] border-[length:var(--border-size)] border-[var(--border-color)] rounded-[var(--corner-radius)] shadow-[var(--shadow-size)] p-8 text-center space-y-4">
        <div className="text-4xl text-[var(--home)]">✅</div>
        <h3 className="text-2xl font-bold">درخواست شما با موفقیت ثبت شد</h3>
        <p className="text-muted-foreground">
          تیم منابع انسانی تکباکس رزومه شما را بررسی کرده و در صورت تایید با شما تماس خواهند گرفت.
        </p>
        <ButtonLink href="/work-with-us" variant="primary">بازگشت به لیست مشاغل</ButtonLink>
      </div>
    );
  }

  return (
    <form
      className="bg-[var(--card-background)] text-[var(--primary-text)] border-[length:var(--border-size)] border-[var(--border-color)] rounded-[var(--corner-radius)] shadow-[var(--shadow-size)] p-5 mt-6 space-y-4"
      onSubmit={handleSubmit}
    >
      <h3 className="text-xl font-bold">ارسال درخواست</h3>
      
      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-md text-sm">
          {error}
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-sm font-medium">نام و نام خانوادگی *</label>
          <Input name="name" placeholder="مثلاً: علی رضایی" required />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">ایمیل *</label>
          <Input name="email" placeholder="email@example.com" type="email" required dir="ltr" />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">تلفن همراه *</label>
          <Input name="phone" placeholder="09123456789" type="tel" required dir="ltr" />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">رزومه (PDF / Word) *</label>
          <input
            type="file"
            name="resume"
            accept=".pdf,.doc,.docx"
            required
            className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[var(--home)] file:text-white hover:file:opacity-90 transition-all cursor-pointer"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium">کمی درباره خودتان و چرا تکباکس؟</label>
        <Textarea
          name="message"
          className="min-h-[120px]"
          placeholder="توضیحات تکمیلی..."
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <ButtonLink href="/work-with-us" variant="ghost">انصراف</ButtonLink>
        <Button type="submit" disabled={loading}>
          {loading ? "در حال ارسال..." : "ارسال درخواست همکاری"}
        </Button>
      </div>
      
      <p className="text-xs text-muted-foreground">
        با کلیک روی دکمه ارسال، شما با <Link href="/terms" className="text-[var(--home)] underline">شرایط حفظ حریم خصوصی</Link> تکباکس موافقت می‌کنید.
      </p>
    </form>
  );
}
