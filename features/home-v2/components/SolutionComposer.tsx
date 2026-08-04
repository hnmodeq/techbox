"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, Search, Wrench } from "lucide-react";
import type { ContentItem } from "@/lib/content";

const toolRules = [
  { href: "/tools/nvr-selector", title: "انتخاب NVR و محاسبه فضای ضبط", keywords: ["دوربین", "nvr", "ضبط", "رزولوشن"] },
  { href: "/tools/raid-calculator", title: "محاسبه ظرفیت و تحمل خرابی RAID", keywords: ["raid", "ظرفیت", "دیسک", "خرابی", "فضا"] },
  { href: "/tools/nas-selector", title: "انتخاب NAS برای سناریوی شما", keywords: ["nas", "ذخیره", "بکاپ", "کاربر", "آرشیو"] },
  { href: "/tools/ups-calculator", title: "محاسبه UPS و زمان پشتیبانی", keywords: ["ups", "برق", "باتری", "توان", "خاموشی"] },
  { href: "/tools/subnet-calculator", title: "طراحی بازه IP و زیرشبکه", keywords: ["ip", "شبکه", "subnet", "cidr", "vlan"] },
] as const;

function relevance(item: ContentItem, query: string) {
  const words = query.toLowerCase().split(/\s+/).filter((word) => word.length > 2);
  const text = `${item.title} ${item.excerpt} ${(item.tags ?? []).join(" ")}`.toLowerCase();
  return words.reduce((total, word) => total + (text.includes(word) ? 1 : 0), 0);
}

export function SolutionComposer({ catalog }: { catalog: ContentItem[] }) {
  const [query, setQuery] = React.useState("");
  const [submitted, setSubmitted] = React.useState("");

  const tools = React.useMemo(() => {
    const normalized = submitted.toLowerCase();
    const ranked = toolRules
      .map((tool) => ({ tool, score: tool.keywords.filter((keyword) => normalized.includes(keyword)).length }))
      .sort((a, b) => b.score - a.score);
    return ranked.filter((item) => item.score > 0).slice(0, 2).map((item) => item.tool);
  }, [submitted]);
  const content = React.useMemo(
    () => submitted
      ? [...catalog]
          .map((item) => ({ item, score: relevance(item, submitted) }))
          .filter((entry) => entry.score > 0)
          .sort((a, b) => b.score - a.score || new Date(b.item.date).getTime() - new Date(a.item.date).getTime())
          .slice(0, 3)
          .map((entry) => entry.item)
      : [],
    [catalog, submitted],
  );

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const value = query.trim();
    if (value) setSubmitted(value);
  };

  return (
    <section id="v2-solve" className="bg-white py-12 dark:bg-black" aria-labelledby="v2-solve-title">
      <div className="mx-auto grid w-full max-w-[1280px] gap-6 px-4 sm:px-6 lg:grid-cols-[.82fr_1.18fr] lg:px-8">
        <div className="border border-border bg-card p-6 sm:p-8">
          <div className="flex size-10 items-center justify-center border border-border text-[color:var(--module-tools-color)]">
            <Wrench className="size-5" />
          </div>
          <h2 id="v2-solve-title" className="mt-5 text-2xl font-black text-foreground sm:text-3xl">چه مسئله‌ای داری؟</h2>
          <p className="mt-2 text-sm leading-7 text-muted-foreground">
            سناریو را با عدد و محدودیت واقعی بنویس. نسخه آزمایشی بدون ادعای هوش مصنوعی، ابزار و محتوای مرتبط تکباکس را کنار هم می‌چیند.
          </p>
          <form onSubmit={submit} className="mt-5">
            <textarea
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="مثلاً: برای ۷۰ دوربین 4K و نگهداری ۳۰ روزه چقدر فضا و چه NVRی لازم دارم؟"
              className="min-h-28 w-full resize-y border border-border bg-background p-3 text-sm leading-6 text-foreground outline-none placeholder:text-muted-foreground focus:border-foreground"
            />
            <button type="submit" className="mt-3 inline-flex h-10 items-center gap-2 bg-foreground px-5 text-sm font-bold text-background">
              ساخت مسیر پیشنهادی <ArrowLeft className="size-4" />
            </button>
          </form>
        </div>

        <div className="border border-border p-6 sm:p-8" aria-live="polite">
          {!submitted ? (
            <div className="flex h-full min-h-64 flex-col items-center justify-center text-center">
              <Search className="size-7 text-muted-foreground" />
              <p className="mt-3 text-sm text-muted-foreground">بعد از نوشتن سناریو، مسیر حل مسئله اینجا نمایش داده می‌شود.</p>
            </div>
          ) : (
            <div>
              <p className="text-xs font-bold text-[color:var(--module-tools-color)]">مسیر پیشنهادی بر اساس محتوای موجود</p>
              <h3 className="mt-1 line-clamp-2 text-xl font-black text-foreground">{submitted}</h3>
              <div className="mt-5 space-y-3">
                {tools.map((tool, index) => (
                  <ResultLink key={tool.href} index={index + 1} href={tool.href} title={tool.title} label="ابزار" />
                ))}
                {content.map((item, index) => (
                  <ResultLink key={`${item.module}-${item.slug}`} index={tools.length + index + 1} href={`/${item.module}/${item.slug}`} title={item.title} label="محتوا" />
                ))}
                {tools.length === 0 && content.length === 0 && (
                  <p className="border-s-2 border-border ps-3 text-sm leading-6 text-muted-foreground">
                    تطبیق دقیقی پیدا نشد؛ جستجوی کامل یا مطرح‌کردن سؤال در انجمن بهترین قدم بعدی است.
                  </p>
                )}
              </div>
              <div className="mt-6 flex flex-wrap gap-3 border-t border-border pt-5">
                <Link href={`/search?q=${encodeURIComponent(submitted)}`} className="text-sm font-bold text-foreground underline underline-offset-4">جستجوی کامل</Link>
                <Link href="/forum?new=1" className="text-sm font-bold text-[color:var(--module-forum-color)] underline underline-offset-4">پرسیدن از جامعه</Link>
                <Link href="/consultation" className="text-sm font-bold text-[color:var(--module-shop-color)] underline underline-offset-4">درخواست مشاوره</Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function ResultLink({ index, href, title, label }: { index: number; href: string; title: string; label: string }) {
  return (
    <Link href={href} className="group grid grid-cols-[2rem_1fr_auto] items-center gap-3 border-b border-border pb-3 last:border-0">
      <span className="font-mono text-xs text-muted-foreground">{String(index).padStart(2, "0")}</span>
      <span className="text-sm font-bold text-foreground transition-colors group-hover:text-primary">{title}</span>
      <span className="text-[10px] text-muted-foreground">{label}</span>
    </Link>
  );
}
