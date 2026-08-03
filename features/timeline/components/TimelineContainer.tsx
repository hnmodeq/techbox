'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { TimelineEvent } from '@/types/timeline';
import { TimelineCard } from './TimelineCard';
import { TimelineSuggestions } from './TimelineSuggestions';
import { ChevronRight, ChevronLeft, ChevronsLeft, ChevronsRight } from 'lucide-react';

const DATE_ROW_H = 28;
const CARD_GAP = 12;
const CARD_H = 360;

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

function TodayMarker() {
  return (
    <div className="relative flex shrink-0 flex-col items-center" style={{ width: 100 }}>
      <div className="flex h-7 items-center justify-center">
        <span className="text-sm font-extrabold text-primary sm:text-base">امروز</span>
      </div>
    </div>
  );
}

function EventItem({ event, index }: { event: TimelineEvent; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.4, ease: 'easeOut' }}
      className="relative flex shrink-0 flex-col items-center"
      style={{ width: 320 }}
      data-parallax
      data-event-index={index}
    >
      <div className="flex h-7 items-center justify-center text-center text-sm font-bold text-muted-foreground sm:text-base">
        {relativeDate(event.dateGr)}
      </div>

      <div className="mt-3">
        <TimelineCard event={event} importance={event.importance} />
      </div>
    </motion.div>
  );
}

interface TimelineContainerProps {
  events: TimelineEvent[];
  heightClassName?: string;
}

export function TimelineContainer({ events, heightClassName }: TimelineContainerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [topPad, setTopPad] = useState(0);

  useEffect(() => {
    const update = () => {
      const el = scrollRef.current;
      if (!el) return;
      const containerH = el.clientHeight;
      const contentH = DATE_ROW_H + CARD_GAP + CARD_H;
      setTopPad(Math.max(0, (containerH - contentH) / 2));
    };
    update();
    window.addEventListener('resize', update);
    const t = setTimeout(update, 150);
    return () => { window.removeEventListener('resize', update); clearTimeout(t); };
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const el = scrollRef.current;
      if (!el) return;
      if (!el.contains(document.activeElement) && document.activeElement !== document.body) return;
      if (e.key === 'ArrowLeft') { el.scrollBy({ left: -400, behavior: 'smooth' }); e.preventDefault(); }
      if (e.key === 'ArrowRight') { el.scrollBy({ left: 400, behavior: 'smooth' }); e.preventDefault(); }
      if (e.key === 'Home') { el.scrollTo({ left: 0, behavior: 'smooth' }); e.preventDefault(); }
      if (e.key === 'End') { el.scrollTo({ left: -(el.scrollWidth - el.clientWidth), behavior: 'smooth' }); e.preventDefault(); }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const findCenteredIndex = useCallback((): number => {
    const el = scrollRef.current;
    if (!el) return 0;
    const centerX = el.getBoundingClientRect().left + el.clientWidth / 2;
    let closest = -1;
    let minDist = Infinity;
    el.querySelectorAll<HTMLElement>('[data-event-index]').forEach((card) => {
      const cardCenterX = card.getBoundingClientRect().left + card.offsetWidth / 2;
      const dist = Math.abs(cardCenterX - centerX);
      if (dist < minDist) { minDist = dist; closest = parseInt(card.dataset.eventIndex || '0', 10); }
    });
    return closest >= 0 ? closest : 0;
  }, []);

  const scrollToEvent = useCallback((index: number) => {
    const el = scrollRef.current;
    if (!el) return;
    const target = el.querySelector<HTMLElement>(`[data-event-index="${index}"]`);
    if (!target) return;
    const elRect = el.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    const offset = targetRect.left - elRect.left - (el.clientWidth / 2) + (target.offsetWidth / 2);
    el.scrollBy({ left: offset, behavior: 'smooth' });
  }, []);

  const scrollToOldest = () => scrollRef.current?.scrollTo({ left: -(scrollRef.current.scrollWidth - scrollRef.current.clientWidth), behavior: 'smooth' });
  const scrollToToday = () => scrollRef.current?.scrollTo({ left: 0, behavior: 'smooth' });
  const scrollToPrev = () => { const idx = findCenteredIndex(); if (idx > 0) scrollToEvent(idx - 1); };
  const scrollToNext = () => { const idx = findCenteredIndex(); if (idx < events.length - 1) scrollToEvent(idx + 1); };

  return (
    <div className="relative flex w-full flex-col overflow-hidden bg-transparent text-foreground" dir="rtl">
      <div className="relative z-10 flex items-center pt-10 pb-6 justify-center gap-5">
        <button onClick={scrollToToday} className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
          <ChevronsRight className="size-3.5" /> امروز
        </button>
        <span className="text-border text-[10px]">|</span>
        <button onClick={scrollToPrev} className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
          <ChevronRight className="size-3.5" /> رویداد بعدی
        </button>
        <span className="text-border text-[10px]">|</span>
        <button onClick={scrollToNext} className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
          رویداد قبلی <ChevronLeft className="size-3.5" />
        </button>
        <span className="text-border text-[10px]">|</span>
        <button onClick={scrollToOldest} className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
          قدیمی‌ترین <ChevronsLeft className="size-3.5" />
        </button>
      </div>

      <div
        ref={scrollRef}
        tabIndex={0}
        dir="rtl"
        className={`timeline-scroll-fade relative z-10 w-full overflow-x-auto overflow-y-hidden bg-transparent text-foreground outline-none [&::-webkit-scrollbar]:hidden ${heightClassName || 'h-[500px]'}`}
        style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
      >
        <div
          className="relative flex min-w-max items-start gap-6 px-[8%]"
          style={{ userSelect: 'none', WebkitUserSelect: 'none', height: '100%', paddingTop: topPad }}
          onDragStart={(e) => e.preventDefault()}
        >
          {/* The texture belongs to the scroll track—not the viewport—so it
              travels with the cards. One layer also avoids the doubled dark
              seam that looked like a black border around grid cells. */}
          <div aria-hidden="true" className="hp-grid-texture pointer-events-none absolute inset-0" />

          <TodayMarker />

          {events.map((event, index) => (
            <EventItem key={event.id} event={event} index={index} />
          ))}

          <TimelineSuggestions />
        </div>
      </div>

      <p className="relative z-10 text-center pb-8 pt-6 text-[11px] text-muted-foreground">
        {events.length.toLocaleString('fa-IR')} رویداد ثبت شده
      </p>
    </div>
  );
}
export default TimelineContainer;
