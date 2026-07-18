"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";

type Status = "loading" | "success" | "error" | "missing";

export default function UnsubscribePage() {
  const params = useSearchParams();
  const token = params.get("token");
  const [status, setStatus] = useState<Status>(token ? "loading" : "missing");

  useEffect(() => {
    if (!token) {
      setStatus("missing");
      return;
    }
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/newsletter/unsubscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        if (!active) return;
        setStatus(res.ok ? "success" : "error");
      } catch {
        if (active) setStatus("error");
      }
    })();
    return () => { active = false; };
  }, [token]);

  return (
    <main className="max-w-md mx-auto px-4 py-20" dir="rtl">
      <Card className="p-8 space-y-4 text-center">
        {status === "loading" && <CardDescription>در حال لغو عضویت شما...</CardDescription>}

        {status === "success" && (
          <>
            <CardTitle className="text-green-600">عضویت شما لغو شد</CardTitle>
            <CardDescription>
              دیگر ایمیل خبرنامه‌ای از تکباکس دریافت نخواهید کرد. هر زمان که مایل بودید می‌توانید دوباره از بخش خبرنامه عضو شوید.
            </CardDescription>
            <ButtonLink href="/" className="w-full">بازگشت به سایت</ButtonLink>
          </>
        )}

        {status === "error" && (
          <>
            <CardTitle className="text-destructive">خطا در لغو عضویت</CardTitle>
            <CardDescription>لینک لغو عضویت نامعتبر است یا منقضی شده است.</CardDescription>
            <ButtonLink href="/" className="w-full">بازگشت به سایت</ButtonLink>
          </>
        )}

        {status === "missing" && (
          <>
            <CardTitle>لینک نامعتبر</CardTitle>
            <CardDescription>برای لغو عضویت باید از لینک داخل ایمیل خبرنامه استفاده کنید.</CardDescription>
            <ButtonLink href="/" className="w-full">بازگشت به سایت</ButtonLink>
          </>
        )}
      </Card>
    </main>
  );
}
