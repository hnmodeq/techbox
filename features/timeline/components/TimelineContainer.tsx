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

  // Proportional time spacing calculated from edge of cards to eliminate any overlapping
  const xPositions = React.useMemo(() => {
    let currX = 220;
    return events.map((ev, idx) => {
      if (idx === 0) return currX;
      const prevDate = new Date(events[idx - 1].dateGr).getTime();
      const currDate = new Date(ev.dateGr).getTime();
      const diffYears = Math.max(0, (currDate - prevDate) / (1000 * 60 * 60 * 24 * 365.2425));

      const prevCardWidth =
        events[idx - 1].importance >= 8
          ? 320
          : events[idx - 1].importance >= 6
            ? 288
            : 256;

      // Proportional gap based on date distance (with safe min buffer so edges never collide)
      const timeGap = Math.min(Math.max(diffYears * 18 * zoom, 50 * zoom), 600 * zoom);
      currX += prevCardWidth + timeGap;
      return currX;
    });
  }, [events, zoom]);

  const totalWidth = Math.max((xPositions[xPositions.length - 1] || 1000) + 600, 2000);

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
        {/* Prominent Horizontal Timeline Axis Line */}
        <div
          className="absolute top-1/2 h-2 bg-[var(--tb-timeline)] shadow-lg shadow-[var(--tb-timeline)]/50 rounded-full"
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
            const xPos = xPositions[idx] || 220;

            return (
              <div
                key={event.id}
                className="absolute top-0 transform -translate-x-1/2 -translate-y-1/2 transition-all duration-75 flex flex-col items-center"
                style={{
                  left: `${xPos}px`,
                }}
              >
                {/* Timeline Milestone Dot on Axis */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-7 h-7 bg-[var(--tb-timeline)] rounded-full border-4 border-[var(--tb-bg-primary)] shadow-xl transition-transform hover:scale-125" />

                {/* Card centered directly along the horizontal line */}
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
