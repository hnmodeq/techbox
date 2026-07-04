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

export function TimelineCard({ event, style, importance }: TimelineCardProps) {
  const [liked, setLiked] = useState(false);
  const [showComments, setShowComments] = useState(false);

  const sizeClass =
    importance >= 8
      ? 'w-80 h-96'
      : importance >= 6
        ? 'w-72 h-80'
        : importance >= 4
          ? 'w-64 h-72'
          : 'w-56 h-64';

  const persianDate = getJalaliDateStringPersian(new Date(event.dateGr));
  const cardImage = event.image || fallbackImages[Math.abs((event.title?.length || 0) % fallbackImages.length)];

  return (
    <div
      style={style}
      className={`${sizeClass} shrink-0 bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl overflow-hidden shadow-2xl border border-slate-700 hover:border-cyan-500 transition-all duration-300 hover:shadow-cyan-500/20 flex flex-col select-none`}
    >
      <div className="relative h-36 w-full shrink-0 overflow-hidden bg-slate-700">
        <Image
          src={cardImage}
          alt={event.title || 'تصویر رویداد'}
          fill
          className="object-cover transition-transform duration-500 hover:scale-105"
          sizes="(max-width: 768px) 100vw, 320px"
        />
        <span className="absolute top-2.5 right-2.5 rounded-full border border-white/30 bg-black/50 px-2.5 py-0.5 text-[11px] font-bold text-white backdrop-blur-md">
          {event.yearFa ? `${event.yearFa} شمسی` : ''}
        </span>
      </div>

      <div className="flex-1 p-4 flex flex-col overflow-hidden">
        <div className="text-xs font-bold text-cyan-400 mb-1.5 font-sans">{persianDate}</div>
        <h3 className="text-sm font-bold text-white mb-2 line-clamp-2 leading-6">{event.title}</h3>
        <p className="text-xs text-slate-300 mb-3 line-clamp-3 leading-6 flex-1">{event.description}</p>

        {event.tags && Array.isArray(event.tags) && event.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {(event.tags as string[]).slice(0, 2).map((tag, idx) => (
              <span key={idx} className="text-[11px] bg-cyan-950/50 text-cyan-300 border border-cyan-800/40 px-2 py-0.5 rounded-full">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-slate-700 px-4 py-2.5 flex items-center justify-between bg-slate-800/60 gap-2 shrink-0">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setLiked(!liked);
          }}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
        >
          <Heart size={16} className={liked ? 'fill-red-500 text-red-500' : ''} />
          <span className="text-xs font-bold">{liked ? 1 : 0}</span>
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setShowComments(!showComments);
          }}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-cyan-400 transition-colors cursor-pointer"
        >
          <MessageCircle size={16} />
          <span className="text-xs font-bold">۰ نظر</span>
        </button>
      </div>

      {showComments && (
        <div className="border-t border-slate-700 px-4 py-2 bg-slate-700/40 text-xs text-slate-300">
          <p className="text-center font-bold">نظرات به زودی فعال می‌شوند...</p>
        </div>
      )}
    </div>
  );
}
