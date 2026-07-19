"use client";

import React, { useState } from "react";
import Image from "next/image";
import { formatRelativeDate, formatRelativeTime } from "@/lib/date-format";
import { LikeButton } from "@/components/ui/like-button";
import CommentSection from "@/features/comment/components/CommentSection";

export function NewsSidebarCard({ news, isUnread }: { news: any; isUnread: boolean }) {
  const [showComments, setShowComments] = useState(false);

  return (
    <div className="flex flex-col w-full px-2 py-3 gap-3">
      <div className="flex items-start gap-3 w-full">
        <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-lg bg-muted">
          <Image
            src={news.image || "/assets/blog-1.jpg"}
            alt={news.title}
            fill
            className="object-cover"
            sizes="(min-width: 768px) 96px, 96px"
            quality={100}
          />
          {isUnread && (
            <span className="absolute top-1 right-1 size-2 rounded-full bg-red-500 ring-2 ring-background" />
          )}
        </div>
        <div className="flex-1 min-w-0 text-start">
          <div className="flex items-start gap-1.5">
            {isUnread && <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-red-500" />}
            <div className="text-xs font-bold line-clamp-3 leading-5 text-foreground">
              {news.title}
            </div>
          </div>
          <div className="mt-1.5 text-[10px] text-muted-foreground flex items-center justify-between">
            <span>{formatRelativeTime(news.date)}</span>
          </div>
        </div>
      </div>
      
      {/* Actions */}
      <div className="flex items-center gap-3">
        <LikeButton contentType="news" slug={news.slug} initial={news.likes || 0} tooltipLabel="پسندیدن این خبر" />
        <button
          onClick={() => setShowComments(!showComments)}
          className="text-[11px] font-bold text-muted-foreground hover:text-primary transition-colors"
        >
          مشاهده بیشتر ({news.comments || 0})
        </button>
      </div>

      {/* Waterfall Comments Overlay inline */}
      {showComments && (
        <div className="mt-2 border-t border-border/50 pt-2 w-full">
          <CommentSection module="news" slug={news.slug} />
        </div>
      )}
    </div>
  );
}
