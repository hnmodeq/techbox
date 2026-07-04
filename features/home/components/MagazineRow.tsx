'use client';

import React from 'react';
import { getLatest } from '@/lib/content';
import { HOME_ROW_SIZES } from './HomeRowConfig';
import Link from 'next/link';
import Image from 'next/image';
import { Icon } from '@/design/icons';

export default function MagazineRow() {
  const articles = getLatest('blog', 5);

  return (
    <section className={`w-full py-12 px-4 sm:px-6 lg:px-8 bg-[var(--tb-bg-primary)] ${HOME_ROW_SIZES.magazineMinHeight} flex flex-col justify-center`} dir="rtl">
      <div className={`mx-auto ${HOME_ROW_SIZES.containerMaxWidth} w-full`}>
        {/* Simple Text More Button positioned ABOVE items inside the header */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <h2 className="text-xl sm:text-2xl font-black text-[var(--tb-fg-primary)]">آخرین مقالات و تحلیل‌های زیرساخت</h2>
          <Link href="/blog" className="text-sm font-bold text-[var(--tb-blog)] hover:underline flex items-center gap-1 shrink-0">
            <span>مشاهده همه مقالات</span>
            <span>←</span>
          </Link>
        </div>

        {/* Expanded grid showing items edge-to-edge */}
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {articles.map((art) => (
            <Link
              key={art.slug}
              href={`/blog/${art.slug}`}
              className="group card !p-0 overflow-hidden flex flex-col justify-between hover:-translate-y-1 hover:shadow-[var(--tb-shadow-lg)] transition-all duration-[var(--tb-motion-md)] border border-[var(--tb-border)]"
            >
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-[var(--tb-bg-muted)]">
                <Image
                  src={art.image || '/assets/blog-1.jpg'}
                  alt={art.title}
                  fill
                  className="object-cover transition-transform duration-[var(--tb-motion-lg)] group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 300px"
                />
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="tb-text-sm text-[var(--tb-fg-muted)] mb-1.5 flex items-center gap-1.5">
                    <Icon name="clock" className="h-3.5 w-3.5" />
                    <span>{art.date_fa}</span>
                  </div>
                  <h3 className="tb-text-md font-bold text-[var(--tb-fg-primary)] group-hover:text-[var(--tb-blog)] transition-colors line-clamp-2 leading-7">
                    {art.title}
                  </h3>
                  <p className="tb-text-sm text-[var(--tb-fg-muted)] mt-2 line-clamp-2 leading-6">
                    {art.excerpt}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[var(--tb-border)]/60 flex items-center justify-between text-[11px] text-[var(--tb-fg-muted)]">
                  <div className="flex items-center gap-1.5">
                    <Image src={art.author?.avatar || '/assets/hooman.png'} alt={art.author?.name || 'نویسنده'} width={22} height={22} className="rounded-full object-cover ring-1 ring-[var(--tb-border)]" />
                    <span className="font-bold text-[var(--tb-fg-primary)]">{art.author?.name || 'تحریریه'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>👁 {(art.views ?? 0).toLocaleString('fa-IR')}</span>
                    <span>♥ {(art.likes ?? 0).toLocaleString('fa-IR')}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
