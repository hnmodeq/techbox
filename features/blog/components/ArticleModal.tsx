"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type ContentItem } from "@/lib/content";
import { Button } from "@/components/ui/button";
import { Icon } from "@/design/icons";
import { LikeButton } from "@/components/ui/like-button";
import { SaveButton } from "@/components/ui/save-button";
import { ShareButton } from "@/components/ui/share-button";
import { AuthorLink } from "@/components/ui/author-link";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
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
  const router = useRouter();
  const [navigating, setNavigating] = useState(false);

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
    setNavigating(false);
  }, [item.slug]);

  // Prefetch the article page as soon as the modal opens
  useEffect(() => {
    router.prefetch(`/blog/${item.slug}`);
  }, [item.slug, router]);

  const handleOpenFullPage = useCallback(() => {
    setNavigating(true);
    // Show full-screen loading overlay, navigate, modal closes naturally when
    // the new page replaces the current one (the /blog route unmounts BlogGrid)
    router.push(`/blog/${item.slug}`);
    // Fallback: close modal after 3s in case navigation is very slow
    setTimeout(() => { setNavigating(false); onClose(); }, 3000);
  }, [item.slug, router, onClose]);

  const readingTime = item.readingTimeLabel || "";
  const tags: string[] = Array.isArray((item as any).tags) ? (item as any).tags : [];

  return (
    <TooltipProvider>
      <div
        className="fixed inset-0 flex items-center justify-center p-4 sm:p-6"
        style={{ zIndex: zIndex.modal }}
        dir="rtl"
      >
        <div className="absolute inset-0 bg-black/80" onClick={onClose} />

        <div className="relative z-10 animate-in fade-in duration-200 flex items-center gap-2 w-full max-w-4xl">

          {/* Prev — RIGHT in RTL → << */}
          <Tooltip>
            <TooltipTrigger
              render={
                <button
                  type="button"
                  onClick={onPrev}
                  className="shrink-0 text-white/50 hover:text-white transition-colors select-none"
                  style={{ fontSize: 30, fontWeight: 900, lineHeight: 1, padding: "0 8px" }}
                  aria-label="مقاله بعدی"
                />
              }
            >
              {"<<"}
            </TooltipTrigger>
            <TooltipContent>مقاله بعدی</TooltipContent>
          </Tooltip>

          {/* Modal */}
          <div
            className="relative flex-1 flex flex-col max-h-[90vh] overflow-hidden rounded-xl bg-[var(--modal-background)] border border-border shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* ── Full-screen navigation loading overlay ── */}
            {navigating && (
              <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-4 bg-background/90 backdrop-blur-md">
                <div className="w-12 h-12 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
                <span className="text-sm font-medium text-muted-foreground">در حال باز کردن مقاله...</span>
              </div>
            )}

            {/* Hero image */}
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

              {/* Date + reading time — bottom of image */}
              <div className="absolute bottom-3 right-3 flex items-center gap-3 text-white/70 text-xs">
                <Tooltip>
                  <TooltipTrigger render={<span className="cursor-default" />}>
                    {formatRelativeDate(item.date)}
                  </TooltipTrigger>
                  <TooltipContent>تاریخ انتشار</TooltipContent>
                </Tooltip>
                {readingTime && (
                  <>
                    <span className="text-white/40">•</span>
                    <Tooltip>
                      <TooltipTrigger render={<span className="cursor-default" />}>
                        {readingTime}
                      </TooltipTrigger>
                      <TooltipContent>زمان مطالعه</TooltipContent>
                    </Tooltip>
                  </>
                )}
              </div>
            </div>

            {/* Scrollable body */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4"
              style={{ scrollbarWidth: "thin" }}
            >
              {/* Author row — author right, full-page button left */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-border">
                <AuthorLink
                  name={item.author?.name}
                  avatar={item.author?.avatar}
                  username={item.author?.username}
                  role={item.author?.job || item.author?.role}
                  verifiedType={(item.author as any)?.verifiedType}
                  verifiedLabel={(item.author as any)?.verifiedLabel}
                />
                {/* Full-page button — does NOT close modal immediately */}
                <button
                  type="button"
                  onClick={handleOpenFullPage}
                  disabled={navigating}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4 whitespace-nowrap disabled:opacity-50"
                >
                  باز کردن در صفحه کامل ↗
                </button>
              </div>

              {/* Title */}
              <h2 className="text-lg sm:text-xl font-black text-foreground leading-7">
                {item.title}
              </h2>

              {/* Full article body */}
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

              {/* Social actions */}
              <div className="flex flex-wrap items-center gap-3 pb-1">
                <LikeButton contentType="blog" slug={item.slug} initial={item.likes || 0} tooltipLabel="پسندیدن مقاله" />
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

          {/* Next — LEFT in RTL → >> */}
          <Tooltip>
            <TooltipTrigger
              render={
                <button
                  type="button"
                  onClick={onNext}
                  className="shrink-0 text-white/50 hover:text-white transition-colors select-none"
                  style={{ fontSize: 30, fontWeight: 900, lineHeight: 1, padding: "0 8px" }}
                  aria-label="مقاله قبلی"
                />
              }
            >
              {">>"}
            </TooltipTrigger>
            <TooltipContent>مقاله قبلی</TooltipContent>
          </Tooltip>

        </div>
      </div>
    </TooltipProvider>
  );
}
