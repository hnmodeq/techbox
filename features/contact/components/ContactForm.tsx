"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";

type Status = "idle" | "sending" | "success" | "error";

export default function ContactForm() {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [subject, setSubject] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [status, setStatus] = React.useState<Status>("idle");
  const [error, setError] = React.useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    setError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject, message }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        setStatus("success");
        setName("");
        setEmail("");
        setSubject("");
        setMessage("");
      } else {
        setStatus("error");
        setError(data?.message || "ارسال با خطا مواجه شد. لطفاً دوباره تلاش کنید.");
      }
    } catch {
      setStatus("error");
      setError("ارتباط با سرور برقرار نشد.");
    }
  };

  if (status === "success") {
    return (
      <div className="rounded-[var(--corner-radius)] border-[length:var(--border-size)] border-[var(--border-color)] bg-[var(--muted-background)] p-4 text-center text-[var(--primary-text)]">
        پیام شما با موفقیت ارسال شد. با تشکر از همراهی شما.
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <div className="grid md:grid-cols-2 gap-4">
        <input
          className="input"
          placeholder="نام"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          minLength={2}
        />
        <input
          className="input"
          placeholder="ایمیل"
          type="email"
          dir="ltr"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <input
        className="input"
        placeholder="موضوع"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
      />
      <textarea
        className="input min-h-[140px]"
        placeholder="پیام شما…"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        required
        minLength={5}
      />
      {status === "error" && (
        <p className="text-sm font-bold text-red-400">{error}</p>
      )}
      <Button type="submit" disabled={status === "sending"}>
        {status === "sending" ? "در حال ارسال…" : "ارسال"}
      </Button>
    </form>
  );
}
