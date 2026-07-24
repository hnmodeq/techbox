'use client';

import React, { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { TimelineEvent } from '@/types/timeline';
import { TimelineCard } from './TimelineCard';
import { TimelineSuggestions } from './TimelineSuggestions';
import { ChevronRight, ChevronLeft, ChevronsLeft, ChevronsRight } from 'lucide-react';

// ─── Constants ──────────────────────────────────────────────────────────────
const SPACER_H = 24;   // h-6
const DOT_SIZE = 16;   // size-4
const DOT_GAP  = 16;   // mt-4

// ─── Helpers ────────────────────────────────────────────────────────────────
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

// ─── Sub-components ─────────────────────────────────────────────────────────

function TodayMarker() {
  return (
    <div className="relative flex shrink-0 flex-col items-center" style={{ width: 100 }}>
      <div className="h-6 flex items-center justify-center">
        <span className="text-[11px] font-extrabold text-primary">امروز</span>
      </div>
      <div className="relative z-10 flex items-center justify-center">
        <div className="size-5 rounded-full bg-primary shadow-md shadow-primary/30" />
        <div className="absolute size-5 rounded-full bg-primary animate-ping opacity-25" />
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
      {/* Date label */}
      <div className="mb-2 text-center text-xs font-bold text-muted-foreground h-6 flex items-center justify-center">
        {relativeDate(event.dateGr)}
      </div>

      {/* Dot — sits on the line */}
      <div className="relative z-10 flex items-center justify-center">
        <div className="size-4 rounded-full border-2 border-background bg-foreground shadow-sm" />
      </div>

      {/* Card */}
      <div className="mt-4">
        <TimelineCard event={event} importance={event.importance} />
      </div>
    </motion.div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────

interface TimelineContainerProps {
  events: TimelineEvent[];
  heightClassName?: string;
}

export function TimelineContainer({ events, heightClassName }: TimelineContainerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [topPad, setTopPad] = useState(0);
  const [canScrollTowardOlder, setCanScrollTowardOlder] = useState(false);
  const [canScrollTowardNewer, setCanScrollTowardNewer] = useState(false);

  // ── Vertical centering ──
  useEffect(() => {
    const update = () => {
      const el = scrollRef.current;
      if (!el) return;
      const containerH = el.clientHeight;
      const contentH = SPACER_H + DOT_SIZE + DOT_GAP + 460;
      setTopPad(Math.max(0, (containerH - contentH) / 2));
    };
    update();
    window.addEventListener('resize', update);
    const t = setTimeout(update, 150);
    return () => { window.removeEventListener('resize', update); clearTimeout(t); };
  }, []);

  // ── Scroll state ──
  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    const absLeft = Math.abs(el.scrollLeft);
    setCanScrollTowardNewer(absLeft > 10);
    setCanScrollTowardOlder(absLeft < maxScroll - 10);
  }, []);

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', checkScroll, { passive: true });
    window.addEventListener('resize', checkScroll);
    const t = setTimeout(checkScroll, 200);
    return () => { el.removeEventListener('scroll', checkScroll); window.removeEventListener('resize', checkScroll); clearTimeout(t); };
  }, [checkScroll]);

  // ── Keyboard navigation ──
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

  // ── Parallax depth ──
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    let rafId: number;
    const handleScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        el.querySelectorAll<HTMLElement>('[data-parallax]').forEach((card) => {
          const cardRect = card.getBoundingClientRect();
          const cardCenterX = cardRect.left + cardRect.width / 2;
          const dist = Math.abs(cardCenterX - centerX);
          const maxDist = rect.width / 2;
          const t = Math.min(dist / maxDist, 1);
          const scale = 1 + (1 - t) * 0.025;
          const opacity = 0.65 + (1 - t) * 0.35;
          card.style.transform = `scale(${scale})`;
          card.style.opacity = String(opacity);
          card.style.transition = 'transform 0.15s ease-out, opacity 0.15s ease-out';
        });
      });
    };
    el.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => { el.removeEventListener('scroll', handleScroll); cancelAnimationFrame(rafId); };
  }, [events]);

  // ── Find the event card closest to viewport center ──
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

  // ── Scroll to a specific event by index ──
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

  // ── Navigation actions ──
  const scrollToOldest = () => scrollRef.current?.scrollTo({ left: -(scrollRef.current.scrollWidth - scrollRef.current.clientWidth), behavior: 'smooth' });
  const scrollToToday = () => scrollRef.current?.scrollTo({ left: 0, behavior: 'smooth' });
  const scrollToPrev = () => { const idx = findCenteredIndex(); if (idx > 0) scrollToEvent(idx - 1); };
  const scrollToNext = () => { const idx = findCenteredIndex(); if (idx < events.length - 1) scrollToEvent(idx + 1); };

  const lineTop = topPad + SPACER_H + DOT_SIZE / 2;

  return (
    <div className="relative w-full" dir="rtl">
      <div className="flex items-center pt-30 justify-center gap-5">
        <button
          onClick={scrollToToday}
          className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <ChevronsRight className="size-3.5" />
          امروز
        </button>

        <span className="text-border text-[10px]">|</span>

        <button
          onClick={scrollToPrev}
          className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <ChevronRight className="size-3.5" />
          رویداد بعدی
        </button>

        <span className="text-border text-[10px]">|</span>

        <button
          onClick={scrollToNext}
          className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          رویداد قبلی
          <ChevronLeft className="size-3.5" />
        </button>

        <button
          onClick={scrollToOldest}
          className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          قدیمی‌ترین
          <ChevronsLeft className="size-3.5" />
        </button>

        <span className="text-border text-[10px] mx-1">·</span>
        <span className="text-[11px] text-muted-foreground font-medium">
          {events.length.toLocaleString('fa-IR')} رویداد
        </span>
      </div>

      {/* Timeline wrapper */}
      <div className="relative">
        {/* Scroll container */}
        <div
          ref={scrollRef}
          tabIndex={0}
          dir="rtl"
          className={`relative w-full overflow-x-auto overflow-y-hidden bg-background text-foreground outline-none ${heightClassName ?? 'h-[560px]'}`}
          style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
        >
          <style>{`div::-webkit-scrollbar { display: none; }`}</style>

          <div
            className="relative flex min-w-max items-start gap-6 px-[8%]"
            style={{ userSelect: 'none', WebkitUserSelect: 'none', height: '100%', paddingTop: topPad }}
            onDragStart={(e) => e.preventDefault()}
          >
            {/* Continuous horizontal line */}
            <div
              className="pointer-events-none absolute left-0 h-[3px] rounded-full bg-border/60"
              style={{ top: lineTop, width: '100%' }}
            />

            {/* Today marker */}
            <TodayMarker />

            {/* Events */}
            {events.map((event, index) => (
              <EventItem key={event.id} event={event} index={index} />
            ))}

            {/* Suggestion box — at the end (oldest side in RTL) */}
            <TimelineSuggestions />
          </div>
        </div>
      </div>
    </div>
  );
}
