'use client';

import React, { useEffect, useRef } from 'react';
import { TimelineEvent } from '@/types/timeline';
import { TimelineCard } from './TimelineCard';
import { ZoomControls } from './ZoomControls';

interface TimelineContainerProps {
  events: TimelineEvent[];
  zoom: number;
  pan: { x: number; y: number };
  onPanStart: (e: React.MouseEvent | React.PointerEvent) => void;
  onPanMove: (e: React.MouseEvent | React.PointerEvent) => void;
  onPanEnd: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetView: () => void;
  onWheel?: (e: React.WheelEvent | WheelEvent) => void;
}

export function TimelineContainer({
  events,
  zoom,
  pan,
  onPanStart,
  onPanMove,
  onPanEnd,
  onZoomIn,
  onZoomOut,
  onResetView,
  onWheel,
}: TimelineContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Sequential item spacing along the horizontal track (prevents 10,000px voids between years)
  const cardSpacing = 340 * zoom;
  const startOffset = 220;
  const totalWidth = Math.max(events.length * cardSpacing + startOffset * 2, 2000);

  // Native non-passive wheel listener to strictly block vertical webpage scrolling
  useEffect(() => {
    const el = containerRef.current;
    if (!el || !onWheel) return;

    const nativeWheelHandler = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onWheel(e);
    };

    el.addEventListener('wheel', nativeWheelHandler, { passive: false });
    return () => {
      el.removeEventListener('wheel', nativeWheelHandler);
    };
  }, [onWheel]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[calc(100vh-64px)] min-h-[640px] bg-[var(--tb-bg-primary)] overflow-hidden select-none transition-colors duration-[var(--tb-motion-md)]"
    >
      {/* Background Grid synced with tokens */}
      <div className="absolute inset-0 opacity-[0.14] pointer-events-none">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: 'linear-gradient(90deg, var(--tb-timeline) 1px, transparent 1px), linear-gradient(var(--tb-timeline) 1px, transparent 1px)',
            backgroundSize: `${50 * zoom}px 50px`,
            backgroundPosition: `${pan.x}px ${pan.y}px`,
          }}
        />
      </div>

      {/* Draggable Track Canvas */}
      <div
        className="absolute inset-0 overflow-hidden cursor-grab active:cursor-grabbing"
        onPointerDown={onPanStart}
        onPointerMove={onPanMove}
        onPointerUp={onPanEnd}
        onPointerCancel={onPanEnd}
      >
        {/* Horizontal Timeline Axis Line */}
        <div
          className="absolute top-1/2 h-1 bg-gradient-to-r from-[var(--tb-timeline)]/10 via-[var(--tb-timeline)] to-[var(--tb-timeline)]/10 shadow-lg"
          style={{
            left: `${pan.x}px`,
            top: `calc(50% + ${pan.y}px)`,
            width: `${totalWidth}px`,
            transform: 'translateY(-50%)',
          }}
        />

        {/* Timeline Cards Container */}
        <div
          className="absolute top-1/2 left-0"
          style={{
            left: `${pan.x}px`,
            top: `calc(50% + ${pan.y}px)`,
          }}
        >
          {events.map((event, idx) => {
            const xPosition = idx * cardSpacing + startOffset;

            return (
              <div
                key={event.id}
                className="absolute top-0 transform -translate-x-1/2 -translate-y-1/2 transition-all duration-75 flex flex-col items-center"
                style={{
                  left: `${xPosition}px`,
                }}
              >
                {/* Timeline Milestone Dot on Axis */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-6 h-6 bg-[var(--tb-timeline)] rounded-full border-4 border-[var(--tb-bg-primary)] shadow-lg transition-transform hover:scale-125" />

                {/* Card centered directly on the horizontal line */}
                <div className="flex justify-center">
                  <TimelineCard event={event} importance={event.importance} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <ZoomControls zoom={zoom} onZoomIn={onZoomIn} onZoomOut={onZoomOut} onReset={onResetView} />
    </div>
  );
}
