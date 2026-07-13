'use client';

import React, { useState, useCallback } from 'react';
import { HOME_ROW_SIZES } from './HomeRowConfig';
import Link from 'next/link';
import { Icon } from '@/design/icons';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { TimelineContainer, TimelineLoading, TimelineError } from '@/features/timeline/components';
import { useTimelineEvents, useTimelineZoom, usePan } from '@/features/timeline/hooks';

function ActiveTimelineContent() {
  const { events, isLoading, error } = useTimelineEvents();
  const { zoom, resetZoom, setZoom } = useTimelineZoom(1);
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
    <section className={`w-full py-12 bg-background border-0 ${HOME_ROW_SIZES.timelineMinHeight} flex flex-col justify-center`} dir="rtl">
      <div className={`mx-auto ${HOME_ROW_SIZES.containerMaxWidth} w-full px-4 sm:px-6 lg:px-8 space-y-6`}>
        <div className="flex items-center justify-between gap-4 mb-2">
          <h2 className="text-xl sm:text-2xl font-black text-foreground">تاریخچه تحولات، رویدادها و نقاط عطف دیتاسنتر</h2>
          <Link
            href="/timeline"
            className="text-sm font-bold text-primary hover:underline flex items-center gap-1 shrink-0"
          >
            <span>ورود به تایم‌لاین کامل</span>
            <span>←</span>
          </Link>
        </div>

        {active && (
          <div className="text-center">
            <Badge variant="outline" className="bg-card px-4 py-1.5 text-xs font-bold text-primary shadow-sm">
              برای مشاهده رویدادهای بیشتر، تایم‌لاین را با ماوس یا لمس به چپ و راست بکشید ↔️
            </Badge>
          </div>
        )}

        <div className="w-full overflow-hidden rounded-xl">
          {!active ? (
            <Card
              role="button"
              tabIndex={0}
              onClick={() => setActive(true)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  setActive(true);
                }
              }}
              className="group min-h-[420px] cursor-pointer overflow-hidden border bg-card p-0 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="بارگذاری تایم‌لاین تعاملی"
            >
              <CardContent className="relative p-6 sm:p-10">
                <div className="pointer-events-none absolute inset-0 bg-muted/25" />
                <div className="relative mx-auto flex min-h-[300px] max-w-5xl items-center justify-center [perspective:1200px]">
                  {[
                    ['timeline1.jpg','-translate-x-44 -rotate-6 scale-90 opacity-75'],
                    ['timeline5.jpg','-translate-x-24 rotate-3 scale-95 opacity-85'],
                    ['timeline10.jpg','z-10 scale-105'],
                    ['timeline14.jpg','translate-x-24 -rotate-3 scale-95 opacity-85'],
                    ['timeline17.jpg','translate-x-44 rotate-6 scale-90 opacity-75'],
                  ].map(([img, cls]) => (
                    <div
                      key={img}
                      className={`absolute h-52 w-40 overflow-hidden rounded-xl border bg-cover bg-center shadow-sm ring-1 ring-border transition-transform duration-300 group-hover:scale-[1.03] ${cls}`}
                      style={{ backgroundImage: `url(https://gasy0aqpxehqiy8d.public.blob.vercel-storage.com/timeline-images/${img})` }}
                    />
                  ))}
                </div>
                <div className="relative z-20 -mt-4 flex flex-col items-center justify-center gap-3 text-center">
                  <Icon name="timeline" className="w-11 h-11 text-primary" />
                  <h3 className="text-lg sm:text-xl font-black text-foreground">نمای سریع تایم‌لاین تاریخ فناوری</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground max-w-lg leading-6">
                    برای فعال‌سازی نسخه تعاملی، روی کارت‌های تایم‌لاین کلیک کنید.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <ActiveTimelineContent />
          )}
        </div>
      </div>
    </section>
  );
}
