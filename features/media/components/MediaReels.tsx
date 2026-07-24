"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
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
  const galleryRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const current = items[currentIndex] ?? null;

  const goTo = useCallback(
    (idx: number) => {
      if (idx < 0 || idx >= items.length) return;
      setCurrentIndex(idx);
      const el = galleryRef.current?.querySelector(`[data-idx="${idx}"]`);
      el?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    },
    [items.length]
  );

  const goNext = useCallback(() => goTo(currentIndex + 1), [currentIndex, goTo]);
  const goPrev = useCallback(() => goTo(currentIndex - 1), [currentIndex, goTo]);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp" || e.key === "ArrowLeft") { e.preventDefault(); goPrev(); }
      if (e.key === "ArrowDown" || e.key === "ArrowRight") { e.preventDefault(); goNext(); }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [goNext, goPrev]);

  // Load and play video when index changes — handle HLS streams too
  useEffect(() => {
    const vid = videoRef.current;
    if (!vid || !current?.videoUrl) return;
    let hls: any;

    const isHls = current.videoUrl.includes('.m3u8');

    if (isHls) {
      (async () => {
        try {
          const Hls = (await import('hls.js')).default;
          if (Hls.isSupported()) {
            hls = new Hls({ enableWorker: true, lowLatencyMode: true });
            hls.loadSource(current.videoUrl);
            hls.attachMedia(vid);
            hls.on(Hls.Events.MANIFEST_PARSED, () => {
              vid.play().catch(() => {});
            });
          } else if (vid.canPlayType('application/vnd.apple.mpegurl')) {
            vid.src = current.videoUrl || "";
            vid.play().catch(() => {});
          }
        } catch {}
      })();
    } else {
      // Regular video — src is already set via JSX, just play
      const timer = setTimeout(() => {
        vid.play().catch(() => {});
      }, 150);
      return () => clearTimeout(timer);
    }

    return () => {
      try { hls?.destroy(); } catch {}
    };
  }, [currentIndex, current?.videoUrl]);

  if (items.length === 0) {
    return (
      <div className="flex items-center justify-center h-[60vh] text-muted-foreground" dir="rtl">
        هنوز ویدیویی ثبت نشده است.
      </div>
    );
  }

  return (
    <div className="flex flex-row-reverse gap-4 h-[calc(100svh-var(--header-height)-2rem)] px-4 py-4" dir="rtl">
      {/* ── Col 1 (LEFT in RTL): Video player ── */}
      <div className="w-[420px] shrink-0 flex flex-col gap-2">
        {/* Previous button */}
        <div className="flex justify-center">
          <button
            onClick={goPrev}
            disabled={currentIndex === 0 ? true : undefined} suppressHydrationWarning
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-md text-xs font-medium text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
          >
            <ChevronUp className="size-4" />
            ویدیوی قبلی
          </button>
        </div>

        {/* Video player */}
        <div className="relative flex-1 min-h-0 rounded-xl overflow-hidden border border-border bg-black">
                <video
                  ref={videoRef}
                  key={current?.slug}
                  src={current?.videoUrl || undefined}
                  poster={current?.image}
                  controls
                  autoPlay
                  muted
                  playsInline
                  preload="auto"
                  onError={(e) => {
                    // If direct playback fails, try as HLS
                    const vid = e.currentTarget;
                    if (current?.videoUrl && !current.videoUrl.includes('.m3u8')) {
                      // Try with different source approach
                      vid.load();
                    }
                  }}
                  className="w-full h-full object-contain bg-black"
                />
        </div>

        {/* Next button */}
        <div className="flex justify-center">
          <button
            onClick={goNext}
            disabled={currentIndex === items.length - 1 ? true : undefined} suppressHydrationWarning
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-md text-xs font-medium text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
          >
            ویدیوی بعدی
            <ChevronDown className="size-4" />
          </button>
        </div>
      </div>

      {/* ── Col 2 (CENTER): Info + comments ── */}
      <div className="flex-1 min-w-0 flex align-center flex-col border border-border rounded-xl bg-card overflow-hidden">
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
            {/* Comments — hidden scrollbar */}
            <div className="flex-1 overflow-y-auto p-4" style={{ scrollbarWidth: "none" }}>
              <style>{`.media-comments::-webkit-scrollbar { display: none; }`}</style>
              <div className="media-comments">
                <CommentSection module="media" slug={current.slug} initialComments={current.comments || 0} compact />
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── Col 3 (RIGHT in RTL): Vertical gallery with buttons ── */}
      <div className="w-[200px] shrink-0 flex flex-col gap-1.5">
        {/* Gallery up button */}
        <div className="flex justify-center">
          <button
            onClick={goPrev}
            disabled={currentIndex === 0 ? true : undefined} suppressHydrationWarning
            className="flex items-center justify-center w-full py-1.5 rounded-md text-xs font-medium text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30 disabled:pointer-events-none cursor-pointer border border-border"
          >
            <ChevronUp className="size-4" />
          </button>
        </div>

        {/* Gallery cards — hidden scrollbar */}
        <div
          ref={galleryRef}
          className="flex-1 min-h-0 overflow-y-auto space-y-3"
          style={{ scrollbarWidth: "none" }}
        >
          {items.map((vid, idx) => (
            <div key={vid.slug} data-idx={idx} className={idx === currentIndex ? "ring-2 ring-primary rounded-[var(--corner-radius)]" : ""}>
              <VideoCard video={vid} onOpen={() => goTo(idx)} />
            </div>
          ))}
        </div>

        {/* Gallery down button */}
        <div className="flex justify-center">
          <button
            onClick={goNext}
            disabled={currentIndex === items.length - 1 ? true : undefined} suppressHydrationWarning
            className="flex items-center justify-center w-full py-1.5 rounded-md text-xs font-medium text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30 disabled:pointer-events-none cursor-pointer border border-border"
          >
            <ChevronDown className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
