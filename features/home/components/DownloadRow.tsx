'use client';

import { useHomeModule } from '@/features/home/lib/home-data';
import { HOME_ROW_SIZES } from './HomeRowConfig';
import Link from 'next/link';
import { DownloadMetaLine } from '@/components/ui/download-meta';
import { DownloadAction } from '@/components/ui/download-action';
import { EmptyRow, RowGridSkeleton } from './HomeRowSkeletons';

export default function DownloadRow() {
  const { items: dbFiles, loading } = useHomeModule('download');
  const files = dbFiles.slice(0, 8);

  const getFileType = (title: string, category?: string, fileName?: string | null) => {
    const source = `${title} ${category || ''} ${fileName || ''}`.toLowerCase();
    if (source.includes('.pdf') || source.includes('pdf')) return 'PDF';
    if (source.includes('.zip') || source.includes('zip')) return 'ZIP';
    if (source.includes('iso')) return 'ISO';
    if (source.includes('driver') || source.includes('exe')) return 'EXE';
    if (source.includes('firmware') || source.includes('bin')) return 'BIN';
    return 'FILE';
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

        {loading ? (
          <RowGridSkeleton count={8} imageRatio="aspect-[5/2]" className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4" />
        ) : files.length === 0 ? (
          <EmptyRow>هنوز فایلی در دیتابیس ثبت نشده است.</EmptyRow>
        ) : (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {files.map((file) => {
            const fileType = getFileType(file.title, file.category, file.fileName ?? null);
            return (
              <article
                key={file.slug}
                className="group bg-[var(--card-background)] text-[var(--primary-text)] border-[length:var(--border-size)] border-[var(--border-color)] rounded-[var(--corner-radius)] shadow-[var(--shadow-size)] p-4 hover:bg-[var(--muted-background)]/40 transition-all duration-[200ms] flex flex-col justify-between gap-3"
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[var(--corner-radius)] bg-[var(--download)]/10 text-[var(--download)] border-[length:var(--border-size)] border-[var(--download)]/30 shadow-[var(--shadow-size)]">
                    <span className="text-[12px] font-mono font-black tracking-tight" dir="ltr">{file.fileSize || fileType}</span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold text-[var(--download)] bg-[var(--download)]/10 px-2 py-0.5 rounded">
                        {file.category || 'سیستم‌عامل'}
                      </span>
                      <span className="text-[10px] font-bold text-[var(--paragraph-color)] bg-[var(--muted-background)] px-2 py-0.5 rounded" dir="ltr">{fileType}</span>
                    </div>

                    <Link href={`/download/${file.slug}`} className="block">
                      <h3 className="text-[length:var(--h3-font-size)] text-[var(--h3-font-color)] font-semibold font-bold text-[var(--primary-text)] group-hover:text-[var(--download)] transition-colors line-clamp-1 leading-6">
                        {file.title}
                      </h3>
                    </Link>
                    <div className="text-xs paragraph-color mt-1 line-clamp-1">
                      {file.excerpt || 'سرورهای Enterprise و مجازی‌سازی'}
                    </div>
                  </div>
                </div>

                {/* Bottom Footer without visible separator line */}
                <div className="flex flex-wrap items-center justify-between gap-3 w-full mt-3">
                  <DownloadAction slug={file.slug} fallbackFileName={file.fileName ?? null} />
                  <DownloadMetaLine slug={file.slug} fallbackFileName={file.fileName ?? null} fallbackFileSize={file.fileSize ?? null} fallbackDownloadCount={file.downloadCount ?? 0} showFileName={false} />
                </div>
              </article>
            );
          })}
        </div>
        )}
      </div>
    </section>
  );
}
