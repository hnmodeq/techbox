"use client";

import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/design/icons";
import { LiveViewCounter } from "@/components/ui/live-view-counter";
import { LikeButton } from "@/components/ui/like-button";
import CommentSection from "@/features/comment/components/CommentSection";

type ReviewDetailProps = {
  item: any;
};

export default function ReviewDetail({ item }: ReviewDetailProps) {
  // Likes/counts are rendered by the real <LikeButton /> / <CommentSection /> below.

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
      <nav className="mb-6 flex items-center gap-2 text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] paragraph-color">
        <Link href="/" className="hover:text-[var(--primary-text)]">خانه</Link>
        <span>/</span>
        <Link href="/review" className="hover:text-[var(--primary-text)]">نقد و بررسی</Link>
        <span>/</span>
        <span className="truncate text-[var(--primary-text)] max-w-xs">{item.title}</span>
      </nav>

      <article className="bg-[var(--card-background)] text-[var(--primary-text)] border-[length:var(--border-size)] border-[var(--border-color)] rounded-[var(--corner-radius)] shadow-[var(--shadow-size)] p-6 sm:p-8 space-y-8 shadow-[var(--shadow-size)] border-[var(--border-color)]">
        {/* Header */}
        <header className="border-b-[length:var(--border-size)] border-[var(--border-color)] pb-6 space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <span className="rounded-full bg-[color-mix(in_oklch,var(--review)_15%,transparent)] border-[length:var(--border-size)] border-[color-mix(in_oklch,var(--review)_30%,transparent)] px-3.5 py-1 text-xs font-bold text-[var(--review)]">
              {item.category || "بررسی تخصصی"}
            </span>
            <span className="text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] paragraph-color">{item.date_fa}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-[var(--primary-text)] leading-10">
            {item.title}
          </h1>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            <div className="flex items-center gap-3">
              <Image
                src={item.author?.avatar || "/assets/hooman.png"}
                alt={item.author?.name || "نویسنده"}
                width={48}
                height={48}
                className="h-12 w-12 rounded-full object-cover ring-1 ring-[var(--border-color)]"
              />
              <div>
                <div className="font-bold text-[var(--primary-text)]">{item.author?.name || "نویسنده تکباکس"}</div>
                <div className="text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] paragraph-color">{item.author?.role || "تحلیلگر سخت‌افزار"}</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <LiveViewCounter module="review" slug={item.slug} initialViews={item.views ?? 0} showLabel={true} />
              <LikeButton contentType="review" slug={item.slug} initial={item.likes ?? 0} />
            </div>
          </div>
        </header>

        {/* Featured Image */}
        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-[var(--corner-radius)] bg-[var(--muted-background)] shadow-[var(--shadow-size)]">
          <Image src={item.image || "/assets/blog-1.jpg"} alt={item.title} fill sizes="800px" className="object-cover" />
        </div>

        {/* Excerpt Lead */}
        <p className="text-lg font-bold leading-9 text-[var(--primary-text)] bg-[var(--muted-background)]/40 p-5 rounded-[var(--corner-radius)] border-r-4 border-[var(--review)]">
          {item.excerpt}
        </p>

        {/* Strengths & Weaknesses Boxes */}
        <div className="grid md:grid-cols-2 gap-6 my-8">
          {/* Strengths */}
          <div className="rounded-[var(--corner-radius)] border-[length:var(--border-size)] border-[color-mix(in_oklch,var(--success)_40%,transparent)] bg-[color-mix(in_oklch,var(--success)_8%,var(--card-background))] p-5 space-y-4 shadow-[var(--shadow-size)]">
            <div className="flex items-center gap-2.5 text-base font-black text-[var(--success)] border-b-[length:var(--border-size)] border-[color-mix(in_oklch,var(--success)_25%,transparent)] pb-3">
              <Icon name="check" size={20} className="stroke-[2.5]" />
              <span>نقاط قوت</span>
            </div>
            <ul className="space-y-3">
              {strengths.map((str: string, idx: number) => (
                <li key={idx} className="flex items-start gap-2.5 text-[14px] leading-7 text-[var(--primary-text)]">
                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[var(--success)]" />
                  <span>{str}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Weaknesses */}
          <div className="rounded-[var(--corner-radius)] border-[length:var(--border-size)] border-[color-mix(in_oklch,var(--warning)_40%,transparent)] bg-[color-mix(in_oklch,var(--warning)_8%,var(--card-background))] p-5 space-y-4 shadow-[var(--shadow-size)]">
            <div className="flex items-center gap-2.5 text-base font-black text-[var(--warning)] border-b-[length:var(--border-size)] border-[color-mix(in_oklch,var(--warning)_25%,transparent)] pb-3">
              <Icon name="shield" size={20} className="stroke-[2.5]" />
              <span>نقاط ضعف</span>
            </div>
            <ul className="space-y-3">
              {weaknesses.map((wk: string, idx: number) => (
                <li key={idx} className="flex items-start gap-2.5 text-[14px] leading-7 text-[var(--primary-text)]">
                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[var(--warning)]" />
                  <span>{wk}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Full Review Content */}
        <div className="prose max-w-none leading-9 text-[15px] text-[var(--primary-text)] whitespace-pre-line pt-4 border-t-[length:var(--border-size)] border-[var(--border-color)]">
          {item.content || "متن کامل ارزیابی این محصول در درگاه آزمایشگاهی تکباکس ثبت شده است."}
        </div>

        <CommentSection module="review" slug={item.slug} />
      </article>
    </main>
  );
}
