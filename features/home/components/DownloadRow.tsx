'use client';

import React from 'react';
import { getLatest } from '@/lib/content';
import { HOME_ROW_SIZES } from './HomeRowConfig';
import Link from 'next/link';
import { Icon } from '@/design/icons';

export default function DownloadRow() {
  const files = getLatest('download', 8);

  return (
    <section className={`w-full py-12 px-4 sm:px-6 lg:px-8 border-t border-[var(--tb-border)] bg-[color-mix(in_oklch,var(--tb-download)_4%,var(--tb-bg-primary))] ${HOME_ROW_SIZES.downloadMinHeight} flex flex-col justify-center`} dir="rtl">
      <div className={`mx-auto ${HOME_ROW_SIZES.containerMaxWidth} w-full`}>
        {/* Title without colorful badge and without separator border */}
        <div className="mb-6">
          <h2 className="text-xl sm:text-2xl font-black text-[var(--tb-fg-primary)]">ISOها، فریم‌ورها و درایورهای سرور و زیرساخت</h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {files.map((file) => (
            <Link
              key={file.slug}
              href={`/download/${file.slug}`}
              className="group card p-4 hover:bg-[var(--tb-bg-muted)]/40 transition-all duration-[var(--tb-motion-md)] border border-[var(--tb-border)] flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_oklch,var(--tb-download)_12%,var(--tb-bg-muted))] text-[var(--tb-download)] border border-[color-mix(in_oklch,var(--tb-download)_25%,transparent)] group-hover:scale-110 transition-transform">
                  <Icon name="downloadModule" className="h-6 w-6" />
                </div>
                <div className="min-w-0">
                  <h3 className="tb-text-md font-bold text-[var(--tb-fg-primary)] group-hover:text-[var(--tb-download)] transition-colors line-clamp-1">
                    {file.title}
                  </h3>
                  <div className="tb-text-sm text-[var(--tb-fg-muted)] mt-0.5">
                    {file.date_fa} • {file.category || 'فایل'}
                  </div>
                </div>
              </div>

              <div className="shrink-0 text-left">
                <span className="badge !bg-[var(--tb-bg-muted)] text-[var(--tb-fg-primary)] font-bold">
                  {(file.likes ?? 0).toLocaleString('fa-IR')} دانلود
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* Full-width More Button at bottom center */}
        <div className="mt-8 w-full">
          <Link href="/download" className="btn btn-ghost w-full py-3.5 font-bold text-center border border-[var(--tb-border)] hover:bg-[var(--tb-bg-muted)]">
            ورود به مرکز دانلود ←
          </Link>
        </div>
      </div>
    </section>
  );
}
