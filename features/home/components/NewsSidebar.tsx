'use client';

import React, { useState } from 'react';
import { getModuleItems } from '@/lib/content';
import Link from 'next/link';
import { Icon } from '@/design/icons';
import Image from 'next/image';

export default function NewsSidebar() {
  const [open, setOpen] = useState(false);
  const newsItems = getModuleItems('news').slice(0, 15);

  return (
    <>
      {/* Floating Toggle Button on the Left Edge */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="fixed left-0 top-24 z-40 flex items-center gap-2 rounded-r-[var(--tb-radius-lg)] bg-[var(--tb-news)] px-3 py-2 text-slate-950 font-black shadow-[var(--tb-shadow-lg)] transition-transform hover:translate-x-1 cursor-pointer"
        title="اخبار زنده تکباکس"
      >
        <Icon name="news" className="h-5 w-5" />
        <span className="tb-text-sm hidden sm:inline">اخبار فوری</span>
      </button>

      {/* Backdrop for Mobile */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Left Sidebar Drawer */}
      <aside
        className={`fixed left-0 top-0 h-screen w-72 sm:w-80 bg-[var(--tb-bg-primary)] border-r border-[var(--tb-border)] shadow-2xl z-50 flex flex-col transition-transform duration-[var(--tb-motion-lg)] ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
        dir="rtl"
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-[var(--tb-border)] flex items-center justify-between bg-[color-mix(in_oklch,var(--tb-news)_10%,var(--tb-bg-secondary))] shrink-0">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[var(--tb-news)] animate-pulse" />
            <h3 className="tb-text-md font-black text-[var(--tb-news)]">اخبار زنده تکباکس</h3>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="p-1 text-[var(--tb-fg-muted)] hover:text-[var(--tb-fg-primary)] transition-colors cursor-pointer"
            title="بستن سایدبار اخبار"
          >
            <Icon name="close" className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable News List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 divide-y divide-[var(--tb-border)]/50">
          {newsItems.map((n) => (
            <Link
              key={n.slug}
              href={`/news/${n.slug}`}
              onClick={() => setOpen(false)}
              className="group block pt-3 first:pt-0"
            >
              <div className="flex items-center justify-between gap-2 text-[11px] text-[var(--tb-fg-muted)] mb-1.5">
                <span className="badge !bg-[color-mix(in_oklch,var(--tb-news)_15%,transparent)] !text-[var(--tb-news)] !px-2 !py-0.5">
                  {n.category || 'خبر'}
                </span>
                <span className="flex items-center gap-1">
                  <Icon name="clock" className="h-3 w-3" />
                  {n.date_fa} {n.time || ''}
                </span>
              </div>

              <h4 className="tb-text-sm font-bold text-[var(--tb-fg-primary)] group-hover:text-[var(--tb-news)] transition-colors line-clamp-2 leading-6">
                {n.title}
              </h4>

              <div className="mt-2 flex items-center justify-between text-[11px] text-[var(--tb-fg-muted)]">
                <span>منبع: {n.source || 'تحریریه تکباکس'}</span>
                <span>👁 {(n.views ?? 0).toLocaleString('fa-IR')}</span>
              </div>
            </Link>
          ))}
        </div>

        {/* Footer Link */}
        <div className="p-3 border-t border-[var(--tb-border)] bg-[var(--tb-bg-secondary)] text-center shrink-0">
          <Link
            href="/news"
            onClick={() => setOpen(false)}
            className="btn btn-ghost w-full tb-text-sm text-[var(--tb-news)] font-bold"
          >
            مشاهده آرشیو کامل اخبار →
          </Link>
        </div>
      </aside>
    </>
  );
}
