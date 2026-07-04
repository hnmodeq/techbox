'use client';

import React from 'react';
import { HOME_ROW_SIZES } from './HomeRowConfig';
import Link from 'next/link';
import Image from 'next/image';
import { Icon } from '@/design/icons';
import timelineData from '@/data/timeline.json';
import { getJalaliDateStringPersian } from '@/lib/jalali';

export default function HomeTimelineRow() {
  const events = (timelineData as any[]).slice(0, 8);

  return (
    <section className={`w-full py-14 px-4 sm:px-6 lg:px-8 border-t border-[var(--tb-border)] bg-[color-mix(in_oklch,var(--tb-timeline)_4%,var(--tb-bg-primary))] ${HOME_ROW_SIZES.timelineMinHeight} flex flex-col justify-center overflow-hidden`} dir="rtl">
      <div className="mx-auto max-w-7xl w-full">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 border-b border-[var(--tb-border)]/60 pb-5">
          <div>
            <span className="badge !bg-[color-mix(in_oklch,var(--tb-timeline)_15%,transparent)] !text-[var(--tb-timeline)] font-black mb-2">
              تایم‌لاین فناوری اطلاعات
            </span>
            <h2 className="tb-text-big-title text-[var(--tb-fg-primary)]">تاریخچه تحولات، رویدادها و نقاط عطف دیتاسنتر</h2>
          </div>
          
          <Link
            href="/timeline"
            className="btn btn-primary bg-[var(--tb-timeline)] text-slate-950 hover:opacity-90 font-black px-6 py-3 flex items-center gap-2 shrink-0 self-start sm:self-auto"
          >
            <Icon name="timeline" className="h-5 w-5" />
            <span>ورود به تایم‌لاین تعاملی کامل →</span>
          </Link>
        </div>

        {/* Horizontal Scrolling Preview Strip */}
        <div className="relative">
          <div className="flex items-stretch gap-6 overflow-x-auto pb-8 pt-4 scrollbar-thin">
            {events.map((ev, idx) => {
              const dateObj = new Date(ev.dateGr);
              const persianDate = getJalaliDateStringPersian(dateObj);

              return (
                <Link
                  key={ev.id || idx}
                  href="/timeline"
                  className="group relative w-72 sm:w-80 shrink-0 card p-0 overflow-hidden border border-[var(--tb-border)] shadow-xl hover:-translate-y-1.5 hover:border-[var(--tb-timeline)] transition-all duration-[var(--tb-motion-md)] bg-slate-950 flex flex-col justify-between"
                >
                  <div className="relative h-40 w-full overflow-hidden bg-slate-800">
                    <Image
                      src={ev.image || '/assets/blog-1.jpg'}
                      alt={ev.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="320px"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
                    <span className="absolute top-3 right-3 rounded-full border border-white/30 bg-black/60 px-3 py-0.5 tb-text-sm text-[var(--tb-timeline)] font-black backdrop-blur-md">
                      نقطه عطف #{idx + 1}
                    </span>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between text-white">
                    <div>
                      <div className="text-xs font-black text-[var(--tb-timeline)] mb-2 font-sans">{persianDate}</div>
                      <h3 className="text-base font-bold text-white group-hover:text-[var(--tb-timeline)] transition-colors line-clamp-2 leading-7">
                        {ev.title}
                      </h3>
                      <p className="text-xs text-slate-300 mt-2 line-clamp-3 leading-6">
                        {ev.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-400 font-bold">
                      <span>مشاهده در تایم‌لاین کامل</span>
                      <span className="text-[var(--tb-timeline)]">←</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
}
