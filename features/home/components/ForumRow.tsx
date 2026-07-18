'use client';

import React, { useEffect, useState } from 'react';
import { HOME_ROW_SIZES } from './HomeRowConfig';
import { useHomeModule } from '@/features/home/lib/home-data';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ButtonLink } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { formatRelativeDate } from '@/lib/date-format';
import { ForumBadge } from '@/components/ui/forum-badge';
import { useStatEntry } from '@/providers/stats.provider';
import { EmptyRow } from './HomeRowSkeletons';

/** Live comment-count sentence, e.g. "۶۰ پاسخ ثبت شده". Falls back to the
 * count baked into the home payload, then refreshes from the shared stats
 * provider (real DB value). */
function ForumCommentSentence({ slug, initial }: { slug: string; initial: number }) {
  const [count, setCount] = useState(initial);
  const { entry: shared, status } = useStatEntry('forum', slug);

  useEffect(() => {
    if (shared && typeof shared.comments === 'number') setCount(shared.comments);
  }, [shared]);

  useEffect(() => {
    let mounted = true;
    if (status === 'loading' || shared) return () => { mounted = false; };
    fetch(`/api/stats?module=forum&slug=${encodeURIComponent(slug)}`, { cache: 'no-store' })
      .then((r) => r.json())
      .then((s) => {
        if (mounted && typeof s.comments === 'number') setCount(s.comments);
      })
      .catch(() => {});
    return () => { mounted = false; };
  }, [slug, shared, status]);

  return (
    <span className="text-[11px] text-muted-foreground">
      <span className="font-bold text-foreground">{count.toLocaleString('fa-IR')}</span>{' '}
      پاسخ ثبت شده
    </span>
  );
}

function ForumCardSkeleton() {
  return (
    <Card className="p-5">
      <CardContent className="p-0 space-y-3">
        <Skeleton className="h-5 w-20" />
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-4 w-2/3" />
      </CardContent>
    </Card>
  );
}

/** A single best-answer line clipped to two lines with an ellipsis. */
function clampText(text: string, max = 160) {
  const clean = (text || '').replace(/\s+/g, ' ').trim();
  return clean.length > max ? `${clean.slice(0, max).trimEnd()}...` : clean;
}

export default function ForumRow({ homeTitle, homeMoreLabel, showHomeTitle = true, showHomeMoreLabel = true }: { homeTitle?: string; homeMoreLabel?: string; showHomeTitle?: boolean; showHomeMoreLabel?: boolean }) {
  const { items: topics, loading } = useHomeModule('forum');

  return (
    <section className={`w-full py-12 px-4 sm:px-6 lg:px-8 bg-background ${HOME_ROW_SIZES.forumMinHeight} flex flex-col justify-center`} dir="rtl">
      <div className={`mx-auto ${HOME_ROW_SIZES.containerMaxWidth} w-full`}>
        <div className="flex items-center justify-between gap-4 mb-6">
          {showHomeTitle && <h2 className="text-xl sm:text-2xl font-black text-foreground">{homeTitle || "داغ\u200Cترین بحث\u200Cها و چالش\u200Cهای شبکه و دیتاسنتر"}</h2>}
          {showHomeMoreLabel && (
          <ButtonLink variant="link" size="sm" className="text-[var(--forum)] font-bold shrink-0" href="/forum">
            {homeMoreLabel || "ورود به انجمن و ثبت پرسش ←"}
          </ButtonLink>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {loading ? (
            Array.from({ length: 6 }).map((_, index) => <ForumCardSkeleton key={index} />)
          ) : topics.length === 0 ? (
            <div className="col-span-full"><EmptyRow>هنوز موضوعی در دیتابیس انجمن ثبت نشده است.</EmptyRow></div>
          ) : (
            topics.map((top) => {
              const authorName = top.author?.name || 'عضو تکباکس';
              const authorSlug = top.author?.username || String(authorName).trim().toLowerCase().replace(/[^\w]+/g, '-');
              const description = clampText(top.excerpt || top.content || '');
              const accepted = (top as any).acceptedAnswer as { text: string } | undefined;
              const acceptedSnippet = accepted ? clampText(accepted.text) : '';

              return (
                <Card key={top.slug} className="group relative h-full p-5 hover:shadow-md transition-all duration-200">
                  <CardContent className="p-0 space-y-3">
                    {/* Author (right) + publish date (left) */}
                    <div className="flex items-center justify-between gap-2">
                      <Link
                        href={`/author/${encodeURIComponent(authorSlug)}`}
                        onClick={(e) => e.stopPropagation()}
                        className="relative z-10 flex items-center gap-2.5 group/author hover:opacity-90 transition-opacity"
                      >
                        <Avatar className="h-9 w-9 shrink-0 ring-1 ring-border group-hover/author:ring-[var(--forum)] transition-all">
                          <AvatarImage src={top.author?.avatar || '/assets/hooman.png'} alt={authorName} />
                          <AvatarFallback>{authorName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-foreground group-hover/author:text-[var(--forum)] transition-colors truncate">
                            {authorName}
                          </div>
                          {top.author?.job ? (
                            <div className="text-[10px] text-muted-foreground truncate">{top.author.job}</div>
                          ) : (
                            <div className="text-[10px] text-muted-foreground truncate">{top.author?.role || 'عضو انجمن'}</div>
                          )}
                        </div>
                      </Link>

                      {/* Publish date — left, with tooltip */}
                      <Tooltip>
                        <TooltipTrigger render={<span className="text-[11px] text-muted-foreground shrink-0 cursor-default" />}>
                          {formatRelativeDate(top.date)}
                        </TooltipTrigger>
                        <TooltipContent>تاریخ ساخته شدن این پرسش</TooltipContent>
                      </Tooltip>
                    </div>

                    {/* Topic title — the primary stretched link (covers whole card) */}
                    <h3 className="text-sm font-bold text-foreground group-hover:text-[var(--forum)] transition-colors line-clamp-2 leading-6">
                      <Link href={`/forum/${top.slug}`} className="absolute inset-0 z-0" aria-label={top.title} />
                      {top.title}
                    </h3>

                    {/* Topic description snippet with ... */}
                    {description && (
                      <p className="text-xs text-muted-foreground leading-5 line-clamp-2">
                        {description}<span className="text-muted-foreground">...</span>
                      </p>
                    )}

                    {/* Best answer snippet (only if the author selected one) */}
                    {acceptedSnippet && (
                      <div className="rounded-md border border-[color-mix(in_oklch,var(--success)_30%,transparent)] bg-[color-mix(in_oklch,var(--success)_8%,transparent)] p-2.5 space-y-1">
                        <div className="flex items-center gap-1.5">
                          <Badge variant="ghost" className="text-[10px] text-[var(--success)] p-0 h-auto">پاسخ برتر ✓</Badge>
                        </div>
                        <p className="text-[11px] text-foreground/80 leading-5 line-clamp-2">
                          {acceptedSnippet}<span className="text-muted-foreground">...</span>
                        </p>
                      </div>
                    )}

                    {/* Bottom row: status (left) | reply counter (right).
                        RTL + justify-between → DOM order [counter, status]. */}
                    <div className="pt-2 border-t flex items-center justify-between gap-2">
                      <ForumCommentSentence slug={top.slug} initial={top.comments || 0} />
                      <ForumBadge slug={top.slug} fallback={typeof (top as any).solved === 'boolean' ? (top as any).solved : null} />
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}
