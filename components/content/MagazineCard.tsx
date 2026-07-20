"use client";

/**
 * MagazineCard — shared card component used by both:
 *   - features/home/components/MagazineRow.tsx  (homepage blog row)
 *   - features/blog/components/BlogGrid.tsx      (/blog page)
 *
 * Design: full-bleed image fills the entire card. Title, author, stats and
 * date all sit on top of the image inside a gradient overlay at the bottom.
 * Date + reading-time sit in a lighter gradient at the top.
 */

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { CardStats } from "@/components/ui/card-stats";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { blurProps } from "@/lib/image-placeholder";
import { formatRelativeDate } from "@/lib/date-format";

// ─── helpers (duplicated-free: defined once here) ────────────────────────────

function stripPreviewText(value?: string) {
  return (value || "")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/[#>*_`~\-[\]()]/g, " ")
    .replace(/&[a-zA-Z0-9#]+;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function articlePreview(item: { excerpt?: string; content?: string }) {
  const content = stripPreviewText(item.content);
  const excerpt = stripPreviewText(item.excerpt);
  let text = content || excerpt;
  if (content && excerpt && content.length < 220 && !content.includes(excerpt)) {
    text = `${content} ${excerpt}`.trim();
  }
  if (!text) return "";
  return text.endsWith("...") || text.endsWith("…") ? text : `${text}...`;
}

function compactReadingTimeLabel(value?: string) {
  return (value || "").replace(/\s*مطالعه\s*$/, "");
}

function getAuthorSlug(author?: { name?: string; username?: string }) {
  const value = author?.username || author?.name || "editorial";
  return value.trim().toLowerCase().replace(/[^a-z0-9_\u0600-\u06FF]+/g, "-");
}

// ─── Author meta ──────────────────────────────────────────────────────────────

function ArticleAuthorMeta({
  author,
  className = "",
}: {
  author?: { name?: string; username?: string; avatar?: string; job?: string; role?: string };
  className?: string;
}) {
  const name = author?.name || "تحریریه";
  const job = author?.job || "";
  const slug = getAuthorSlug(author);

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Link
            href={`/author/${encodeURIComponent(slug)}`}
            onClick={(e) => e.stopPropagation()}
            className={`grid grid-cols-[minmax(60px,1fr)_2rem] grid-rows-2 items-center gap-x-2 text-right transition-opacity hover:opacity-90 ${className}`}
            dir="ltr"
          />
        }
      >
        <div
          className="col-start-1 row-start-1 min-w-0 self-end truncate text-xs font-extrabold text-white drop-shadow"
          dir="rtl"
        >
          {name}
        </div>
        {job && (
          <div
            className="col-start-1 row-start-2 min-w-0 self-start truncate text-[10px] text-white/70"
            dir="rtl"
          >
            {job}
          </div>
        )}
        <div className="relative col-start-2 row-span-2 row-start-1 size-8 overflow-hidden rounded-full ring-1 ring-white/40">
          <Image
            src={author?.avatar || "/logo.png"}
            alt={name}
            fill
            sizes="32px"
            className="object-cover"
          />
        </div>
      </TooltipTrigger>
      <TooltipContent>بازدید از حساب کاربری {name}</TooltipContent>
    </Tooltip>
  );
}

// ─── The card ─────────────────────────────────────────────────────────────────

export interface MagazineCardItem {
  slug: string;
  module?: string;
  title: string;
  excerpt?: string;
  content?: string;
  image?: string;
  date?: string;
  readingTimeLabel?: string;
  views?: number;
  likes?: number;
  comments?: number;
  author?: { name?: string; username?: string; avatar?: string; job?: string; role?: string };
}

export function MagazineCard({ item }: { item: MagazineCardItem }) {
  const postModule = item.module || "blog";

  return (
    <Card className="group !p-0 overflow-hidden relative aspect-[3/4] transition-all duration-500 ease-out hover:-translate-y-0.5 hover:shadow-xl">
      <Link href={`/${postModule}/${item.slug}`} className="absolute inset-0 z-10" aria-label={item.title} />

      {/* Full-bleed image */}
      <Image
        src={item.image || "/assets/blog-1.jpg"}
        alt={item.title}
        fill
        className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
        {...blurProps(item.image || "/assets/blog-1.jpg")}
      />

      {/* Top gradient — date + reading time */}
      <div
        dir="ltr"
        className="absolute inset-x-0 top-0 z-20 flex items-center justify-between bg-gradient-to-b from-black/60 to-transparent px-3 py-3 pointer-events-none"
      >
        <Tooltip>
          <TooltipTrigger
            render={<span className="text-[10px] font-bold text-white/90 sm:text-xs pointer-events-auto" dir="rtl" />}
          >
            {formatRelativeDate(item.date)}
          </TooltipTrigger>
          <TooltipContent>تاریخ انتشار</TooltipContent>
        </Tooltip>

        {item.readingTimeLabel && (
          <Tooltip>
            <TooltipTrigger
              render={<span className="text-[10px] font-medium text-white/75 sm:text-xs pointer-events-auto" dir="rtl" />}
            >
              {compactReadingTimeLabel(item.readingTimeLabel)}
            </TooltipTrigger>
            <TooltipContent>زمان مطالعه</TooltipContent>
          </Tooltip>
        )}
      </div>

      {/* Bottom gradient — title + author + stats */}
      <div className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/90 via-black/60 to-transparent px-4 pt-10 pb-4 pointer-events-none">
        <h3 className="text-sm font-bold text-white line-clamp-2 leading-6 mb-3">
          {item.title}
        </h3>

        <div className="flex items-end justify-between gap-2 pointer-events-auto" dir="ltr">
          {/* Stats — icons white */}
          <div className="[&_span]:text-white [&_svg]:text-white/70">
            <CardStats
              module={postModule}
              slug={item.slug}
              initialViews={item.views ?? 0}
              initialLikes={item.likes ?? 0}
              initialComments={item.comments ?? 0}
              showComments
            />
          </div>

          {/* Author */}
          <ArticleAuthorMeta author={item.author} />
        </div>
      </div>
    </Card>
  );
}
