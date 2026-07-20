"use client";

/**
 * ForumCard — shared card used by:
 *   - features/home/components/ForumRow.tsx  (homepage forum row)
 *   - features/forum/components/ForumList.tsx  (/forum page)
 *
 * Displays a forum topic with author, date tooltip, title, description,
 * best-answer snippet, reply count tooltip, and status badge.
 */

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { ForumBadge } from "@/components/ui/forum-badge";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import { useStatEntry } from "@/providers/stats.provider";
import { formatRelativeDate } from "@/lib/date-format";

// ─── helpers ────────────────────────────────────────────────────────────────

export function clampText(text: string, max = 160) {
  const clean = (text || "").replace(/\s+/g, " ").trim();
  return clean.length > max ? `${clean.slice(0, max).trimEnd()}...` : clean;
}

// ─── Live reply counter ───────────────────────────────────────────────────────

export function ForumCommentCount({ slug, initial }: { slug: string; initial: number }) {
  const [count, setCount] = useState(initial);
  const { entry: shared, status } = useStatEntry("forum", slug);

  useEffect(() => {
    if (shared && typeof shared.comments === "number") setCount(shared.comments);
  }, [shared]);

  useEffect(() => {
    let mounted = true;
    if (status === "loading" || shared) return () => { mounted = false; };
    fetch(`/api/stats?module=forum&slug=${encodeURIComponent(slug)}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((s) => { if (mounted && typeof s.comments === "number") setCount(s.comments); })
      .catch(() => {});
    return () => { mounted = false; };
  }, [slug, shared, status]);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger render={<span className="text-[11px] text-muted-foreground cursor-default" />}>
          <span className="font-bold text-foreground">{count.toLocaleString("fa-IR")}</span>{" "}
          پاسخ ثبت شده
        </TooltipTrigger>
        <TooltipContent>تعداد پاسخ ثبت شده برای این موضوع</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

export function ForumCardSkeleton() {
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

// ─── Card ────────────────────────────────────────────────────────────────────

export interface ForumTopicItem {
  slug: string;
  title: string;
  excerpt?: string;
  content?: string;
  date?: string;
  comments?: number;
  solved?: boolean;
  author?: {
    name?: string;
    username?: string;
    avatar?: string;
    job?: string;
    role?: string;
    verifiedType?: string | null;
    verifiedLabel?: string | null;
  };
  acceptedAnswer?: { text: string } | null;
}

export function ForumCard({ topic }: { topic: ForumTopicItem }) {
  const authorName = topic.author?.name || "عضو تکباکس";
  const authorSlug =
    topic.author?.username ||
    String(authorName).trim().toLowerCase().replace(/[^\w\u0600-\u06FF]+/g, "-");
  const description = clampText(topic.excerpt || topic.content || "");
  const acceptedSnippet = topic.acceptedAnswer ? clampText(topic.acceptedAnswer.text) : "";

  return (
    <TooltipProvider>
      <Card className="group relative h-full p-5 hover:shadow-md transition-all duration-200">
        <CardContent className="p-0 space-y-3">
          {/* Author (right) + publish date (left) */}
          <div className="flex items-center justify-between gap-2">
            <Link
              href={`/author/${encodeURIComponent(authorSlug)}`}
              onClick={(e) => e.stopPropagation()}
              className="relative z-10 flex items-center gap-2.5 group/author hover:opacity-90 transition-opacity"
            >
              <Avatar className="h-9 w-9 shrink-0 ring-1 ring-border group-hover/author:ring-[var(--primary)] transition-all">
                <AvatarImage src={topic.author?.avatar || "/assets/hooman.png"} alt={authorName} />
                <AvatarFallback>{authorName.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <div className="text-xs font-bold text-foreground group-hover/author:text-[var(--primary)] transition-colors flex items-center gap-1">
                  <span className="truncate">{authorName}</span>
                  {topic.author?.verifiedType && (
                    <VerifiedBadge
                      type={topic.author.verifiedType as "content" | "org" | "user"}
                      label={topic.author.verifiedLabel}
                      size={13}
                    />
                  )}
                </div>
                <div className="text-[10px] text-muted-foreground truncate">
                  {topic.author?.job || topic.author?.role || "عضو انجمن"}
                </div>
              </div>
            </Link>

            {/* Date — with tooltip */}
            <Tooltip>
              <TooltipTrigger render={<span className="text-[11px] text-muted-foreground shrink-0 cursor-default" />}>
                {formatRelativeDate(topic.date)}
              </TooltipTrigger>
              <TooltipContent>تاریخ ایجاد موضوع</TooltipContent>
            </Tooltip>
          </div>

          {/* Title — stretched link covers whole card */}
          <h3 className="text-sm font-bold text-foreground group-hover:text-[var(--primary)] transition-colors line-clamp-2 leading-6">
            <Link href={`/forum/${topic.slug}`} className="absolute inset-0 z-0" aria-label={topic.title} />
            {topic.title}
          </h3>

          {/* Description snippet */}
          {description && (
            <p className="text-xs text-muted-foreground leading-5 line-clamp-2">{description}</p>
          )}

          {/* Best answer snippet */}
          {acceptedSnippet && (
            <div className="rounded-md border border-[color-mix(in_oklch,var(--success)_30%,transparent)] bg-[color-mix(in_oklch,var(--success)_8%,transparent)] p-2.5 space-y-1">
              <div className="flex items-center gap-1.5">
                <Badge variant="ghost" className="text-[10px] text-[var(--success)] p-0 h-auto">
                  پاسخ برتر ✓
                </Badge>
              </div>
              <p className="text-[11px] text-foreground/80 leading-5 line-clamp-2">{acceptedSnippet}</p>
            </div>
          )}

          {/* Bottom: reply count (right) | status badge (left) */}
          <div className="pt-2 border-t flex items-center justify-between gap-2">
            <ForumCommentCount slug={topic.slug} initial={topic.comments || 0} />
            <ForumBadge
              slug={topic.slug}
              fallback={typeof topic.solved === "boolean" ? topic.solved : null}
            />
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
