'use client';

import React, { useState } from 'react';
import { TimelineEvent } from '@/types/timeline';
import { getJalaliDateStringPersian } from '@/lib/jalali';
import { Heart, MessageCircle } from 'lucide-react';
import Image from 'next/image';

interface TimelineCardProps {
  event: TimelineEvent;
  style?: React.CSSProperties;
  importance: number;
}

const fallbackImages = [
  '/assets/blog-1.jpg',
  '/assets/blog-2.jpg',
  '/assets/blog-4.jpg',
  '/assets/blog-5.jpg',
  '/assets/blog-6.png',
];

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

export function TimelineCard({ event, style, importance }: TimelineCardProps) {
  const [liked, setLiked] = useState(false);
  const [showComments, setShowComments] = useState(false);

  const sizeClass =
    importance >= 8
      ? 'w-80'
      : importance >= 6
        ? 'w-72'
        : 'w-64';

  const dateObj = new Date(event.dateGr);
  const persianDate = getJalaliDateStringPersian(dateObj);
  const globalDate = !isNaN(dateObj.getTime())
    ? new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric' }).format(dateObj)
    : '';
  const timeAgo = getRelativeTimeAgo(dateObj);

  const cardImage = event.image || fallbackImages[Math.abs((event.title?.length || 0) % fallbackImages.length)];

  return (
    <div style={style} className="flex flex-col items-center gap-3 select-none shrink-0 group">
      {/* Main Card Box synced with Tokens (--tb-bg-secondary, --tb-border) */}
      <div
        className={`${sizeClass} card p-0 overflow-hidden shadow-[var(--tb-shadow-lg)] transition-all duration-[var(--tb-motion-md)] hover:-translate-y-1 hover:border-[var(--tb-timeline)] flex flex-col w-full`}
      >
        <div className="relative h-36 w-full shrink-0 overflow-hidden bg-[var(--tb-bg-muted)]">
          <Image
            src={cardImage}
            alt={event.title || 'تصویر رویداد'}
            fill
            className="object-cover transition-transform duration-[var(--tb-motion-lg)] group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 320px"
          />
        </div>

        <div className="flex-1 p-4 flex flex-col overflow-hidden">
          <h3 className="tb-text-md font-bold text-[var(--tb-fg-primary)] mb-2 line-clamp-2 transition-colors group-hover:text-[var(--tb-timeline)]">
            {event.title}
          </h3>
          <p className="tb-text-sm text-[var(--tb-fg-muted)] mb-3 line-clamp-3 flex-1 leading-6">
            {event.description}
          </p>
        </div>

        <div className="border-t border-[var(--tb-border)] px-4 py-2.5 flex items-center justify-between bg-[var(--tb-bg-muted)]/50 gap-2 shrink-0">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setLiked(!liked);
            }}
            className="flex items-center gap-1.5 tb-text-sm text-[var(--tb-fg-muted)] hover:text-[var(--tb-danger)] transition-colors cursor-pointer font-bold"
          >
            <Heart size={16} className={liked ? 'fill-current text-[var(--tb-danger)]' : ''} />
            <span>{liked ? 1 : 0}</span>
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowComments(!showComments);
            }}
            className="flex items-center gap-1.5 tb-text-sm text-[var(--tb-fg-muted)] hover:text-[var(--tb-timeline)] transition-colors cursor-pointer font-bold"
          >
            <MessageCircle size={16} />
            <span>۰ نظر</span>
          </button>
        </div>

        {showComments && (
          <div className="border-t border-[var(--tb-border)] px-4 py-2.5 bg-[var(--tb-bg-muted)] tb-text-sm text-[var(--tb-fg-muted)] text-center font-bold">
            نظرات به زودی فعال می‌شوند...
          </div>
        )}
      </div>

      {/* External Date & Time Ago Box OUTSIDE Below Card Frame synced with Tokens */}
      <div className="w-full bg-transparent border-0 shadow-none p-1 flex flex-col items-center text-center gap-1.5">
        <div className="text-sm sm:text-base font-black text-[var(--tb-timeline)] font-sans">{persianDate}</div>
        <div className="text-xs sm:text-sm font-bold text-[var(--tb-fg-secondary)] font-sans tracking-wide" dir="ltr">{globalDate}</div>
        <div className="text-xs sm:text-sm font-extrabold text-[var(--tb-warning)]">
          {timeAgo}
        </div>
      </div>
    </div>
  );
}
