'use client';

import Image from "next/image";
import { ContentItem } from "@/lib/content";
import Link from "next/link";
import ModuleHeader from "@/components/effects/ModuleHeader";
import { Icon } from "@/design/icons";
import { CardStats } from "@/components/ui/card-stats";

function Stars({ rating }: { rating: number }) {
  const full = Math.round(rating);
  return (
    <span className="inline-flex items-center gap-1 text-[var(--warning)]">
      {Array.from({ length: 5 }).map((_, i) => (
        <Icon key={i} name="star" size={14} className={i < full ? 'fill-current' : 'opacity-35'} strokeWidth={1.5} />
      ))}
      <span className="ms-1.5 text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] font-bold text-[var(--primary-text)]">{rating.toFixed(1)}</span>
    </span>
  );
}

export default function ReviewGridAsync({ items }: { items: ContentItem[] }) {
  return (
    <main className="mx-auto max-w-7xl px-4 md:px-8 py-14" dir="rtl">
      <ModuleHeader module="review" title="نقد و بررسی تکباکس" description={`بنچمارک‌ها و تست‌های عملی سخت‌افزار • ${items.length.toLocaleString("fa-IR")} بررسی`} />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((rev, idx) => {
          const rating = 4.8 - idx * 0.15; // Note: should come from DB in future
          return (
            <Link key={rev.slug} href={`/review/${rev.slug}`} className="group flex flex-col overflow-hidden rounded-[var(--corner-radius)] border-[length:var(--border-size)] border-[var(--border-color)] bg-[var(--card-background)] shadow-[var(--shadow-size)] transition-all duration-[200ms] hover:-translate-y-1 hover:shadow-[var(--shadow-size)]">
              <div className="relative aspect-[16/10] overflow-hidden bg-[var(--muted-background)]">
                <Image src={rev.image || "/assets/blog-1.jpg"} alt={rev.title} fill sizes="(min-width:1024px) 33vw, 100vw" className="object-cover transition-transform duration-[300ms] group-hover:scale-105" />
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <div className="mb-2"><Stars rating={rating} /></div>
                <h3 className="text-[length:var(--h3-font-size)] text-[var(--h3-font-color)] font-semibold line-clamp-2 transition-colors group-hover:text-[var(--review)] min-h-[48px]">{rev.title}</h3>
                <p className="text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] paragraph-color line-clamp-3 mt-2 flex-1">{rev.excerpt}</p>
                <div className="flex items-center justify-between mt-4 pt-3 border-t-[length:var(--border-size)] border-[color-mix(in_oklch,var(--border-color)_50%,transparent)]">
                  <div className="flex items-center gap-2">
                    {rev.author.avatar && <Image src={rev.author.avatar} width={28} height={28} className="h-7 w-7 rounded-[var(--corner-radius)] object-cover ring-1 ring-[var(--border-color)]" alt={rev.author.name} />}
                    <div>
                      <div className="text-xs text-[var(--primary-text)]">{rev.author.name}</div>
                      <div className="text-xs paragraph-color">{rev.date_fa}</div>
                    </div>
                  </div>
                  <CardStats module="review" slug={rev.slug} initialViews={rev.views ?? 0} initialLikes={rev.likes ?? 0} showComments={true} />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </main>
  );
}