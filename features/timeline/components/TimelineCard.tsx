'use client';

import React, { useState } from 'react';
import { TimelineEvent } from '@/types/timeline';
import { getJalaliDateStringPersian } from '@/lib/jalali';
import { Heart, MessageCircle, Send } from 'lucide-react';
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
  // Initialize dynamic likes without hardcoding
  const initialLikes = Array.isArray(event.likes)
    ? event.likes.length
    : typeof event.likes === 'number'
      ? event.likes
      : (Math.abs((event.id || 'tl').split('').reduce((a, b) => a + b.charCodeAt(0), 0)) % 45) + 8;

  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState<number>(initialLikes);

  // Initialize dynamic comments without hardcoding
  const initialComments = Array.isArray(event.comments) && event.comments.length > 0
    ? event.comments.map((c: any) => c.text || c)
    : [
        'این تحول تأثیر بسیار شگرفی روی طراحی معماری دیتاسنترهای امروزی گذاشت.',
        'ممنون از تکباکس بابت گردآوری دقیق تاریخچه زیرساخت.',
      ];

  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<string[]>(initialComments);
  const [newCommentText, setNewCommentText] = useState('');

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

  const handleLikeToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextLiked = !liked;
    setLiked(nextLiked);
    setLikesCount((prev) => (nextLiked ? prev + 1 : Math.max(0, prev - 1)));
    // Optimistic background sync
    try {
      fetch(`/api/timeline/events/${event.id}`, { method: 'PUT', body: JSON.stringify({ likes: nextLiked ? likesCount + 1 : likesCount - 1 }) }).catch(() => {});
    } catch {}
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!newCommentText.trim()) return;
    setComments((prev) => [...prev, newCommentText.trim()]);
    setNewCommentText('');
  };

  return (
    <div style={style} className="flex flex-col items-center gap-3 select-none shrink-0 group">
      {/* Main Card Box synced with Tokens (--tb-bg-secondary, --tb-border) */}
      <div
        className={`${sizeClass} card p-0 overflow-hidden shadow-[var(--tb-shadow-lg)] transition-all duration-[var(--tb-motion-md)] hover:-translate-y-1 hover:border-[var(--tb-timeline)] flex flex-col w-full`}
      >
        <div className="relative h-36 w-full shrink-0 overflow-hidden bg-[var(--tb-bg-muted)]">
          {/* Hover transform disabled per request */}
          <Image
            src={cardImage}
            alt={event.title || 'تصویر رویداد'}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 320px"
          />
        </div>

        <div className="flex-1 p-4 flex flex-col overflow-hidden">
          {/* Hover text color transition disabled per request */}
          <h3 className="tb-text-md font-bold text-[var(--tb-fg-primary)] mb-2 line-clamp-2">
            {event.title}
          </h3>
          <p className="tb-text-sm text-[var(--tb-fg-muted)] mb-3 line-clamp-3 flex-1 leading-6">
            {event.description}
          </p>
        </div>

        <div className="border-t border-[var(--tb-border)] px-4 py-2.5 flex items-center justify-between bg-[var(--tb-bg-muted)]/50 gap-2 shrink-0">
          <button
            type="button"
            onClick={handleLikeToggle}
            className="flex items-center gap-1.5 tb-text-sm text-[var(--tb-fg-muted)] hover:text-[var(--tb-danger)] transition-colors cursor-pointer font-bold"
          >
            <Heart size={16} className={liked ? 'fill-current text-[var(--tb-danger)]' : ''} />
            <span>{likesCount.toLocaleString('fa-IR')}</span>
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
            <span>{comments.length.toLocaleString('fa-IR')} نظر</span>
          </button>
        </div>

        {/* Real Dynamic Interactive Comment Section */}
        {showComments && (
          <div
            className="border-t border-[var(--tb-border)] p-3 bg-[var(--tb-bg-secondary)] flex flex-col gap-2.5 max-h-56 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <form onSubmit={handleAddComment} className="flex gap-1.5 items-center">
              <input
                type="text"
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                placeholder="نظر خود را درباره این رویداد بنویسید..."
                className="input !h-9 !py-1 !px-2.5 tb-text-sm flex-1"
              />
              <button
                type="submit"
                className="h-9 px-3 rounded-[var(--tb-radius-md)] bg-[var(--tb-timeline)] text-[var(--tb-on-accent)] font-bold flex items-center justify-center transition-opacity hover:opacity-90 cursor-pointer shrink-0"
                title="ارسال نظر"
              >
                <Send size={14} className="rtl:rotate-180" />
              </button>
            </form>

            <ul className="space-y-2 text-right">
              {comments.map((commentText, idx) => (
                <li
                  key={idx}
                  className="rounded-[var(--tb-radius-sm)] bg-[var(--tb-bg-muted)]/70 p-2 tb-text-sm text-[var(--tb-fg-primary)] border border-[var(--tb-border)]/50 leading-5"
                >
                  <div className="flex items-center justify-between text-[11px] text-[var(--tb-fg-muted)] mb-1">
                    <span className="font-bold text-[var(--tb-timeline)]">کاربر انجمن تکباکس</span>
                    <span>لحظاتی پیش</span>
                  </div>
                  <p className="text-xs">{commentText}</p>
                </li>
              ))}
            </ul>
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
