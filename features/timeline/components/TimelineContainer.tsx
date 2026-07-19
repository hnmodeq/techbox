'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { TimelineEvent } from '@/types/timeline';
import { TimelineCard } from './TimelineCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  /** Tailwind height class for the container. Defaults to near-full-viewport
   *  for the standalone /timeline page. The home row passes a compact value. */
  heightClassName?: string;
}

type LineComment = { id?: string; authorName: string; text: string; createdAt?: string }

function LineCommentBox({ eventId, prefix, placeholder }: { eventId?: string; prefix: string; placeholder: string }) {
  const [comments, setComments] = useState<LineComment[]>([])
  const [text, setText] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!eventId) return
    fetch(`/api/timeline/comments?eventId=${encodeURIComponent(eventId)}`, { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : []))
      .then((rows) => setComments((Array.isArray(rows) ? rows : []).filter((row) => String(row.text || '').startsWith(prefix)).map((row) => ({ ...row, text: String(row.text).slice(prefix.length) }))))
      .catch(() => setComments([]))
  }, [eventId, prefix])

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    event.stopPropagation()
    if (!eventId || !text.trim()) return
    setError('')
    const res = await fetch('/api/timeline/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventId, text: `${prefix}${text.trim()}` }),
    })
    if (res.status === 401) {
      window.dispatchEvent(new CustomEvent('tb_open_auth'))
      return
    }
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      setError(body?.message || body?.error || 'خطا در ثبت نظر')
      return
    }
    const created = await res.json()
    setComments((prev) => [{ ...created, text: String(created.text).slice(prefix.length) }, ...prev])
    setText('')
  }

  return (
    <div className="w-72 rounded-xl border bg-card p-3 shadow-sm" onPointerDown={(e) => e.stopPropagation()} onWheel={(e) => e.stopPropagation()}>
      <form onSubmit={submit} className="flex items-center gap-1.5">
        <Input value={text} onChange={(e) => setText(e.target.value)} placeholder={placeholder} className="h-8 text-xs" />
        <Button size="icon-sm" type="submit" aria-label="ارسال"><Send className="size-3.5 rtl:rotate-180" /></Button>
      </form>
      {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
      <ScrollArea className="mt-2 h-28">
        <ul className="space-y-1.5 pe-2 text-right">
          {comments.length === 0 ? <li className="rounded-md bg-muted/40 p-2 text-xs text-muted-foreground">هنوز نظری ثبت نشده است.</li> : comments.map((comment, index) => (
            <li key={comment.id || index} className="rounded-md bg-muted/40 p-2 text-xs leading-5">
              <div className="font-bold text-primary">{comment.authorName}</div>
              <p className="text-muted-foreground">{comment.text}</p>
            </li>
          ))}
        </ul>
      </ScrollArea>
    </div>
  )
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

export function TimelineContainer({ events, zoom, pan, onPanStart, onPanMove, onPanEnd, onWheel, heightClassName }: TimelineContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const xPositions = useMemo(() => {
    return events.reduce<number[]>((positions, ev, idx) => {
      if (idx === 0) return [300];
      const prevDate = new Date(events[idx - 1].dateGr).getTime();
      const currDate = new Date(ev.dateGr).getTime();
      const diffYears = Math.max(0, (currDate - prevDate) / (1000 * 60 * 60 * 24 * 365.2425));
      const prevWidth = events[idx - 1].importance >= 8 ? 320 : events[idx - 1].importance >= 6 ? 288 : 256;
      const currWidth = ev.importance >= 8 ? 320 : ev.importance >= 6 ? 288 : 256;
      const timeGap = Math.min(Math.max(diffYears * 22 * zoom, 48 * zoom), 700 * zoom);
      return [...positions, positions[idx - 1] + prevWidth / 2 + currWidth / 2 + timeGap];
    }, []);
  }, [events, zoom]);

  const endPosition = (xPositions[xPositions.length - 1] || 1000) + 420;
  const totalWidth = endPosition + 300;
  const clampedPanX = useMemo(() => {
    if (typeof window === 'undefined') return pan.x;
    const maxPan = 120;
    const minPan = -(totalWidth - window.innerWidth + 160);
    return Math.max(minPan, Math.min(maxPan, pan.x));
  }, [pan.x, totalWidth]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || !onWheel) return;
    const nativeWheelHandler = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onWheel(e);
    };
    el.addEventListener('wheel', nativeWheelHandler, { passive: false });
    return () => el.removeEventListener('wheel', nativeWheelHandler);
  }, [onWheel]);

  return (
    <div ref={containerRef} className={`relative h-100 w-full overflow-hidden select-none bg-background text-foreground bg-blue-200 transition-colors duration-200`}>
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="h-full w-full" style={{ backgroundImage: 'linear-gradient(90deg, var(--border) 1px, transparent 1px), linear-gradient(var(--border) 1px, transparent 1px)', backgroundSize: `${50 * zoom}px 50px`, backgroundPosition: `${clampedPanX}px ${pan.y}px` }} />
      </div>
      <div className="absolute inset-0 overflow-hidden cursor-grab active:cursor-grabbing"onPointerDown={onPanStart} onPointerMove={onPanMove} onPointerUp={onPanEnd} onPointerCancel={onPanEnd}>
        <div className="absolute z-0 h-1.5 rounded-full bg-border" style={{ left: `${clampedPanX - 100}px`, top: `calc(35% + ${pan.y}px)`, width: `${totalWidth}px`, transform: 'translateY(-50%)' }} />
        <div className="absolute left-0 top-0 h-full" style={{ left: `${clampedPanX}px`, top: `${pan.y}px` }}>
          <div className="absolute top-[35%] flex -translate-x-1/2 flex-col items-center" style={{ left: '60px' }}>
            <div className="absolute left-1/2 top-0 z-40 size-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-background bg-foreground shadow-sm" />
            <div className="absolute left-1/2 top-[32px] z-30 -translate-x-1/2">
              <LineCommentBox eventId={events[0]?.id} prefix="[missing]" placeholder="چه چیزی در تایم‌لاین کم است؟" />
            </div>
          </div>
          {events.map((event, idx) => {
            const xPos = xPositions[idx] || 240;
            const timeAgo = getRelativeTimeAgo(new Date(event.dateGr));
            return (
              <div key={event.id} className="absolute top-[35%] flex -translate-x-1/2 flex-col items-center" style={{ left: `${xPos}px` }}>
                <div className="absolute bottom-[calc(100%+14px)] left-1/2 flex w-64 -translate-x-1/2 flex-col items-center gap-1 text-center sm:w-72">
                  <div className="text-xs font-extrabold text-muted-foreground">{timeAgo}</div>
                </div>
                <div className="absolute left-1/2 top-0 z-40 size-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-background bg-foreground shadow-sm transition-transform hover:scale-125" />
                <div className="absolute left-1/2 top-[32px] z-10 flex -translate-x-1/2 justify-center">
                  <TimelineCard event={event} importance={event.importance} />
                </div>
              </div>
            );
          })}
          <div className="absolute top-[35%] flex -translate-x-1/2 flex-col items-center" style={{ left: `${endPosition}px` }}>
            <div className="absolute bottom-[calc(100%+14px)] left-1/2 w-64 -translate-x-1/2 text-center">
              <span className="inline-flex rounded-md bg-primary px-3 py-1 text-xs font-bold text-primary-foreground shadow-sm">امروز</span>
            </div>
            <div className="absolute left-1/2 top-0 z-40 size-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-background bg-foreground shadow-sm" />
            <div className="absolute left-1/2 top-[32px] z-30 -translate-x-1/2">
              <LineCommentBox eventId={events[events.length - 1]?.id} prefix="[future]" placeholder="فکر می‌کنید بعدش چه اتفاقی می‌افتد؟" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
