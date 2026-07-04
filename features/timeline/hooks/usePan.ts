'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

interface PanPosition {
  x: number;
  y: number;
}

export function usePan(initialPan: PanPosition = { x: 0, y: 0 }) {
  const [pan, setPan] = useState<PanPosition>(initialPan);
  const isDraggingRef = useRef(false);
  const startPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const startPanRef = useRef<PanPosition>({ ...initialPan });

  const stopPanning = useCallback(() => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    if (typeof document !== 'undefined') {
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    }
  }, []);

  useEffect(() => {
    const handleGlobalUp = () => stopPanning();
    window.addEventListener('mouseup', handleGlobalUp);
    window.addEventListener('pointerup', handleGlobalUp);
    return () => {
      window.removeEventListener('mouseup', handleGlobalUp);
      window.removeEventListener('pointerup', handleGlobalUp);
    };
  }, [stopPanning]);

  const startPanning = useCallback((e: React.MouseEvent | React.PointerEvent) => {
    if (e.button !== 0) return; // Only left mouse button
    isDraggingRef.current = true;
    startPosRef.current = { x: e.clientX, y: e.clientY };
    startPanRef.current = { ...pan };
    if (typeof document !== 'undefined') {
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'grabbing';
    }
  }, [pan]);

  const handlePan = useCallback(
    (e: React.MouseEvent | React.PointerEvent) => {
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
