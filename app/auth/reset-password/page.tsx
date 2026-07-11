"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  // Missing token/email = invalid link
  if (!token || !email) {
    return (
      <main className="max-w-md mx-auto px-4 py-20 text-center" dir="rtl">
        <div className="bg-[var(--card-background)] text-[var(--primary-text)] border-[length:var(--border-size)] border-[var(--border-color)] rounded-[var(--corner-radius)] shadow-[var(--shadow-size)] p-8 space-y-4">
          <h1 className="text-[length:var(--h2-font-size)] text-[var(--h2-font-color)] font-bold">لینک نامعتبر</h1>
          <p className="text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] paragraph-color">
            لینک بازیابی رمز عبور معتبر نیست یا ناقص است. لطفاً دوباره درخواست بازیابی بدهید.
          </p>
          <a href="/account" className="inline-block text-[var(--home)] underline">
            بازگشت به حساب کاربری
          </a>
        </div>
      </main>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    if (newPassword.length < 8) {
      setMessage("رمز عبور باید حداقل ۸ کاراکتر باشد.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage("رمز عبور و تکرار آن مطابقت ندارند.");
      return;
    }

    setStatus("loading");
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token, newPassword }),
      });
      const data = await res.json();

      if (res.ok && data.ok) {
        setStatus("success");
        setMessage("رمز عبور با موفقیت تغییر کرد. اکنون می‌توانید وارد شوید.");
      } else {
        setStatus("error");
        setMessage(data.error || "خطا در تغییر رمز عبور. لینک ممکن است منقضی شده باشد.");
      }
    } catch {
      setStatus("error");
      setMessage("خطا در اتصال به سرور.");
    }
  };

  return (
    <main className="max-w-md mx-auto px-4 py-20" dir="rtl">
      <div className="bg-[var(--card-background)] text-[var(--primary-text)] border-[length:var(--border-size)] border-[var(--border-color)] rounded-[var(--corner-radius)] shadow-[var(--shadow-size)] p-8 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-[length:var(--h2-font-size)] text-[var(--h2-font-color)] font-bold">بازیابی رمز عبور</h1>
          <p className="text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] paragraph-color">
            رمز عبور جدید خود را وارد کنید.
          </p>
        </div>

        {status === "success" ? (
          <div className="rounded-[var(--corner-radius)] bg-[var(--success)]/15 text-[var(--success)] border-[length:var(--border-size)] border-[var(--success)]/30 p-4 text-center space-y-3">
            <p>{message}</p>
            <a href="/account" className="inline-block text-[var(--home)] underline">
              ورود به حساب
            </a>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] paragraph-color mb-1">رمز عبور جدید</label>
              <input
                type="password"
                required
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="حداقل ۸ کاراکتر"
                className="input w-full"
                dir="ltr"
              />
            </div>
            <div>
              <label className="block text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] paragraph-color mb-1">تکرار رمز عبور</label>
              <input
                type="password"
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="تکرار رمز عبور"
                className="input w-full"
                dir="ltr"
              />
            </div>

            {message && (
              <div className="rounded-[var(--corner-radius)] bg-[var(--danger)]/15 text-[var(--danger)] border-[length:var(--border-size)] border-[var(--danger)]/30 p-3 text-center text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)]">
                {message}
              </div>
            )}

            <Button type="submit" disabled={status === "loading"} className="w-full justify-center">
              {status === "loading" ? "در حال تغییر..." : "تغییر رمز عبور"}
            </Button>
          </form>
        )}
      </div>
    </main>
  );
}
