"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronUp, ChevronDown, Play } from "lucide-react";
import { type ContentItem } from "@/lib/content";
import { LikeButton } from "@/components/ui/like-button";
import { SaveButton } from "@/components/ui/save-button";
import { ShareButton } from "@/components/ui/share-button";
import { CardStats } from "@/components/ui/card-stats";
import CommentSection from "@/features/comment/components/CommentSection";
import { formatRelativeDate } from "@/lib/date-format";
import { blurProps } from "@/lib/image-placeholder";

export default function MediaReels({ serverItems }: { serverItems?: ContentItem[] }) {
  const items = useMemo(() => serverItems ?? [], [serverItems]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<"up" | "down">("up");
  const galleryRef = useRef<HTMLDivElement>(null);

  const current = items[currentIndex] ?? null;

  const goTo = useCallback(
    (idx: number, dir: "up" | "down") => {
      if (idx < 0 || idx >= items.length) return;
      setDirection(dir);
      setCurrentIndex(idx);
      // Scroll the gallery to keep the active thumbnail visible
      const el = galleryRef.current?.querySelector(`[data-idx="${idx}"]`);
      el?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    },
    [items.length]
  );

  const goNext = useCallback(() => goTo(currentIndex + 1, "up"), [currentIndex, goTo]);
  const goPrev = useCallback(() => goTo(currentIndex - 1, "down"), [currentIndex, goTo]);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp" || e.key === "ArrowLeft") { e.preventDefault(); goPrev(); }
      if (e.key === "ArrowDown" || e.key === "ArrowRight") { e.preventDefault(); goNext(); }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [goNext, goPrev]);

  if (items.length === 0) {
    return (
      <div className="flex items-center justify-center h-[60vh] text-muted-foreground" dir="rtl">
        هنوز ویدیویی ثبت نشده است.
      </div>
    );
  }

  return (
    <div className="flex gap-4 h-[calc(100svh-var(--header-height)-2rem)] px-4 py-4" dir="rtl">
      {/* ── Right side: vertical gallery ── */}
      <div
        ref={galleryRef}
        className="w-[280px] shrink-0 overflow-y-auto space-y-2 pr-1"
        style={{ scrollbarWidth: "thin" }}
      >
        {items.map((vid, idx) => (
          <button
            key={vid.slug}
            data-idx={idx}
            type="button"
            onClick={() => goTo(idx, idx > currentIndex ? "up" : "down")}
            className={`group relative w-full flex gap-3 p-2 rounded-lg border transition-all cursor-pointer text-right ${
              idx === currentIndex
                ? "border-primary bg-primary/5"
                : "border-border bg-card hover:border-primary/30 hover:bg-accent/30"
            }`}
          >
            {/* Thumbnail */}
            <div className="relative w-[60px] h-[80px] shrink-0 rounded overflow-hidden bg-muted">
              <Image
                src={vid.image || "/assets/blog-1.jpg"}
                alt={vid.title}
                fill
                sizes="60px"
                className="object-cover"
                {...blurProps(vid.image || "/assets/blog-1.jpg")}
              />
              {idx === currentIndex && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <Play className="size-4 text-white fill-white" />
                </div>
              )}
              {vid.videoDuration && (
                <span className="absolute bottom-0.5 right-0.5 text-[8px] bg-black/70 text-white px-1 rounded">
                  {vid.videoDuration}
                </span>
              )}
            </div>
            {/* Info */}
            <div className="flex-1 min-w-0 py-0.5">
              <p className={`text-[11px] font-bold leading-4 line-clamp-2 ${idx === currentIndex ? "text-primary" : "text-foreground"}`}>
                {vid.title}
              </p>
              <p className="text-[9px] text-muted-foreground mt-1">
                {formatRelativeDate(vid.date)}
              </p>
              <div className="mt-1" dir="ltr">
                <CardStats
                  module="media"
                  slug={vid.slug}
                  initialViews={vid.views}
                  initialLikes={vid.likes}
                  initialComments={vid.comments}
                  showComments
                />
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* ── Left side: video player + info ── */}
      <div className="flex-1 min-w-0 flex flex-col gap-3">
        {/* Previous button */}
        <div className="flex justify-center">
          <button
            onClick={goPrev}
            disabled={currentIndex === 0}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-md text-xs font-medium text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
          >
            <ChevronUp className="size-4" />
            ویدیوی قبلی
          </button>
        </div>

        {/* Video player with slide animation */}
        <div className="relative flex-1 min-h-0 rounded-xl overflow-hidden border border-border bg-black">
          <AnimatePresence mode="wait" initial={false}>
            {current && (
              <motion.div
                key={current.slug}
                initial={{ opacity: 0, y: direction === "up" ? 80 : -80 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: direction === "up" ? -80 : 80 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <video
                  key={current.slug}
                  src={current.videoUrl || undefined}
                  poster={current.image}
                  controls
                  autoPlay
                  playsInline
                  preload="metadata"
                  className="w-full h-full object-contain bg-black"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Next button */}
        <div className="flex justify-center">
          <button
            onClick={goNext}
            disabled={currentIndex === items.length - 1}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-md text-xs font-medium text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
          >
            ویدیوی بعدی
            <ChevronDown className="size-4" />
          </button>
        </div>

        {/* Info + comments */}
        {current && (
          <div className="rounded-xl border border-border bg-card p-5 space-y-4 max-h-[40vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="text-lg font-black text-foreground leading-7">{current.title}</h2>
                {current.excerpt && (
                  <p className="text-sm text-muted-foreground mt-1 leading-6">{current.excerpt}</p>
                )}
                <p className="text-xs text-muted-foreground mt-2">{formatRelativeDate(current.date)}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <LikeButton contentType="media" slug={current.slug} initial={current.likes || 0} tooltipLabel="پسند کردن این ویدیو" />
              <SaveButton module="media" slug={current.slug} />
              <ShareButton />
            </div>

            <CommentSection module="media" slug={current.slug} initialComments={current.comments || 0} compact />
          </div>
        )}
      </div>
    </div>
  );
}
