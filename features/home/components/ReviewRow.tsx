'use client';

import React from 'react';
import { useHomeModule } from '@/features/home/lib/home-data';
import { HOME_ROW_SIZES } from './HomeRowConfig';
import Link from 'next/link';
import Image from 'next/image';
import { blurProps } from "@/lib/image-placeholder";
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ButtonLink } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { CardStats } from '@/components/ui/card-stats';
import { AuthorLink } from '@/components/ui/author-link';
import { ReviewRating } from '@/components/ui/review-rating';
import { EmptyRow, RowGridSkeleton } from './HomeRowSkeletons';

export default function ReviewRow() {
  const { items: dbReviews, loading } = useHomeModule('review');
  const reviews = dbReviews.slice(0, 5);

  return (
    <section className={`w-full py-12 px-4 sm:px-6 lg:px-8 bg-background ${HOME_ROW_SIZES.reviewMinHeight} flex flex-col justify-center`} dir="rtl">
      <div className={`mx-auto ${HOME_ROW_SIZES.containerMaxWidth} w-full`}>
        <div className="flex items-center justify-between gap-4 mb-6">
          <h2 className="text-xl sm:text-2xl font-black text-foreground">بنچمارک‌ها و تست‌های عملی سخت‌افزار</h2>
          <ButtonLink variant="link" size="sm" className="text-[var(--review)] font-bold shrink-0" href="/review">
            مشاهده تمام بررسی‌ها ←
          </ButtonLink>
        </div>

        {loading ? (
          <RowGridSkeleton count={5} />
        ) : reviews.length === 0 ? (
          <EmptyRow>هنوز نقد و بررسی‌ای در دیتابیس ثبت نشده است.</EmptyRow>
        ) : (
        <div className="responsive-card-grid grid gap-6">
          {reviews.map((rev) => (
            <Link key={rev.slug} href={`/review/${rev.slug}`} className="group block">
              <Card className="h-full !p-0 overflow-hidden flex flex-col justify-between hover:shadow-md transition-all duration-200">
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
                  <Image
                    src={rev.image || '/assets/blog-1.jpg'}
                    alt={rev.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 300px"
                    {...blurProps(rev.image || '/assets/blog-1.jpg')}
                  />
                  <Badge variant="secondary" className="absolute top-2 right-2 bg-[var(--review)]/85 text-white border-none text-[10px]">
                    بررسی
                  </Badge>
                </div>

                <CardContent className="p-4 flex-1 flex flex-col">
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground font-bold">
                    <span>{rev.category || 'بررسی تخصصی'} • {rev.date_fa}</span>
                    <ReviewRating slug={rev.slug} fallbackRating={rev.rating ?? null} fallbackCount={rev.ratingCount ?? 0} compact />
                  </div>
                  <h3 className="text-sm font-bold text-foreground group-hover:text-[var(--review)] transition-colors line-clamp-2 leading-6">
                    {rev.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-2 line-clamp-2 leading-5">
                    {rev.excerpt}
                  </p>
                </CardContent>

                <div className="px-4 pb-4 pt-3 border-t flex items-center justify-between text-xs text-muted-foreground font-bold">
                  <AuthorLink name={rev.author?.name} avatar={rev.author?.avatar} role={rev.author?.role} />
                  <CardStats module="review" slug={rev.slug} showComments={true} />
                </div>
              </Card>
            </Link>
          ))}
        </div>
        )}
      </div>
    </section>
  );
}
