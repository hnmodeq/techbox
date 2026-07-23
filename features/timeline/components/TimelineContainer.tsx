'use client';

import React, { useRef, useState, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { TimelineEvent } from '@/types/timeline';
import { TimelineCard } from './TimelineCard';
import { TimelineSuggestions } from './TimelineSuggestions';
import { ChevronRight, ChevronLeft, ChevronsLeft, ChevronsRight } from 'lucide-react';

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
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const controls = useAnimation();

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    // RTL: scrollLeft is negative or 0; scrollRight = scrollLeft + clientWidth < scrollWidth
    setCanScrollLeft(el.scrollLeft < -10);
    setCanScrollRight(Math.abs(el.scrollLeft) + el.clientWidth < el.scrollWidth - 10);
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', checkScroll, { passive: true });
    window.addEventListener('resize', checkScroll);
    return () => {
      el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, []);

  const smoothScroll = (amount: number) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: amount, behavior: 'smooth' });
  };

  const scrollToOldest = () => {
    const el = scrollRef.current;
    if (!el) return;
    // In RTL, oldest is at the left end → scrollLeft = -scrollWidth
    el.scrollTo({ left: -el.scrollWidth, behavior: 'smooth' });
  };

  const scrollToToday = () => {
    const el = scrollRef.current;
    if (!el) return;
    // Today is at the right end → scrollLeft = 0
    el.scrollTo({ left: 0, behavior: 'smooth' });
  };

  return (
    <div className="relative w-full" dir="rtl">
      {/* Scroll arrows — bigger, centered vertically */}
      <button
        onClick={() => smoothScroll(400)}
        className={`absolute right-2 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-11 h-11 rounded-full bg-background/80 backdrop-blur border border-border shadow-md text-foreground hover:bg-accent transition-all select-none ${canScrollRight ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        aria-label="اسکرول به راست"
      >
        <ChevronRight className="size-5" />
      </button>

      <button
        onClick={() => smoothScroll(-400)}
        className={`absolute left-2 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-11 h-11 rounded-full bg-background/80 backdrop-blur border border-border shadow-md text-foreground hover:bg-accent transition-all select-none ${canScrollLeft ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        aria-label="اسکرول به چپ"
      >
        <ChevronLeft className="size-5" />
      </button>

      {/* Scroll container */}
      <div
        ref={scrollRef}
        dir="rtl"
        className={`relative w-full overflow-x-auto overflow-y-hidden bg-background text-foreground ${heightClassName ?? 'h-[560px]'}`}
        style={{
          scrollbarWidth: 'none',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <style>{`
          div::-webkit-scrollbar { display: none; }
        `}</style>

        <div
          className="relative flex min-w-max items-center gap-8 px-[8%]"
          style={{ userSelect: 'none', WebkitUserSelect: 'none', height: '100%' }}
          onDragStart={(e) => e.preventDefault()}
        >
          {/* Continuous horizontal line — vertically centered */}
          <div
            className="pointer-events-none absolute left-0 h-1 rounded-full bg-border"
            style={{ top: 'calc(50% - 44px)', width: '100%' }}
          />

          {events.map((event, idx) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04, duration: 0.4, ease: 'easeOut' }}
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
            </motion.div>
          ))}

          {/* Suggestion box — at the end (oldest side in RTL) */}
          <TimelineSuggestions />
        </div>
      </div>

      {/* Navigation buttons below the timeline */}
      <div className="flex items-center justify-center gap-3 mt-4">
        <button
          onClick={scrollToOldest}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-card text-sm font-medium text-foreground hover:bg-accent transition-colors"
        >
          <ChevronsLeft className="size-4" />
          برو به قدیمی‌ترین
        </button>
        <button
          onClick={scrollToToday}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-card text-sm font-medium text-foreground hover:bg-accent transition-colors"
        >
          برو به امروز
          <ChevronsRight className="size-4" />
        </button>
      </div>
    </div>
  );
}
