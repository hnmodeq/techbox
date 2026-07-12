'use client';

import React from 'react';
import { useHomeModule } from '@/features/home/lib/home-data';
import { HOME_ROW_SIZES } from './HomeRowConfig';
import Link from 'next/link';
import Image from 'next/image';
import { blurProps } from "@/lib/image-placeholder";
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ButtonLink } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { CardStats } from '@/components/ui/card-stats';
import { AuthorLink } from '@/components/ui/author-link';
import { EmptyRow, RowGridSkeleton } from './HomeRowSkeletons';

export default function MagazineRow() {
  const { items: dbArticles, loading } = useHomeModule('blog');
  const articles = dbArticles.slice(0, 5);

  return (
    <section className={`w-full py-12 px-4 sm:px-6 lg:px-8 bg-background ${HOME_ROW_SIZES.magazineMinHeight} flex flex-col justify-center`} dir="rtl">
      <div className={`mx-auto ${HOME_ROW_SIZES.containerMaxWidth} w-full`}>
        <div className="flex items-center justify-between gap-4 mb-6">
          <h2 className="text-xl sm:text-2xl font-black text-foreground">آخرین مقالات و تحلیل‌های زیرساخت</h2>
          <ButtonLink variant="link" size="sm" className="text-[var(--blog)] font-bold shrink-0" href="/blog">
            مشاهده همه مقالات ←
          </ButtonLink>
        </div>

        {loading ? (
          <RowGridSkeleton count={5} />
        ) : articles.length === 0 ? (
          <EmptyRow>هنوز مقاله‌ای در دیتابیس ثبت نشده است.</EmptyRow>
        ) : (
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {articles.map((art) => (
            <Card key={art.slug} className="group !p-0 overflow-hidden flex flex-col justify-between hover:shadow-md transition-all duration-200">
              <Link href={`/blog/${art.slug}`} className="block flex-1">
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
                  <Image
                    src={art.image || '/assets/blog-1.jpg'}
                    alt={art.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 300px"
                    {...blurProps(art.image || '/assets/blog-1.jpg')}
                  />
                  <Badge variant="secondary" className="absolute top-2 right-2 bg-[var(--blog)]/85 text-white border-none text-[10px]">
                    مقاله
                  </Badge>
                </div>

                <CardContent className="p-4">
                  <div className="text-xs text-muted-foreground mb-1.5 font-bold">
                    <span>{art.date_fa}</span>
                  </div>
                  <h3 className="text-sm font-bold text-foreground group-hover:text-[var(--blog)] transition-colors line-clamp-2 leading-7">
                    {art.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-2 line-clamp-2 leading-6">
                    {art.excerpt}
                  </p>
                </CardContent>
              </Link>

              <div className="px-4 pb-4 pt-3 border-t flex items-center justify-between text-xs text-muted-foreground font-bold">
                <AuthorLink name={art.author?.name} avatar={art.author?.avatar} />
                <CardStats module={art.module || 'blog'} slug={art.slug} showComments={true} />
              </div>
            </Card>
          ))}
        </div>
        )}
      </div>
    </section>
  );
}
