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

function getYear(dateGr: Date | string): number {
  const d = typeof dateGr === 'string' ? new Date(dateGr) : dateGr;
  return d.getFullYear();
}

function getDecade(year: number): number {
  return Math.floor(year / 10) * 10;
}

const ERA_LABELS: Record<number, string> = {
  1960: 'آغاز عصر کامپیوتر',
  1970: 'میکروکامپیوترها',
  1980: 'رایانه‌های شخصی',
  1990: 'انقلاب اینترنت',
  2000: 'موبایل و وب ۲',
  2010: 'رایانش ابری',
  2020: 'عصر هوش مصنوعی',
};

function getEraLabel(decade: number): string {
  return ERA_LABELS[decade] || `دهه ${decade}`;
}

function getPrimaryTag(event: TimelineEvent): string | null {
  const tags = (event as any).tags;
  if (Array.isArray(tags) && tags.length > 0) return String(tags[0]);
  if (typeof tags === 'string') {
    try { const p = JSON.parse(tags); if (Array.isArray(p) && p.length > 0) return String(p[0]); } catch {}
  }
  return null;
}

// ─── Timeline item types ────────────────────────────────────────────────────
type TimelineItem =
  | { type: 'today' }
  | { type: 'era'; decade: number; label: string }
  | { type: 'year'; year: number }
  | { type: 'event'; event: TimelineEvent; index: number };

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

function EraMarker({ label, decade }: { label: string; decade: number }) {
  return (
    <div className="relative flex shrink-0 flex-col items-center" style={{ width: 140 }}>
      <div className="h-6 flex items-center justify-center">
        <span className="text-[10px] font-black text-muted-foreground/40 tracking-wider">
          {decade}s
        </span>
      </div>
      <div className="relative z-10 flex items-center justify-center">
        <div className="size-3 rounded-full bg-muted-foreground/20 border border-muted-foreground/10" />
      </div>
      <div className="mt-2 px-2 py-1 rounded-md bg-muted/40 border border-border/40">
        <span className="text-[10px] font-bold text-muted-foreground/50 whitespace-nowrap">{label}</span>
      </div>
    </div>
  );
}

function YearTick({ year }: { year: number }) {
  return (
    <div className="relative flex shrink-0 flex-col items-center" style={{ width: 56 }}>
      <div className="h-6 flex items-center justify-center">
        <span className="text-[10px] font-bold text-muted-foreground/60">{year.toLocaleString('fa-IR')}</span>
      </div>
      <div className="relative z-10 flex items-center justify-center">
        <div className="w-[2px] h-5 bg-muted-foreground/25 rounded-full" />
      </div>
    </div>
  );
}

function EventItem({
  event,
  index,
  hoveredTag,
  onDotEnter,
  onDotLeave,
}: {
  event: TimelineEvent;
  index: number;
  hoveredTag: string | null;
  onDotEnter: (tag: string) => void;
  onDotLeave: () => void;
}) {
  const tag = getPrimaryTag(event);
  const isHighlighted = hoveredTag && tag && hoveredTag === tag;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.4, ease: 'easeOut' }}
      className="relative flex shrink-0 flex-col items-center"
      style={{ width: 320 }}
      data-parallax
    >
      {/* Date label */}
      <div className="mb-2 text-center text-xs font-bold text-muted-foreground h-6 flex items-center justify-center">
        {relativeDate(event.dateGr)}
      </div>

      {/* Dot — sits on the line */}
      <div
        className="relative z-10 flex items-center justify-center cursor-pointer"
        onMouseEnter={() => tag && onDotEnter(tag)}
        onMouseLeave={onDotLeave}
      >
        <div className={`size-4 rounded-full border-2 border-background shadow-sm transition-all duration-200 ${isHighlighted ? 'bg-primary scale-125' : 'bg-foreground'}`} />
        {isHighlighted && (
          <div className="absolute size-8 rounded-full bg-primary/10 animate-pulse" />
        )}
      </div>

      {/* Card */}
      <div className="mt-4">
        <TimelineCard event={event} importance={event.importance} />
      </div>
    </motion.div>
  );
}

function TimelineMiniMap({ scrollRef }: { scrollRef: React.RefObject<HTMLDivElement | null> }) {
  const [thumbLeft, setThumbLeft] = useState(0);
  const [thumbWidth, setThumbWidth] = useState(100);

  useEffect(() => {
    const update = () => {
      const el = scrollRef.current;
      if (!el) return;
      const maxScroll = el.scrollWidth - el.clientWidth;
      if (maxScroll <= 0) { setThumbLeft(0); setThumbWidth(100); return; }
      const absLeft = Math.abs(el.scrollLeft);
      const w = Math.max(8, (el.clientWidth / el.scrollWidth) * 100);
      setThumbWidth(w);
      setThumbLeft((absLeft / maxScroll) * (100 - w));
    };
    const el = scrollRef.current;
    el?.addEventListener('scroll', update, { passive: true });
    update();
    const t = setTimeout(update, 200);
    window.addEventListener('resize', update);
    return () => { el?.removeEventListener('scroll', update); window.removeEventListener('resize', update); clearTimeout(t); };
  }, [scrollRef]);

  return (
    <div className="mx-auto max-w-xs mt-2">
      <div className="relative h-1 bg-muted rounded-full overflow-hidden">
        <div
          className="absolute top-0 h-full bg-primary/25 rounded-full transition-all duration-150"
          style={{ width: `${thumbWidth}%`, left: `${thumbLeft}%` }}
        />
      </div>
    </div>
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
  const [hoveredTag, setHoveredTag] = useState<string | null>(null);

  // ── Vertical centering: calculate top padding ──
  useEffect(() => {
    const update = () => {
      const el = scrollRef.current;
      if (!el) return;
      const containerH = el.clientHeight;
      // Approximate content height: spacer + dot + gap + card
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
      // Only respond if the timeline or a child is focused
      if (!el.contains(document.activeElement) && document.activeElement !== document.body) return;
      if (e.key === 'ArrowLeft') { el.scrollBy({ left: -400, behavior: 'smooth' }); e.preventDefault(); }
      if (e.key === 'ArrowRight') { el.scrollBy({ left: 400, behavior: 'smooth' }); e.preventDefault(); }
      if (e.key === 'Home') { el.scrollTo({ left: 0, behavior: 'smooth' }); e.preventDefault(); }
      if (e.key === 'End') { el.scrollTo({ left: -(el.scrollWidth - el.clientWidth), behavior: 'smooth' }); e.preventDefault(); }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  // ── Parallax depth effect ──
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

  // ── Build timeline items ──
  const timelineItems = useMemo(() => {
    const items: TimelineItem[] = [];
    let lastYear: number | null = null;
    let lastDecade: number | null = null;

    items.push({ type: 'today' });

    events.forEach((event, index) => {
      const year = getYear(event.dateGr);
      const decade = getDecade(year);

      if (decade !== lastDecade) {
        items.push({ type: 'era', decade, label: getEraLabel(decade) });
        lastDecade = decade;
      }
      if (year !== lastYear) {
        items.push({ type: 'year', year });
        lastYear = year;
      }

      items.push({ type: 'event', event, index });
    });

    return items;
  }, [events]);

  const lineTop = topPad + SPACER_H + DOT_SIZE / 2;

  const scrollToOldest = () => scrollRef.current?.scrollTo({ left: -(scrollRef.current.scrollWidth - scrollRef.current.clientWidth), behavior: 'smooth' });
  const scrollToToday = () => scrollRef.current?.scrollTo({ left: 0, behavior: 'smooth' });

  return (
    <div className="relative w-full" dir="rtl">
      {/* Grid background — time-travel feel */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.035] dark:opacity-[0.05]"
        style={{
          backgroundImage:
            'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      {/* Scroll arrow — RIGHT (toward today/newer) */}
      <button
        onClick={() => scrollRef.current?.scrollBy({ left: 400, behavior: 'smooth' })}
        className={`absolute right-2 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-12 h-12 rounded-full bg-background/80 backdrop-blur border border-border shadow-lg text-foreground hover:bg-accent transition-all duration-300 select-none cursor-pointer ${canScrollTowardNewer ? 'opacity-100 scale-100' : 'opacity-0 scale-75 pointer-events-none'}`}
        aria-label="اسکرول به سمت امروز"
      >
        <ChevronRight className="size-5" />
      </button>

      {/* Scroll arrow — LEFT (toward older) */}
      <button
        onClick={() => scrollRef.current?.scrollBy({ left: -400, behavior: 'smooth' })}
        className={`absolute left-2 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-12 h-12 rounded-full bg-background/80 backdrop-blur border border-border shadow-lg text-foreground hover:bg-accent transition-all duration-300 select-none cursor-pointer ${canScrollTowardOlder ? 'opacity-100 scale-100' : 'opacity-0 scale-75 pointer-events-none'}`}
        aria-label="اسکرول به سمت قدیمی‌ترین"
      >
        <ChevronLeft className="size-5" />
      </button>

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
          {/* Continuous horizontal line — aligned with dot centers */}
          <div
            className="pointer-events-none absolute left-0 h-[3px] rounded-full bg-border/60"
            style={{ top: lineTop, width: '100%' }}
          />

          {timelineItems.map((item) => {
            if (item.type === 'today') return <TodayMarker key="today" />;
            if (item.type === 'era') return <EraMarker key={`era-${item.decade}`} decade={item.decade} label={item.label} />;
            if (item.type === 'year') return <YearTick key={`year-${item.year}`} year={item.year} />;
            return (
              <EventItem
                key={item.event.id}
                event={item.event}
                index={item.index}
                hoveredTag={hoveredTag}
                onDotEnter={setHoveredTag}
                onDotLeave={() => setHoveredTag(null)}
              />
            );
          })}

          {/* Suggestion box — at the end (oldest side in RTL) */}
          <TimelineSuggestions />
        </div>
      </div>

      {/* Mini-map */}
      <TimelineMiniMap scrollRef={scrollRef} />

      {/* Navigation + event counter */}
      <div className="flex items-center justify-center gap-2 mt-2">
        <span className="text-[11px] text-muted-foreground font-medium">
          {events.length.toLocaleString('fa-IR')} رویداد
        </span>
        <span className="text-border text-[10px]">•</span>
        <button
          onClick={scrollToToday}
          className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          برو به امروز
          <ChevronsLeft className="size-3.5" />
        </button>
        <span className="text-border text-[10px]">|</span>
        <button
          onClick={scrollToOldest}
          className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <ChevronsRight className="size-3.5" />
          برو به قدیمی‌ترین
        </button>
      </div>
    </div>
  );
}
