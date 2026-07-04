'use client';

import React from 'react';
import { getLatest } from '@/lib/content';
import { HOME_ROW_SIZES } from './HomeRowConfig';
import Link from 'next/link';
import Image from 'next/image';
import { Icon } from '@/design/icons';

export default function ForumRow() {
  const topics = getLatest('forum', 4);

  return (
    <section className={`w-full py-12 px-4 sm:px-6 lg:px-8 border-t border-[var(--tb-border)] bg-[color-mix(in_oklch,var(--tb-forum)_4%,var(--tb-bg-primary))] ${HOME_ROW_SIZES.forumMinHeight} flex flex-col justify-center`} dir="rtl">
      <div className="mx-auto max-w-7xl w-full">
        <div className="flex items-end justify-between mb-8 border-b border-[var(--tb-border)]/60 pb-4">
          <div>
            <span className="badge !bg-[color-mix(in_oklch,var(--tb-forum)_15%,transparent)] !text-[var(--tb-forum)] font-black mb-2">
              انجمن تخصصی تکباکس
            </span>
            <h2 className="tb-text-big-title text-[var(--tb-fg-primary)]">داغ‌ترین بحث‌ها و چالش‌های شبکه و دیتاسنتر</h2>
          </div>
          <Link href="/forum" className="btn btn-ghost text-[var(--tb-forum)] font-bold">
            ورود به انجمن و ثبت پرسش ←
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {topics.map((top, idx) => {
            const solved = !top.slug.includes('proxmox');
            return (
              <Link
                key={top.slug}
                href={`/forum/${top.slug}`}
                className="group card p-5 hover:bg-[var(--tb-bg-muted)]/40 transition-all duration-[var(--tb-motion-md)] border border-[var(--tb-border)] flex items-start gap-4"
              >
                {/* Author Avatar */}
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
                    {solved ? (
                      <span className="rounded-full bg-[color-mix(in_oklch,var(--tb-success)_15%,transparent)] border border-[color-mix(in_oklch,var(--tb-success)_30%,transparent)] px-2.5 py-0.5 text-[11px] font-bold text-[var(--tb-success)]">
                        حل‌شده ✓
                      </span>
                    ) : (
                      <span className="rounded-full bg-[color-mix(in_oklch,var(--tb-warning)_15%,transparent)] border border-[color-mix(in_oklch,var(--tb-warning)_30%,transparent)] px-2.5 py-0.5 text-[11px] font-bold text-[var(--tb-warning)]">
                        باز
                      </span>
                    )}
                  </div>

                  <h3 className="tb-text-md font-bold text-[var(--tb-fg-primary)] group-hover:text-[var(--tb-forum)] transition-colors line-clamp-2 leading-6">
                    {top.title}
                  </h3>

                  <div className="mt-3 pt-3 border-t border-[var(--tb-border)]/60 flex items-center justify-between text-[11px] text-[var(--tb-fg-muted)]">
                    <span>📅 {top.date_fa}</span>
                    <div className="flex items-center gap-3">
                      <span>💬 {((top.likes ?? 0) % 7 + 2).toLocaleString('fa-IR')} پاسخ</span>
                      <span>👁 {(top.views ?? 0).toLocaleString('fa-IR')} بازدید</span>
                    </div>
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
