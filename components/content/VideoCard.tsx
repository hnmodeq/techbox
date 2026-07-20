"use client";

/**
 * VideoCard + VideoModal — shared components used by:
 *   - features/home/components/VideoReelsRow.tsx  (homepage media row)
 *   - features/media/components/MediaGallery.tsx   (/media page)
 *
 * Card: 9/16 aspect-ratio thumbnail, play icon morphs to "پخش ویدیو" on hover,
 *       date top-right, duration top-left, stats bottom.
 * Modal: full video player with comments, like, save, share, prev/next nav.
 */

import React, { useRef, useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { Icon } from "@/design/icons";
import { Button } from "@/components/ui/button";
import { CardStats } from "@/components/ui/card-stats";
import { LikeButton } from "@/components/ui/like-button";
import { SaveButton } from "@/components/ui/save-button";
import { ShareButton } from "@/components/ui/share-button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import CommentSection from "@/features/comment/components/CommentSection";
import { blurProps } from "@/lib/image-placeholder";
import { formatRelativeDate } from "@/lib/date-format";
import { zIndex } from "@/design";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface VideoItem {
  slug: string;
  title: string;
  excerpt?: string;
  image?: string;
  videoUrl?: string | null;
  videoDuration?: string | null;
  date?: string;
  likes?: number;
  views?: number;
  comments?: number;
  module?: string;
}

// ─── Card ─────────────────────────────────────────────────────────────────────

interface VideoCardProps {
  video: VideoItem;
  onOpen: () => void;
}

export function VideoCard({ video, onOpen }: VideoCardProps) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group relative w-full aspect-[9/16] p-0 rounded-[var(--corner-radius)] overflow-hidden border border-border shadow-sm bg-card flex flex-col justify-end text-right cursor-pointer"
    >
      {/* Thumbnail */}
      <Image
        src={video.image || "/assets/blog-1.jpg"}
        alt={video.title}
        fill
        className="object-cover"
        sizes="200px"
        {...blurProps(video.image || "/assets/blog-1.jpg")}
      />
      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent z-10 pointer-events-none" />

      {/* Date (right) + Duration (left) — top bar */}
      <div
        dir="ltr"
        className="absolute inset-x-0 top-0 flex items-center justify-between bg-gradient-to-b from-black/70 to-transparent px-3 py-3 z-30"
      >
        <Tooltip>
          <TooltipTrigger render={<span className="text-[10px] font-bold text-white/90 sm:text-xs" dir="rtl" />}>
            {formatRelativeDate(video.date)}
          </TooltipTrigger>
          <TooltipContent>تاریخ انتشار ویدیو</TooltipContent>
        </Tooltip>
        {video.videoDuration && (
          <Tooltip>
            <TooltipTrigger render={<span className="text-[10px] font-medium text-white/75 sm:text-xs" dir="ltr" />}>
              {video.videoDuration}
            </TooltipTrigger>
            <TooltipContent>مدت زمان ویدیو</TooltipContent>
          </Tooltip>
        )}
      </div>

      {/* Play icon → "پخش ویدیو" morph on hover */}
      <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
        <div className="relative flex items-center justify-center overflow-hidden h-8">
          <span className="absolute flex items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:blur-sm group-hover:scale-75 group-hover:opacity-0">
            <Icon name="play" size={32} className="text-white drop-shadow-lg" />
          </span>
          <span className="absolute flex items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] blur-sm scale-75 opacity-0 group-hover:blur-0 group-hover:scale-100 group-hover:opacity-100">
            <span className="text-white text-xs font-bold drop-shadow-lg">پخش ویدیو</span>
          </span>
        </div>
      </div>

      {/* Title + stats — bottom */}
      <div className="relative z-30 p-3 text-white w-full">
        <h3 className="text-[11px] sm:text-xs font-bold leading-4 line-clamp-2 text-white group-hover:text-[var(--primary)] transition-colors">
          {video.title}
        </h3>
        <div className="mt-2 flex items-center justify-start" dir="ltr">
          <CardStats
            module={video.module || "media"}
            slug={video.slug}
            initialViews={video.views}
            initialLikes={video.likes}
            initialComments={video.comments || 0}
            showComments
          />
        </div>
      </div>
    </button>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────

interface VideoModalProps {
  video: VideoItem;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  slideDirection: "left" | "right";
}

export function VideoModal({ video, onClose, onPrev, onNext, slideDirection }: VideoModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoDimensions, setVideoDimensions] = useState<{ width: number; height: number } | null>(null);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") onNext();
      if (e.key === "ArrowRight") onPrev();
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onPrev, onNext, onClose]);

  useEffect(() => {
    setVideoDimensions(null);
    const vid = videoRef.current;
    if (!vid) return;
    const handleMeta = () => setVideoDimensions({ width: vid.videoWidth, height: vid.videoHeight });
    if (vid.readyState >= 1) setVideoDimensions({ width: vid.videoWidth, height: vid.videoHeight });
    vid.addEventListener("loadedmetadata", handleMeta);
    return () => {
      vid.removeEventListener("loadedmetadata", handleMeta);
      vid.pause();
    };
  }, [video.slug]);

  const isPortrait = videoDimensions ? videoDimensions.height >= videoDimensions.width : true;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4 sm:p-6"
      style={{ zIndex: zIndex.modal }}
      dir="rtl"
    >
      <div className="absolute inset-0 bg-black/80" onClick={onClose} />

      <div className="relative z-10 animate-in fade-in duration-200 flex items-center gap-1">
        {/* Prev (right in RTL) */}
        <Tooltip>
          <TooltipTrigger
            render={
              <button
                type="button"
                onClick={onPrev}
                className="shrink-0 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-card/80 border border-border text-foreground backdrop-blur-sm hover:bg-card hover:scale-110 transition-all duration-200 shadow-lg"
              />
            }
          >
            <Icon name="chevronRight" size={24} />
          </TooltipTrigger>
          <TooltipContent>ویدیوی بعدی</TooltipContent>
        </Tooltip>

        {/* Modal */}
        <div
          className="flex flex-col sm:flex-row max-h-[92vh] overflow-hidden rounded-[var(--corner-radius)] bg-[var(--modal-background)] border-[length:var(--border-size)] border-[var(--border-color)] shadow-[var(--shadow-size)] w-full sm:w-auto"
          style={{
            maxWidth: isPortrait ? "80rem" : "100rem",
            animation: `${slideDirection === "right" ? "slideFromRight" : "slideFromLeft"} 250ms ease-out`,
          }}
        >
          {/* Video */}
          <div className="bg-black shrink-0 flex items-center justify-center">
            <video
              ref={videoRef}
              src={video.videoUrl || undefined}
              poster={video.image}
              controls
              autoPlay
              playsInline
              preload="metadata"
              onError={() => {}}
              className="block bg-black h-[50vh] sm:h-[92vh] w-auto sm:max-w-[45vw] object-contain"
            />
          </div>

          {/* Info */}
          <div className="min-w-0 sm:min-w-[340px] sm:max-w-[520px] sm:flex-1 flex flex-col max-h-[42vh] sm:max-h-[92vh]">
            <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="font-black text-[var(--primary-text)] text-lg leading-8">{video.title}</h3>
                  <p className="paragraph-color mt-1 text-sm leading-7">{video.excerpt}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="text-muted-foreground hover:text-foreground shrink-0"
                >
                  <Icon name="close" size={22} />
                </Button>
              </div>

              <div className="flex items-center gap-3" dir="ltr">
                <LikeButton
                  contentType="media"
                  slug={video.slug}
                  initial={video.likes || 0}
                  tooltipLabel="پسند کردن این ویدیو"
                />
                <SaveButton module="media" slug={video.slug} />
                <ShareButton />
              </div>

              <CommentSection
                module="media"
                slug={video.slug}
                initialComments={video.comments || 0}
              />
            </div>
          </div>
        </div>

        {/* Next (left in RTL) */}
        <Tooltip>
          <TooltipTrigger
            render={
              <button
                type="button"
                onClick={onNext}
                className="shrink-0 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-card/80 border border-border text-foreground backdrop-blur-sm hover:bg-card hover:scale-110 transition-all duration-200 shadow-lg"
              />
            }
          >
            <Icon name="chevronLeft" size={24} />
          </TooltipTrigger>
          <TooltipContent>ویدیوی قبلی</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}

// ─── Hook: modal state management ────────────────────────────────────────────

export function useVideoModal(videos: VideoItem[]) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [slideKey, setSlideKey] = useState(0);
  const [slideDirection, setSlideDirection] = useState<"left" | "right">("left");

  const open = useCallback((idx: number) => setActiveIndex(idx), []);
  const close = useCallback(() => setActiveIndex(null), []);

  const prev = useCallback(() => {
    setSlideDirection("right");
    setSlideKey((k) => k + 1);
    setActiveIndex((prev) => {
      if (prev === null) return null;
      return prev > 0 ? prev - 1 : videos.length - 1;
    });
  }, [videos.length]);

  const next = useCallback(() => {
    setSlideDirection("left");
    setSlideKey((k) => k + 1);
    setActiveIndex((prev) => {
      if (prev === null) return null;
      return prev < videos.length - 1 ? prev + 1 : 0;
    });
  }, [videos.length]);

  const activeVideo = activeIndex !== null && activeIndex < videos.length ? videos[activeIndex] : null;

  return { activeIndex, activeVideo, slideKey, slideDirection, open, close, prev, next };
}
