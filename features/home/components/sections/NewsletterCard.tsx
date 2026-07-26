"use client";

/**
 * Newsletter signup card — Tom's Guide `newsletter-sidebar`.
 *
 * Sits in the right-hand third of §3. Posts to the existing
 * /api/newsletter/subscribe route, which already handles rate limiting,
 * duplicate emails and reactivation, and returns a Persian `message`.
 * We surface that message verbatim rather than inventing our own copy —
 * the API knows whether this was a new signup, a reactivation, or an
 * "already subscribed".
 *
 * Client Component (form state).
 * Docs: docs/homepage-upgrade/02-DESIGN-SPEC.md §3
 */
import * as React from "react";
import Link from "next/link";

type Status = "idle" | "loading" | "ok" | "error";

export function NewsletterCard() {
  const [email, setEmail] = React.useState("");
  const [status, setStatus] = React.useState<Status>("idle");
  const [message, setMessage] = React.useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "loading") return;

    setStatus("loading");
    setMessage("");
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const body = await res.json().catch(() => ({}));

      if (res.ok && body?.ok) {
        setStatus("ok");
        setMessage(body.message || "عضویت شما ثبت شد.");
        setEmail("");
      } else {
        setStatus("error");
        setMessage(body?.message || "ثبت عضویت ناموفق بود. دوباره تلاش کنید.");
      }
    } catch {
      setStatus("error");
      setMessage("ارتباط برقرار نشد. اتصال خود را بررسی کنید.");
    }
  }

  return (
    <aside className="rounded-[var(--hp-r-lg)] bg-[color:var(--hp-brand-ink)] p-7 text-[color:var(--hp-on-brand)] lg:sticky lg:top-24 dark:border dark:border-white/[0.08]">
      <h3 className="text-[22px] font-semibold leading-[30px]">
        خبرنامه تکباکس
      </h3>
      <p className="mt-2 text-[14px] leading-[24px] text-[color:var(--hp-on-brand-mut)]">
        هر هفته یک ایمیل: مهم‌ترین اخبار زیرساخت، تحلیل‌ها و تخفیف‌های فروشگاه.
      </p>

      {status === "ok" ? (
        <div
          role="status"
          className="mt-5 flex items-start gap-3 rounded-[var(--hp-r-md)] bg-white/10 p-4"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true" className="mt-0.5 shrink-0">
            <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="2" />
            <path d="M6 10.5l2.5 2.5L14 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <p className="text-[14px] leading-[24px]">{message}</p>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="mt-5">
          <label htmlFor="hp-newsletter-email" className="sr-only">
            نشانی ایمیل
          </label>
          <div className="relative flex items-center rounded-[12px] bg-white p-1.5">
            <input
              id="hp-newsletter-email"
              type="email"
              required
              dir="ltr"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="h-9 min-w-0 flex-1 bg-transparent px-2 text-[15px] text-slate-800 placeholder:text-slate-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              aria-label="عضویت در خبرنامه"
              className="grid h-10 w-10 shrink-0 place-items-center rounded-[8px] bg-[color:var(--hp-accent)] text-[color:var(--hp-on-accent)] transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {status === "loading" ? (
                <span className="block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white motion-reduce:animate-none" />
              ) : (
                <span aria-hidden="true" className="text-lg leading-none">←</span>
              )}
            </button>
          </div>

          {status === "error" && (
            <p role="alert" className="mt-2 text-[13px] leading-[20px] text-white">
              {message}
            </p>
          )}
        </form>
      )}

      <p className="mt-4 text-[11px] leading-[18px] text-[color:var(--hp-on-brand-mut)]">
        با عضویت،{" "}
        <Link href="/terms" className="underline hover:text-[color:var(--hp-on-brand)]">
          قوانین و حریم خصوصی
        </Link>{" "}
        تکباکس را می‌پذیرید. هر زمان می‌توانید لغو عضویت کنید.
      </p>
    </aside>
  );
}

export default NewsletterCard;
