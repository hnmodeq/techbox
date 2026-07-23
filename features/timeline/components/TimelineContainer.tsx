'use client';

import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
  // canScrollRight = we can scroll toward OLDER (left in RTL)
  // canScrollLeft  = we can scroll toward NEWER/today (right in RTL)
  const [canScrollTowardOlder, setCanScrollTowardOlder] = useState(false);
  const [canScrollTowardNewer, setCanScrollTowardNewer] = useState(false);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    const absLeft = Math.abs(el.scrollLeft);
    // At the right end (scrollLeft ≈ 0) = newest/today → can't scroll toward newer
    setCanScrollTowardNewer(absLeft > 10);
    // At the left end (absLeft ≈ maxScroll) = oldest → can't scroll toward older
    setCanScrollTowardOlder(absLeft < maxScroll - 10);
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', checkScroll, { passive: true });
    window.addEventListener('resize', checkScroll);
    // Initial check after layout settles
    const t = setTimeout(checkScroll, 100);
    return () => {
      el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
      clearTimeout(t);
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
    el.scrollTo({ left: -(el.scrollWidth - el.clientWidth), behavior: 'smooth' });
  };

  const scrollToToday = () => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ left: 0, behavior: 'smooth' });
  };

  return (
    <div className="relative w-full" dir="rtl">
      {/* Grid background — gives the "traveling through time" feel */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      {/* Scroll arrow — RIGHT (toward today/newer) */}
      <button
        onClick={() => smoothScroll(400)}
        className={`absolute right-2 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-12 h-12 rounded-full bg-background/80 backdrop-blur border border-border shadow-lg text-foreground hover:bg-accent transition-all duration-300 select-none cursor-pointer ${canScrollTowardNewer ? 'opacity-100 scale-100' : 'opacity-0 scale-75 pointer-events-none'}`}
        aria-label="اسکرول به سمت امروز"
      >
        <ChevronRight className="size-5" />
      </button>

      {/* Scroll arrow — LEFT (toward older) */}
      <button
        onClick={() => smoothScroll(-400)}
        className={`absolute left-2 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-12 h-12 rounded-full bg-background/80 backdrop-blur border border-border shadow-lg text-foreground hover:bg-accent transition-all duration-300 select-none cursor-pointer ${canScrollTowardOlder ? 'opacity-100 scale-100' : 'opacity-0 scale-75 pointer-events-none'}`}
        aria-label="اسکرول به سمت قدیمی‌ترین"
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
          {/* Continuous horizontal line — aligned with dot centers */}
          <div
            className="pointer-events-none absolute left-0 h-[3px] rounded-full bg-border"
            style={{ top: 'calc(50% - 8px)', width: '100%' }}
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

              {/* Dot — sits ON the line */}
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

      {/* Navigation buttons — close to timeline, ghost style, swapped */}
      <div className="flex items-center justify-center gap-2 mt-2">
        <button
          onClick={scrollToToday}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          برو به امروز
          <ChevronsLeft className="size-4" />
        </button>
        <span className="text-border text-xs">|</span>
        <button
          onClick={scrollToOldest}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <ChevronsRight className="size-4" />
          برو به قدیمی‌ترین
        </button>
      </div>
    </div>
  );
}
