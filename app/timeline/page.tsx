'use client';

import React, { useCallback } from 'react';
import { TimelineContainer, TimelineLoading, TimelineError } from '@/features/timeline/components';
import { useTimelineEvents, useTimelineZoom, usePan } from '@/features/timeline/hooks';

export default function TimelinePage() {
  const { events, isLoading, error } = useTimelineEvents();
  const { zoom, zoomIn, zoomOut, resetZoom } = useTimelineZoom(1);
  const { pan, startPanning, stopPanning, handlePan, resetPan } = usePan({ x: 200, y: 0 });

  const handleResetView = useCallback(() => {
    resetZoom();
    resetPan();
  }, [resetZoom, resetPan]);

  if (isLoading) return <TimelineLoading />;
  if (error) return <TimelineError error={error} />;
  if (!events || events.length === 0) return <TimelineError error="هیچ رویدادی یافت نشد" />;

  return (
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
    />
  );
}
