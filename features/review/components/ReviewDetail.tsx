"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/design/icons";

type ReviewDetailProps = {
  item: any;
};

export default function ReviewDetail({ item }: ReviewDetailProps) {
  const [likesCount, setLikesCount] = useState<number>(item.likes || 45);
  const [hasLiked, setHasLiked] = useState(false);

  // Fallback strengths/weaknesses if not explicit in item data
  const strengths = item.strengths || [
    "عملکرد بسیار پایدار و سرعت خیره‌کننده در تست‌های زیرساخت",
    "کیفیت ساخت سازمانی و پشتیبانی از قطعات Redundant",
    "رابط کاربری و ابزارهای مدیریتی پیشرفته و پخته",
  ];
  const weaknesses = item.weaknesses || [
    "قیمت نسبتاً بالا در مقایسه با برخی راهکارهای میان‌رده بازار",
    "نیاز به لایسنس یا ماژول‌های جانبی برای فعال‌سازی برخی قابلیت‌های پیشرفته",
  ];

  return (
    <main className="mx-auto max-w-4xl px-4 py-10" dir="rtl">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 tb-text-sm text-[var(--tb-fg-muted)]">
        <Link href="/" className="hover:text-[var(--tb-fg-primary)]">خانه</Link>
        <span>/</span>
        <Link href="/review" className="hover:text-[var(--tb-fg-primary)]">نقد و بررسی</Link>
        <span>/</span>
        <span className="truncate text-[var(--tb-fg-primary)] max-w-xs">{item.title}</span>
      </nav>

      <article className="card p-6 sm:p-8 space-y-8 shadow-lg border-[var(--tb-border)]">
        {/* Header */}
        <header className="border-b border-[var(--tb-border)] pb-6 space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <span className="rounded-full bg-[color-mix(in_oklch,var(--tb-review)_15%,transparent)] border border-[color-mix(in_oklch,var(--tb-review)_30%,transparent)] px-3.5 py-1 text-xs font-bold text-[var(--tb-review)]">
              {item.category || "بررسی تخصصی"}
            </span>
            <span className="tb-text-sm text-[var(--tb-fg-muted)]">{item.date_fa}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-[var(--tb-fg-primary)] leading-10">
            {item.title}
          </h1>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            <div className="flex items-center gap-3">
              <Image
                src={item.author?.avatar || "/assets/hooman.png"}
                alt={item.author?.name || "نویسنده"}
                width={48}
                height={48}
                className="h-12 w-12 rounded-full object-cover ring-1 ring-[var(--tb-border)]"
              />
              <div>
                <div className="font-bold text-[var(--tb-fg-primary)]">{item.author?.name || "نویسنده تکباکس"}</div>
                <div className="tb-text-sm text-[var(--tb-fg-muted)]">{item.author?.role || "تحلیلگر سخت‌افزار"}</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 tb-text-sm text-[var(--tb-fg-muted)] bg-[var(--tb-bg-muted)] px-3 py-1.5 rounded-full border border-[var(--tb-border)]">
                <Icon name="view" size={16} />
                <span>{item.views?.toLocaleString("fa-IR") || "۲,۱۰۰"} بازدید</span>
              </span>

              <button
                onClick={() => {
                  setLikesCount((prev) => (hasLiked ? prev - 1 : prev + 1));
                  setHasLiked(!hasLiked);
                }}
                className={`inline-flex items-center gap-1.5 tb-text-sm px-4 py-1.5 rounded-full border font-bold transition-all ${
                  hasLiked
                    ? "bg-[var(--tb-review)]/15 border-[var(--tb-review)] text-[var(--tb-review)] shadow-sm"
                    : "bg-[var(--tb-bg-secondary)] border-[var(--tb-border)] text-[var(--tb-fg-primary)] hover:border-[var(--tb-review)]"
                }`}
              >
                <Icon name="like" size={16} className={hasLiked ? "fill-current" : ""} />
                <span>{likesCount.toLocaleString("fa-IR")} پسند</span>
              </button>
            </div>
          </div>
        </header>

        {/* Featured Image */}
        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-[var(--tb-radius-lg)] bg-[var(--tb-bg-muted)] shadow-md">
          <Image src={item.image || "/assets/blog-1.jpg"} alt={item.title} fill sizes="800px" className="object-cover" />
        </div>

        {/* Excerpt Lead */}
        <p className="text-lg font-bold leading-9 text-[var(--tb-fg-primary)] bg-[var(--tb-bg-muted)]/40 p-5 rounded-[var(--tb-radius-md)] border-r-4 border-[var(--tb-review)]">
          {item.excerpt}
        </p>

        {/* Strengths & Weaknesses Boxes */}
        <div className="grid md:grid-cols-2 gap-6 my-8">
          {/* Strengths */}
          <div className="rounded-[var(--tb-radius-lg)] border border-[color-mix(in_oklch,var(--tb-success)_40%,transparent)] bg-[color-mix(in_oklch,var(--tb-success)_8%,var(--tb-bg-secondary))] p-5 space-y-4 shadow-sm">
            <div className="flex items-center gap-2.5 text-base font-black text-[var(--tb-success)] border-b border-[color-mix(in_oklch,var(--tb-success)_25%,transparent)] pb-3">
              <Icon name="check" size={20} className="stroke-[2.5]" />
              <span>نقاط قوت</span>
            </div>
            <ul className="space-y-3">
              {strengths.map((str: string, idx: number) => (
                <li key={idx} className="flex items-start gap-2.5 text-[14px] leading-7 text-[var(--tb-fg-primary)]">
                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[var(--tb-success)]" />
                  <span>{str}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Weaknesses */}
          <div className="rounded-[var(--tb-radius-lg)] border border-[color-mix(in_oklch,var(--tb-warning)_40%,transparent)] bg-[color-mix(in_oklch,var(--tb-warning)_8%,var(--tb-bg-secondary))] p-5 space-y-4 shadow-sm">
            <div className="flex items-center gap-2.5 text-base font-black text-[var(--tb-warning)] border-b border-[color-mix(in_oklch,var(--tb-warning)_25%,transparent)] pb-3">
              <Icon name="shield" size={20} className="stroke-[2.5]" />
              <span>نقاط ضعف</span>
            </div>
            <ul className="space-y-3">
              {weaknesses.map((wk: string, idx: number) => (
                <li key={idx} className="flex items-start gap-2.5 text-[14px] leading-7 text-[var(--tb-fg-primary)]">
                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[var(--tb-warning)]" />
                  <span>{wk}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Full Review Content */}
        <div className="prose max-w-none leading-9 text-[15px] text-[var(--tb-fg-primary)] whitespace-pre-line pt-4 border-t border-[var(--tb-border)]">
          {item.content || "متن کامل ارزیابی این محصول در درگاه آزمایشگاهی تکباکس ثبت شده است."}
        </div>

        {/* Notice: No internal review rating stars or tag outputs per user requirements */}
      </article>
    </main>
  );
}
