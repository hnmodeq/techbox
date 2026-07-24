"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronUp, ChevronDown } from "lucide-react";
import { type ContentItem } from "@/lib/content";
import { VideoCard } from "@/components/content/VideoCard";
import { LikeButton } from "@/components/ui/like-button";
import { SaveButton } from "@/components/ui/save-button";
import { ShareButton } from "@/components/ui/share-button";
import CommentSection from "@/features/comment/components/CommentSection";
import { formatRelativeDate } from "@/lib/date-format";

export default function MediaReels({ serverItems }: { serverItems?: ContentItem[] }) {
  const items = useMemo(() => serverItems ?? [], [serverItems]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<"up" | "down">("up");
  const galleryRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const current = items[currentIndex] ?? null;

  const goTo = useCallback(
    (idx: number, dir: "up" | "down") => {
      if (idx < 0 || idx >= items.length) return;
      setDirection(dir);
      setCurrentIndex(idx);
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

  // Force play when video source changes
  useEffect(() => {
    const vid = videoRef.current;
    if (!vid || !current?.videoUrl) return;
    vid.load();
    vid.play().catch(() => {});
  }, [currentIndex, current?.videoUrl]);

  if (items.length === 0) {
    return (
      <div className="flex items-center justify-center h-[60vh] text-muted-foreground" dir="rtl">
        هنوز ویدیویی ثبت نشده است.
      </div>
    );
  }

  return (
    <div className="flex gap-4 h-[calc(100svh-var(--header-height)-2rem)] px-4 py-4" dir="rtl">
      {/* ── Col 1 (LEFT in RTL): Video player ── */}
      <div className="w-[320px] shrink-0 flex flex-col gap-2">
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
                initial={{ opacity: 0, y: direction === "up" ? 60 : -60 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: direction === "up" ? -60 : 60 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <video
                  ref={videoRef}
                  src={current.videoUrl || undefined}
                  poster={current.image}
                  controls
                  autoPlay
                  muted
                  playsInline
                  preload="auto"
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
      </div>

      {/* ── Col 2 (CENTER): Info + comments ── */}
      <div className="flex-1 min-w-0 flex flex-col border border-border rounded-xl bg-card overflow-hidden">
        {current && (
          <>
            {/* Title + actions */}
            <div className="p-4 border-b border-border space-y-3">
              <div>
                <h2 className="text-base font-black text-foreground leading-6">{current.title}</h2>
                {current.excerpt && (
                  <p className="text-xs text-muted-foreground mt-1 leading-5 line-clamp-2">{current.excerpt}</p>
                )}
                <p className="text-[10px] text-muted-foreground mt-1.5">{formatRelativeDate(current.date)}</p>
              </div>
              <div className="flex items-center gap-3">
                <LikeButton contentType="media" slug={current.slug} initial={current.likes || 0} tooltipLabel="پسند کردن این ویدیو" />
                <SaveButton module="media" slug={current.slug} />
                <ShareButton />
              </div>
            </div>
            {/* Comments */}
            <div className="flex-1 overflow-y-auto p-4">
              <CommentSection module="media" slug={current.slug} initialComments={current.comments || 0} compact />
            </div>
          </>
        )}
      </div>

      {/* ── Col 3 (RIGHT in RTL): Vertical gallery ── */}
      <div
        ref={galleryRef}
        className="w-[200px] shrink-0 overflow-y-auto space-y-3"
        style={{ scrollbarWidth: "thin" }}
      >
        {items.map((vid, idx) => (
          <div key={vid.slug} data-idx={idx} className={idx === currentIndex ? "ring-2 ring-primary rounded-[var(--corner-radius)]" : ""}>
            <VideoCard video={vid} onOpen={() => goTo(idx, idx > currentIndex ? "up" : "down")} />
          </div>
        ))}
      </div>
    </div>
  );
}
