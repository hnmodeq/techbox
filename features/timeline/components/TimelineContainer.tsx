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
  onZoomChange?: (nextZoom: number) => void;
  onWheel?: (e: React.WheelEvent | WheelEvent) => void;
}

export function TimelineContainer({
  events,
  zoom,
  pan,
  onPanStart,
  onPanMove,
  onPanEnd,
  onResetView,
  onZoomChange,
  onWheel,
}: TimelineContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Exact Edge-to-Edge math: xPos[idx] = xPos[idx - 1] + (W[idx-1]/2) + (W[idx]/2) + timeGap
  // Minimum physical gap strictly maintained at Math.max(36, 64 * zoom) + historical time diff
  const xPositions = React.useMemo(() => {
    let currX = 240;
    return events.map((ev, idx) => {
      if (idx === 0) return currX;
      const prevDate = new Date(events[idx - 1].dateGr).getTime();
      const currDate = new Date(ev.dateGr).getTime();
      const diffYears = Math.max(0, (currDate - prevDate) / (1000 * 60 * 60 * 24 * 365.2425));

      const prevWidth = events[idx - 1].importance >= 8 ? 320 : events[idx - 1].importance >= 6 ? 288 : 256;
      const currWidth = ev.importance >= 8 ? 320 : ev.importance >= 6 ? 288 : 256;

      // Generous physical edge buffer so cards never overlap at any zoom level
      const minEdgeBuffer = Math.max(36, 64 * zoom);
      const timeGap = Math.min(Math.max(diffYears * 28 * zoom, minEdgeBuffer), 800 * zoom);
      currX += prevWidth / 2 + currWidth / 2 + timeGap;
      return currX;
    });
  }, [events, zoom]);

  const totalWidth = Math.max((xPositions[xPositions.length - 1] || 1000) + 800, 2000);

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
        {/* Prominent Glowing Horizontal Timeline Axis Line running continuously right beneath the card boxes */}
        <div
          className="absolute h-2.5 bg-[var(--tb-timeline)] shadow-[0_0_16px_rgba(6,182,212,0.8)] rounded-full z-10"
          style={{
            left: `${pan.x - 500}px`,
            top: `calc(62% + ${pan.y}px)`,
            width: `${totalWidth + 1000}px`,
            transform: 'translateY(-50%)',
          }}
        />

        {/* Timeline Cards Container */}
        <div
          className="absolute top-0 left-0 h-full"
          style={{
            left: `${pan.x}px`,
            top: `${pan.y}px`,
          }}
        >
          {events.map((event, idx) => {
            const xPos = xPositions[idx] || 240;

            return (
              <div
                key={event.id}
                className="absolute top-[62%] transform -translate-x-1/2 -translate-y-[calc(100%+14px)] flex flex-col items-center"
                style={{
                  left: `${xPos}px`,
                }}
              >
                {/* Timeline Milestone Dot sitting right on the axis line between card and external date block (NOT on card) */}
                <div className="absolute -bottom-[14px] left-1/2 -translate-x-1/2 translate-y-1/2 z-20 w-6 h-6 bg-[var(--tb-timeline)] rounded-full border-4 border-[var(--tb-bg-primary)] shadow-lg transition-transform hover:scale-125" />

                {/* Card placement aligned directly along the line */}
                <div className="flex justify-center">
                  <TimelineCard event={event} importance={event.importance} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <ZoomControls zoom={zoom} onReset={onResetView} onZoomChange={onZoomChange} />
    </div>
  );
}
