'use client';

import React from 'react';
import { HOME_ROW_SIZES } from './HomeRowConfig';
import { useHomeModule } from '@/features/home/lib/home-data';
import Link from 'next/link';
import Image from 'next/image';
import { blurProps } from "@/lib/image-placeholder";
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ButtonLink } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { CardStats } from '@/components/ui/card-stats';
import { ForumBadge } from '@/components/ui/forum-badge';
import { EmptyRow } from './HomeRowSkeletons';

function ForumCardSkeleton() {
  return (
    <Card className="p-5">
      <CardContent className="p-0 flex items-start gap-4">
        <Skeleton className="h-12 w-12 shrink-0 rounded-full" />
        <div className="min-w-0 flex-1 space-y-3">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function ForumRow() {
  const { items: topics, loading } = useHomeModule('forum');

  return (
    <section className={`w-full py-12 px-4 sm:px-6 lg:px-8 bg-background ${HOME_ROW_SIZES.forumMinHeight} flex flex-col justify-center`} dir="rtl">
      <div className={`mx-auto ${HOME_ROW_SIZES.containerMaxWidth} w-full`}>
        <div className="flex items-center justify-between gap-4 mb-6">
          <h2 className="text-xl sm:text-2xl font-black text-foreground">داغ‌ترین بحث‌ها و چالش‌های شبکه و دیتاسنتر</h2>
          <ButtonLink variant="link" size="sm" className="text-[var(--forum)] font-bold shrink-0" href="/forum">
            ورود به انجمن و ثبت پرسش ←
          </ButtonLink>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {loading ? (
            Array.from({ length: 6 }).map((_, index) => <ForumCardSkeleton key={index} />)
          ) : topics.length === 0 ? (
            <div className="col-span-full"><EmptyRow>هنوز موضوعی در دیتابیس انجمن ثبت نشده است.</EmptyRow></div>
          ) : (
            topics.map((top) => (
              <Link key={top.slug} href={`/forum/${top.slug}`} className="group block">
                <Card className="h-full p-5 hover:shadow-md transition-all duration-200">
                  <CardContent className="p-0 flex items-start gap-4">
                    <Avatar className="h-12 w-12 shrink-0 ring-1 ring-border">
                      <AvatarImage src={top.author?.avatar || '/assets/hooman.png'} alt={top.author?.name || 'کاربر'} />
                      <AvatarFallback>{(top.author?.name || 'ک').charAt(0)}</AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
                        <span className="text-xs text-muted-foreground font-bold">
                          {top.author?.name || 'عضو تکباکس'}
                        </span>
                        <ForumBadge slug={top.slug} fallback={typeof (top as any).solved === 'boolean' ? (top as any).solved : null} />
                      </div>

                      <h3 className="text-sm font-bold text-foreground group-hover:text-[var(--forum)] transition-colors line-clamp-2 leading-6">
                        {top.title}
                      </h3>

                      <div className="mt-3 pt-3 border-t flex items-center justify-between text-[11px] text-muted-foreground">
                        <span>{top.date_fa}</span>
                        <CardStats module="forum" slug={top.slug} initialViews={top.views} initialLikes={top.likes} initialComments={top.comments || 0} showComments={true} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
