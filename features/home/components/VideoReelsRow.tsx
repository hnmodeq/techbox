'use client';

import React from 'react';
import { getLatest } from '@/lib/content';
import { HOME_ROW_SIZES } from './HomeRowConfig';
import Link from 'next/link';
import Image from 'next/image';
import { CardStats } from '@/components/ui/card-stats';

export default function VideoReelsRow() {
  const videos = getLatest('media', 5);
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
          {videos.map((vid) => (
              <Link
                key={vid.slug}
                href={`/media/${vid.slug}`}
                className="group relative w-full aspect-[9/16] rounded-[var(--corner-radius)] overflow-hidden border-[length:var(--border-size)] border-[var(--border-color)] shadow-[var(--shadow-size)] hover:shadow-[var(--shadow-size)] transition-all duration-[200ms] bg-[var(--card-background)] flex flex-col justify-end text-right cursor-pointer"
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
                  <div className="w-12 h-12 rounded-full bg-white/25 backdrop-blur-md flex items-center justify-center text-white transition-transform group-hover:scale-125 shadow-[var(--shadow-size)]">
                    ▶
                  </div>
                </div>

                <div className="relative z-30 p-3.5 text-white w-full">
                  <h3 className="text-xs sm:text-sm font-bold leading-5 line-clamp-2 text-white group-hover:text-[var(--media)] transition-colors">
                    {vid.title}
                  </h3>
                  
                  {/* Clean, distinct icons for views, likes, comments without line separator */}
                  <div className="mt-2.5">
                    <CardStats module="media" slug={vid.slug} showComments={true} />
                  </div>
                </div>
              </Link>
            ))}
        </div>
      </div>
    </section>
  );
}
