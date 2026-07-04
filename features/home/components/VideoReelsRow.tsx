'use client';

import React from 'react';
import { getModuleItems } from '@/lib/content';
import { HOME_ROW_SIZES } from './HomeRowConfig';
import Link from 'next/link';
import Image from 'next/image';
import { Icon } from '@/design/icons';

export default function VideoReelsRow() {
  const videos = getModuleItems('media').slice(0, 8);

  return (
    <section className={`w-full py-12 px-4 sm:px-6 lg:px-8 border-t border-[var(--tb-border)] bg-[color-mix(in_oklch,var(--tb-media)_4%,var(--tb-bg-primary))] ${HOME_ROW_SIZES.mediaMinHeight} flex flex-col justify-center overflow-hidden`} dir="rtl">
      <div className="mx-auto max-w-7xl w-full">
        <div className="flex items-end justify-between mb-8 border-b border-[var(--tb-border)]/60 pb-4">
          <div>
            <span className="badge !bg-[color-mix(in_oklch,var(--tb-media)_15%,transparent)] !text-[var(--tb-media)] font-black mb-2">
              رسانه ویدیویی ریلز
            </span>
            <h2 className="tb-text-big-title text-[var(--tb-fg-primary)]">ریلزها و ویدیوهای کوتاه زیرساخت</h2>
          </div>
          <Link href="/media" className="btn btn-ghost text-[var(--tb-media)] font-bold">
            مشاهده تمام ویدیوها ←
          </Link>
        </div>

        {/* Horizontal Scrolling Strip for Vertical Reel Thumbnails (aspect-[9/16]) */}
        <div className="flex items-stretch gap-5 overflow-x-auto pb-6 pt-2 scrollbar-thin">
          {videos.map((vid) => (
            <Link
              key={vid.slug}
              href={`/media/${vid.slug}`}
              className="group relative w-52 sm:w-60 shrink-0 aspect-[9/16] rounded-2xl overflow-hidden border border-[var(--tb-border)] shadow-xl hover:-translate-y-1.5 transition-all duration-[var(--tb-motion-md)] bg-slate-950 flex flex-col justify-end"
            >
              {/* Full-bleed Reel Thumbnail */}
              <Image
                src={vid.image || '/assets/blog-1.jpg'}
                alt={vid.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="240px"
              />

              {/* Gradient Overlay for Readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent z-10 pointer-events-none" />

              {/* Play Icon Badge Center */}
              <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                <div className="w-12 h-12 rounded-full bg-white/25 backdrop-blur-md flex items-center justify-center text-white transition-transform group-hover:scale-125 shadow-lg">
                  ▶
                </div>
              </div>

              {/* Reel Metadata Overlaid at Bottom */}
              <div className="relative z-30 p-4 text-white">
                <span className="badge !bg-[var(--tb-media)] !text-slate-950 font-black !text-[10px] mb-2">
                  {vid.category || 'ریلز آموزشی'}
                </span>
                <h3 className="text-sm font-bold leading-6 line-clamp-2 text-white group-hover:text-[var(--tb-media)] transition-colors">
                  {vid.title}
                </h3>
                <div className="mt-2 pt-2 border-t border-white/20 flex items-center justify-between text-[11px] text-slate-300">
                  <span>👁 {(vid.views ?? 0).toLocaleString('fa-IR')}</span>
                  <span>♥ {(vid.likes ?? 0).toLocaleString('fa-IR')}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
