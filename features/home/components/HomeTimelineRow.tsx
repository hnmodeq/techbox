'use client';

import React, { useState, useCallback } from 'react';
import { HOME_ROW_SIZES } from './HomeRowConfig';
import Link from 'next/link';
import { Icon } from '@/design/icons';
import { TimelineContainer, TimelineLoading, TimelineError } from '@/features/timeline/components';
import { useTimelineEvents, useTimelineZoom, usePan } from '@/features/timeline/hooks';

function ActiveTimelineContent() {
  const { events, isLoading, error } = useTimelineEvents();
  const { zoom, zoomIn, zoomOut, resetZoom, setZoom } = useTimelineZoom(1);
  const { pan, startPanning, stopPanning, handlePan, resetPan } = usePan({ x: 150, y: 0 });

  const handleResetView = useCallback(() => {
    resetZoom();
    resetPan();
  }, [resetZoom, resetPan]);

  if (isLoading) return <TimelineLoading />;
  if (error || !events || events.length === 0) return <TimelineError error={error || 'رویدادی یافت نشد'} />;

  return (
    <TimelineContainer
      events={events}
      zoom={zoom}
      pan={pan}
      onPanStart={startPanning}
      onPanMove={handlePan}
      onPanEnd={stopPanning}
      onResetView={handleResetView}
      onZoomChange={setZoom}
      onWheel={undefined}
    />
  );
}

export default function HomeTimelineRow() {
  const [active, setActive] = useState(false);

  return (
    <section className={`w-full py-12 bg-[var(--main-background)] border-0 ${HOME_ROW_SIZES.timelineMinHeight} flex flex-col justify-center`} dir="rtl">
      <div className={`mx-auto ${HOME_ROW_SIZES.containerMaxWidth} w-full px-4 sm:px-6 lg:px-8 space-y-6`}>
        
        {/* Row Header with Simple Text Link More Button */}
        <div className="flex items-center justify-between gap-4 mb-2">
          <h2 className="text-xl sm:text-2xl font-black text-[var(--primary-text)]">تاریخچه تحولات، رویدادها و نقاط عطف دیتاسنتر</h2>
          <Link
            href="/timeline"
            className="text-sm font-bold text-[var(--timeline)] hover:underline flex items-center gap-1 shrink-0"
          >
            <span>ورود به تایم‌لاین کامل</span>
            <span>←</span>
          </Link>
        </div>

        {/* Helper Awareness Banner */}
        {active && (
          <div className="text-center">
            <span className="badge bg-[var(--card-background)] text-[var(--timeline)] font-bold border-[length:var(--border-size)] border-[var(--border-color)] shadow-[var(--shadow-size)] px-4 py-1.5 text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)]">
              برای مشاهده رویدادهای بیشتر، تایم‌لاین را با ماوس یا لمس به چپ و راست بکشید ↔️
            </span>
          </div>
        )}

        {/* Eager loading container replaced with click-to-activate performance wrapper */}
        <div className="w-full rounded-[var(--corner-radius)] border-0 overflow-hidden shadow-none">
          {!active ? (
            <div className="relative min-h-[420px] overflow-hidden rounded-[var(--corner-radius)] border-[length:var(--border-size)] border-[var(--border-color)] shadow-[var(--shadow-size)] bg-[var(--card-background)] p-6 sm:p-10">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,var(--timeline),transparent_36%)] opacity-25" />
              <div className="relative mx-auto flex min-h-[300px] max-w-5xl items-center justify-center [perspective:1200px]">
                {[
                  ['timeline1.jpg','-translate-x-44 -rotate-6 scale-90 opacity-75'],
                  ['timeline5.jpg','-translate-x-24 rotate-3 scale-95 opacity-85'],
                  ['timeline10.jpg','z-10 scale-105'],
                  ['timeline14.jpg','translate-x-24 -rotate-3 scale-95 opacity-85'],
                  ['timeline17.jpg','translate-x-44 rotate-6 scale-90 opacity-75'],
                ].map(([img, cls]) => (
                  <div key={img} className={`absolute h-52 w-40 overflow-hidden rounded-[var(--corner-radius)] border-[length:var(--border-size)] border-white/20 shadow-[var(--shadow-size)] bg-cover bg-center ${cls}`} style={{ backgroundImage: `url(https://gasy0aqpxehqiy8d.public.blob.vercel-storage.com/timeline-images/${img})` }} />
                ))}
              </div>
              <div className="relative z-20 -mt-4 flex flex-col items-center justify-center gap-4 text-center">
                <Icon name="timeline" className="w-11 h-11 text-[var(--timeline)]" />
                <h3 className="text-lg sm:text-xl font-black text-[var(--primary-text)]">نمای سریع تایم‌لاین تاریخ فناوری</h3>
                <p className="text-xs sm:text-sm paragraph-color max-w-lg leading-6">پیش‌نمایش سبک از کارت‌های تایم‌لاین. نسخه تعاملی با کلیک شما فعال می‌شود.</p>
                <button type="button" onClick={() => setActive(true)} className="inline-flex items-center justify-center gap-2 rounded-[var(--corner-radius)] bg-[var(--timeline)] px-8 py-3 text-sm font-black text-slate-950 shadow-[var(--shadow-size)] hover:opacity-90 transition-opacity cursor-pointer">بارگذاری تایم‌لاین تعاملی ←</button>
              </div>
            </div>
          ) : (
            <ActiveTimelineContent />
          )}
        </div>

      </div>
    </section>
  );
}
