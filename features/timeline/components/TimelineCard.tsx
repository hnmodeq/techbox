'use client';

import React, { useState } from 'react';
import { TimelineEvent } from '@/types/timeline';
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

export function TimelineCard({ event, style, importance }: TimelineCardProps) {
  const initialLikes = Array.isArray(event.likes)
    ? event.likes.length
    : typeof event.likes === 'number'
      ? event.likes
      : (Math.abs((event.id || 'tl').split('').reduce((a, b) => a + b.charCodeAt(0), 0)) % 45) + 8;

  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState<number>(initialLikes);

  const initialComments = Array.isArray(event.comments) && event.comments.length > 0
    ? event.comments.map((c: any) => c.text || c)
    : [
        'این تحول تأثیر بسیار شگرفی روی طراحی معماری دیتاسنترهای امروزی گذاشت.',
        'ممنون از تکباکس بابت گردآوری دقیق تاریخچه زیرساخت.',
        'نقطه عطف بی‌نظیری در پیشرفت فناوری اطلاعات بود.',
      ];

  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<string[]>(initialComments);
  const [newCommentText, setNewCommentText] = useState('');

  const widthClass =
    importance >= 8
      ? 'w-72 sm:w-80'
      : importance >= 6
        ? 'w-64 sm:w-72'
        : 'w-60 sm:w-64';

  const cardImage = event.image || fallbackImages[Math.abs((event.title?.length || 0) % fallbackImages.length)];

  const handleLikeToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextLiked = !liked;
    setLiked(nextLiked);
    setLikesCount((prev) => (nextLiked ? prev + 1 : Math.max(0, prev - 1)));
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
    /* Top-aligned container so opening comments expands downwards without moving card top position */
    <div style={style} className={`${widthClass} select-none shrink-0 group flex flex-col justify-start`}>
      {/* Card Box with fixed image backdrop to eliminate resizing/flicker when comments expand */}
      <div className="relative min-h-[320px] sm:min-h-[350px] w-full rounded-xl overflow-hidden shadow-[var(--tb-shadow-lg)] border border-[var(--tb-border)] hover:border-[var(--tb-timeline)] transition-all duration-[var(--tb-motion-md)] hover:-translate-y-1 flex flex-col justify-end bg-slate-950">
        
        {/* Fixed-Height Background Image Layer (h-[280px]) so expanding comments never resizes or flickers the image */}
        <div className="absolute top-0 inset-x-0 h-[280px] overflow-hidden z-0 pointer-events-none">
          <Image
            src={cardImage}
            alt={event.title || 'تصویر رویداد'}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 320px"
          />
          {/* Soft bottom-to-top gradient fade out over the image */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/85 to-transparent" />
        </div>

        {/* Content overlaid on top of fixed image background */}
        <div className="relative z-10 p-4.5 flex flex-col justify-end text-white">
          <h3 className="tb-text-md font-bold text-white mb-2 line-clamp-2 leading-7">
            {event.title}
          </h3>
          <p className="tb-text-sm text-slate-300 mb-4 line-clamp-3 leading-6">
            {event.description}
          </p>

          <div className="border-t border-white/20 pt-3 flex items-center justify-between gap-2 shrink-0">
            <button
              type="button"
              onClick={handleLikeToggle}
              className="flex items-center gap-1.5 tb-text-sm text-slate-300 hover:text-red-400 transition-colors cursor-pointer font-bold"
            >
              <Heart size={16} className={liked ? 'fill-current text-red-500' : ''} />
              <span>{likesCount.toLocaleString('fa-IR')}</span>
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowComments(!showComments);
              }}
              className="flex items-center gap-1.5 tb-text-sm text-slate-300 hover:text-cyan-400 transition-colors cursor-pointer font-bold"
            >
              <MessageCircle size={16} />
              <span>{comments.length.toLocaleString('fa-IR')} نظر</span>
            </button>
          </div>

          {/* Real Dynamic Interactive Comment Section with Smooth Opening Motion & Wheel Isolation */}
          {showComments && (
            <div
              className="mt-3.5 pt-3.5 border-t border-white/20 flex flex-col gap-3 max-h-80 sm:max-h-96 overflow-y-auto animate-in fade-in-0 slide-in-from-top-3 duration-300 pr-1"
              onClick={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
              onWheel={(e) => e.stopPropagation()}
            >
              <form onSubmit={handleAddComment} className="flex gap-1.5 items-center shrink-0">
                <input
                  type="text"
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  placeholder="نظر خود را درباره این رویداد بنویسید..."
                  className="input !h-9 !py-1 !px-2.5 tb-text-sm flex-1 !bg-slate-900/90 !text-white !border-slate-700"
                />
                <button
                  type="submit"
                  className="h-9 px-3 rounded-[var(--tb-radius-md)] bg-[var(--tb-timeline)] text-slate-950 font-bold flex items-center justify-center transition-opacity hover:opacity-90 cursor-pointer shrink-0"
                  title="ارسال نظر"
                >
                  <Send size={14} className="rtl:rotate-180" />
                </button>
              </form>

              <ul className="space-y-2 text-right">
                {comments.map((commentText, idx) => (
                  <li
                    key={idx}
                    className="rounded-[var(--tb-radius-sm)] bg-slate-900/90 p-2.5 tb-text-sm text-slate-200 border border-slate-700/60 leading-5"
                  >
                    <div className="flex items-center justify-between text-[11px] text-cyan-400 mb-1">
                      <span className="font-bold">کاربر انجمن تکباکس</span>
                      <span className="text-slate-400">لحظاتی پیش</span>
                    </div>
                    <p className="text-xs">{commentText}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
