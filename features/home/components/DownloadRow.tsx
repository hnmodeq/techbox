'use client';

import React from 'react';
import { getLatest } from '@/lib/content';
import { HOME_ROW_SIZES } from './HomeRowConfig';
import Link from 'next/link';
import { Icon } from '@/design/icons';
import { CardStats } from '@/components/ui/CardStats';

export default function DownloadRow() {
  const files = getLatest('download', 8);

  const getExtension = (title: string, category?: string) => {
    if (title.toLowerCase().includes('iso')) return '.ISO';
    if (title.toLowerCase().includes('driver') || title.toLowerCase().includes('exe')) return '.EXE';
    if (title.toLowerCase().includes('firmware') || title.toLowerCase().includes('bin')) return '.BIN';
    return '.ZIP';
  };

  const getSize = (idx: number) => {
    const sizes = ['۴.۲ گیگابایت', '۶۸۰ مگابایت', '۱.۸ گیگابایت', '۲۴۰ مگابایت', '۵.۱ گیگابایت'];
    return sizes[idx % sizes.length];
  };

  return (
    <section className={`w-full py-12 px-4 sm:px-6 lg:px-8 bg-[var(--tb-bg-primary)] ${HOME_ROW_SIZES.downloadMinHeight} flex flex-col justify-center`} dir="rtl">
      <div className={`mx-auto ${HOME_ROW_SIZES.containerMaxWidth} w-full`}>
        {/* Simple Text More Button positioned ABOVE items inside the header */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <h2 className="text-xl sm:text-2xl font-black text-[var(--tb-fg-primary)]">ISOها، فریم‌ورها و درایورهای سرور و زیرساخت</h2>
          <Link href="/download" className="text-sm font-bold text-[var(--tb-download)] hover:underline flex items-center gap-1 shrink-0">
            <span>ورود به مرکز دانلود</span>
            <span>←</span>
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {files.map((file, idx) => {
            const ext = getExtension(file.title, file.category);
            const fileSize = getSize(idx);

            return (
              <Link
                key={file.slug}
                href={`/download/${file.slug}`}
                className="group card p-4 hover:bg-[var(--tb-bg-muted)]/40 transition-all duration-[var(--tb-motion-md)] border border-[var(--tb-border)] flex flex-col justify-between gap-4 bg-[var(--tb-bg-secondary)]"
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  {/* Software File Box with Extension Badge */}
                  <div className="flex flex-col items-center justify-center h-14 w-14 shrink-0 rounded-xl bg-[color-mix(in_oklch,var(--tb-download)_12%,var(--tb-bg-muted))] text-[var(--tb-download)] border border-[color-mix(in_oklch,var(--tb-download)_30%,transparent)] group-hover:scale-105 transition-transform shadow-sm">
                    <Icon name="downloadModule" size={22} strokeWidth={2} />
                    <span className="text-[9px] font-mono font-black tracking-tight mt-0.5">{ext}</span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold text-[var(--tb-download)] bg-[var(--tb-download)]/10 px-2 py-0.5 rounded">
                        {file.category || 'سیستم‌عامل'}
                      </span>
                      <span className="text-[11px] text-[var(--tb-fg-muted)] font-bold">حجم: {fileSize}</span>
                    </div>

                    <h3 className="tb-text-md font-bold text-[var(--tb-fg-primary)] group-hover:text-[var(--tb-download)] transition-colors line-clamp-1 leading-6">
                      {file.title}
                    </h3>
                    <div className="text-xs text-[var(--tb-fg-muted)] mt-1 line-clamp-1">
                      {file.excerpt || 'سرورهای Enterprise و مجازی‌سازی'}
                    </div>
                  </div>
                </div>

                {/* Direct Download Action Footer */}
                <div className="pt-3 border-t border-[var(--tb-border)]/60 flex items-center justify-between">
                  <span className="text-xs font-extrabold text-[var(--tb-download)] group-hover:underline flex items-center gap-1">
                    <span>دانلود مستقیم</span>
                    <span>↓</span>
                  </span>
                  <CardStats module="download" slug={file.slug} initialViews={file.views ?? 0} initialLikes={file.likes ?? 0} />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
