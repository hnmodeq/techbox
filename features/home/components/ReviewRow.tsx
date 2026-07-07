'use client';

import React from 'react';
import { getLatest } from '@/lib/content';
import { HOME_ROW_SIZES } from './HomeRowConfig';
import Link from 'next/link';
import Image from 'next/image';
import { CardStats } from '@/components/ui/card-stats';
import { AuthorLink } from '@/components/ui/author-link';

export default function ReviewRow() {
  const reviews = getLatest('review', 5);

  return (
    <section className={`w-full py-12 px-4 sm:px-6 lg:px-8 bg-[var(--main-background)] ${HOME_ROW_SIZES.reviewMinHeight} flex flex-col justify-center`} dir="rtl">
      <div className={`mx-auto ${HOME_ROW_SIZES.containerMaxWidth} w-full`}>
        {/* Simple Text More Button positioned ABOVE items inside the header */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <h2 className="text-xl sm:text-2xl font-black text-[var(--primary-text)]">بنچمارک‌ها و تست‌های عملی سخت‌افزار</h2>
          <Link href="/review" className="text-sm font-bold text-[var(--review)] hover:underline flex items-center gap-1 shrink-0">
            <span>مشاهده تمام بررسی‌ها</span>
            <span>←</span>
          </Link>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {reviews.map((rev) => (
              <div
                key={rev.slug}
                className="group bg-[var(--card-background)] text-[var(--primary-text)] border-[length:var(--border-size)] border-[var(--border-color)] rounded-[var(--corner-radius)] shadow-[var(--shadow-size)] !p-0 overflow-hidden flex flex-col justify-between hover:shadow-[var(--shadow-size)] transition-all duration-[200ms] border-[length:var(--border-size)] border-[var(--border-color)]"
              >
                <Link href={`/review/${rev.slug}`} className="block flex-1">
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-[var(--muted-background)]">
                    <Image
                      src={rev.image || '/assets/blog-1.jpg'}
                      alt={rev.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 300px"
                    />
                  </div>

                  <div className="p-4">
                    <div className="mb-2 text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] paragraph-color font-bold">
                      <span>{rev.category || 'بررسی تخصصی'}</span>
                      <span> • {rev.date_fa}</span>
                    </div>
                    <h3 className="text-[length:var(--h3-font-size)] text-[var(--h3-font-color)] font-semibold font-bold text-[var(--primary-text)] group-hover:text-[var(--review)] transition-colors line-clamp-2 leading-6">
                      {rev.title}
                    </h3>
                    <p className="text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] paragraph-color mt-2 line-clamp-2 leading-5">
                      {rev.excerpt}
                    </p>
                  </div>
                </Link>

                <div className="px-4 pb-4 pt-3 border-t-[length:var(--border-size)] border-[var(--border-color)]/60 flex items-center justify-between text-xs paragraph-color font-bold">
                  <AuthorLink name={rev.author?.name} avatar={rev.author?.avatar} role={rev.author?.role} />
                  <CardStats module="review" slug={rev.slug} showComments={true} />
                </div>
              </div>
            ))}
        </div>
      </div>
    </section>
  );
}
