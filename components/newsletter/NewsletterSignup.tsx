"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");

    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name: name || undefined }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus("success");
        setMessage(data.message || "با موفقیت عضو شدید!");
        setEmail("");
        setName("");
      } else {
        setStatus("error");
        setMessage(data.error || "خطا در ثبت‌نام");
      }
    } catch (err) {
      setStatus("error");
      setMessage("خطا در ارتباط با سرور");
    }
  };

  return (
    <div className="rounded-[var(--corner-radius)] border border-[var(--border-color)] bg-[var(--card-background)] p-8">
      <div className="max-w-md">
        <h3 className="text-2xl font-black text-[var(--primary-text)] mb-2">
          خبرنامه تکباکس
        </h3>
        <p className="paragraph-color mb-6">
          آخرین مقالات، اخبار و محتوای تخصصی زیرساخت را مستقیماً در ایمیل خود دریافت کنید.
        </p>

        {status === "success" ? (
          <div className="rounded-lg bg-[var(--success)]/10 border border-[var(--success)]/30 p-4 text-[var(--success)]">
            {message}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="text"
                placeholder="نام (اختیاری)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input w-full"
              />
            </div>
            <div>
              <input
                type="email"
                placeholder="ایمیل شما"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input w-full"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={status === "loading"}
            >
              {status === "loading" ? "در حال ثبت..." : "عضویت در خبرنامه"}
            </Button>
            {status === "error" && (
              <p className="text-sm text-[var(--danger)]">{message}</p>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
