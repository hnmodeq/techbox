'use client';

import React, { useEffect, useState } from 'react';
import { getLatest } from '@/lib/content';
import { HOME_ROW_SIZES } from './HomeRowConfig';
import Link from 'next/link';
import Image from 'next/image';
import { blurProps } from "@/lib/image-placeholder";
import { CardStats } from '@/components/ui/card-stats';
import { ForumBadge } from '@/components/ui/forum-badge';

type ForumTopic = ReturnType<typeof getLatest>[0] & { solved?: boolean | null };

const fallbackTopics = getLatest('forum', 6) as ForumTopic[];

function ForumCardSkeleton() {
  return (
    <div className="bg-[var(--card-background)] border-[length:var(--border-size)] border-[var(--border-color)] rounded-[var(--corner-radius)] p-5 flex items-start gap-4">
      <div className="h-12 w-12 shrink-0 animate-pulse rounded-full bg-[var(--muted-background)]" />
      <div className="min-w-0 flex-1 space-y-3">
        <div className="h-4 w-1/2 animate-pulse rounded-[var(--corner-radius)] bg-[var(--muted-background)]" />
        <div className="h-5 w-full animate-pulse rounded-[var(--corner-radius)] bg-[var(--muted-background)]" />
        <div className="h-4 w-2/3 animate-pulse rounded-[var(--corner-radius)] bg-[var(--muted-background)]" />
      </div>
    </div>
  );
}

export default function ForumRow() {
  const [topics, setTopics] = useState<ForumTopic[] | null>(null);

  useEffect(() => {
    let mounted = true;

    fetch('/api/posts?module=forum&take=6', { cache: 'no-store' })
      .then((r) => {
        if (!r.ok) throw new Error('forum_posts_unavailable');
        return r.json();
      })
      .then((data) => {
        if (!mounted) return;
        setTopics(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (mounted) setTopics(fallbackTopics);
      });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section className={`w-full py-12 px-4 sm:px-6 lg:px-8 bg-[var(--main-background)] ${HOME_ROW_SIZES.forumMinHeight} flex flex-col justify-center`} dir="rtl">
      <div className={`mx-auto ${HOME_ROW_SIZES.containerMaxWidth} w-full`}>
        {/* Simple Text More Button positioned ABOVE items inside the header */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <h2 className="text-xl sm:text-2xl font-black text-[var(--primary-text)]">داغ‌ترین بحث‌ها و چالش‌های شبکه و دیتاسنتر</h2>
          <Link href="/forum" className="text-sm font-bold text-[var(--forum)] hover:underline flex items-center gap-1 shrink-0">
            <span>ورود به انجمن و ثبت پرسش</span>
            <span>←</span>
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {topics === null ? (
            Array.from({ length: 6 }).map((_, index) => <ForumCardSkeleton key={index} />)
          ) : topics.length === 0 ? (
            <div className="col-span-full rounded-[var(--corner-radius)] border-[length:var(--border-size)] border-[var(--border-color)] bg-[var(--card-background)] p-6 text-center paragraph-color">
              هنوز موضوعی در دیتابیس انجمن ثبت نشده است.
            </div>
          ) : (
            topics.map((top) => (
              <Link
                key={top.slug}
                href={`/forum/${top.slug}`}
                className="group bg-[var(--card-background)] text-[var(--primary-text)] border-[length:var(--border-size)] border-[var(--border-color)] rounded-[var(--corner-radius)] shadow-[var(--shadow-size)] p-5 hover:bg-[var(--muted-background)]/40 transition-all duration-[200ms] flex items-start gap-4"
              >
                <Image
                  src={top.author?.avatar || '/assets/hooman.png'}
                  alt={top.author?.name || 'کاربر'}
                  width={48}
                  height={48}
                  className="h-12 w-12 rounded-full object-cover ring-1 ring-[var(--border-color)] shrink-0"
                  {...blurProps(top.author?.avatar || '/assets/hooman.png')}
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
                    <span className="text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] font-bold paragraph-color">
                      {top.author?.name || 'عضو تکباکس'}
                    </span>
                    <ForumBadge slug={top.slug} fallback={typeof top.solved === 'boolean' ? top.solved : null} />
                  </div>

                  <h3 className="text-[length:var(--h3-font-size)] text-[var(--h3-font-color)] font-semibold font-bold text-[var(--primary-text)] group-hover:text-[var(--forum)] transition-colors line-clamp-2 leading-6">
                    {top.title}
                  </h3>

                  <div className="mt-3 pt-3 border-t-[length:var(--border-size)] border-[var(--border-color)]/60 flex items-center justify-between text-[11px] paragraph-color">
                    <span>{top.date_fa}</span>
                    <CardStats module="forum" slug={top.slug} showComments={true} />
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
