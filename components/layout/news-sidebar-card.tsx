"use client";

import React, { useState } from "react";
import Image from "next/image";
import { formatRelativeDate, formatRelativeTime } from "@/lib/date-format";
import { LikeButton } from "@/components/ui/like-button";
import CommentSection from "@/features/comment/components/CommentSection";

export function NewsSidebarCard({ news, isUnread }: { news: any; isUnread: boolean }) {
  const [showComments, setShowComments] = useState(false);

  return (
    <div className="flex flex-col w-full relative rounded-lg overflow-hidden group">
      {/* Full-bleed background image */}
      <div className="absolute inset-0 z-0">
        <Image
          src={news.image || "/assets/blog-1.jpg"}
          alt={news.title}
          fill
          className="object-cover transition-transform duration-[400ms] group-hover:scale-105"
          sizes="(min-width: 768px) 300px, 100vw"
          quality={100}
        />
        {/* Dark gradients for legibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-black/90 pointer-events-none" />
      </div>

      {isUnread && (
        <span className="absolute top-3 right-3 z-10 size-2.5 rounded-full bg-red-500 ring-2 ring-black" />
      )}

      <div className="relative z-10 flex flex-col justify-between p-4 h-full min-h-[220px]">
        <div className="flex-1 min-w-0 text-start pt-2">
          <div className="text-sm font-bold line-clamp-3 leading-6 text-white drop-shadow-sm">
            {news.title}
          </div>
          <div className="mt-2 text-xs text-white/80 font-medium">
            {formatRelativeTime(news.date)}
          </div>
        </div>
      
        {/* Actions */}
        <div className="flex items-center gap-3 pt-4 mt-auto">
          <LikeButton contentType="news" slug={news.slug} initial={news.likes || 0} tooltipLabel="پسندیدن این خبر" hideText lightMode />
          <button
            onClick={() => setShowComments(!showComments)}
            className="text-[11px] font-bold text-white/90 hover:text-white transition-colors"
          >
            مشاهده دیدگاه‌ها ({news.comments || 0})
          </button>
        </div>
      </div>

      {/* Waterfall Comments Overlay inline */}
      {showComments && (
        <div className="relative z-10 bg-background/95 backdrop-blur border-t border-border pt-2 w-full px-3 pb-3">
          <CommentSection module="news" slug={news.slug} compact />
        </div>
      )}
    </div>
  );
}
