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
  onWheel?: (e: any) => void;
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
  const minTime = events.length > 0 ? Math.min(...events.map((e) => new Date(e.dateGr).getTime())) : new Date('1940-01-01').getTime();
  const maxTime = events.length > 0 ? Math.max(...events.map((e) => new Date(e.dateGr).getTime())) : new Date('2030-01-01').getTime();
  const minDate = new Date(minTime);
  const maxDate = new Date(maxTime);
  const totalYears = Math.max(10, maxDate.getFullYear() - minDate.getFullYear() + 10);
  const pixelsPerYear = 140;
  const totalWidth = totalYears * pixelsPerYear * zoom;

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
      className="relative w-full h-[calc(100vh-64px)] min-h-[600px] bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 overflow-hidden select-none"
    >
      {/* Background Grid */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: 'linear-gradient(90deg, #38bdf8 1px, transparent 1px), linear-gradient(#38bdf8 1px, transparent 1px)',
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
        {/* Horizontal Timeline Axis */}
        <div
          className="absolute top-1/2 h-1 bg-gradient-to-r from-cyan-500/10 via-cyan-400 to-cyan-500/10 shadow-lg shadow-cyan-500/50"
          style={{
            left: `${pan.x}px`,
            top: `calc(50% + ${pan.y}px)`,
            width: `${Math.max(totalWidth, 2000)}px`,
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
            const eventDate = new Date(event.dateGr);
            const yearsSinceMin = eventDate.getFullYear() - minDate.getFullYear();
            const xPosition = yearsSinceMin * pixelsPerYear * zoom;

            return (
              <div
                key={event.id}
                className="absolute top-0 transform -translate-x-1/2 transition-all duration-75"
                style={{
                  left: `${xPosition}px`,
                }}
              >
                {/* Timeline Dot & Connector */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center">
                  <div className="w-5 h-5 bg-cyan-400 rounded-full border-4 border-slate-950 shadow-md shadow-cyan-400/80 transition-transform hover:scale-125" />
                  <div className={`w-0.5 bg-gradient-to-b from-cyan-400/80 to-transparent ${idx % 2 === 0 ? 'h-10 -mt-12 order-first' : 'h-10'}`} />
                </div>

                {/* Card placement alternating above and below axis without scale distortion */}
                <div
                  className="flex justify-center"
                  style={{
                    marginTop: idx % 2 === 0 ? '-480px' : '60px',
                  }}
                >
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
