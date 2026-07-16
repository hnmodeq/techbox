"use client";

import Image from "next/image";
import { blurProps } from "@/lib/image-placeholder";
import { getModuleItems, type ContentItem } from "@/lib/content";
import { useDbPosts } from "@/hooks/useDbPosts";
import Link from "next/link";
import ModuleHeader from "@/components/effects/ModuleHeader";
import { CardStats } from "@/components/ui/card-stats";
import { ReviewRating } from "@/components/ui/review-rating";

export default function ReviewGrid({ serverItems }: { serverItems?: ContentItem[] }) {
  const fallbackItems = getModuleItems("review");
  const { items: dbItems } = useDbPosts("review", fallbackItems, 100);

  const items = serverItems && serverItems.length > 0 ? serverItems : dbItems;

  return (
    <main className="mx-auto max-w-5xl px-4 py-12" dir="rtl">
      <ModuleHeader module="review" title="نقد و بررسی تخصصی تجهیزات" description="تست‌های آزمایشگاهی زیرساخت، بنچمارک دقیق و ارزیابی معماری" count={`${items.length.toLocaleString("fa-IR")} بررسی`} />

      {/* Single column vertical list with full-width horizontal cards */}
      <div className="flex flex-col gap-6 mt-8">
        {items.map((r: any) => (
            <Link key={r.slug} href={`/review/${r.slug}`} className="bg-[var(--card-background)] text-[var(--primary-text)] border-[length:var(--border-size)] border-[var(--border-color)] rounded-[var(--corner-radius)] shadow-[var(--shadow-size)] overflow-hidden group grid md:grid-cols-[280px_1fr] lg:grid-cols-[320px_1fr] gap-6 !p-0 transition-all hover:shadow-[var(--shadow-size)] items-stretch">
              <div className="block relative aspect-[16/10] md:aspect-auto md:h-full bg-[var(--muted-background)] overflow-hidden min-h-[220px]">
                <Image src={r.image || "/assets/blog-1.jpg"} fill sizes="(min-width:1024px) 320px, 100vw" className="object-cover transition-transform duration-[300ms] group-hover:scale-105" alt={r.title} {...blurProps(r.image || "/assets/blog-1.jpg")} />
                <span className="absolute top-3 right-3 rounded-full border-[length:var(--border-size)] border-white/30 bg-black/50 px-3 py-1 text-xs font-bold text-white backdrop-blur-md">{r.category}</span>
              </div>

              <div className="p-5 sm:p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-3 mb-2 flex-wrap text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] paragraph-color font-bold">
                    <span>{r.category || 'بررسی تخصصی'} • {r.date_fa}</span>
                    <ReviewRating slug={r.slug} fallbackRating={r.rating ?? null} fallbackCount={r.ratingCount ?? 0} />
                  </div>

                  <h3 className="text-lg sm:text-xl font-black text-[var(--primary-text)] transition-colors group-hover:text-[var(--review)] leading-8">
                    {r.title}
                  </h3>

                  <p className="mt-3 text-[14px] leading-7 paragraph-color line-clamp-3">
                    {r.excerpt}
                  </p>
                </div>

                {/* Author & stats footer */}
                <div className="flex flex-wrap items-center justify-between gap-4 mt-6 pt-4 border-t-[length:var(--border-size)] border-[var(--border-color)]">
                  <div className="flex items-center gap-3">
                    <Image src={r.author?.avatar || "/assets/hooman.png"} width={36} height={36} className="h-9 w-9 rounded-full object-cover ring-1 ring-[var(--border-color)]" alt={r.author?.name || "نویسنده"} />
                    <div>
                      <div className="text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] font-bold text-[var(--primary-text)]">{r.author?.name || "نویسنده تکباکس"}</div>
                      <div className="text-[11px] paragraph-color">{r.author?.role || "تحلیلگر سخت‌افزار"}</div>
                    </div>
                  </div>

                  <CardStats module="review" slug={r.slug} initialViews={r.views} initialLikes={r.likes} initialComments={r.comments || 0} showComments={true} />
                </div>
              </div>
            </Link>
          ))}
      </div>
    </main>
  );
}
