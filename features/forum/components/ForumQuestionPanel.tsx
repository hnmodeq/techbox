"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

function makeSlug(title: string) {
  const base = title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06FF]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return `${base || "topic"}-${Date.now().toString(36)}`;
}

/** Always-visible homepage composer — a direct alternative to a modal. */
export function ForumQuestionPanel() {
  const router = useRouter();
  const [title, setTitle] = React.useState("");
  const [body, setBody] = React.useState("");
  const [error, setError] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const cleanTitle = title.trim();
    const cleanBody = body.trim();
    if (cleanTitle.length < 5 || cleanBody.length < 10) {
      setError("عنوان و جزئیات پرسش را کامل‌تر بنویسید.");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          module: "forum",
          slug: makeSlug(cleanTitle),
          title: cleanTitle,
          excerpt: cleanBody.slice(0, 180),
          content: cleanBody,
          tags: ["پرسش", "تکباکس"],
          category: "پرسش",
          published: true,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (response.status === 401) {
        setError("برای طرح پرسش ابتدا وارد حساب کاربری شوید.");
        window.dispatchEvent(new CustomEvent("tb_open_auth"));
        return;
      }
      if (!response.ok) {
        setError(data?.message || data?.error || "ثبت پرسش ناموفق بود. دوباره تلاش کنید.");
        return;
      }

      setTitle("");
      setBody("");
      toast.success("پرسش شما در انجمن ثبت شد.");
      router.refresh();
    } catch {
      setError("ارتباط با سرور برقرار نشد. دوباره تلاش کنید.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="hp-forum-question" className="rounded-[var(--hp-r-md)] bg-[color:var(--community-accent)] p-5 text-white" aria-labelledby="hp-forum-question-title">
      <h3 id="hp-forum-question-title" className="text-[18px] font-bold">
        پرسش خود را مطرح کنید
      </h3>
      <p className="mt-1 text-[13px] leading-6 text-white/80">
        مسئله، خطا و آنچه تا امروز امتحان کرده‌اید را بنویسید تا پاسخ دقیق‌تری دریافت کنید.
      </p>

      <form onSubmit={submit} className="mt-4 space-y-3">
        <label htmlFor="hp-forum-question-title-input" className="sr-only">عنوان پرسش</label>
        <Input
          id="hp-forum-question-title-input"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="عنوان واضح و دقیق پرسش"
          maxLength={200}
          disabled={submitting}
          className="border-white/20 bg-white text-slate-900 placeholder:text-slate-500"
        />
        <label htmlFor="hp-forum-question-body" className="sr-only">جزئیات پرسش</label>
        <Textarea
          id="hp-forum-question-body"
          value={body}
          onChange={(event) => setBody(event.target.value)}
          placeholder="جزئیات محیط، توپولوژی، خطا و راه‌حل‌هایی که امتحان کرده‌اید..."
          className="min-h-28 resize-y border-white/20 bg-white text-slate-900 placeholder:text-slate-500"
          maxLength={5000}
          disabled={submitting}
        />
        {error && <p role="alert" className="text-[12px] font-semibold text-white">{error}</p>}
        <Button type="submit" disabled={submitting} className="w-full bg-white text-[color:var(--community-accent)] hover:bg-white/90">
          {submitting ? "در حال ثبت…" : "ثبت پرسش"}
        </Button>
      </form>
    </section>
  );
}

export default ForumQuestionPanel;
