'use client';

import React from 'react';
import { useHomeModule } from '@/features/home/lib/home-data';
import { HOME_ROW_SIZES } from './HomeRowConfig';
import Link from 'next/link';
import Image from 'next/image';
import { blurProps } from "@/lib/image-placeholder";
import { Card, CardContent } from '@/components/ui/card';
import { ButtonLink } from '@/components/ui/button';
import { CardStats } from '@/components/ui/card-stats';
import { AuthorLink } from '@/components/ui/author-link';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { EmptyRow, RowGridSkeleton } from './HomeRowSkeletons';

function excerptWithEllipsis(value?: string) {
  const text = (value || '').trim();
  if (!text) return '';
  return text.endsWith('...') || text.endsWith('…') ? text : `${text}...`;
}

function compactReadingTimeLabel(value?: string) {
  return (value || '').replace(/\s*مطالعه\s*$/, '');
}

export default function MagazineRow() {
  const { items: dbArticles, loading } = useHomeModule('blog');
  const articles = dbArticles.slice(0, 5);

  return (
    <section className={`w-full py-12 px-4 sm:px-6 lg:px-8 bg-background ${HOME_ROW_SIZES.magazineMinHeight} flex flex-col justify-center`} dir="rtl">
      <div className={`mx-auto ${HOME_ROW_SIZES.containerMaxWidth} w-full`}>
        <div className="flex items-center justify-between gap-4 mb-6">
          <h2 className="text-xl sm:text-2xl font-black text-foreground">آخرین مقالات منتشر شده</h2>
          <ButtonLink variant="link" size="sm" className="text-[var(--blog)] font-bold shrink-0" href="/blog">
            مشاهده همه ←
          </ButtonLink>
        </div>

        {loading ? (
          <RowGridSkeleton count={5} />
        ) : articles.length === 0 ? (
          <EmptyRow>هنوز مقاله‌ای در دیتابیس ثبت نشده است.</EmptyRow>
        ) : (
        <div className="responsive-card-grid grid gap-6">
          {articles.map((art) => (
            <Card key={art.slug} className="group !p-0 overflow-hidden flex flex-col justify-between transition-all duration-500 ease-out hover:-translate-y-0.5 hover:shadow-md">
              <Link href={`/blog/${art.slug}`} className="block flex-1">
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
                  <Image
                    src={art.image || '/assets/blog-1.jpg'}
                    alt={art.title}
                    fill
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                    sizes="(max-width: 768px) 100vw, 300px"
                    {...blurProps(art.image || '/assets/blog-1.jpg')}
                  />
                </div>

                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-sm font-bold text-foreground group-hover:text-[var(--blog)] transition-colors duration-300 line-clamp-2 leading-7">
                      {art.title}
                    </h3>
                    {art.readingTimeLabel && (
                      <Tooltip>
                        <TooltipTrigger render={<span className="shrink-0 pt-1 text-[10px] font-medium text-muted-foreground/80 sm:text-xs" />}>
                          {compactReadingTimeLabel(art.readingTimeLabel)}
                        </TooltipTrigger>
                        <TooltipContent>زمان مطالعه</TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 line-clamp-3 leading-6">
                    {excerptWithEllipsis(art.excerpt)}
                  </p>
                </CardContent>
              </Link>

              <div className="px-4 pb-4 pt-3 border-t text-xs text-muted-foreground font-bold space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <AuthorLink name={art.author?.name} avatar={art.author?.avatar} username={art.author?.username} role={art.author?.job || art.author?.role} />
                  <div className="flex shrink-0 flex-col items-end gap-1 text-left">
                    <Tooltip>
                      <TooltipTrigger render={<span className="text-muted-foreground" />}>
                        {art.date_fa}
                      </TooltipTrigger>
                      <TooltipContent>تاریخ انتشار این مقاله</TooltipContent>
                    </Tooltip>
                  </div>
                </div>
                <div className="flex justify-end">
                  <CardStats module={art.module || 'blog'} slug={art.slug} showComments={true} />
                </div>
              </div>
            </Card>
          ))}
        </div>
        )}
      </div>
    </section>
  );
}
