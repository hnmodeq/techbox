'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

interface PanPosition {
  x: number;
  y: number;
}

export function usePan(initialPan: PanPosition = { x: 0, y: 0 }) {
  const [pan, setPan] = useState<PanPosition>({ x: initialPan.x, y: 0 });
  const isDraggingRef = useRef(false);
  const lastXRef = useRef(0);
  const lastTimeRef = useRef(0);
  const velocityRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  const startPanRef = useRef<PanPosition>({ x: initialPan.x, y: 0 });
  const startPosRef = useRef<number>(0);

  const stopPanning = useCallback(() => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;

    if (typeof document !== 'undefined') {
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    }

    // Kinetic momentum deceleration loop
    let vel = velocityRef.current;
    if (Math.abs(vel) > 1) {
      const step = () => {
        if (isDraggingRef.current) return;
        vel *= 0.93; // Friction factor
        if (Math.abs(vel) < 0.2) {
          if (rafRef.current) cancelAnimationFrame(rafRef.current);
          return;
        }
        setPan((prev) => ({ x: prev.x + vel, y: 0 }));
        rafRef.current = requestAnimationFrame(step);
      };
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(step);
    }
  }, []);

  useEffect(() => {
    const handleGlobalUp = () => stopPanning();
    window.addEventListener('mouseup', handleGlobalUp);
    window.addEventListener('pointerup', handleGlobalUp);
    return () => {
      window.removeEventListener('mouseup', handleGlobalUp);
      window.removeEventListener('pointerup', handleGlobalUp);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [stopPanning]);

  const startPanning = useCallback((e: React.MouseEvent | React.PointerEvent) => {
    if (e.button !== 0) return; // Only left mouse button
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    velocityRef.current = 0;
    isDraggingRef.current = true;
    startPosRef.current = e.clientX;
    lastXRef.current = e.clientX;
    lastTimeRef.current = performance.now();
    startPanRef.current = { ...pan };

    if (typeof document !== 'undefined') {
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'grabbing';
    }
  }, [pan]);

  const handlePan = useCallback(
    (e: React.MouseEvent | React.PointerEvent) => {
      if (!isDraggingRef.current) return;
      const now = performance.now();
      const dt = Math.max(1, now - lastTimeRef.current);
      const dx = e.clientX - lastXRef.current;
      velocityRef.current = (dx / dt) * 16; // Normalized velocity

      lastXRef.current = e.clientX;
      lastTimeRef.current = now;

      const deltaX = e.clientX - startPosRef.current;
      setPan({
        x: startPanRef.current.x + deltaX,
        y: 0, // Horizontal lock
      });
    },
    []
  );

  const resetPan = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setPan({ x: initialPan.x, y: 0 });
  }, [initialPan.x]);

  return { pan, startPanning, stopPanning, handlePan, resetPan, setPan };
}
