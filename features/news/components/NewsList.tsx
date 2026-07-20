"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import { type ContentItem } from "@/lib/content";
import { formatRelativeDate } from "@/lib/date-format";
import { LikeButton } from "@/components/ui/like-button";
import CommentSection from "@/features/comment/components/CommentSection";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const PAGE_SIZE = 10;

// ─── Single news card ────────────────────────────────────────────────────────

function NewsCard({ item }: { item: any }) {
  const [showComments, setShowComments] = useState(false);

  return (
    <article
      className="rounded-xl border border-border bg-card overflow-hidden"
      dir="rtl"
    >
      {/* Card body: image left, text right */}
      <div className="flex gap-0 sm:gap-0 flex-col sm:flex-row">
        {/* Thumbnail — fixed width column, never overlaps text */}
        {item.image && (
          <div className="relative sm:w-52 sm:shrink-0 aspect-[16/9] sm:aspect-auto sm:h-auto overflow-hidden bg-muted">
            <Image
              src={item.image}
              alt={item.title}
              fill
              sizes="(min-width:640px) 208px, 100vw"
              className="object-cover"
              quality={90}
            />
          </div>
        )}

        {/* Text content */}
        <div className="flex flex-1 flex-col justify-between p-4 min-w-0">
          {/* Date */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2 flex-wrap">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger render={<span className="font-semibold cursor-default" />}>
                  {formatRelativeDate(item.date)}
                </TooltipTrigger>
                <TooltipContent>
                  {new Date(item.date).toLocaleDateString("fa-IR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            {item.source && (
              <>
                <span>•</span>
                <span>منبع: {item.source}</span>
              </>
            )}
          </div>

          {/* Title */}
          <h3 className="text-base font-bold text-foreground leading-6 mb-2">
            {item.title}
          </h3>

          {/* Full description — always visible */}
          {item.excerpt && (
            <p className="text-sm text-muted-foreground leading-7 mb-4">
              {item.excerpt}
            </p>
          )}

          {/* Actions */}
          <div className="flex items-center gap-4 pt-3 border-t border-border/50">
            <LikeButton
              contentType="news"
              slug={item.slug}
              initial={item.likes || 0}
              tooltipLabel="پسندیدن خبر"
            />

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger
                  render={
                    <button
                      type="button"
                      onClick={() => setShowComments((v) => !v)}
                      className={`flex items-center gap-1.5 text-xs font-bold transition-colors ${
                        showComments
                          ? "text-primary"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    />
                  }
                >
                  <MessageCircle size={15} />
                  <span style={{ fontVariantNumeric: "tabular-nums" }}>
                    {(item.comments || 0).toLocaleString("fa-IR")}
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  {showComments ? "بستن دیدگاه‌ها" : "مشاهده دیدگاه‌ها"}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>

      {/* Collapsible comments */}
      <AnimatePresence initial={false}>
        {showComments && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="border-t border-border px-4 pb-4 pt-2">
              <CommentSection module="news" slug={item.slug} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </article>
  );
}

// ─── Page component ──────────────────────────────────────────────────────────

export default function NewsList({ serverItems }: { serverItems?: ContentItem[] }) {
  const items = serverItems ?? [];
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));

  const pageItems = useMemo(
    () => items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [items, page]
  );

  // Scroll to top when page changes
  const goTo = (p: number) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <main className="mx-auto max-w-3xl px-4 md:px-6 py-12" dir="rtl">
      {/* News list */}
      <div className="flex flex-col gap-4">
        {pageItems.length === 0 ? (
          <div className="py-20 text-center text-muted-foreground">هنوز خبری ثبت نشده است.</div>
        ) : (
          pageItems.map((n: any) => <NewsCard key={n.slug} item={n} />)
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-10">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  disabled={page === 1}
                  onClick={() => page > 1 && goTo(page - 1)}
                />
              </PaginationItem>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                .reduce<(number | "…")[]>((acc, p, idx, arr) => {
                  if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("…");
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, i) =>
                  p === "…" ? (
                    <PaginationItem key={`ellipsis-${i}`}>
                      <span className="px-2 text-muted-foreground">…</span>
                    </PaginationItem>
                  ) : (
                    <PaginationItem key={p}>
                      <PaginationLink
                        isActive={page === p}
                        onClick={() => goTo(p as number)}
                      >
                        {(p as number).toLocaleString("fa-IR")}
                      </PaginationLink>
                    </PaginationItem>
                  )
                )}

              <PaginationItem>
                <PaginationNext
                  disabled={page === totalPages}
                  onClick={() => page < totalPages && goTo(page + 1)}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </main>
  );
}
