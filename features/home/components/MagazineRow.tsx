'use client';

import React from 'react';
import { getLatest, getCommentCount } from '@/lib/content';
import { HOME_ROW_SIZES } from './HomeRowConfig';
import Link from 'next/link';
import Image from 'next/image';
import { Icon } from '@/design/icons';
import { CardStats } from '@/components/ui/CardStats';
import { AuthorLink } from '@/components/ui/AuthorLink';

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
            <div
              key={art.slug}
              className="group card !p-0 overflow-hidden flex flex-col justify-between hover:-translate-y-1 hover:shadow-[var(--tb-shadow-lg)] transition-all duration-[var(--tb-motion-md)] border border-[var(--tb-border)]"
            >
              <Link href={`/blog/${art.slug}`} className="block flex-1">
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-[var(--tb-bg-muted)]">
                  <Image
                    src={art.image || '/assets/blog-1.jpg'}
                    alt={art.title}
                    fill
                    className="object-cover transition-transform duration-[var(--tb-motion-lg)] group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 300px"
                  />
                </div>

                <div className="p-4">
                  <div className="tb-text-sm text-[var(--tb-fg-muted)] mb-1.5 font-bold">
                    <span>{art.date_fa}</span>
                  </div>
                  <h3 className="tb-text-md font-bold text-[var(--tb-fg-primary)] group-hover:text-[var(--tb-blog)] transition-colors line-clamp-2 leading-7">
                    {art.title}
                  </h3>
                  <p className="tb-text-sm text-[var(--tb-fg-muted)] mt-2 line-clamp-2 leading-6">
                    {art.excerpt}
                  </p>
                </div>
              </Link>

              <div className="px-4 pb-4 pt-3 border-t border-[var(--tb-border)]/60 flex items-center justify-between text-xs text-[var(--tb-fg-muted)] font-bold">
                <AuthorLink name={art.author?.name} avatar={art.author?.avatar} />
                <CardStats module={art.module || 'blog'} slug={art.slug} initialViews={art.views ?? 0} initialLikes={art.likes ?? 0} initialComments={getCommentCount("blog", art.slug)} showComments={true} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
