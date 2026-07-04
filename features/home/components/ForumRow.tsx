'use client';

import React, { useState, useEffect } from 'react';
import { getLatest } from '@/lib/content';
import { HOME_ROW_SIZES } from './HomeRowConfig';
import Link from 'next/link';
import Image from 'next/image';
import { CardStats } from '@/components/ui/CardStats';

function ForumBadge({ slug, fallback }: { slug: string; fallback: boolean }) {
  const [solved, setSolved] = useState(fallback);

  useEffect(() => {
    let mounted = true;
    fetch(`/api/stats?module=forum&slug=${encodeURIComponent(slug)}`)
      .then((r) => r.json())
      .then((d) => {
        if (mounted && typeof d.solved === 'boolean') {
          setSolved(d.solved);
        }
      })
      .catch(() => {});
    return () => { mounted = false; };
  }, [slug]);

  return solved ? (
    <span className="rounded-full bg-[color-mix(in_oklch,var(--tb-success)_15%,transparent)] border border-[color-mix(in_oklch,var(--tb-success)_30%,transparent)] px-2.5 py-0.5 text-[11px] font-bold text-[var(--tb-success)]">
      حل‌شده ✓
    </span>
  ) : (
    <span className="rounded-full bg-[color-mix(in_oklch,var(--tb-warning)_15%,transparent)] border border-[color-mix(in_oklch,var(--tb-warning)_30%,transparent)] px-2.5 py-0.5 text-[11px] font-bold text-[var(--tb-warning)]">
      باز
    </span>
  );
}

export default function ForumRow() {
  const topics = getLatest('forum', 6);

  return (
    <section className={`w-full py-12 px-4 sm:px-6 lg:px-8 bg-[var(--tb-bg-primary)] ${HOME_ROW_SIZES.forumMinHeight} flex flex-col justify-center`} dir="rtl">
      <div className={`mx-auto ${HOME_ROW_SIZES.containerMaxWidth} w-full`}>
        {/* Simple Text More Button positioned ABOVE items inside the header */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <h2 className="text-xl sm:text-2xl font-black text-[var(--tb-fg-primary)]">داغ‌ترین بحث‌ها و چالش‌های شبکه و دیتاسنتر</h2>
          <Link href="/forum" className="text-sm font-bold text-[var(--tb-forum)] hover:underline flex items-center gap-1 shrink-0">
            <span>ورود به انجمن و ثبت پرسش</span>
            <span>←</span>
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {topics.map((top, idx) => (
            <Link
              key={top.slug}
              href={`/forum/${top.slug}`}
              className="group card p-5 hover:bg-[var(--tb-bg-muted)]/40 transition-all duration-[var(--tb-motion-md)] border border-[var(--tb-border)] flex items-start gap-4"
            >
              <Image
                src={top.author?.avatar || '/assets/hooman.png'}
                alt={top.author?.name || 'کاربر'}
                width={48}
                height={48}
                className="h-12 w-12 rounded-full object-cover ring-1 ring-[var(--tb-border)] shrink-0"
              />

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
                  <span className="tb-text-sm font-bold text-[var(--tb-fg-muted)]">
                    {top.author?.name || 'عضو تکباکس'}
                  </span>
                  <ForumBadge slug={top.slug} fallback={idx % 2 === 0} />
                </div>

                <h3 className="tb-text-md font-bold text-[var(--tb-fg-primary)] group-hover:text-[var(--tb-forum)] transition-colors line-clamp-2 leading-6">
                  {top.title}
                </h3>

                <div className="mt-3 pt-3 border-t border-[var(--tb-border)]/60 flex items-center justify-between text-[11px] text-[var(--tb-fg-muted)]">
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
