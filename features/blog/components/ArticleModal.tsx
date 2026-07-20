"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { type ContentItem } from "@/lib/content";
import { Button } from "@/components/ui/button";
import { Icon } from "@/design/icons";
import { LikeButton } from "@/components/ui/like-button";
import { SaveButton } from "@/components/ui/save-button";
import { ShareButton } from "@/components/ui/share-button";
import { AuthorLink } from "@/components/ui/author-link";
import CommentSection from "@/features/comment/components/CommentSection";
import MarkdownContent from "@/features/content/components/MarkdownContent";
import { formatRelativeDate } from "@/lib/date-format";
import { blurProps } from "@/lib/image-placeholder";
import { zIndex } from "@/design";

interface ArticleModalProps {
  item: ContentItem;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

export function ArticleModal({ item, onClose, onPrev, onNext }: ArticleModalProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onPrev();
      if (e.key === "ArrowLeft") onNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, onPrev, onNext]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [item.slug]);

  const readingTime = item.readingTimeLabel || "";
  const tags: string[] = Array.isArray((item as any).tags) ? (item as any).tags : [];

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4 sm:p-6"
      style={{ zIndex: zIndex.modal }}
      dir="rtl"
    >
      <div className="absolute inset-0 bg-black/80" onClick={onClose} />

      <div className="relative z-10 animate-in fade-in duration-200 flex items-center gap-2 w-full max-w-4xl">

        {/* Prev — RIGHT side in RTL → << */}
        <button
          type="button"
          onClick={onPrev}
          className="shrink-0 text-white/50 hover:text-white transition-colors select-none"
          style={{ fontSize: 30, fontWeight: 900, lineHeight: 1, padding: "0 8px" }}
          aria-label="مقاله بعدی"
        >
          {"<<"}
        </button>

        {/* Modal */}
        <div
          className="flex-1 flex flex-col max-h-[90vh] overflow-hidden rounded-xl bg-[var(--modal-background)] border border-border shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Hero image — title lives here */}
          <div className="relative h-52 sm:h-64 shrink-0 overflow-hidden bg-muted">
            {item.image ? (
              <Image
                src={item.image}
                alt={item.title}
                fill
                className="object-cover"
                sizes="900px"
                {...blurProps(item.image)}
              />
            ) : (
              <div className="absolute inset-0 bg-muted" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/40" />

            {/* Close button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="absolute top-3 left-3 text-white/80 hover:text-white hover:bg-white/10"
            >
              <Icon name="close" size={20} />
            </Button>

            {/* Date + reading time — top right */}
            <div className="absolute top-3 right-3 flex items-center gap-2 text-white/70 text-xs">
              <span>{formatRelativeDate(item.date)}</span>
              {readingTime && <><span>•</span><span>{readingTime}</span></>}
            </div>

            {/* Title + "باز کردن" link — bottom of image */}
            <div className="absolute bottom-0 inset-x-0 px-5 py-4 flex items-end justify-between gap-4">
              <h2 className="text-lg sm:text-xl font-black text-white leading-6 flex-1">
                {item.title}
              </h2>
              <Link
                href={`/blog/${item.slug}`}
                onClick={onClose}
                className="shrink-0 text-xs text-white/60 hover:text-white transition-colors underline underline-offset-4 whitespace-nowrap"
              >
                باز کردن در صفحه کامل ↗
              </Link>
            </div>
          </div>

          {/* Scrollable body */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4"
            style={{ scrollbarWidth: "thin" }}
          >
            {/* Author + top actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-border">
              <AuthorLink
                name={item.author?.name}
                avatar={item.author?.avatar}
                username={item.author?.username}
                role={item.author?.job || item.author?.role}
                verifiedType={(item.author as any)?.verifiedType}
                verifiedLabel={(item.author as any)?.verifiedLabel}
              />
              <div className="flex items-center gap-2" dir="rtl">
                <LikeButton contentType="blog" slug={item.slug} initial={item.likes || 0} tooltipLabel="پسندیدن مقاله" />
                <SaveButton module="blog" slug={item.slug} />
                <ShareButton />
              </div>
            </div>

            {/* Full article body — smaller font */}
            <MarkdownContent content={item.content || item.excerpt || ""} />

            {/* Tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {tags.map((t) => (
                  <Link
                    key={t}
                    href={`/search?q=${encodeURIComponent(t)}`}
                    onClick={onClose}
                    className="text-xs text-muted-foreground border border-border rounded px-2 py-0.5 hover:text-foreground hover:border-foreground transition-colors"
                  >
                    #{t}
                  </Link>
                ))}
              </div>
            )}

            {/* Bottom actions — no top separator */}
            <div className="flex flex-wrap items-center gap-3 pb-1">
              <LikeButton contentType="blog" slug={item.slug} initial={item.likes || 0} />
              <SaveButton module="blog" slug={item.slug} />
              <ShareButton />
            </div>

            {/* Comments */}
            <CommentSection
              module="blog"
              slug={item.slug}
              initialComments={item.comments || 0}
            />
          </div>
        </div>

        {/* Next — LEFT side in RTL → >> */}
        <button
          type="button"
          onClick={onNext}
          className="shrink-0 text-white/50 hover:text-white transition-colors select-none"
          style={{ fontSize: 30, fontWeight: 900, lineHeight: 1, padding: "0 8px" }}
          aria-label="مقاله قبلی"
        >
          {">>"}
        </button>
      </div>
    </div>
  );
}
