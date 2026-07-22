'use client';

import React, { useState, useEffect, useRef } from 'react';
import { TimelineEvent } from '@/types/timeline';
import { Heart, MessageCircle, X } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTimelineLiked } from '@/providers/timeline-likes.provider';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';

interface TimelineCardProps {
  event: TimelineEvent;
  style?: React.CSSProperties;
  importance: number;
}

export function TimelineCard({ event, style, importance }: TimelineCardProps) {
  const serverLikes = typeof (event as any).likesCount === 'number' ? (event as any).likesCount : -1;
  const serverComments = typeof (event as any).commentsCount === 'number' ? (event as any).commentsCount : -1;

  const { liked: contextLiked, setLiked: setContextLiked } = useTimelineLiked(event.id);
  const [localLiked, setLocalLiked] = useState<boolean | null>(null);
  const liked = localLiked !== null ? localLiked : contextLiked;

  const [likesCount, setLikesCount] = useState<number>(serverLikes);
  const [commentsCount, setCommentsCount] = useState<number>(serverComments);
  const [likeBusy, setLikeBusy] = useState(false);

  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Array<{ id?: string; authorName: string; text: string; createdAt: string }>>(
    Array.isArray((event as any).comments)
      ? (event as any).comments
          .filter((c: any) => !String(c.text || '').startsWith('[missing]') && !String(c.text || '').startsWith('[future]'))
          .map((c: any) => ({
            id: c.id,
            authorName: c.authorName || 'عضو تکباکس',
            text: c.text,
            createdAt: typeof c.createdAt === 'string' ? c.createdAt : new Date(c.createdAt).toISOString(),
          }))
      : []
  );
  const [newCommentText, setNewCommentText] = useState('');
  const [commentError, setCommentError] = useState('');

  // Ref for the comment scroll area — used to trap wheel events
  const commentScrollRef = useRef<HTMLDivElement>(null);

  // Trap wheel events inside the comment area so only it scrolls
  useEffect(() => {
    const el = commentScrollRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      const { scrollTop, scrollHeight, clientHeight } = el;
      const atTop = scrollTop === 0 && e.deltaY < 0;
      const atBottom = scrollTop + clientHeight >= scrollHeight && e.deltaY > 0;
      if (!atTop && !atBottom) {
        e.preventDefault();
        e.stopPropagation();
        el.scrollTop += e.deltaY;
      } else {
        e.stopPropagation();
      }
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [showComments]);

  // Extract event sub-properties for stable dependency tracking
  const eventLikesCount = (event as any).likesCount;
  const eventCommentsCount = (event as any).commentsCount;
  const eventComments = (event as any).comments;

  // Keep local state in sync if the parent re-fetches the event payload.
  useEffect(() => {
    if (typeof eventLikesCount === 'number') setLikesCount(eventLikesCount);
  }, [eventLikesCount]);

  useEffect(() => {
    if (typeof eventCommentsCount === 'number') setCommentsCount(eventCommentsCount);
  }, [eventCommentsCount]);

  useEffect(() => {
    if (Array.isArray(eventComments)) {
      const filtered = eventComments
        .filter((c: any) => !String(c.text || '').startsWith('[missing]') && !String(c.text || '').startsWith('[future]'))
        .map((c: any) => ({
          id: c.id,
          authorName: c.authorName || 'عضو تکباکس',
          text: c.text,
          createdAt: typeof c.createdAt === 'string' ? c.createdAt : new Date(c.createdAt).toISOString(),
        }));
      setComments(filtered);
    }
  }, [eventComments]);

  const widthClass =
    importance >= 8
      ? 'w-72 sm:w-80'
      : importance >= 6
        ? 'w-64 sm:w-72'
        : 'w-60 sm:w-64';

  const handleLikeToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    if (likeBusy) return;
    setLikeBusy(true);

    const prevLiked = liked;
    const nextLiked = !liked;
    const prevCount = likesCount;

    // Optimistic update
    setLocalLiked(nextLiked);
    setContextLiked(nextLiked);
    setLikesCount(nextLiked ? prevCount + 1 : Math.max(0, prevCount - 1));

    try {
      const res = await fetch('/api/timeline/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId: event.id }),
      });

      if (res.status === 401) {
        setLocalLiked(prevLiked);
        setContextLiked(prevLiked);
        setLikesCount(prevCount);
        window.dispatchEvent(new CustomEvent('tb_open_auth'));
        setLikeBusy(false);
        return;
      }

      if (res.ok) {
        const data = await res.json();
        setLocalLiked(data.liked);
        setContextLiked(data.liked);
        if (typeof data.likes === 'number') setLikesCount(data.likes);
      } else {
        setLocalLiked(prevLiked);
        setContextLiked(prevLiked);
        setLikesCount(prevCount);
      }
    } catch {
      setLocalLiked(prevLiked);
      setContextLiked(prevLiked);
      setLikesCount(prevCount);
    } finally {
      setLikeBusy(false);
    }
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
        window.dispatchEvent(new CustomEvent('tb_open_auth'));
        return;
      }

      if (res.ok) {
        const created = await res.json();
        setComments((prev) => [
          {
            id: created.id,
            authorName: created.authorName || 'شما',
            text: created.text,
            createdAt: new Date(created.createdAt || Date.now()).toISOString(),
          },
          ...prev,
        ]);
        setCommentsCount((n) => n + 1);
        setNewCommentText('');
      } else {
        const err = await res.json();
        setCommentError(err.message || err.error || 'خطا در ثبت نظر');
      }
    } catch {
      setCommentError('خطا در برقراری ارتباط با سرور');
    }
  };

  const formatTime = (iso: string) => {
    try {
      const d = new Date(iso);
      // eslint-disable-next-line react-hooks/purity
      const diff = Date.now() - d.getTime();
      if (diff < 60_000) return 'لحظاتی پیش';
      if (diff < 3_600_000) return `${Math.floor(diff / 60_000).toLocaleString('fa-IR')} دقیقه پیش`;
      if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000).toLocaleString('fa-IR')} ساعت پیش`;
      return `${Math.floor(diff / 86_400_000).toLocaleString('fa-IR')} روز پیش`;
    } catch {
      return '';
    }
  };

  return (
    <div
      style={style}
      className={`${widthClass} shrink-0 flex flex-col justify-start relative select-none`}
      onDragStart={(e) => e.preventDefault()}
    >
      <div className="relative h-[440px] sm:h-[460px] w-full rounded-lg overflow-hidden shadow-sm border border-border flex flex-col justify-end bg-card">
        {/* Background image + gradient */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          {event.image ? (
            <Image
              src={event.image}
              alt={event.title || 'تصویر رویداد'}
              fill
              className="object-cover pointer-events-none"
              draggable={false}
              sizes="(max-width: 768px) 100vw, 320px"
            />
          ) : (
            <div className="h-full w-full bg-muted" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/85 to-transparent" />
        </div>

        {/* Card content */}
        <div className="relative z-10 p-4 flex flex-col justify-end h-full text-foreground">
          <div className="flex-1 flex flex-col justify-end overflow-hidden mb-4">
            <h3 className="font-bold text-foreground mb-2 line-clamp-2 leading-6">
              {event.title}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-6 leading-5">
              {event.description}
            </p>
          </div>

          {/* Like + Comment buttons */}
          <div className="border-t border-white/20 pt-3 flex items-center justify-between gap-2 shrink-0">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger
                  render={
                    <button
                      type="button"
                      onClick={handleLikeToggle}
                      className="flex items-center gap-1.5 text-sm font-bold cursor-pointer text-muted-foreground"
                      aria-pressed={liked}
                    />
                  }
                >
                  <Heart
                    size={16}
                    fill={liked ? 'currentColor' : 'none'}
                    strokeWidth={2}
                    className={liked ? 'text-red-500' : 'text-muted-foreground hover:text-red-500 transition-colors'}
                  />
                  {likesCount >= 0 && (
                    <span className="text-muted-foreground tabular-nums">
                      {likesCount.toLocaleString('fa-IR')}
                    </span>
                  )}
                </TooltipTrigger>
                <TooltipContent>تعداد پسندها</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger
                  render={
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setShowComments(!showComments); }}
                      className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer font-bold"
                      aria-expanded={showComments}
                    />
                  }
                >
                  <MessageCircle size={16} />
                  {commentsCount >= 0 && <span>{commentsCount.toLocaleString('fa-IR')}</span>}
                </TooltipTrigger>
                <TooltipContent>دیدگاه کاربران</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* Comments overlay */}
        {showComments && (
          <div
            className="absolute inset-0 z-30 flex flex-col bg-background/90 backdrop-blur-sm animate-in fade-in-0 slide-in-from-bottom-4 duration-200"
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
            onDragStart={(e) => e.preventDefault()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 pt-3 pb-2 border-b border-border shrink-0">
              <span className="text-sm font-bold text-foreground">دیدگاه‌های شما</span>
              <button
                type="button"
                onClick={() => setShowComments(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="بستن"
              >
                <X size={16} />
              </button>
            </div>

            {/* Scrollable comment list — wheel trapped inside */}
            <div
              ref={commentScrollRef}
              className="flex-1 overflow-y-auto overscroll-contain"
              style={{ scrollbarWidth: 'thin' }}
            >
              <ul className="space-y-2 p-3 text-right">
                {comments.length === 0 && (
                  <li className="rounded-md bg-muted/20 p-2.5 text-xs text-muted-foreground border border-border text-center">
                    هنوز نظری ثبت نشده است.
                  </li>
                )}
                {comments.map((comment, idx) => (
                  <li key={comment.id || idx} className="rounded-md bg-muted/20 p-2.5 text-xs border border-border leading-5">
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="font-bold text-primary">{comment.authorName}</span>
                      <span className="text-muted-foreground">{formatTime(comment.createdAt)}</span>
                    </div>
                    <p className="text-foreground">{comment.text}</p>
                  </li>
                ))}
              </ul>
            </div>

            {/* Comment input */}
            <form onSubmit={handleAddComment} className="p-3 border-t border-border bg-card shrink-0">
              <div className="flex gap-1.5 items-center">
                <Input
                  type="text"
                  value={newCommentText}
                  onChange={(e) => { setNewCommentText(e.target.value); setCommentError(''); }}
                  placeholder="نظر شما..."
                  className="h-9 flex-1 text-sm bg-background"
                />
                <Button type="submit" size="sm" className="h-9 shrink-0 px-3">
                  ثبت نظر
                </Button>
              </div>
              {commentError && <p className="text-[11px] text-destructive mt-1.5">{commentError}</p>}
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
