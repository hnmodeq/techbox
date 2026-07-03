'use client';

import React from 'react';
import { TimelineEvent } from '@/types/timeline';
import { TimelineCard } from './TimelineCard';
import { ZoomControls } from './ZoomControls';

interface TimelineContainerProps {
  events: TimelineEvent[];
  zoom: number;
  pan: { x: number; y: number };
  onPanStart: (e: React.MouseEvent) => void;
  onPanMove: (e: React.MouseEvent) => void;
  onPanEnd: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetView: () => void;
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
}: TimelineContainerProps) {
  const minDate = new Date(Math.min(...events.map((e) => new Date(e.dateGr).getTime())));
  const maxDate = new Date(Math.max(...events.map((e) => new Date(e.dateGr).getTime())));
  const totalYears = maxDate.getFullYear() - minDate.getFullYear();
  const pixelsPerYear = 100;
  const totalWidth = totalYears * pixelsPerYear;

  return (
    <div className="relative w-full h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 overflow-hidden">
      <div className="absolute inset-0 opacity-5">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: 'linear-gradient(90deg, #64748b 1px, transparent 1px)',
            backgroundSize: '50px 100%',
          }}
        />
      </div>

      <div
        className="absolute inset-0 overflow-hidden cursor-grab active:cursor-grabbing"
        onMouseDown={onPanStart}
        onMouseMove={onPanMove}
        onMouseUp={onPanEnd}
        onMouseLeave={onPanEnd}
      >
        <div
          className="absolute top-1/2 transform -translate-y-1/2 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent"
          style={{
            left: `${pan.x}px`,
            width: `${totalWidth * zoom}px`,
            transform: 'translateY(-50%)',
          }}
        />

        <div
          className="absolute top-1/2 transform -translate-y-1/2 flex gap-8 transition-none"
          style={{
            left: `${pan.x}px`,
            transform: `translateY(-50%) scaleX(${zoom})`,
            transformOrigin: 'left center',
          }}
        >
          {events.map((event, idx) => {
            const eventDate = new Date(event.dateGr);
            const yearsSinceMin = eventDate.getFullYear() - minDate.getFullYear();
            const xPosition = yearsSinceMin * pixelsPerYear;

            return (
              <div
                key={event.id}
                className="absolute top-0 transform -translate-y-1/2"
                style={{
                  left: `${xPosition}px`,
                  width: '100%',
                }}
              >
                <div className="absolute -top-2 left-40 w-4 h-4 bg-blue-500 rounded-full shadow-lg shadow-blue-500/50 transform -translate-x-1/2" />

                <div
                  style={{
                    marginTop: idx % 2 === 0 ? '-380px' : '40px',
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
