'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useHomeModule } from '@/features/home/lib/home-data';
import { HOME_ROW_SIZES } from './HomeRowConfig';
import Link from 'next/link';
import Image from 'next/image';
import { blurProps } from "@/lib/image-placeholder";
import { CardStats } from '@/components/ui/card-stats';
import { Button } from '@/components/ui/button';
import CommentSection from '@/features/comment/components/CommentSection';
import { zIndex } from '@/design';
import { Icon } from '@/design/icons';
import { EmptyRow, VideoRowGridSkeleton } from './HomeRowSkeletons';
import { LikeButton } from '@/components/ui/like-button';
import { SaveButton } from '@/components/ui/save-button';
import { ShareButton } from '@/components/ui/share-button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function VideoReelsRow({ homeTitle, homeMoreLabel, showHomeTitle = true, showHomeMoreLabel = true }: { homeTitle?: string; homeMoreLabel?: string; showHomeTitle?: boolean; showHomeMoreLabel?: boolean }) {
  const { items: dbVideos, loading } = useHomeModule('media');
  const videos = dbVideos.slice(0, 5);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [slideKey, setSlideKey] = useState(0);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('left');

  const goToPrev = useCallback(() => {
    // RTL: previous video is to the right
    setSlideDirection('right');
    setSlideKey(k => k + 1);
    setActiveIndex(prev => {
      if (prev === null) return null;
      return prev > 0 ? prev - 1 : videos.length - 1;
    });
  }, [videos.length]);

  const goToNext = useCallback(() => {
    // RTL: next video is to the left
    setSlideDirection('left');
    setSlideKey(k => k + 1);
    setActiveIndex(prev => {
      if (prev === null) return null;
      return prev < videos.length - 1 ? prev + 1 : 0;
    });
  }, [videos.length]);

  return (
    <section className={`w-full py-8 px-4 sm:px-6 lg:px-8 bg-[var(--main-background)] ${HOME_ROW_SIZES.mediaMinHeight} flex flex-col justify-center`} dir="rtl">
      <div className={`mx-auto ${HOME_ROW_SIZES.containerMaxWidth} w-full`}>
        <div className="flex items-center justify-between gap-4 mb-6">
          {showHomeTitle && <h2 className="text-xl sm:text-2xl font-black text-[var(--primary-text)]">{homeTitle || "آخرین ویدیوهای کوتاه تکباکسی"}</h2>}
          {showHomeMoreLabel && <Link href="/media" className="text-sm font-bold text-[var(--media)] hover:underline flex items-center gap-1 shrink-0"><span>{homeMoreLabel || "گشت و گزار در ویدیوها"}</span><span>←</span></Link>}
        </div>
        {loading ? (
          <VideoRowGridSkeleton count={5} />
        ) : videos.length === 0 ? (
          <EmptyRow>هنوز ویدیویی در دیتابیس ثبت نشده است.</EmptyRow>
        ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {videos.map((vid, idx) => (
            <button type="button" key={vid.slug} onClick={() => setActiveIndex(idx)} className="group relative w-full aspect-[9/16] p-0 rounded-[var(--corner-radius)] overflow-hidden border border-border shadow-sm hover:shadow-md transition-all duration-[200ms] bg-card flex flex-col justify-end text-right cursor-pointer">
              <Image src={vid.image || '/assets/blog-1.jpg'} alt={vid.title} fill className="object-cover" sizes="200px" {...blurProps(vid.image || '/assets/blog-1.jpg')} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent z-10 pointer-events-none" />

              {/* Date & Duration overlay */}
              <div dir="ltr" className="absolute inset-x-0 top-0 flex items-center justify-between bg-gradient-to-b from-black/70 to-transparent px-3 py-3 z-30">
                <Tooltip>
                  <TooltipTrigger render={<span className="text-[10px] font-bold text-white/90 sm:text-xs" dir="rtl" />}>
                    {vid.date_fa}
                  </TooltipTrigger>
                  <TooltipContent>تاریخ انتشار ویدیو</TooltipContent>
                </Tooltip>
                {(vid as any).videoDuration && (
                  <Tooltip>
                    <TooltipTrigger render={<span className="text-[10px] font-medium text-white/75 sm:text-xs" dir="ltr" />}>
                      {(vid as any).videoDuration}
                    </TooltipTrigger>
                    <TooltipContent>مدت زمان ویدیو</TooltipContent>
                  </Tooltip>
                )}
              </div>

              {/* Play icon with morph/dissolve effect */}
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

              <div className="relative z-30 p-3 text-white w-full">
                <h3 className="text-[11px] sm:text-xs font-bold leading-4 line-clamp-2 text-white group-hover:text-[var(--media)] transition-colors">{vid.title}</h3>
                <div className="mt-2 flex items-center justify-start" dir="ltr">
                  <CardStats module="media" slug={vid.slug} initialViews={vid.views} initialLikes={vid.likes} initialComments={vid.comments || 0} showComments={true} />
                </div>
              </div>
            </button>
          ))}
        </div>
        )}
      </div>
      {activeIndex !== null && activeIndex < videos.length && (
        <VideoModal
          key={slideKey}
          video={videos[activeIndex]}
          onClose={() => setActiveIndex(null)}
          onPrev={goToPrev}
          onNext={goToNext}
          slideDirection={slideDirection}
        />
      )}
    </section>
  );
}

function VideoModal({ video, onClose, onPrev, onNext, slideDirection }: {
  video: any;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  slideDirection: 'left' | 'right';
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [videoDimensions, setVideoDimensions] = useState<{ width: number; height: number } | null>(null);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') onNext();
      if (e.key === 'ArrowRight') onPrev();
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onPrev, onNext, onClose]);

  // Callback ref: captures the DOM node and wires it up.
  // This avoids React.key-triggered unmount/remount races.
  const setVideoRef = useCallback((node: HTMLVideoElement | null) => {
    // Clean up previous node
    const prev = videoRef.current;
    if (prev && prev !== node) {
      prev.pause();
      prev.src = '';
      prev.load(); // flush
    }
    videoRef.current = node;
    if (!node) return;

    setVideoDimensions(null);

    const onMeta = () => {
      if (videoRef.current === node) {
        setVideoDimensions({ width: node.videoWidth, height: node.videoHeight });
      }
    };

    if (node.readyState >= 1) {
      onMeta();
    }
    node.addEventListener('loadedmetadata', onMeta);

    // Auto-play; browsers may block this, user can click play via controls
    node.play().catch(() => {});

    return () => {
      node.removeEventListener('loadedmetadata', onMeta);
    };
  }, []);

  // When video.slug changes (prev/next), reset dimensions
  useEffect(() => {
    setVideoDimensions(null);
  }, [video.slug]);

  const isPortrait = videoDimensions ? videoDimensions.height >= videoDimensions.width : true;

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 sm:p-6" style={{ zIndex: zIndex.modal }} dir="rtl">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80" onClick={onClose} />

      {/* Prev/Next as flex siblings — no overlap with modal */}
      {/* In RTL flex-row: first child → right, last child → left */}
      <div className="relative z-10 animate-in fade-in duration-200 flex items-center gap-1">
        {/* Inline keyframes for slide direction */}
        <style>{`
          @keyframes slideFromRight {
            from { transform: translateX(40px); opacity: 0.5; }
            to { transform: translateX(0); opacity: 1; }
          }
          @keyframes slideFromLeft {
            from { transform: translateX(-40px); opacity: 0.5; }
            to { transform: translateX(0); opacity: 1; }
          }
        `}</style>

        {/* Previous button (right side in RTL) */}
        <Tooltip>
          <TooltipTrigger render={
            <button
              type="button"
              onClick={onPrev}
              className="shrink-0 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-card/80 border border-border text-foreground backdrop-blur-sm hover:bg-card hover:scale-110 transition-all duration-200 shadow-lg"
            />
          }>
            <Icon name="chevronRight" size={24} />
          </TooltipTrigger>
          <TooltipContent>رفتن به ویدیوی بعدی</TooltipContent>
        </Tooltip>

        {/* Modal content */}
        <div
          className="flex flex-col sm:flex-row max-h-[92vh] overflow-hidden rounded-[var(--corner-radius)] bg-[var(--modal-background)] border-[length:var(--border-size)] border-[var(--border-color)] shadow-[var(--shadow-size)] w-full sm:w-auto"
          style={{
            maxWidth: isPortrait ? '80rem' : '100rem',
            animation: `${slideDirection === 'right' ? 'slideFromRight' : 'slideFromLeft'} 250ms ease-out`,
          }}
        >
          {/* Video section */}
          <div className="bg-black shrink-0 flex items-center justify-center">
            <video
              ref={setVideoRef}
              src={video.videoUrl || undefined}
              poster={video.image}
              controls
              autoPlay
              playsInline
              preload="metadata"
              className="block bg-black h-[50vh] sm:h-[92vh] w-auto sm:max-w-[45vw] object-contain"
            />
          </div>

          {/* Info section with ScrollArea */}
          <div className="min-w-0 sm:min-w-[340px] sm:max-w-[520px] sm:flex-1 max-h-[42vh] sm:max-h-none overflow-hidden">
            <ScrollArea className="h-full">
              <div className="p-4 sm:p-5 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="font-black text-[var(--primary-text)] text-lg leading-8">{video.title}</h3>
                    <p className="paragraph-color mt-1 text-sm leading-7">{video.excerpt}</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={onClose} className="text-muted-foreground hover:text-foreground shrink-0">
                    <Icon name="close" size={22} />
                  </Button>
                </div>

                <div className="flex items-center justify-between" dir="ltr">
                  <div className="flex items-center gap-3">
                    <LikeButton contentType="media" slug={video.slug} initial={video.likes || 0} tooltipLabel="پسند کردن این ویدیو" />
                    <SaveButton module="media" slug={video.slug} />
                    <ShareButton />
                  </div>
                </div>

                <CommentSection module="media" slug={video.slug} initialComments={video.comments || 0} />
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* Next button (left side in RTL) */}
        <Tooltip>
          <TooltipTrigger render={
            <button
              type="button"
              onClick={onNext}
              className="shrink-0 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-card/80 border border-border text-foreground backdrop-blur-sm hover:bg-card hover:scale-110 transition-all duration-200 shadow-lg"
            />
          }>
            <Icon name="chevronLeft" size={24} />
          </TooltipTrigger>
          <TooltipContent>رفتن به ویدیوی قبلی</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}
