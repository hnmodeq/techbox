'use client';

import React from 'react';
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
  return (
    <div
      dir="rtl"
      className={`relative w-full overflow-x-auto overflow-y-hidden bg-background text-foreground ${heightClassName ?? 'h-[560px]'}`}
      style={{
        scrollbarWidth: 'thin',
        WebkitOverflowScrolling: 'touch',
        // The scroll container itself doesn't need user-select; child cards
        // enforce their own no-select. Keep this off here so the scrollbar
        // stays fully interactive.
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
  );
}
