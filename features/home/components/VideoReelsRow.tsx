'use client';

import React, { useState } from 'react';
import { getLatest, getCommentCount } from '@/lib/content';
import { HOME_ROW_SIZES } from './HomeRowConfig';
import Link from 'next/link';
import Image from 'next/image';
import { Icon } from '@/design/icons';
import { CardStats } from '@/components/ui/CardStats';
import { createPortal } from 'react-dom';
import { zIndex } from '@/design';

const SAMPLE_VIDEO = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

export default function VideoReelsRow() {
  const videos = getLatest('media', 5);
  const [activeVideo, setActiveVideo] = useState<any | null>(null);

  return (
    <section className={`w-full py-12 px-4 sm:px-6 lg:px-8 bg-[var(--main-background)] ${HOME_ROW_SIZES.mediaMinHeight} flex flex-col justify-center`} dir="rtl">
      <div className={`mx-auto ${HOME_ROW_SIZES.containerMaxWidth} w-full`}>
        {/* Simple Text More Button positioned ABOVE items inside the header */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <h2 className="text-xl sm:text-2xl font-black text-[var(--primary-text)]">ریلزها و ویدیوهای کوتاه زیرساخت</h2>
          <Link href="/media" className="text-sm font-bold text-[var(--media)] hover:underline flex items-center gap-1 shrink-0">
            <span>مشاهده همه ویدیوها</span>
            <span>←</span>
          </Link>
        </div>

        {/* Clean Grid Layout without scrollbars */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
          {videos.map((vid) => {
            const commentsCount = getCommentCount('media', vid.slug);
            return (
              <button
                type="button"
                key={vid.slug}
                onClick={() => setActiveVideo(vid)}
                className="group relative w-full aspect-[9/16] rounded-2xl overflow-hidden border border-[var(--border-color)] shadow-xl hover:shadow-2xl transition-all duration-[var(--tb-motion-md)] bg-slate-950 flex flex-col justify-end text-right cursor-pointer"
              >
                <Image
                  src={vid.image || '/assets/blog-1.jpg'}
                  alt={vid.title}
                  fill
                  className="object-cover"
                  sizes="260px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent z-10 pointer-events-none" />

                <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                  <div className="w-12 h-12 rounded-full bg-white/25 backdrop-blur-md flex items-center justify-center text-white transition-transform group-hover:scale-125 shadow-lg">
                    ▶
                  </div>
                </div>

                <div className="relative z-30 p-3.5 text-white w-full">
                  <h3 className="text-xs sm:text-sm font-bold leading-5 line-clamp-2 text-white group-hover:text-[var(--media)] transition-colors">
                    {vid.title}
                  </h3>
                  
                  {/* Clean, distinct icons for views, likes, comments without line separator */}
                  <div className="mt-2.5">
                    <CardStats module="media" slug={vid.slug} initialViews={vid.views ?? 0} initialLikes={vid.likes ?? 0} initialComments={commentsCount} showComments={true} />
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Pop-up Modal Video Player */}
        {activeVideo && typeof window !== "undefined" && createPortal(
          <div className="fixed inset-0 flex items-center justify-center p-3 sm:p-6" style={{ zIndex: zIndex.modal }} dir="rtl">
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity" onClick={() => setActiveVideo(null)} />
            
            <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[var(--corner-radius)] border border-[var(--border-color)] bg-[var(--main-background)] shadow-2xl flex flex-col" style={{ zIndex: zIndex.modalContent }}>
              <div className="flex items-center justify-between p-4 border-b border-[var(--border-color)]">
                <h3 className="text-[length:var(--h2-font-size)] text-[var(--h2-font-color)] font-bold font-bold truncate text-[var(--primary-text)]">{activeVideo.title}</h3>
                <button
                  type="button"
                  onClick={() => setActiveVideo(null)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[var(--muted-background)] paragraph-color hover:text-[var(--primary-text)] transition-colors cursor-pointer"
                  aria-label="بستن"
                >
                  <Icon name="close" size={18} />
                </button>
              </div>

              <div className="relative aspect-video bg-black shrink-0">
                <video
                  key={activeVideo.slug}
                  controls
                  autoPlay
                  playsInline
                  poster={activeVideo.image}
                  className="w-full h-full object-contain bg-black"
                  src={SAMPLE_VIDEO}
                />
              </div>

              <div className="p-5 flex flex-wrap items-center justify-between gap-4">
                <div className="text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] paragraph-color">
                  <span>منتشرشده توسط: <b className="text-[var(--primary-text)]">{activeVideo.author?.name || "تکباکس"}</b></span>
                  <span> • {activeVideo.date_fa}</span>
                </div>
                <Link href={`/media/${activeVideo.slug}`} className="btn btn-primary px-5 py-2 text-xs font-bold">
                  مشاهده صفحه اختصاصی ویدیو و دیدگاه‌ها ←
                </Link>
              </div>
            </div>
          </div>,
          document.body
        )}
      </div>
    </section>
  );
}
