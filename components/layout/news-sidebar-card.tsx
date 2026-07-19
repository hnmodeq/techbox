"use client";

import React, { useState } from "react";
import Image from "next/image";
import { formatRelativeTime } from "@/lib/date-format";
import { LikeButton } from "@/components/ui/like-button";
import CommentSection from "@/features/comment/components/CommentSection";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { AnimatePresence, motion } from "framer-motion";

export function NewsSidebarCard({ news, isUnread }: { news: any; isUnread: boolean }) {
  const [showComments, setShowComments] = useState(false);

  return (
    <div className="flex flex-col w-full relative rounded-lg overflow-hidden border border-border/20 shadow-sm bg-[var(--card-background)]">
      {/* Image & Content Container (Fixed Height) */}
      <div className="relative h-[300px] w-full flex flex-col justify-between p-4 shrink-0">
        {/* Full-bleed background image */}
        <div className="absolute inset-0 z-0">
          <Image
            src={news.image || "/assets/blog-1.jpg"}
            alt={news.title}
            fill
            className="object-cover"
            sizes="(min-width: 768px) 300px, 100vw"
            quality={100}
          />
          {/* Dark gradients for legibility */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-black/90 pointer-events-none" />
        </div>

        {isUnread && (
          <span className="absolute top-3 right-3 z-10 size-2.5 rounded-full bg-red-500 ring-2 ring-black" />
        )}

        <div className="relative z-10 flex-1 min-w-0 text-start pt-2 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
          <div className="text-sm font-bold leading-6 text-white drop-shadow-sm">
            {news.title}
          </div>
          <div className="mt-3 flex items-center flex-wrap gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger
                  render={<span className="text-xs text-white/80 font-medium cursor-default" />}
                >
                  {formatRelativeTime(news.date)}
                </TooltipTrigger>
                <TooltipContent>تاریخ انتشار خبر</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {news.source && (
              <>
                <span className="text-white/50">•</span>
                <span className="text-[10px] text-white/60 font-medium">منبع: {news.source}</span>
              </>
            )}
          </div>
        </div>
      
        {/* Actions */}
        <div className="relative z-10 flex items-center gap-3 pt-3 mt-auto shrink-0 border-t border-white/20">
          <LikeButton contentType="news" slug={news.slug} initial={news.likes || 0} hideText lightMode />
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger
                render={
                  <button
                    onClick={() => setShowComments(!showComments)}
                    className="text-[11px] font-bold text-white/90 hover:text-white transition-colors"
                  />
                }
              >
                مشاهده دیدگاه‌ها ({news.comments || 0})
              </TooltipTrigger>
              <TooltipContent>تعداد دیدگاه‌ها</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Waterfall Comments Dropdown */}
      <AnimatePresence initial={false}>
        {showComments && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="w-full bg-[var(--card-background)] border-t border-border">
              <div className="max-h-[300px] overflow-y-auto px-3 pb-3 overscroll-contain">
                <CommentSection module="news" slug={news.slug} compact />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
