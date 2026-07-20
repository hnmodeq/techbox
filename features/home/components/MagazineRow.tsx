'use client';

import React from 'react';
import { useHomeModule } from '@/features/home/lib/home-data';
import { HOME_ROW_SIZES } from './HomeRowConfig';
import Link from 'next/link';
import { ButtonLink } from '@/components/ui/button';
import { EmptyRow, RowGridSkeleton } from './HomeRowSkeletons';
import { MagazineCard } from '@/components/content/MagazineCard';

export default function MagazineRow({
  homeTitle,
  homeMoreLabel,
  showHomeTitle = true,
  showHomeMoreLabel = true,
}: {
  homeTitle?: string;
  homeMoreLabel?: string;
  showHomeTitle?: boolean;
  showHomeMoreLabel?: boolean;
}) {
  const { items: dbArticles, loading } = useHomeModule('blog');
  const articles = dbArticles.slice(0, 3);

  return (
    <section
      className={`w-full py-8 px-4 sm:px-6 lg:px-8 bg-background ${HOME_ROW_SIZES.magazineMinHeight} flex flex-col justify-center`}
      dir="rtl"
    >
      <div className={`mx-auto ${HOME_ROW_SIZES.containerMaxWidth} w-full`}>
        <div className="flex items-center justify-between gap-4 mb-6">
          {showHomeTitle && (
            <h2 className="text-xl sm:text-2xl font-black text-foreground">
              {homeTitle || "آخرین مقالات منتشر شده"}
            </h2>
          )}
          {showHomeMoreLabel && (
            <ButtonLink
              variant="link"
              size="sm"
              className="text-[var(--primary)] font-bold shrink-0"
              href="/blog"
            >
              {homeMoreLabel || "مشاهده همه ←"}
            </ButtonLink>
          )}
        </div>

        {loading ? (
          <RowGridSkeleton count={3} />
        ) : articles.length === 0 ? (
          <EmptyRow>هنوز مقاله‌ای در دیتابیس ثبت نشده است.</EmptyRow>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((art) => (
              <MagazineCard key={art.slug} item={art} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
