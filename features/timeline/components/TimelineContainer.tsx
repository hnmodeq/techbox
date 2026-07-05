'use client';

import React, { useEffect, useRef, useState } from 'react';
import { TimelineEvent } from '@/types/timeline';
import { TimelineCard } from './TimelineCard';
import { getJalaliDateStringPersian } from '@/lib/jalali';
import { Send } from 'lucide-react';

interface TimelineContainerProps {
  events: TimelineEvent[];
  zoom: number;
  pan: { x: number; y: number };
  onPanStart: (e: React.MouseEvent | React.PointerEvent) => void;
  onPanMove: (e: React.MouseEvent | React.PointerEvent) => void;
  onPanEnd: () => void;
  onResetView: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onZoomChange?: (nextZoom: number) => void;
  onWheel?: (e: React.WheelEvent | WheelEvent) => void;
}

function getRelativeTimeAgo(dateGr: Date | string): string {
  const d = typeof dateGr === 'string' ? new Date(dateGr) : dateGr;
  if (isNaN(d.getTime())) return '';
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return 'در آینده';
  if (diffDays === 0) return 'امروز';
  if (diffDays < 30) return `${diffDays.toLocaleString('fa-IR')} روز پیش`;
  const diffMonths = Math.floor(diffDays / 30.4375);
  if (diffMonths < 12) return `${diffMonths.toLocaleString('fa-IR')} ماه پیش`;
  const diffYears = Math.floor(diffDays / 365.2425);
  return `${diffYears.toLocaleString('fa-IR')} سال پیش`;
}

export function TimelineContainer({
  events,
  zoom,
  pan,
  onPanStart,
  onPanMove,
  onPanEnd,
  onWheel,
}: TimelineContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [earlyHistoryComment, setEarlyHistoryComment] = useState('');
  const [earlyCommentsList, setEarlyCommentsList] = useState<string[]>([
    'پیشنهاد می‌کنم تاریخچه ابداع کارت پانچ هرمان هالریت (۱۸۹۰) را هم اضافه کنید.',
  ]);

  // Exact Edge-to-Edge math: xPos[idx] = xPos[idx - 1] + (W[idx-1]/2) + (W[idx]/2) + timeGap
  const xPositions = React.useMemo(() => {
    let currX = 360;
    return events.map((ev, idx) => {
      if (idx === 0) return currX;
      const prevDate = new Date(events[idx - 1].dateGr).getTime();
      const currDate = new Date(ev.dateGr).getTime();
      const diffYears = Math.max(0, (currDate - prevDate) / (1000 * 60 * 60 * 24 * 365.2425));

      const prevWidth = events[idx - 1].importance >= 8 ? 320 : events[idx - 1].importance >= 6 ? 288 : 256;
      const currWidth = ev.importance >= 8 ? 320 : ev.importance >= 6 ? 288 : 256;

      const timeGap = Math.min(Math.max(diffYears * 22 * zoom, 48 * zoom), 700 * zoom);
      currX += prevWidth / 2 + currWidth / 2 + timeGap;
      return currX;
    });
  }, [events, zoom]);

  const endPosition = (xPositions[xPositions.length - 1] || 1000) + 420;
  const totalWidth = endPosition + 400;

  // Strict scrolling boundaries so users stop when hitting beginning or end of line
  const clampedPanX = React.useMemo(() => {
    if (typeof window === 'undefined') return pan.x;
    const maxPan = 180; // Left boundary stop
    const minPan = -(totalWidth - window.innerWidth + 200); // Right boundary stop
    return Math.max(minPan, Math.min(maxPan, pan.x));
  }, [pan.x, totalWidth]);

  // Native non-passive wheel listener to strictly block vertical webpage scrolling
  useEffect(() => {
    const el = containerRef.current;
    if (!el || !onWheel) return;

    const nativeWheelHandler = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onWheel(e);
    };

    el.addEventListener('wheel', nativeWheelHandler, { passive: false });
    return () => {
      el.removeEventListener('wheel', nativeWheelHandler);
    };
  }, [onWheel]);

  const handleAddEarlyComment = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!earlyHistoryComment.trim()) return;
    setEarlyCommentsList((prev) => [earlyHistoryComment.trim(), ...prev]);
    setEarlyHistoryComment('');
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[calc(100vh-64px)] min-h-[680px] bg-[var(--main-background)] overflow-hidden select-none transition-colors duration-[var(--tb-motion-md)]"
    >
      {/* Background Grid synced with tokens */}
      <div className="absolute inset-0 opacity-[0.14] pointer-events-none">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: 'linear-gradient(90deg, var(--timeline) 1px, transparent 1px), linear-gradient(var(--timeline) 1px, transparent 1px)',
            backgroundSize: `${50 * zoom}px 50px`,
            backgroundPosition: `${clampedPanX}px ${pan.y}px`,
          }}
        />
      </div>

      {/* Draggable Track Canvas */}
      <div
        className="absolute inset-0 overflow-hidden cursor-grab active:cursor-grabbing"
        onPointerDown={onPanStart}
        onPointerMove={onPanMove}
        onPointerUp={onPanEnd}
        onPointerCancel={onPanEnd}
      >
        {/* Prominent Glowing Horizontal Timeline Axis Line running continuously across the track */}
        <div
          className="absolute h-2.5 bg-[var(--timeline)] shadow-[0_0_16px_rgba(6,182,212,0.8)] rounded-full z-10"
          style={{
            left: `${clampedPanX - 100}px`,
            top: `calc(35% + ${pan.y}px)`,
            width: `${totalWidth}px`,
            transform: 'translateY(-50%)',
          }}
        />

        {/* Timeline Cards & Landmarks Container */}
        <div
          className="absolute top-0 left-0 h-full"
          style={{
            left: `${clampedPanX}px`,
            top: `${pan.y}px`,
          }}
        >
          {/* ============================================================================
              🟢 START OF LINE LANDMARK: از اینجا به قبل خبری نبوده
              ============================================================================ */}
          <div
            className="absolute top-[35%] transform -translate-x-1/2 flex flex-col items-center"
            style={{ left: '60px' }}
          >
            {/* Title Above Line */}
            <div className="absolute bottom-[calc(100%+14px)] left-1/2 -translate-x-1/2 w-64 text-center">
              <span className="badge !bg-[var(--timeline)] !text-slate-950 font-black mb-1.5 shadow-md">
                آغاز خط تایم‌لاین تکباکس
              </span>
              <h3 className="text-[length:var(--h3-font-size)] text-[var(--h3-font-color)] font-semibold font-black text-[var(--primary-text)] leading-6">
                از اینجا به قبل خبری نبوده؛ اگه بوده شما به ما بگید!
              </h3>
            </div>

            {/* Landmark Dot on Axis */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-7 h-7 bg-[var(--tb-warning)] rounded-full border-4 border-[var(--main-background)] shadow-xl" />

            {/* Comment Box Below Line with more distance */}
            <div
              className="absolute top-[32px] left-1/2 -translate-x-1/2 w-64 card p-3.5 shadow-xl border-[var(--border-color)] flex flex-col gap-2.5 z-20"
              onPointerDown={(e) => e.stopPropagation()}
            >
              <form onSubmit={handleAddEarlyComment} className="flex gap-1.5 items-center">
                <input
                  type="text"
                  value={earlyHistoryComment}
                  onChange={(e) => setEarlyHistoryComment(e.target.value)}
                  placeholder="پیشنهاد رویداد تاریخی..."
                  className="input !h-9 !py-1 !px-2.5 text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] flex-1"
                />
                <button
                  type="submit"
                  className="h-9 px-3 rounded-[var(--corner-radius)] bg-[var(--tb-warning)] text-slate-950 font-bold flex items-center justify-center cursor-pointer shrink-0"
                >
                  <Send size={14} className="rtl:rotate-180" />
                </button>
              </form>

              <ul className="space-y-1.5 max-h-40 overflow-y-auto text-right">
                {earlyCommentsList.map((c, i) => (
                  <li key={i} className="rounded bg-[var(--muted-background)]/80 p-2 text-xs text-[var(--primary-text)] leading-5">
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* ============================================================================
              🔵 MIDDLE: TIMELINE EVENT CARDS
              ============================================================================ */}
          {events.map((event, idx) => {
            const xPos = xPositions[idx] || 240;
            const dateObj = new Date(event.dateGr);
            const persianDate = getJalaliDateStringPersian(dateObj);
            const globalDate = !isNaN(dateObj.getTime())
              ? new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric' }).format(dateObj)
              : '';
            const timeAgo = getRelativeTimeAgo(dateObj);

            return (
              <div
                key={event.id}
                className="absolute top-[35%] transform -translate-x-1/2 flex flex-col items-center"
                style={{
                  left: `${xPos}px`,
                }}
              >
                {/* 1. Title & Date Section STRICTLY ABOVE THE LINE */}
                <div className="absolute bottom-[calc(100%+14px)] left-1/2 -translate-x-1/2 w-64 sm:w-72 text-center flex flex-col items-center gap-1">
                  <div className="text-sm sm:text-base font-black text-[var(--timeline)] font-sans">{persianDate}</div>
                  <div className="text-xs sm:text-sm font-bold text-[var(--tb-fg-secondary)] font-sans tracking-wide" dir="ltr">{globalDate}</div>
                  <div className="text-xs font-extrabold text-[var(--tb-warning)] mt-0.5">
                    {timeAgo}
                  </div>
                </div>

                {/* 2. Milestone Dot sitting directly on the axis line */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-6 h-6 bg-[var(--timeline)] rounded-full border-4 border-[var(--main-background)] shadow-lg transition-transform hover:scale-125" />

                {/* 3. Card hanging BELOW THE LINE top-aligned (top: 32px) with generous padding beneath line */}
                <div className="absolute top-[32px] left-1/2 -translate-x-1/2 flex justify-center z-10">
                  <TimelineCard event={event} importance={event.importance} />
                </div>
              </div>
            );
          })}

          {/* ============================================================================
              🔴 END OF LINE LANDMARK: امروز (Today)
              ============================================================================ */}
          <div
            className="absolute top-[35%] transform -translate-x-1/2 flex flex-col items-center"
            style={{ left: `${endPosition}px` }}
          >
            {/* Title Above Line */}
            <div className="absolute bottom-[calc(100%+14px)] left-1/2 -translate-x-1/2 w-64 text-center">
              <span className="badge !bg-[var(--tb-success)] !text-slate-950 font-black mb-1.5 shadow-md">
                نقطه کنونی
              </span>
              <h3 className="text-xl font-black text-[var(--primary-text)]">
                امروز (Today)
              </h3>
            </div>

            {/* Landmark Dot on Axis */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-8 h-8 bg-[var(--tb-success)] rounded-full border-4 border-[var(--main-background)] shadow-xl animate-pulse" />

            {/* Info Card Below Line with more padding */}
            <div className="absolute top-[32px] left-1/2 -translate-x-1/2 w-64 card p-4 text-center shadow-xl border-[var(--border-color)] space-y-2 z-20">
              <div className="text-[length:var(--h3-font-size)] text-[var(--h3-font-color)] font-semibold font-bold text-[var(--tb-success)]">
                {getJalaliDateStringPersian(new Date())}
              </div>
              <div className="text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] paragraph-color font-mono" dir="ltr">
                {new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date())}
              </div>
              <p className="text-xs text-[var(--tb-fg-secondary)] leading-5 pt-2 border-t border-[var(--border-color)]">
                به سوی آینده فناوری اطلاعات، زیرساخت‌های ابری و هوش مصنوعی...
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
