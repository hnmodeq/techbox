'use client';

import React from 'react';
import { useHomeModule } from '@/features/home/lib/home-data';
import { HOME_ROW_SIZES } from './HomeRowConfig';
import Link from 'next/link';
import { EmptyRow, VideoRowGridSkeleton } from './HomeRowSkeletons';
import { VideoCard, VideoModal, useVideoModal } from '@/components/content/VideoCard';

export default function VideoReelsRow({
  homeTitle,
  homeMoreLabel,
  showHomeTitle = true,
  showHomeMoreLabel = true,
}: {
  homeTitle?: string;
  homeMoreLabel?: string;
  showHomeTitle?: boolean;
  showHomeMoreLabel?: boolean;
}) {
  const { items: dbVideos, loading } = useHomeModule('media');
  const videos = dbVideos.slice(0, 5);
  const { activeVideo, slideKey, slideDirection, open, close, prev, next } = useVideoModal(videos);

  return (
    <section
      className={`w-full py-8 px-4 sm:px-6 lg:px-8 bg-[var(--main-background)] ${HOME_ROW_SIZES.mediaMinHeight} flex flex-col justify-center`}
      dir="rtl"
    >
      <div className={`mx-auto ${HOME_ROW_SIZES.containerMaxWidth} w-full`}>
        <div className="flex items-center justify-between gap-4 mb-6">
          {showHomeTitle && (
            <h2 className="text-xl sm:text-2xl font-black text-[var(--primary-text)]">
              {homeTitle || 'آخرین ویدیوهای کوتاه تکباکسی'}
            </h2>
          )}
          {showHomeMoreLabel && (
            <Link
              href="/media"
              className="text-sm font-bold text-[var(--primary)] hover:underline flex items-center gap-1 shrink-0"
            >
              <span>{homeMoreLabel || 'گشت و گزار در ویدیوها'}</span>
              <span>←</span>
            </Link>
          )}
        </div>

        {loading ? (
          <VideoRowGridSkeleton count={5} />
        ) : videos.length === 0 ? (
          <EmptyRow>هنوز ویدیویی در دیتابیس ثبت نشده است.</EmptyRow>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {videos.map((vid, idx) => (
              <VideoCard key={vid.slug} video={vid} onOpen={() => open(idx)} />
            ))}
          </div>
        )}
      </div>

      {activeVideo && (
        <VideoModal
          key={slideKey}
          video={activeVideo}
          onClose={close}
          onPrev={prev}
          onNext={next}
          slideDirection={slideDirection}
        />
      )}
    </section>
  );
}
