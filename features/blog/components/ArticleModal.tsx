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
import { VerifiedBadge } from "@/components/ui/verified-badge";
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

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onPrev(); // RTL: right = previous
      if (e.key === "ArrowLeft") onNext();  // RTL: left  = next
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, onPrev, onNext]);

  // Reset scroll on article change
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
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80" onClick={onClose} />

      {/* Nav + modal */}
      <div className="relative z-10 animate-in fade-in duration-200 flex items-center gap-2 w-full max-w-4xl">

        {/* Prev (right in RTL) */}
        <button
          type="button"
          onClick={onPrev}
          className="shrink-0 text-white/50 hover:text-white transition-colors select-none"
          style={{ fontSize: 30, fontWeight: 900, lineHeight: 1, padding: "0 8px" }}
          aria-label="مقاله بعدی"
        >
          {">>"}
        </button>

        {/* Modal */}
        <div
          className="flex-1 flex flex-col max-h-[90vh] overflow-hidden rounded-xl bg-[var(--modal-background)] border border-border shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Article hero image */}
          {item.image && (
            <div className="relative h-52 sm:h-64 shrink-0 overflow-hidden bg-muted">
              <Image
                src={item.image}
                alt={item.title}
                fill
                className="object-cover"
                sizes="900px"
                {...blurProps(item.image)}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

              {/* Close button over image */}
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="absolute top-3 left-3 text-white/80 hover:text-white hover:bg-white/10"
              >
                <Icon name="close" size={20} />
              </Button>

              {/* Date + reading time */}
              <div className="absolute bottom-3 right-3 flex items-center gap-3 text-white/80 text-xs">
                <span>{formatRelativeDate(item.date)}</span>
                {readingTime && <><span>•</span><span>{readingTime}</span></>}
              </div>
            </div>
          )}

          {/* Scrollable body */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-5"
            style={{ scrollbarWidth: "thin" }}
          >
            {/* Title */}
            <h2 className="text-xl sm:text-2xl font-black text-foreground leading-7">
              {item.title}
            </h2>

            {/* Excerpt */}
            {item.excerpt && (
              <p className="text-sm text-muted-foreground leading-7">{item.excerpt}</p>
            )}

            {/* Author + actions row */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-border">
              <AuthorLink
                name={item.author?.name}
                avatar={item.author?.avatar}
                username={item.author?.username}
                role={item.author?.job || item.author?.role}
                verifiedType={(item.author as any)?.verifiedType}
                verifiedLabel={(item.author as any)?.verifiedLabel}
              />
              <div className="flex items-center gap-2" dir="ltr">
                <LikeButton contentType="blog" slug={item.slug} initial={item.likes || 0} tooltipLabel="پسندیدن مقاله" />
                <SaveButton module="blog" slug={item.slug} />
                <ShareButton />
              </div>
            </div>

            {/* Full article body */}
            <div>
              <MarkdownContent content={item.content || item.excerpt || ""} />
            </div>

            {/* Tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
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

            {/* Bottom actions */}
            <div className="flex flex-wrap items-center gap-3 pt-2 pb-1 border-t border-border">
              <LikeButton contentType="blog" slug={item.slug} initial={item.likes || 0} />
              <SaveButton module="blog" slug={item.slug} />
              <ShareButton />
              <Link
                href={`/blog/${item.slug}`}
                onClick={onClose}
                className="mr-auto text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4"
              >
                باز کردن در صفحه کامل ↗
              </Link>
            </div>

            {/* Comments */}
            <CommentSection
              module="blog"
              slug={item.slug}
              initialComments={item.comments || 0}
            />
          </div>
        </div>

        {/* Next (left in RTL) */}
        <button
          type="button"
          onClick={onNext}
          className="shrink-0 text-white/50 hover:text-white transition-colors select-none"
          style={{ fontSize: 30, fontWeight: 900, lineHeight: 1, padding: "0 8px" }}
          aria-label="مقاله قبلی"
        >
          {"<<"}
        </button>
      </div>
    </div>
  );
}
