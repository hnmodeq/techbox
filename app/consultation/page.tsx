"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";

export default function Consultation() {
  const [orgName, setOrgName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: orgName,
          email,
          subject: "درخواست مشاوره زیرساخت",
          message: `شماره تماس: ${phone}\n\n${message || "درخواست مشاوره زیرساخت از صفحه مشاوره"}`,
        }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.ok) {
        throw new Error(data?.message || data?.error || "خطا در ارسال درخواست.");
      }

      setStatus("success");
      setOrgName("");
      setEmail("");
      setPhone("");
      setMessage("");
    } catch (error: any) {
      setStatus("error");
      setErrorMsg(error?.message || "خطا در اتصال به سرور.");
    }
  };

  return (
    <main className="max-w-2xl mx-auto px-5 py-16" dir="rtl">
      <h1 className="text-[length:var(--h1-font-size)] text-[var(--h1-font-color)] font-extrabold mb-4">درخواست مشاوره زیرساخت</h1>
      <form onSubmit={handleSubmit} className="bg-[var(--card-background)] text-[var(--primary-text)] border-[length:var(--border-size)] border-[var(--border-color)] rounded-[var(--corner-radius)] shadow-[var(--shadow-size)] p-6 space-y-4">
        <input className="input" placeholder="نام سازمان" required value={orgName} onChange={(event) => setOrgName(event.target.value)} />
        <input className="input" type="email" placeholder="ایمیل کاری" required value={email} onChange={(event) => setEmail(event.target.value)} />
        <input className="input" placeholder="تلفن" required value={phone} onChange={(event) => setPhone(event.target.value)} />
        <textarea className="input min-h-[120px]" placeholder="نیاز شما؟ سرور، شبکه، ذخیره‌سازی..." value={message} onChange={(event) => setMessage(event.target.value)} />

        {status === "success" && (
          <p className="text-[length:var(--paragraph-font-size)] text-[var(--success)]">درخواست شما ثبت شد. کارشناسان تکباکس به‌زودی با شما تماس می‌گیرند.</p>
        )}
        {status === "error" && (
          <p className="text-[length:var(--paragraph-font-size)] text-[var(--danger)]">{errorMsg}</p>
        )}

        <Button disabled={status === "loading"}>{status === "loading" ? "در حال ارسال..." : "ارسال درخواست"}</Button>
      </form>
    </main>
  );
}
