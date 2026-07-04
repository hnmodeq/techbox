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
  const { pan, startPanning, stopPanning, handlePan, resetPan, setPan } = usePan({ x: 150, y: 0 });

  const handleResetView = useCallback(() => {
    resetZoom();
    resetPan();
  }, [resetZoom, resetPan]);

  const handleWheel = useCallback(
    (e: any) => {
      if (e.ctrlKey) {
        if (e.deltaY < 0) zoomIn();
        else if (e.deltaY > 0) zoomOut();
      } else {
        setPan((current: any) => ({ ...current, x: current.x - e.deltaY * 1.5 }));
      }
    },
    [zoomIn, zoomOut, setPan]
  );

  return (
    <section className={`w-full py-12 border-t border-[var(--tb-border)] bg-[var(--tb-bg-primary)] ${HOME_ROW_SIZES.timelineMinHeight} flex flex-col justify-center`} dir="rtl">
      <div className={`mx-auto ${HOME_ROW_SIZES.containerMaxWidth} w-full px-4 sm:px-6 lg:px-8 space-y-6`}>
        
        {/* Row Header without colorful badge and without separator border */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-2">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-[var(--tb-fg-primary)]">تاریخچه تحولات، رویدادها و نقاط عطف دیتاسنتر</h2>
            <p className="mt-1.5 tb-text-sm text-[var(--tb-fg-muted)]">
              تایم‌لاین زیر کاملاً تعاملی است؛ می‌توانید با ماوس آن را به چپ و راست بکشید، اسکرول کنید یا با دکمه‌ها بزرگ‌نمایی نمایید.
            </p>
          </div>
          
          <Link
            href="/timeline"
            className="btn btn-outline border-[var(--tb-timeline)] text-[var(--tb-timeline)] hover:bg-[var(--tb-timeline)]/10 font-bold px-6 py-2.5 flex items-center gap-2 shrink-0 self-start sm:self-auto"
          >
            <Icon name="timeline" className="h-4 w-4" />
            <span>باز کردن تایم‌لاین در صفحه اختصاصی ←</span>
          </Link>
        </div>

        {/* Full Interactive Timeline Container */}
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
              onZoomIn={zoomIn}
              onZoomOut={zoomOut}
              onResetView={handleResetView}
              onZoomChange={setZoom}
              onWheel={handleWheel}
            />
          )}
        </div>

      </div>
    </section>
  );
}
