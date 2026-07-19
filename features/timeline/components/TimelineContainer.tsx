'use client';

import React, { useRef } from 'react';
import { TimelineEvent } from '@/types/timeline';
import { TimelineCard } from './TimelineCard';
import { ChevronsLeft, ChevronsRight } from 'lucide-react';

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

/**
 * A simple horizontal timeline: one native horizontal-scroll container holding
 * a flex row of events. Each event is a date label + a dot ON the line + a
 * card hanging below. RTL so the newest event appears at the right.
 *
 * Uses native horizontal scroll (touch, trackpad, shift+wheel, scrollbar) — no
 * custom pan/zoom state. Everything inside is non-draggable / non-selectable
 * so images and text can't be copied or dragged out of the timeline.
 */
export function TimelineContainer({ events, heightClassName }: TimelineContainerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const amount = 350; // approximate width of one card + gap
    // In RTL, scrollLeft behaves differently across browsers.
    // Using scrollBy with negative for left and positive for right usually works.
    // But since RTL is tricky, we can try detecting current scrollLeft.
    // Let's just use scrollBy: left decreases x, right increases x.
    // Wait, in RTL, 'right' means towards the start (scrollLeft > 0 usually or 0).
    const scrollAmount = direction === 'left' ? -amount : amount;
    scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  return (
    <div className="relative group w-full">
      <button
        onClick={() => scroll('right')}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-20 text-muted-foreground hover:text-foreground transition-opacity p-2 hidden sm:block"
        aria-label="اسکرول به راست"
      >
        <ChevronsRight size={32} />
      </button>

      <button
        onClick={() => scroll('left')}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-20 text-muted-foreground hover:text-foreground transition-opacity p-2 hidden sm:block"
        aria-label="اسکرول به چپ"
      >
        <ChevronsLeft size={32} />
      </button>

      <div
        ref={scrollRef}
        dir="rtl"
        className={`relative w-full overflow-x-auto overflow-y-hidden bg-background text-foreground ${heightClassName ?? 'h-[560px]'}`}
        style={{
          scrollbarWidth: 'thin',
          WebkitOverflowScrolling: 'touch',
        }}
      >
      {/* The flex row of events. min-w-max so it never wraps. Each event
          centers on the line. */}
      <div
        className="relative flex min-w-max items-start gap-8 px-[8%] pt-3"
        style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
        onDragStart={(e) => e.preventDefault()}
      >
        {/* The continuous horizontal line — pinned at the dot row vertical. */}
        <div
          className="pointer-events-none absolute left-0 h-1 rounded-full bg-border"
          style={{ top: '44px', width: '100%' }}
        />

        {events.map((event) => {
          return (
            <div
              key={event.id}
              className="relative flex shrink-0 flex-col items-center"
              style={{ width: 320 }}
            >
              {/* Date label ABOVE the line — relative format (days/months/years ago) */}
              <div className="mb-2 text-center text-xs font-bold text-muted-foreground h-6 flex items-center justify-center">
                {relativeDate(event.dateGr)}
              </div>

              {/* Dot ON the line (sits at the same vertical as the continuous
                  line at top:44px — date(24) + mb-2(8) + half-dot(12) ≈ 44). */}
              <div className="relative z-10 size-4 rounded-full border-2 border-background bg-foreground shadow-sm" />

              {/* Card hanging below */}
              <div className="mt-4">
                <TimelineCard event={event} importance={event.importance} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
    </div>
  );
}
