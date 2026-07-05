'use client';

import React from 'react';
import { getLatest } from '@/lib/content';
import { HOME_ROW_SIZES } from './HomeRowConfig';
import Link from 'next/link';
import Image from 'next/image';
import { CardStats } from '@/components/ui/CardStats';
import { ForumBadge } from '@/components/ui/ForumBadge';

export default function ForumRow() {
  const topics = getLatest('forum', 6);

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
          {topics.map((top, idx) => (
            <Link
              key={top.slug}
              href={`/forum/${top.slug}`}
              className="group card p-5 hover:bg-[var(--muted-background)]/40 transition-all duration-[var(--tb-motion-md)] border border-[var(--border-color)] flex items-start gap-4"
            >
              <Image
                src={top.author?.avatar || '/assets/hooman.png'}
                alt={top.author?.name || 'کاربر'}
                width={48}
                height={48}
                className="h-12 w-12 rounded-full object-cover ring-1 ring-[var(--border-color)] shrink-0"
              />

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
                  <span className="text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] font-bold paragraph-color">
                    {top.author?.name || 'عضو تکباکس'}
                  </span>
                  <ForumBadge slug={top.slug} fallback={idx % 2 === 0} />
                </div>

                <h3 className="text-[length:var(--h3-font-size)] text-[var(--h3-font-color)] font-semibold font-bold text-[var(--primary-text)] group-hover:text-[var(--tb-forum)] transition-colors line-clamp-2 leading-6">
                  {top.title}
                </h3>

                <div className="mt-3 pt-3 border-t border-[var(--border-color)]/60 flex items-center justify-between text-[11px] paragraph-color">
                  <span>{top.date_fa}</span>
                  <CardStats module="forum" slug={top.slug} initialViews={top.views ?? 0} initialLikes={top.likes ?? 0} showComments={true} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
