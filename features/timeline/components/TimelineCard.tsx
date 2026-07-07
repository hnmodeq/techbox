'use client';

import React, { useState, useEffect } from 'react';
import { TimelineEvent } from '@/types/timeline';
import { Heart, MessageCircle, Send } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useTimelineLiked } from '@/providers/timeline-likes.provider';

interface TimelineCardProps {
  event: TimelineEvent;
  style?: React.CSSProperties;
  importance: number;
}

export function TimelineCard({ event, style, importance }: TimelineCardProps) {
  const initialLikesCount = Array.isArray(event.likes)
    ? event.likes.length
    : typeof event.likes === 'number'
      ? event.likes
      : 0;

  const { liked, setLiked } = useTimelineLiked(event.id);
  const [likesCount, setLikesCount] = useState<number>(initialLikesCount);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [commentError, setCommentError] = useState('');

  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Array<{ authorName: string; text: string; createdAt: string }>>(
    Array.isArray(event.comments)
      ? event.comments.map((c: any) => ({ authorName: c.authorName || 'کاربر', text: c.text, createdAt: 'لحظاتی پیش' }))
      : []
  );
  const [newCommentText, setNewCommentText] = useState('');
  const router = useRouter();

  // NOTE: /api/timeline/events already fetches comments + likes for every
  // event in bulk (via Prisma `include`) as part of the single page-load
  // request, and whether the CURRENT user liked each event comes from the
  // single bulk /api/timeline/liked-events request via TimelineLikesProvider
  // (see providers/timeline-likes.provider.tsx). Previously this component
  // fired its own per-card /api/timeline/like and /api/timeline/comments
  // GET requests on mount, meaning a page with N timeline cards made 2N
  // extra redundant DB round trips on top of the bulk fetches that already
  // had the data.

  // Keep local comments/likes state in sync if the `event` prop itself is
  // refreshed (e.g. parent re-fetches the timeline).
  useEffect(() => {
    if (Array.isArray(event.comments) && event.comments.length > 0) {
      setComments(
        event.comments.map((c: any) => ({
          authorName: c.authorName || 'عضو تکباکس',
          text: c.text,
          createdAt: 'لحظاتی پیش',
        }))
      );
    }
  }, [event.comments]);

  useEffect(() => {
    if (Array.isArray(event.likes) && event.likes.length > 0) {
      setLikesCount(event.likes.length);
    }
  }, [event.likes]);

  const widthClass =
    importance >= 8
      ? 'w-72 sm:w-80'
      : importance >= 6
        ? 'w-64 sm:w-72'
        : 'w-60 sm:w-64';

  const handleLikeToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowLoginPrompt(false);
    try {
      const res = await fetch('/api/timeline/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId: event.id }),
      });

      if (res.status === 401) {
        window.dispatchEvent(new CustomEvent("tb_open_auth"));
        return;
      }

      if (res.ok) {
        const data = await res.json();
        setLiked(data.liked);
        if (typeof data.likes === 'number') {
          setLikesCount(data.likes);
        }
      }
    } catch {}
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCommentError('');
    if (!newCommentText.trim()) return;

    try {
      const res = await fetch('/api/timeline/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId: event.id, text: newCommentText.trim() }),
      });

      if (res.status === 401) {
        window.dispatchEvent(new CustomEvent("tb_open_auth"));
        return;
      }

      if (res.ok) {
        const created = await res.json();
        setComments((prev) => [
          { authorName: created.authorName || 'شما', text: created.text, createdAt: 'لحظاتی پیش' },
          ...prev,
        ]);
        setNewCommentText('');
      } else {
        const err = await res.json();
        setCommentError(err.message || err.error || 'خطا در ثبت نظر');
      }
    } catch {
      setCommentError('خطا در برقراری ارتباط با سرور');
    }
  };

  return (
    <div style={style} className={`${widthClass} select-none shrink-0 group flex flex-col justify-start relative`}>
      {/* TIER 1: STRICTLY FIXED HEIGHT CARD BOX */}
      <div className="relative h-[340px] sm:h-[360px] w-full rounded-[var(--corner-radius)] overflow-hidden shadow-[var(--shadow-size)] border-[length:var(--border-size)] border-[var(--border-color)] hover:border-[var(--timeline)] transition-colors duration-[200ms] flex flex-col justify-end bg-slate-950">
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          {event.image ? (
            <Image
              src={event.image}
              alt={event.title || 'تصویر رویداد'}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 320px"
            />
          ) : (
            <div className="h-full w-full bg-[radial-gradient(circle_at_top,var(--timeline),transparent_38%),linear-gradient(145deg,#020617,#0f172a)]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/85 to-transparent" />
        </div>

        <div className="relative z-10 p-4.5 flex flex-col justify-end h-full text-white">
          <div className="flex-1 flex flex-col justify-end overflow-hidden mb-4">
            <h3 className="text-[length:var(--h3-font-size)] text-[var(--h3-font-color)] font-semibold font-bold text-white mb-2 line-clamp-2 leading-7">
              {event.title}
            </h3>
            <p className="text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] text-slate-300 line-clamp-4 leading-6">
              {event.description}
            </p>
          </div>

          <div className="border-t-[length:var(--border-size)] border-white/20 pt-3 flex items-center justify-between gap-2 shrink-0">
            <div className="relative">
              <button
                type="button"
                onClick={handleLikeToggle}
                className="flex items-center gap-1.5 text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] text-slate-300 hover:text-red-400 transition-colors cursor-pointer font-bold"
              >
                <Heart size={16} className={liked ? 'fill-current text-red-500' : ''} />
                <span>{likesCount.toLocaleString('fa-IR')}</span>
              </button>

              {showLoginPrompt && (
                <div className="absolute bottom-full mb-2 right-0 z-50 w-56 rounded-[var(--corner-radius)] border-[length:var(--border-size)] border-[var(--border-color)] bg-slate-900 p-2.5 shadow-[var(--shadow-size)] text-center">
                  <p className="text-xs text-white mb-2">برای پسندیدن رویداد ابتدا وارد شوید.</p>
                  <div className="flex justify-center gap-1.5">
                    <Button size="xs" onClick={() => router.push('/account')}>ورود / عضویت</Button>
                    <Button variant="ghost" size="xs" onClick={() => setShowLoginPrompt(false)}>بستن</Button>
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowComments(!showComments);
              }}
              className="flex items-center gap-1.5 text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] text-slate-300 hover:text-cyan-400 transition-colors cursor-pointer font-bold"
            >
              <MessageCircle size={16} />
              <span>{comments.length.toLocaleString('fa-IR')} نظر</span>
            </button>
          </div>
        </div>
      </div>

      {/* TIER 2: EXPANDING COMMENT DRAWER */}
      {showComments && (
        <div
          className="w-full mt-2 rounded-[var(--corner-radius)] border-[length:var(--border-size)] border-[var(--border-color)] bg-slate-950/95 p-3.5 shadow-[var(--shadow-size)] flex flex-col gap-3 max-h-80 overflow-y-auto animate-in fade-in-0 slide-in-from-top-2 duration-300 z-20"
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          onWheel={(e) => e.stopPropagation()}
        >
          <form onSubmit={handleAddComment} className="flex flex-col gap-2 shrink-0">
            <div className="flex gap-1.5 items-center">
              <input
                type="text"
                value={newCommentText}
                onChange={(e) => {
                  setNewCommentText(e.target.value);
                  setCommentError('');
                }}
                placeholder="نظر یا تجربه خود را بنویسید..."
                className="input !h-9 !py-1 !px-2.5 text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] flex-1 !bg-slate-900 !text-white !border-slate-700"
              />
              <button
                type="submit"
                className="h-9 px-3 rounded-[var(--corner-radius)] bg-[var(--timeline)] text-slate-950 font-bold flex items-center justify-center transition-opacity hover:opacity-90 cursor-pointer shrink-0"
                title="ارسال نظر"
              >
                <Send size={14} className="rtl:rotate-180" />
              </button>
            </div>
            {commentError && (
              <div className="text-[11px] text-red-400 bg-red-950/40 p-1.5 rounded border-[length:var(--border-size)] border-red-800 flex justify-between items-center">
                <span>{commentError}</span>
                <button type="button" onClick={() => router.push('/account')} className="underline font-bold text-white">ورود</button>
              </div>
            )}
          </form>

          <ul className="space-y-2 text-right">
            {comments.length === 0 && (
              <li className="rounded-[var(--corner-radius)] bg-slate-900/70 p-2.5 text-xs text-slate-400 border-[length:var(--border-size)] border-slate-700/60">
                هنوز نظری برای این رویداد ثبت نشده است.
              </li>
            )}
            {comments.map((comment, idx) => (
              <li
                key={idx}
                className="rounded-[var(--corner-radius)] bg-slate-900/90 p-2.5 text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] text-slate-200 border-[length:var(--border-size)] border-slate-700/60 leading-5"
              >
                <div className="flex items-center justify-between text-[11px] text-cyan-400 mb-1">
                  <span className="font-bold">{comment.authorName}</span>
                  <span className="text-slate-400">{comment.createdAt}</span>
                </div>
                <p className="text-xs">{comment.text}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
