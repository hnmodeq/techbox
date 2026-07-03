'use client';

import { useState, useCallback, useRef } from 'react';

interface PanPosition {
  x: number;
  y: number;
}

export function usePan(initialPan: PanPosition = { x: 0, y: 0 }) {
  const [pan, setPan] = useState<PanPosition>(initialPan);
  const isDraggingRef = useRef(false);
  const startPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const startPanRef = useRef<PanPosition>({ ...initialPan });

  const startPanning = useCallback((e: React.MouseEvent) => {
    isDraggingRef.current = true;
    startPosRef.current = { x: e.clientX, y: e.clientY };
    startPanRef.current = { ...pan };
  }, [pan]);

  const stopPanning = useCallback(() => {
    isDraggingRef.current = false;
  }, []);

  const handlePan = useCallback(
    (e: React.MouseEvent) => {
      if (!isDraggingRef.current) return;
      const deltaX = e.clientX - startPosRef.current.x;
      const deltaY = e.clientY - startPosRef.current.y;
      setPan({
        x: startPanRef.current.x + deltaX,
        y: startPanRef.current.y + deltaY,
      });
    },
    []
  );

  const resetPan = useCallback(() => {
    setPan(initialPan);
  }, [initialPan]);

  return { pan, startPanning, stopPanning, handlePan, resetPan, setPan };
}
