'use client';

import React, { useState, useRef, useEffect } from 'react';
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
import { EmptyRow, RowGridSkeleton } from './HomeRowSkeletons';
import { LikeButton } from '@/components/ui/like-button';
import { SaveButton } from '@/components/ui/save-button';
import { ShareButton } from '@/components/ui/share-button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export default function VideoReelsRow() {
  const { items: dbVideos, loading } = useHomeModule('media');
  const videos = dbVideos.slice(0, 5);
  const [active, setActive] = useState<any | null>(null);

  return (
    <section className={`w-full py-12 px-4 sm:px-6 lg:px-8 bg-[var(--main-background)] ${HOME_ROW_SIZES.mediaMinHeight} flex flex-col justify-center`} dir="rtl">
      <div className={`mx-auto ${HOME_ROW_SIZES.containerMaxWidth} w-full`}>
        <div className="flex items-center justify-between gap-4 mb-6">
          <h2 className="text-xl sm:text-2xl font-black text-[var(--primary-text)]">آخرین ویدیوهای کوتاه تکباکسی</h2>
          <Link href="/media" className="text-sm font-bold text-[var(--media)] hover:underline flex items-center gap-1 shrink-0"><span>گشت و گزار در ویدیوها</span><span>←</span></Link>
        </div>
        {loading ? (
          <RowGridSkeleton count={5} imageRatio="aspect-[9/16]" className="responsive-card-grid-sm grid gap-5" />
        ) : videos.length === 0 ? (
          <EmptyRow>هنوز ویدیویی در دیتابیس ثبت نشده است.</EmptyRow>
        ) : (
        <div className="grid grid-cols-5 gap-4">
          {videos.map((vid) => (
            <button type="button" key={vid.slug} onClick={() => setActive(vid)} className="group relative w-full aspect-[9/16] p-0 rounded-[var(--corner-radius)] overflow-hidden border border-border shadow-sm hover:shadow-md transition-all duration-[200ms] bg-card flex flex-col justify-end text-right cursor-pointer">
              <Image src={vid.image || '/assets/blog-1.jpg'} alt={vid.title} fill className="object-cover" sizes="200px" {...blurProps(vid.image || '/assets/blog-1.jpg')} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent z-10 pointer-events-none" />

              {/* Duration - top right */}
              {(vid as any).videoDuration && (
                <Tooltip>
                  <TooltipTrigger render={<span className="absolute right-2 top-2 z-30 rounded-[var(--corner-radius)] bg-black/60 px-1.5 py-0.5 text-[10px] font-bold text-white" dir="ltr" />}>
                    {(vid as any).videoDuration}
                  </TooltipTrigger>
                  <TooltipContent>مدت زمان ویدیو</TooltipContent>
                </Tooltip>
              )}

              {/* Date - top left */}
              <Tooltip>
                <TooltipTrigger render={<span className="absolute left-2 top-2 z-30 rounded-[var(--corner-radius)] bg-black/60 px-1.5 py-0.5 text-[10px] font-bold text-white" dir="rtl" />}>
                  {vid.date_fa}
                </TooltipTrigger>
                <TooltipContent>تاریخ انتشار ویدیو</TooltipContent>
              </Tooltip>

              {/* Play icon with smooth transition */}
              <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                <div className="relative flex items-center justify-center">
                  <Icon name="play" size={32} className="text-white drop-shadow-lg absolute transition-all duration-300 ease-out opacity-100 group-hover:opacity-0 group-hover:scale-75" />
                  <span className="text-white text-xs font-bold drop-shadow-lg transition-all duration-300 ease-out opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0">
                    پخش ویدیو
                  </span>
                </div>
              </div>

              <div className="relative z-30 p-3 text-white w-full">
                <h3 className="text-[11px] sm:text-xs font-bold leading-4 line-clamp-2 text-white group-hover:text-[var(--media)] transition-colors">{vid.title}</h3>
                <div className="mt-2 flex items-center justify-start" dir="ltr">
                  <CardStats module="media" slug={vid.slug} showComments={true} />
                </div>
              </div>
            </button>
          ))}
        </div>
        )}
      </div>
      {active && (
        <VideoModal video={active} onClose={() => setActive(null)} />
      )}
    </section>
  );
}

function VideoModal({ video, onClose }: { video: any; onClose: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoDimensions, setVideoDimensions] = useState<{ width: number; height: number } | null>(null);

  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;

    const handleLoadedMetadata = () => {
      setVideoDimensions({ width: vid.videoWidth, height: vid.videoHeight });
    };

    if (vid.readyState >= 1) {
      setVideoDimensions({ width: vid.videoWidth, height: vid.videoHeight });
    }

    vid.addEventListener('loadedmetadata', handleLoadedMetadata);
    return () => vid.removeEventListener('loadedmetadata', handleLoadedMetadata);
  }, []);

  // Default to 9:16 (portrait) for shorts/reels content
  const isPortrait = videoDimensions ? videoDimensions.height >= videoDimensions.width : true;

  return (
    <div className="fixed inset-0 bg-black/80 p-3 sm:p-6 flex items-center justify-center" style={{ zIndex: zIndex.modal }} dir="rtl">
      <Button type="button" variant="ghost" className="absolute inset-0 w-full h-full opacity-0" onClick={onClose} aria-label="بستن" />
      <div className="relative z-10 flex w-full overflow-hidden rounded-[var(--corner-radius)] bg-[var(--modal-background)] border-[length:var(--border-size)] border-[var(--border-color)] shadow-[var(--shadow-size)]"
        style={{ maxHeight: '92vh', maxWidth: isPortrait ? '56rem' : '72rem' }}
      >
        {/* Video section - right side, sized by the video */}
        <div className="bg-black shrink-0">
          <video
            ref={videoRef}
            src={video.videoUrl || undefined}
            poster={video.image}
            controls
            autoPlay
            playsInline
            className="block bg-black"
            style={{
              height: '92vh',
              aspectRatio: videoDimensions ? `${videoDimensions.width} / ${videoDimensions.height}` : '9 / 16',
              maxWidth: isPortrait ? '420px' : 'none',
            }}
          />
        </div>
        {/* Info section - left side, takes remaining space, scrollable */}
        <div className="min-w-[280px] flex-1 overflow-y-auto p-4 space-y-4" style={{ maxHeight: '92vh' }}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="font-black text-[var(--primary-text)] text-lg">{video.title}</h3>
              <p className="paragraph-color mt-1 text-sm">{video.excerpt}</p>
              {video.videoDuration && (
                <span className="mt-1 inline-block text-xs paragraph-color" dir="ltr">{video.videoDuration}</span>
              )}
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="text-muted-foreground hover:text-foreground shrink-0">
              <Icon name="close" size={22} />
            </Button>
          </div>

          <div className="flex items-center justify-between" dir="ltr">
            <div className="flex items-center gap-3">
              <LikeButton contentType="media" slug={video.slug} />
              <SaveButton module="media" slug={video.slug} />
              <ShareButton />
            </div>
            <span className="text-xs text-muted-foreground" dir="rtl">{video.date_fa}</span>
          </div>

          <CommentSection module="media" slug={video.slug} />
        </div>
      </div>
    </div>
  );
}
