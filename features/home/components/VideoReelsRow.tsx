'use client';

import React, { useState } from 'react';
import { getLatest } from '@/lib/content';
import { useDbPosts } from '@/hooks/useDbPosts';
import { HOME_ROW_SIZES } from './HomeRowConfig';
import Link from 'next/link';
import Image from 'next/image';
import { CardStats } from '@/components/ui/card-stats';
import { LikeButton } from '@/components/ui/like-button';
import CommentSection from '@/features/comment/components/CommentSection';
import { zIndex } from '@/design';
import { Icon } from '@/design/icons';

export default function VideoReelsRow() {
  const fallbackVideos = getLatest('media', 5);
  const { items: dbVideos } = useDbPosts('media', fallbackVideos, 7);
  const videos = dbVideos.slice(0, 5);
  const [active, setActive] = useState<any | null>(null);

  return (
    <section className={`w-full py-12 px-4 sm:px-6 lg:px-8 bg-[var(--main-background)] ${HOME_ROW_SIZES.mediaMinHeight} flex flex-col justify-center`} dir="rtl">
      <div className={`mx-auto ${HOME_ROW_SIZES.containerMaxWidth} w-full`}>
        <div className="flex items-center justify-between gap-4 mb-6">
          <h2 className="text-xl sm:text-2xl font-black text-[var(--primary-text)]">ریلزها و ویدیوهای کوتاه زیرساخت</h2>
          <Link href="/media" className="text-sm font-bold text-[var(--media)] hover:underline flex items-center gap-1 shrink-0"><span>مشاهده همه ویدیوها</span><span>←</span></Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
          {videos.map((vid) => (
            <button type="button" key={vid.slug} onClick={() => setActive(vid)} className="group relative w-full aspect-[9/16] rounded-[var(--corner-radius)] overflow-hidden border-[length:var(--border-size)] border-[var(--border-color)] shadow-[var(--shadow-size)] hover:shadow-[var(--shadow-size)] transition-all duration-[200ms] bg-[var(--card-background)] flex flex-col justify-end text-right cursor-pointer">
              <Image src={vid.image || '/assets/blog-1.jpg'} alt={vid.title} fill className="object-cover" sizes="260px" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent z-10 pointer-events-none" />
              <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none"><div className="w-12 h-12 rounded-full bg-white/25 backdrop-blur-md flex items-center justify-center text-white transition-transform group-hover:scale-125 shadow-[var(--shadow-size)]">▶</div></div>
              <div className="relative z-30 p-3.5 text-white w-full"><h3 className="text-xs sm:text-sm font-bold leading-5 line-clamp-2 text-white group-hover:text-[var(--media)] transition-colors">{vid.title}</h3><div className="mt-2.5"><CardStats module="media" slug={vid.slug} showComments={true} /></div></div>
            </button>
          ))}
        </div>
      </div>
      {active && (
        <div className="fixed inset-0 bg-black/80 p-3 sm:p-6 flex items-center justify-center" style={{ zIndex: zIndex.modal }} dir="rtl">
          <button type="button" className="absolute inset-0" onClick={() => setActive(null)} aria-label="بستن" />
          <div className="relative z-10 grid w-full max-w-6xl max-h-[92vh] overflow-hidden rounded-[var(--corner-radius)] bg-[var(--modal-background)] border-[length:var(--border-size)] border-[var(--border-color)] shadow-[var(--shadow-size)] lg:grid-cols-[minmax(320px,420px)_1fr]">
            <div className="bg-black flex h-[82vh] max-h-[82vh] items-center justify-center p-3"><video src={active.videoUrl || undefined} poster={active.image} controls autoPlay playsInline className="h-full aspect-[9/16] object-contain bg-black" /></div>
            <div className="min-w-0 h-[82vh] max-h-[82vh] overflow-y-auto p-4 space-y-4">
              <div className="flex items-start justify-between gap-3"><div><h3 className="font-black text-[var(--primary-text)] text-lg">{active.title}</h3><p className="paragraph-color mt-1 text-sm">{active.excerpt}</p></div><button onClick={() => setActive(null)} className="paragraph-color hover:text-[var(--primary-text)]"><Icon name="close" size={22}/></button></div>
              <div className="flex flex-wrap items-center gap-4"><CardStats module="media" slug={active.slug} showComments={true} /><LikeButton contentType="media" slug={active.slug} /></div>
              <CommentSection module="media" slug={active.slug} />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
