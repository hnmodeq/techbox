'use client';

import React from 'react';
import { TimelineEvent } from '@/types/timeline';
import { TimelineCard } from './TimelineCard';

interface TimelineContainerProps {
  events: TimelineEvent[];
  /** Tailwind height class for the scroll area. */
  heightClassName?: string;
}

/**
 * A simple horizontal timeline: one native-scroll container holding a flex row
 * of events. Each event is a dot on a continuous line, with its card hanging
 * below. RTL so the newest event appears at the right (scroll-start).
 *
 * No custom pan state, no zoom hooks, no wheel hijacking — the browser's native
 * horizontal scroll (touch, trackpad, shift+wheel) does everything. This is
 * what makes it feel healthy and predictable instead of fighting the user.
 */
export function TimelineContainer({ events, heightClassName }: TimelineContainerProps) {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const lineRef = React.useRef<HTMLDivElement>(null);

  // Keep the continuous line exactly as wide as the row content (so dots line
  // up with events regardless of scroll position).
  React.useEffect(() => {
    const row = scrollRef.current;
    const line = lineRef.current;
    if (!row || !line) return;
    const sync = () => {
      const inner = row.querySelector('[data-timeline-row]');
      if (inner) line.style.width = `${inner.scrollWidth}px`;
    };
    sync();
    window.addEventListener('resize', sync);
    return () => window.removeEventListener('resize', sync);
  }, [events]);

  return (
    <div
      ref={scrollRef}
      dir="rtl"
      className={`relative w-full overflow-x-auto overflow-y-hidden select-none bg-background text-foreground ${heightClassName ?? 'h-[440px]'}`}
      style={{ scrollbarWidth: 'thin', WebkitOverflowScrolling: 'touch' }}
    >
      {/* The flex row of events. min-w-max so it never wraps; px gives breathing
          room at the start/end. Each event is centered on the line. */}
      <div
        data-timeline-row
        className="relative flex min-w-max items-start gap-6 px-[10%] py-6"
      >
        {/* The continuous horizontal line — sits at the same vertical position
            as the dots (top of each event cell). */}
        <div
          ref={lineRef}
          className="pointer-events-none absolute top-[34px] h-1 rounded-full bg-border"
          style={{ left: 0 }}
        />

        {events.map((event) => (
          <div key={event.id} className="relative flex shrink-0 flex-col items-center" style={{ width: 320 }}>
            {/* Dot on the line */}
            <div className="relative z-10 mb-4 mt-[26px] size-4 rounded-full border-2 border-background bg-foreground shadow-sm" />
            {/* The card hangs below the dot */}
            <TimelineCard event={event} importance={event.importance} />
          </div>
        ))}
      </div>
    </div>
  );
}
