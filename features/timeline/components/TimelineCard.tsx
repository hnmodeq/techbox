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

  return (
    <div
      style={style}
      className={`${sizeClass} flex-shrink-0 bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl overflow-hidden shadow-2xl border border-slate-700 hover:border-blue-500 transition-all hover:shadow-blue-500/20 flex flex-col`}
    >
      {event.image && (
        <div className="relative h-32 w-full overflow-hidden bg-slate-700">
          <Image
            src={event.image}
            alt={event.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      )}

      <div className="flex-1 p-4 flex flex-col overflow-hidden">
        <div className="text-xs font-bold text-blue-400 mb-2 font-sans">{persianDate}</div>
        <h3 className="text-sm font-bold text-white mb-2 line-clamp-2">{event.title}</h3>
        <p className="text-xs text-slate-300 mb-3 line-clamp-3 flex-1">{event.description}</p>

        {event.tags && event.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {event.tags.slice(0, 2).map((tag, idx) => (
              <span key={idx} className="text-xs bg-blue-900/40 text-blue-300 px-2 py-1 rounded-full">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-slate-700 px-4 py-3 flex items-center justify-between bg-slate-800/50 gap-2">
        <button
          onClick={() => setLiked(!liked)}
          className="flex items-center gap-1 text-xs text-slate-400 hover:text-red-500 transition-colors"
        >
          <Heart size={16} className={liked ? 'fill-red-500 text-red-500' : ''} />
          <span className="text-xs">0</span>
        </button>

        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-1 text-xs text-slate-400 hover:text-blue-500 transition-colors"
        >
          <MessageCircle size={16} />
          <span className="text-xs">0</span>
        </button>
      </div>

      {showComments && (
        <div className="border-t border-slate-700 px-4 py-2 bg-slate-700/30 text-xs text-slate-400">
          <p className="text-center">نظرات به زودی...</p>
        </div>
      )}
    </div>
  );
}
