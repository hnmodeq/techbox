'use client';

import { useState, useCallback } from 'react';

const MIN_ZOOM = 0.1;
const MAX_ZOOM = 6.0;
const ZOOM_STEP = 0.15;

export function useTimelineZoom(initialZoom = 1) {
  const [zoom, setZoom] = useState(initialZoom);

  const zoomIn = useCallback(() => {
    setZoom((prev) => Math.min(prev + ZOOM_STEP, MAX_ZOOM));
  }, []);

  const zoomOut = useCallback(() => {
    setZoom((prev) => Math.max(prev - ZOOM_STEP, MIN_ZOOM));
  }, []);

  const resetZoom = useCallback(() => {
    setZoom(1);
  }, []);

  return { zoom, zoomIn, zoomOut, resetZoom, setZoom };
}
