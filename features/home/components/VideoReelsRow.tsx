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
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LikeButton } from '@/components/ui/like-button';
import { SaveButton } from '@/components/ui/save-button';
import { ShareButton } from '@/components/ui/share-button';

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
        <div className="responsive-card-grid-sm grid gap-5">
          {videos.map((vid) => (
            <button type="button" key={vid.slug} onClick={() => setActive(vid)} className="group relative w-full h-auto aspect-[9/16] p-0 rounded-[var(--corner-radius)] overflow-hidden border border-border shadow-sm hover:shadow-md transition-all duration-[200ms] bg-card flex flex-col justify-end text-right cursor-pointer">
              <Image src={vid.image || '/assets/blog-1.jpg'} alt={vid.title} fill className="object-cover" sizes="260px" {...blurProps(vid.image || '/assets/blog-1.jpg')} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent z-10 pointer-events-none" />
              {(vid as any).videoDuration && <span className="absolute left-2 top-2 z-30 rounded-[var(--corner-radius)] bg-black/60 px-2 py-0.5 text-[11px] font-bold text-white" dir="ltr">{(vid as any).videoDuration}</span>}
              <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                <div className="group-hover:hidden">
                  <Icon name="play" size={40} className="text-white drop-shadow-lg" />
                </div>
                <div className="hidden group-hover:flex items-center text-white text-sm font-bold drop-shadow-lg transition-all duration-200">
                  پخش ویدیو
                </div>
              </div>
              <div className="relative z-30 p-3.5 text-white w-full">
                <h3 className="text-xs sm:text-sm font-bold leading-5 line-clamp-2 text-white group-hover:text-[var(--media)] transition-colors">{vid.title}</h3>
                <div className="mt-2.5 flex items-center justify-between" dir="ltr">
                  <CardStats module="media" slug={vid.slug} showComments={true} />
                  <span className="text-[10px] text-white/75" dir="rtl">{vid.date_fa}</span>
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

    // In case metadata is already loaded
    if (vid.readyState >= 1) {
      setVideoDimensions({ width: vid.videoWidth, height: vid.videoHeight });
    }

    vid.addEventListener('loadedmetadata', handleLoadedMetadata);
    return () => vid.removeEventListener('loadedmetadata', handleLoadedMetadata);
  }, []);

  const aspectRatio = videoDimensions ? videoDimensions.width / videoDimensions.height : 16 / 9;

  return (
    <div className="fixed inset-0 bg-black/80 p-3 sm:p-6 flex items-center justify-center" style={{ zIndex: zIndex.modal }} dir="rtl">
      <Button type="button" variant="ghost" className="absolute inset-0 w-full h-full opacity-0" onClick={onClose} aria-label="بستن" />
      <div className="relative z-10 grid w-full max-w-6xl max-h-[92vh] overflow-hidden rounded-[var(--corner-radius)] bg-[var(--modal-background)] border-[length:var(--border-size)] border-[var(--border-color)] shadow-[var(--shadow-size)] lg:grid-cols-[1fr_minmax(320px,420px)]">
        {/* Video section */}
        <div className="bg-black flex items-center justify-center">
          <AspectRatio ratio={aspectRatio} className="w-full max-h-[92vh]">
            <video
              ref={videoRef}
              src={video.videoUrl || undefined}
              poster={video.image}
              controls
              autoPlay
              playsInline
              className="w-full h-full object-contain bg-black"
            />
          </AspectRatio>
        </div>
        {/* Info section - scrollable */}
        <ScrollArea className="h-full max-h-[92vh]">
          <div className="p-4 space-y-4">
            {/* Title + close */}
            <div className="flex items-start justify-between gap-3">
              <div>
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

            {/* Date + like/save/share row */}
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
        </ScrollArea>
      </div>
    </div>
  );
}
