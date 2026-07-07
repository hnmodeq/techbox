'use client';

import React, { useState, useEffect } from 'react';
import { getLatest } from '@/lib/content';
import { HOME_ROW_SIZES } from './HomeRowConfig';
import Link from 'next/link';
import { CardStats } from '@/components/ui/card-stats';
import { useStatEntry } from '@/providers/stats.provider';

function DownloadMeta({ slug }: { slug: string }) {
  const [fileSize, setFileSize] = useState<string | null>(null);
  const { entry: shared, status } = useStatEntry('download', slug);

  useEffect(() => {
    if (shared && typeof shared.fileSize === 'string') {
      setFileSize(shared.fileSize);
    }
  }, [shared]);

  useEffect(() => {
    let mounted = true;
    // Only fall back once the bulk fetch has actually settled and this
    // item still isn't in it - not on a guessed timer.
    if (status === 'loading' || shared) return () => { mounted = false; };

    fetch(`/api/stats?module=download&slug=${encodeURIComponent(slug)}`)
      .then(r => r.json())
      .then(d => {
        if (mounted && d && typeof d.fileSize === 'string') {
          setFileSize(d.fileSize);
        }
      })
      .catch(() => {});
    return () => { mounted = false; };
  }, [slug, shared, status]);

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 w-full mt-3">
      <span className="text-xs font-extrabold text-[var(--download)] group-hover:underline flex items-center gap-1 shrink-0">
        <span>دانلود مستقیم</span>
        <span>↓</span>
      </span>
      <div className="flex items-center gap-3">
        <span className="inline-flex items-center gap-1 text-xs paragraph-color font-bold" title="حجم فایل">
          <svg className="w-3.5 h-3.5 text-[var(--warning)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
          <span className="text-[var(--primary-text)]">{fileSize || 'حجم ثبت نشده'}</span>
        </span>
        <CardStats module="download" slug={slug} showComments={true} />
      </div>
    </div>
  );
}

export default function DownloadRow() {
  const files = getLatest('download', 8);

  const getExtension = (title: string, category?: string) => {
    if (title.toLowerCase().includes('iso')) return '.ISO';
    if (title.toLowerCase().includes('driver') || title.toLowerCase().includes('exe')) return '.EXE';
    if (title.toLowerCase().includes('firmware') || title.toLowerCase().includes('bin')) return '.BIN';
    return '.ZIP';
  };

  return (
    <section className={`w-full py-12 px-4 sm:px-6 lg:px-8 bg-[var(--main-background)] ${HOME_ROW_SIZES.downloadMinHeight} flex flex-col justify-center`} dir="rtl">
      <div className={`mx-auto ${HOME_ROW_SIZES.containerMaxWidth} w-full`}>
        {/* Simple Text More Button positioned ABOVE items inside the header */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <h2 className="text-xl sm:text-2xl font-black text-[var(--primary-text)]">ISOها، فریم‌ورها و درایورهای سرور و زیرساخت</h2>
          <Link href="/download" className="text-sm font-bold text-[var(--download)] hover:underline flex items-center gap-1 shrink-0">
            <span>ورود به مرکز دانلود</span>
            <span>←</span>
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {files.map((file) => {
            const ext = getExtension(file.title, file.category);
            return (
              <Link
                key={file.slug}
                href={`/download/${file.slug}`}
                className="group bg-[var(--card-background)] text-[var(--primary-text)] border-[length:var(--border-size)] border-[var(--border-color)] rounded-[var(--corner-radius)] shadow-[var(--shadow-size)] p-4 hover:bg-[var(--muted-background)]/40 transition-all duration-[200ms] border-[length:var(--border-size)] border-[var(--border-color)] flex flex-col justify-between gap-3 bg-[var(--card-background)]"
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  {/* Yellow Special File Icon Box */}
                  <div className="flex flex-col items-center justify-center h-14 w-14 shrink-0 rounded-[var(--corner-radius)] bg-[var(--warning)]/15 text-[var(--warning)] border-[length:var(--border-size)] border-[var(--warning)]/35 shadow-[var(--shadow-size)]">
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                    <span className="text-[9px] font-mono font-black tracking-tight mt-0.5">{ext}</span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold text-[var(--download)] bg-[var(--download)]/10 px-2 py-0.5 rounded">
                        {file.category || 'سیستم‌عامل'}
                      </span>
                    </div>

                    <h3 className="text-[length:var(--h3-font-size)] text-[var(--h3-font-color)] font-semibold font-bold text-[var(--primary-text)] group-hover:text-[var(--download)] transition-colors line-clamp-1 leading-6">
                      {file.title}
                    </h3>
                    <div className="text-xs paragraph-color mt-1 line-clamp-1">
                      {file.excerpt || 'سرورهای Enterprise و مجازی‌سازی'}
                    </div>
                  </div>
                </div>

                {/* Bottom Footer without visible separator line */}
                <DownloadMeta slug={file.slug} />
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
