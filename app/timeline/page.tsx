'use client';

import React, { useCallback } from 'react';
import { TimelineContainer, TimelineLoading, TimelineError } from '@/features/timeline/components';
import { useTimelineEvents, useTimelineZoom, usePan } from '@/features/timeline/hooks';
import { TimelineLikesProvider } from '@/providers/timeline-likes.provider';

export default function TimelinePage() {
  const { events, isLoading, error } = useTimelineEvents();
  const { zoom, zoomIn, zoomOut, resetZoom } = useTimelineZoom(1);
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

  if (isLoading) return <TimelineLoading />;
  if (error) return <TimelineError error={error} />;
  if (!events || events.length === 0) return <TimelineError error="هیچ رویدادی یافت نشد" />;

  return (
    // Scoped here (rather than globally in LayoutShell) since only
    // /timeline needs to know which events the current user liked - no
    // need to fire that bulk request on every other page in the app.
    <TimelineLikesProvider>
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
        onWheel={handleWheel}
      />
    </TimelineLikesProvider>
  );
}
