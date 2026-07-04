'use client';

import React, { useCallback } from 'react';
import { HOME_ROW_SIZES } from './HomeRowConfig';
import Link from 'next/link';
import { Icon } from '@/design/icons';
import { TimelineContainer, TimelineLoading, TimelineError } from '@/features/timeline/components';
import { useTimelineEvents, useTimelineZoom, usePan } from '@/features/timeline/hooks';

export default function HomeTimelineRow() {
  const { events, isLoading, error } = useTimelineEvents();
  const { zoom, zoomIn, zoomOut, resetZoom, setZoom } = useTimelineZoom(1);
  const { pan, startPanning, stopPanning, handlePan, resetPan } = usePan({ x: 150, y: 0 });

  const handleResetView = useCallback(() => {
    resetZoom();
    resetPan();
  }, [resetZoom, resetPan]);

  return (
    <section className={`w-full py-12 bg-[color-mix(in_oklch,var(--tb-timeline)_4%,var(--tb-bg-primary))] ${HOME_ROW_SIZES.timelineMinHeight} flex flex-col justify-center`} dir="rtl">
      <div className={`mx-auto ${HOME_ROW_SIZES.containerMaxWidth} w-full px-4 sm:px-6 lg:px-8 space-y-6`}>
        
        {/* Row Header with Simple Text Link More Button */}
        <div className="flex items-center justify-between gap-4 mb-2">
          <h2 className="text-xl sm:text-2xl font-black text-[var(--tb-fg-primary)]">تاریخچه تحولات، رویدادها و نقاط عطف دیتاسنتر</h2>
          <Link
            href="/timeline"
            className="text-sm font-bold text-[var(--tb-timeline)] hover:underline flex items-center gap-1 shrink-0"
          >
            <span>ورود به تایم‌لاین کامل</span>
            <span>←</span>
          </Link>
        </div>

        {/* Helper Awareness Banner */}
        <div className="text-center">
          <span className="badge bg-[var(--tb-bg-secondary)] text-[var(--tb-timeline)] font-bold border border-[var(--tb-border)] shadow-sm px-4 py-1.5 tb-text-sm">
            برای مشاهده رویدادهای بیشتر، تایم‌لاین را با ماوس یا لمس به چپ و راست بکشید ↔️
          </span>
        </div>

        {/* Full Interactive Timeline Container with Mouse Wheel Scrolling Isolated (onWheel={undefined}) */}
        <div className="w-full rounded-2xl border border-[var(--tb-border)] overflow-hidden shadow-2xl">
          {isLoading ? (
            <TimelineLoading />
          ) : error || !events || events.length === 0 ? (
            <TimelineError error={error || 'رویدادی یافت نشد'} />
          ) : (
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
          )}
        </div>

      </div>
    </section>
  );
}
