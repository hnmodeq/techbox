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
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { EmptyRow, RowGridSkeleton } from './HomeRowSkeletons';

function stripPreviewText(value?: string) {
  return (value || '')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[#>*_`~\-[\]()]/g, ' ')
    .replace(/&[a-zA-Z0-9#]+;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function articlePreview(item: { excerpt?: string; content?: string }) {
  const content = stripPreviewText(item.content);
  const excerpt = stripPreviewText(item.excerpt);

  // The card preview should be article body text, not just the short excerpt.
  // If body content is unavailable, fall back to the DB excerpt.
  let text = content || excerpt;

  if (content && excerpt && content.length < 220 && !content.includes(excerpt)) {
    text = `${content} ${excerpt}`.trim();
  }

  if (!text) return '';
  return text.endsWith('...') || text.endsWith('…') ? text : `${text}...`;
}
function compactReadingTimeLabel(value?: string) {
  return (value || '').replace(/\s*مطالعه\s*$/, '');
}

function getAuthorSlug(author?: { name?: string; username?: string }) {
  const value = author?.username || author?.name || 'editorial';
  return value.trim().toLowerCase().replace(/[^a-z0-9_\u0600-\u06FF]+/g, '-');
}

function ArticleAuthorMeta({ author, className = '' }: { author?: { name?: string; username?: string; avatar?: string; job?: string; role?: string }; className?: string }) {
  const name = author?.name || 'تحریریه';
  const job = author?.job || author?.role || '';
  const slug = getAuthorSlug(author);

  return (
    <Tooltip>
      <TooltipTrigger render={
        <Link
          href={`/author/${encodeURIComponent(slug)}`}
          onClick={(event) => event.stopPropagation()}
          className={`grid grid-cols-[minmax(60px,1fr)_2rem] grid-rows-2 items-center gap-x-2 text-right transition-opacity hover:opacity-90 min-w-[120px] ${className}`}
          dir="ltr"
        />
      }>
        <div className="col-start-1 row-start-1 min-w-0 self-end truncate text-xs font-extrabold text-foreground sm:text-sm" dir="rtl">
          {name}
        </div>
        {job && (
          <div className="col-start-1 row-start-2 min-w-0 self-start truncate text-[10px] text-muted-foreground sm:text-[11px]" dir="rtl">
            {job}
          </div>
        )}
        <div className="relative col-start-2 row-span-2 row-start-1 size-8 overflow-hidden rounded-full ring-1 ring-border transition-all group-hover:ring-primary">
          <Image src={author?.avatar || '/assets/hooman.png'} alt={name} fill sizes="32px" className="object-cover" />
        </div>
      </TooltipTrigger>
      <TooltipContent>بازدید از حساب کاربری {name}</TooltipContent>
    </Tooltip>
  );
}

export default function MagazineRow() {
  const { items: dbArticles, loading } = useHomeModule('blog');
  const articles = dbArticles.slice(0, 3);

  return (
    <section className={`w-full py-8 px-4 sm:px-6 lg:px-8 bg-background ${HOME_ROW_SIZES.magazineMinHeight} flex flex-col justify-center`} dir="rtl">
      <div className={`mx-auto ${HOME_ROW_SIZES.containerMaxWidth} w-full`}>
        <div className="flex items-center justify-between gap-4 mb-6">
          <h2 className="text-xl sm:text-2xl font-black text-foreground">آخرین مقالات منتشر شده</h2>
          <ButtonLink variant="link" size="sm" className="text-[var(--blog)] font-bold shrink-0" href="/blog">
            مشاهده همه ←
          </ButtonLink>
        </div>

        {loading ? (
          <RowGridSkeleton count={3} />
        ) : articles.length === 0 ? (
          <EmptyRow>هنوز مقاله‌ای در دیتابیس ثبت نشده است.</EmptyRow>
        ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
                  <div dir="ltr" className="absolute inset-x-0 top-0 flex items-center justify-between bg-gradient-to-b from-black/70 to-transparent px-3 py-3">
                    <Tooltip>
                      <TooltipTrigger render={<span className="text-[10px] font-bold text-white/90 sm:text-xs" dir="rtl" />}>
                        {art.date_fa}
                      </TooltipTrigger>
                      <TooltipContent>تاریخ انتشار این مقاله</TooltipContent>
                    </Tooltip>
                    {art.readingTimeLabel && (
                      <Tooltip>
                        <TooltipTrigger render={<span className="text-[10px] font-medium text-white/75 sm:text-xs" dir="rtl" />}>
                          {compactReadingTimeLabel(art.readingTimeLabel)}
                        </TooltipTrigger>
                        <TooltipContent>زمان مطالعه</TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                </div>

                <CardContent className="p-4">
                  <h3 className="text-sm font-bold text-foreground group-hover:text-[var(--blog)] transition-colors duration-300 line-clamp-2 leading-7">
                    {art.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-2 line-clamp-3 min-h-[4.5rem] leading-6">
                    {articlePreview(art)}
                  </p>
                </CardContent>
              </Link>

              <div className="border-t px-4 pb-4 pt-3" dir="ltr">
                <div className="flex items-center justify-between gap-2">
                  <CardStats module={art.module || 'blog'} slug={art.slug} initialViews={art.views} initialLikes={art.likes} initialComments={art.comments || 0} showComments={true} />
                  <div className="shrink-0">
                    <ArticleAuthorMeta author={art.author} />
                  </div>
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
