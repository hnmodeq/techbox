'use client';

import React from 'react';
import { getLatest } from '@/lib/content';
import { HOME_ROW_SIZES } from './HomeRowConfig';
import Link from 'next/link';
import Image from 'next/image';
import { Icon } from '@/design/icons';

export default function MagazineRow() {
  const articles = getLatest('blog', 4);

  return (
    <section className={`w-full py-12 px-4 sm:px-6 lg:px-8 border-t border-[var(--tb-border)] bg-[var(--tb-bg-primary)] ${HOME_ROW_SIZES.magazineMinHeight} flex flex-col justify-center`} dir="rtl">
      <div className="mx-auto max-w-7xl w-full">
        <div className="flex items-end justify-between mb-8 border-b border-[var(--tb-border)]/60 pb-4">
          <div>
            <span className="badge !bg-[color-mix(in_oklch,var(--tb-blog)_15%,transparent)] !text-[var(--tb-blog)] font-black mb-2">
              مجله تخصصی تکباکس
            </span>
            <h2 className="tb-text-big-title text-[var(--tb-fg-primary)]">آخرین مقالات و تحلیل‌های زیرساخت</h2>
          </div>
          <Link href="/blog" className="btn btn-ghost text-[var(--tb-blog)] font-bold">
            مشاهده تمام مقالات مجله ←
          </Link>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
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
                <span className="absolute top-3 right-3 rounded-full border border-white/30 bg-black/60 px-2.5 py-0.5 tb-text-sm text-white backdrop-blur-md">
                  {art.category || 'مقاله'}
                </span>
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
