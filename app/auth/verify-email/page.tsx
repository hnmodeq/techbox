"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth.provider";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";

type Status = "verifying" | "success" | "error";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");
  const router = useRouter();
  const { login } = useAuth();

  const [status, setStatus] = useState<Status>("verifying");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token || !email) {
      setStatus("error");
      setMessage("لینک تأیید ناقص است.");
      return;
    }

    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, token }),
        });
        const data = await res.json();
        if (!active) return;

        if (res.ok && data.ok) {
          if (data.user) {
            login(data.user);
            window.dispatchEvent(new CustomEvent("tb_auth_changed", { detail: data.user }));
          }
          setStatus("success");
          setMessage(
            data.alreadyVerified
              ? "ایمیل شما قبلاً تأیید شده بود. اکنون می‌توانید وارد شوید."
              : "ایمیل شما با موفقیت تأیید شد!"
          );
          // Give the cookie + state a tick, then head home.
          setTimeout(() => router.push("/"), 1200);
        } else {
          setStatus("error");
          setMessage(data.message || "لینک تأیید نامعتبر یا منقضی شده است.");
        }
      } catch {
        if (active) {
          setStatus("error");
          setMessage("خطا در اتصال به سرور.");
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [token, email, login, router]);

  return (
    <main className="max-w-md mx-auto px-4 py-20 space-y-6" dir="rtl">
      <Card className="p-6 sm:p-8 space-y-6 text-center">
        <CardTitle>تأیید ایمیل</CardTitle>

        {status === "verifying" && (
          <CardDescription>در حال تأیید ایمیل شما... لطفاً صبر کنید.</CardDescription>
        )}

        {status === "success" && (
          <div className="space-y-4">
            <p className="text-sm text-green-600 font-bold">{message}</p>
            <ButtonLink href="/" className="w-full">ورود به سایت</ButtonLink>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-4">
            <CardDescription className="text-destructive">{message}</CardDescription>
            <p className="text-xs text-muted-foreground leading-5">
              می‌توانید در صفحه ورود، گزینه «ارسال مجدد ایمیل تأیید» را بزنید تا لینک جدیدی دریافت کنید.
            </p>
            <ButtonLink href="/account" className="w-full">بازگشت به ورود</ButtonLink>
          </div>
        )}
      </Card>
    </main>
  );
}
