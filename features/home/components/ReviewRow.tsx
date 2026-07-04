'use client';

import React from 'react';
import { getLatest } from '@/lib/content';
import { HOME_ROW_SIZES } from './HomeRowConfig';
import Link from 'next/link';
import Image from 'next/image';
import { Icon } from '@/design/icons';

function Stars({ rating }: { rating: number }) {
  const full = Math.round(rating);
  return (
    <span className="inline-flex items-center gap-1 text-[var(--tb-warning)]">
      {Array.from({ length: 5 }).map((_, i) => (
        <Icon key={i} name="star" size={14} className={i < full ? 'fill-current' : 'opacity-35'} strokeWidth={1.5} />
      ))}
      <span className="ms-1.5 tb-text-sm font-bold text-[var(--tb-fg-primary)]">{rating.toFixed(1)}</span>
    </span>
  );
}

export default function ReviewRow() {
  const reviews = getLatest('review', 5);

  return (
    <section className={`w-full py-12 px-4 sm:px-6 lg:px-8 bg-[var(--tb-bg-primary)] ${HOME_ROW_SIZES.reviewMinHeight} flex flex-col justify-center`} dir="rtl">
      <div className={`mx-auto ${HOME_ROW_SIZES.containerMaxWidth} w-full`}>
        {/* Simple Text More Button positioned ABOVE items inside the header */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <h2 className="text-xl sm:text-2xl font-black text-[var(--tb-fg-primary)]">بنچمارک‌ها و تست‌های عملی سخت‌افزار</h2>
          <Link href="/review" className="text-sm font-bold text-[var(--tb-review)] hover:underline flex items-center gap-1 shrink-0">
            <span>مشاهده تمام بررسی‌ها</span>
            <span>←</span>
          </Link>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {reviews.map((rev, idx) => {
            const rating = 4.8 - idx * 0.15;
            return (
              <Link
                key={rev.slug}
                href={`/review/${rev.slug}`}
                className="group card !p-0 overflow-hidden flex flex-col justify-between hover:-translate-y-1 hover:shadow-[var(--tb-shadow-lg)] transition-all duration-[var(--tb-motion-md)] border border-[var(--tb-border)]"
              >
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-[var(--tb-bg-muted)]">
                  <Image
                    src={rev.image || '/assets/blog-1.jpg'}
                    alt={rev.title}
                    fill
                    className="object-cover transition-transform duration-[var(--tb-motion-lg)] group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 300px"
                  />
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="mb-2">
                      <Stars rating={rating} />
                    </div>
                    <h3 className="tb-text-md font-bold text-[var(--tb-fg-primary)] group-hover:text-[var(--tb-review)] transition-colors line-clamp-2 leading-6">
                      {rev.title}
                    </h3>
                    <p className="tb-text-sm text-[var(--tb-fg-muted)] mt-2 line-clamp-2 leading-5">
                      {rev.excerpt}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[var(--tb-border)]/60 flex items-center justify-between text-[11px] text-[var(--tb-fg-muted)]">
                    <span>✍️ {rev.author?.name || 'تحلیلگر سخت‌افزار'}</span>
                    <span>👁 {(rev.views ?? 0).toLocaleString('fa-IR')} بازدید</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
