'use client';

import { useHomeModule } from '@/features/home/lib/home-data';
import { HOME_ROW_SIZES } from './HomeRowConfig';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ButtonLink } from '@/components/ui/button';
import { Icon } from '@/design/icons';
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
    <section className={`w-full py-12 px-4 sm:px-6 lg:px-8 bg-background ${HOME_ROW_SIZES.downloadMinHeight} flex flex-col justify-center`} dir="rtl">
      <div className={`mx-auto ${HOME_ROW_SIZES.containerMaxWidth} w-full`}>
        <div className="flex items-center justify-between gap-4 mb-6">
          <h2 className="text-xl sm:text-2xl font-black text-foreground">ISOها، فریم‌ورها و درایورهای سرور و زیرساخت</h2>
          <ButtonLink variant="link" size="sm" className="text-[var(--download)] font-bold shrink-0" href="/download">
            ورود به مرکز دانلود ←
          </ButtonLink>
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
              <Card key={file.slug} className="group p-4 hover:shadow-md transition-all duration-200">
                <CardContent className="p-0 flex flex-col justify-between gap-3">
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-[var(--download)]/10 text-[var(--download)] border border-[var(--download)]/30">
                      <Icon name="file" size={26} className="text-[var(--download)]" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="border-[color-mix(in_oklch,var(--download)_30%,var(--border))] bg-[color-mix(in_oklch,var(--download)_12%,transparent)] text-[var(--download)] text-[11px]" dir="ltr">
                          {fileType}
                        </Badge>
                      </div>

                      <Link href={`/download/${file.slug}`} className="block">
                        <h3 className="text-sm font-bold text-foreground group-hover:text-[var(--download)] transition-colors line-clamp-1 leading-6">
                          {file.title}
                        </h3>
                      </Link>
                      <div className="text-xs text-muted-foreground mt-1 line-clamp-1">
                        {file.excerpt || 'سرورهای Enterprise و مجازی‌سازی'}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 w-full mt-3">
                    <DownloadAction slug={file.slug} fallbackFileName={file.fileName ?? null} />
                    <DownloadMetaLine slug={file.slug} fallbackFileName={file.fileName ?? null} fallbackFileSize={file.fileSize ?? null} fallbackDownloadCount={file.downloadCount ?? 0} showFileName={false} showFileSize={true} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
        )}
      </div>
    </section>
  );
}
