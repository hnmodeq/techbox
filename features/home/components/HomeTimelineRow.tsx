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
            <span className="badge bg-[var(--card-background)] text-[var(--timeline)] font-bold border border-[var(--border-color)] shadow-sm px-4 py-1.5 text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)]">
              برای مشاهده رویدادهای بیشتر، تایم‌لاین را با ماوس یا لمس به چپ و راست بکشید ↔️
            </span>
          </div>
        )}

        {/* Eager loading container replaced with click-to-activate performance wrapper */}
        <div className="w-full rounded-2xl border-0 overflow-hidden shadow-none">
          {!active ? (
            <div className="card p-8 sm:p-12 text-center bg-[var(--card-background)] border border-[var(--border-color)] rounded-2xl flex flex-col items-center justify-center gap-4">
              <Icon name="timeline" className="w-12 h-12 text-[var(--timeline)] opacity-80" />
              <h3 className="text-lg sm:text-xl font-black text-[var(--primary-text)]">تایم‌لاین تعاملی فناوری اطلاعات تکباکس</h3>
              <p className="text-xs sm:text-sm paragraph-color max-w-lg leading-6">
                برای سرعت بیشتر در بارگذاری صفحه و صرفه‌جویی در منابع پردازشی دستگاه شما، تایم‌لاین زنده تنها در صورت تقاضا بارگذاری می‌شود.
              </p>
              <button
                type="button"
                onClick={() => setActive(true)}
                className="btn btn-primary bg-[var(--timeline)] text-slate-950 px-8 py-3 text-sm font-black shadow-lg hover:opacity-90 transition-opacity cursor-pointer"
              >
                بارگذاری و اجرای تایم‌لاین تعاملی ←
              </button>
            </div>
          ) : (
            <ActiveTimelineContent />
          )}
        </div>

      </div>
    </section>
  );
}
