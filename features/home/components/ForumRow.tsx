'use client';

import React from 'react';
import { HOME_ROW_SIZES } from './HomeRowConfig';
import { useHomeModule } from '@/features/home/lib/home-data';
import { ButtonLink } from '@/components/ui/button';
import { EmptyRow } from './HomeRowSkeletons';
import { ForumCard, ForumCardSkeleton } from '@/components/content/ForumCard';

export default function ForumRow({
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
  const { items: topics, loading } = useHomeModule('forum');

  return (
    <section
      className={`w-full py-12 px-4 sm:px-6 lg:px-8 bg-background ${HOME_ROW_SIZES.forumMinHeight} flex flex-col justify-center`}
      dir="rtl"
    >
      <div className={`mx-auto ${HOME_ROW_SIZES.containerMaxWidth} w-full`}>
        <div className="flex items-center justify-between gap-4 mb-6">
          {showHomeTitle && (
            <h2 className="text-xl sm:text-2xl font-black text-foreground">
              {homeTitle || 'داغ‌ترین بحث‌ها و چالش‌های شبکه و دیتاسنتر'}
            </h2>
          )}
          {showHomeMoreLabel && (
            <ButtonLink variant="link" size="sm" className="text-[var(--primary)] font-bold shrink-0" href="/forum">
              {homeMoreLabel || 'ورود به انجمن و ثبت پرسش ←'}
            </ButtonLink>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => <ForumCardSkeleton key={i} />)
          ) : topics.length === 0 ? (
            <div className="col-span-full">
              <EmptyRow>هنوز موضوعی در دیتابیس انجمن ثبت نشده است.</EmptyRow>
            </div>
          ) : (
            topics.map((top) => (
              <ForumCard
                key={top.slug}
                topic={{
                  slug: top.slug,
                  title: top.title,
                  excerpt: top.excerpt,
                  content: top.content,
                  date: top.date,
                  comments: top.comments,
                  solved: (top as any).solved,
                  author: top.author as any,
                  acceptedAnswer: (top as any).acceptedAnswer,
                }}
              />
            ))
          )}
        </div>
      </div>
    </section>
  );
}
