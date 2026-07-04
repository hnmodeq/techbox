'use client';

import React from 'react';
import { getLatest, getCommentCount } from '@/lib/content';
import { HOME_ROW_SIZES } from './HomeRowConfig';
import Link from 'next/link';
import Image from 'next/image';
import { Icon } from '@/design/icons';
import { CardStats } from '@/components/ui/CardStats';

export default function VideoReelsRow() {
  const videos = getLatest('media', 5);

  return (
    <section className={`w-full py-12 px-4 sm:px-6 lg:px-8 bg-[var(--tb-bg-primary)] ${HOME_ROW_SIZES.mediaMinHeight} flex flex-col justify-center`} dir="rtl">
      <div className={`mx-auto ${HOME_ROW_SIZES.containerMaxWidth} w-full`}>
        {/* Simple Text More Button positioned ABOVE items inside the header */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <h2 className="text-xl sm:text-2xl font-black text-[var(--tb-fg-primary)]">ریلزها و ویدیوهای کوتاه زیرساخت</h2>
          <Link href="/media" className="text-sm font-bold text-[var(--tb-media)] hover:underline flex items-center gap-1 shrink-0">
            <span>مشاهده همه ویدیوها</span>
            <span>←</span>
          </Link>
        </div>

        {/* Clean Grid Layout without scrollbars */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
          {videos.map((vid) => {
            const commentsCount = getCommentCount('media', vid.slug);
            return (
              <Link
                key={vid.slug}
                href={`/media/${vid.slug}`}
                className="group relative w-full aspect-[9/16] rounded-2xl overflow-hidden border border-[var(--tb-border)] shadow-xl hover:-translate-y-1.5 transition-all duration-[var(--tb-motion-md)] bg-slate-950 flex flex-col justify-end"
              >
                <Image
                  src={vid.image || '/assets/blog-1.jpg'}
                  alt={vid.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="260px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent z-10 pointer-events-none" />

                <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                  <div className="w-12 h-12 rounded-full bg-white/25 backdrop-blur-md flex items-center justify-center text-white transition-transform group-hover:scale-125 shadow-lg">
                    ▶
                  </div>
                </div>

                <div className="relative z-30 p-3.5 text-white">
                  <h3 className="text-xs sm:text-sm font-bold leading-5 line-clamp-2 text-white group-hover:text-[var(--tb-media)] transition-colors">
                    {vid.title}
                  </h3>
                  
                  {/* Clean, distinct icons for views, likes, comments */}
                  <div className="mt-3 pt-2.5 border-t border-white/20">
                    <CardStats module="media" slug={vid.slug} initialViews={vid.views ?? 0} initialLikes={vid.likes ?? 0} initialComments={commentsCount} showComments={true} />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
