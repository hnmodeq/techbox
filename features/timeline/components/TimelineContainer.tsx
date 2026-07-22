'use client';

import React, { useRef } from 'react';
import { TimelineEvent } from '@/types/timeline';
import { TimelineCard } from './TimelineCard';
function relativeDate(dateGr: Date | string): string {
  const d = typeof dateGr === 'string' ? new Date(dateGr) : dateGr;
  if (isNaN(d.getTime())) return '';
  const diff = Date.now() - d.getTime();
  if (diff < 0) return 'در آینده';
  const days = Math.floor(diff / 86_400_000);
  if (days === 0) return 'امروز';
  if (days < 30) return `${days.toLocaleString('fa-IR')} روز پیش`;
  const months = Math.floor(days / 30.4375);
  if (months < 12) return `${months.toLocaleString('fa-IR')} ماه پیش`;
  const years = Math.floor(days / 365.2425);
  return `${years.toLocaleString('fa-IR')} سال پیش`;
}

interface TimelineContainerProps {
  events: TimelineEvent[];
  heightClassName?: string;
}

export function TimelineContainer({ events, heightClassName }: TimelineContainerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const amount = 360;
    const scrollAmount = direction === 'left' ? -amount : amount;
    scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  return (
    <div className="relative w-full" dir="rtl">
      {/* Navigation buttons — right arrow on right, left arrow on left */}
      <button
        onClick={() => scroll('right')}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-20 hidden sm:flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors select-none"
        style={{ fontSize: 28, fontWeight: 900, lineHeight: 1, padding: "0 10px" }}
        aria-label="اسکرول به راست"
      >
        →
      </button>

      <button
        onClick={() => scroll('left')}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-20 hidden sm:flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors select-none"
        style={{ fontSize: 28, fontWeight: 900, lineHeight: 1, padding: "0 10px" }}
        aria-label="اسکرول به چپ"
      >
        ←
      </button>

      {/* Scroll container — no visible scrollbar */}
      <div
        ref={scrollRef}
        dir="rtl"
        className={`relative w-full overflow-x-auto overflow-y-hidden bg-background text-foreground ${heightClassName ?? 'h-[560px]'}`}
        style={{
          scrollbarWidth: 'none',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {/* Hide webkit scrollbar */}
        <style>{`
          [data-timeline-scroll]::-webkit-scrollbar { display: none; }
        `}</style>

        <div
          className="relative flex min-w-max items-start gap-8 px-[8%] pt-3"
          style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
          onDragStart={(e) => e.preventDefault()}
        >
          {/* Continuous horizontal line */}
          <div
            className="pointer-events-none absolute left-0 h-1 rounded-full bg-border"
            style={{ top: '44px', width: '100%' }}
          />

          {events.map((event) => (
            <div
              key={event.id}
              className="relative flex shrink-0 flex-col items-center"
              style={{ width: 320 }}
            >
              {/* Date label above the line */}
              <div className="mb-2 text-center text-xs font-bold text-muted-foreground h-6 flex items-center justify-center">
                {relativeDate(event.dateGr)}
              </div>

              {/* Dot on the line */}
              <div className="relative z-10 size-4 rounded-full border-2 border-background bg-foreground shadow-sm" />

              {/* Card */}
              <div className="mt-4">
                <TimelineCard event={event} importance={event.importance} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
