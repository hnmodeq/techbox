"use client";

import { Skeleton } from "@/components/ui/skeleton";

/* ═══════════════════════════════════════════════════════════════════
   DETAILED SKELETON LAYOUTS
   ────────────────────────────────────────────────────────────────
   Each skeleton mimics the real layout of its content area so users
   can anticipate where content will appear. Uses the shimmer
   animation from the Skeleton component.
   ═══════════════════════════════════════════════════════════════════ */

// ─── Comment Form Skeleton ────────────────────────────────────────
// Mimics: avatar + name, textarea, submit button
export function CommentFormSkeleton() {
  return (
    <div className="bg-[var(--card-background)] border-[length:var(--border-size)] border-[var(--border-color)] rounded-[var(--corner-radius)] p-5 space-y-4 mb-8">
      <div className="flex items-center gap-3 border-b-[length:var(--border-size)] border-[var(--border-color)] pb-3">
        <Skeleton className="h-9 w-9 rounded-full shrink-0" />
        <div className="space-y-2">
          <Skeleton className="h-3 w-20 rounded" />
          <Skeleton className="h-2.5 w-14 rounded" />
        </div>
      </div>
      <Skeleton className="h-24 w-full rounded-[var(--corner-radius)]" />
      <div className="flex justify-end">
        <Skeleton className="h-8 w-28 rounded-[var(--corner-radius)]" />
      </div>
    </div>
  );
}

// ─── Single Comment Card Skeleton ─────────────────────────────────
// Mimics: avatar, name, date, text lines, heart + reply buttons
export function CommentCardSkeleton() {
  return (
    <div className="bg-[var(--card-background)] border-[length:var(--border-size)] border-[var(--border-color)] rounded-[var(--corner-radius)] shadow-[var(--shadow-size)] p-4 space-y-3">
      {/* Avatar + name + date row */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-full shrink-0" />
          <Skeleton className="h-3 w-20 rounded" />
        </div>
        <Skeleton className="h-2.5 w-14 rounded" />
      </div>
      {/* Text lines */}
      <div className="space-y-2">
        <Skeleton className="h-3 w-full rounded" />
        <Skeleton className="h-3 w-4/5 rounded" />
      </div>
      {/* Action buttons: heart + count + reply */}
      <div className="flex items-center gap-4">
        <Skeleton className="h-5 w-16 rounded" />
        <Skeleton className="h-5 w-10 rounded" />
      </div>
    </div>
  );
}

// ─── Comment List Skeleton ─────────────────────────────────────────
// Mimics: 2-3 comment cards with one having a nested reply
export function CommentListSkeleton() {
  return (
    <div className="space-y-3">
      {/* First comment */}
      <CommentCardSkeleton />
      {/* Second comment with a reply */}
      <div>
        <CommentCardSkeleton />
        {/* Reply (indented with border line) */}
        <div className="border-r-2 border-[var(--border-color)] pe-4 ps-3" style={{ marginRight: 16 }}>
          <div className="mt-3">
            <CommentCardSkeleton />
          </div>
        </div>
      </div>
      {/* Third comment */}
      <CommentCardSkeleton />
    </div>
  );
}

// ─── Full Comment Section Skeleton ─────────────────────────────────
// Combines form skeleton + list skeleton
export function CommentSectionSkeleton() {
  return (
    <section className="mt-14 border-t-[length:var(--border-size)] border-[var(--border-color)] pt-10">
      <div className="flex items-center justify-between mb-6">
        <Skeleton className="h-7 w-40 rounded" />
      </div>
      <CommentFormSkeleton />
      <CommentListSkeleton />
    </section>
  );
}

// ─── Video Modal Info Panel Skeleton ──────────────────────────────
// Mimics: title, excerpt, like/save/share, comment section
export function VideoModalInfoSkeleton() {
  return (
    <div className="min-w-0 sm:min-w-[340px] sm:max-w-[520px] sm:flex-1 p-4 sm:p-5 space-y-4">
      {/* Title + close button */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-2 flex-1">
          <Skeleton className="h-6 w-4/5 rounded" />
          <Skeleton className="h-4 w-full rounded" />
          <Skeleton className="h-4 w-2/3 rounded" />
        </div>
        <Skeleton className="h-8 w-8 rounded-[var(--corner-radius)] shrink-0" />
      </div>
      {/* Like / Save / Share buttons */}
      <div className="flex items-center gap-3" dir="ltr">
        <Skeleton className="h-8 w-24 rounded-[var(--corner-radius)]" />
        <Skeleton className="h-8 w-20 rounded-[var(--corner-radius)]" />
        <Skeleton className="h-8 w-16 rounded-[var(--corner-radius)]" />
      </div>
      {/* Comment section area */}
      <div className="border-t-[length:var(--border-size)] border-[var(--border-color)] pt-4 space-y-3">
        <Skeleton className="h-6 w-36 rounded" />
        {/* Comment form */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="space-y-1.5">
              <Skeleton className="h-2.5 w-16 rounded" />
              <Skeleton className="h-2 w-12 rounded" />
            </div>
          </div>
          <Skeleton className="h-20 w-full rounded-[var(--corner-radius)]" />
          <div className="flex justify-end">
            <Skeleton className="h-7 w-24 rounded-[var(--corner-radius)]" />
          </div>
        </div>
        {/* A couple comment cards */}
        <CommentCardSkeleton />
        <CommentCardSkeleton />
      </div>
    </div>
  );
}

// ─── Video Modal Full Skeleton ─────────────────────────────────────
// Video placeholder (dark) + info panel skeleton
export function VideoModalSkeleton() {
  return (
    <div className="flex flex-col sm:flex-row max-h-[92vh] overflow-hidden rounded-[var(--corner-radius)] bg-[var(--modal-background)] border-[length:var(--border-size)] border-[var(--border-color)] shadow-[var(--shadow-size)]">
      {/* Video placeholder */}
      <div className="bg-[var(--muted-background)] shrink-0 flex items-center justify-center h-[50vh] sm:h-[92vh] sm:max-w-[45vw] w-full sm:w-auto">
        <Skeleton className="h-12 w-12 rounded-full" />
      </div>
      <VideoModalInfoSkeleton />
    </div>
  );
}

// ─── Article Card Skeleton ─────────────────────────────────────────
// Mimics: image, title, excerpt, stats + author row
export function ArticleCardSkeleton() {
  return (
    <div className="overflow-hidden border-[length:var(--border-size)] border-[var(--border-color)] rounded-[var(--corner-radius)] bg-[var(--card-background)] shadow-[var(--shadow-size)]">
      <Skeleton className="aspect-[16/10] w-full rounded-none" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-4 w-4/5 rounded" />
        <Skeleton className="h-3 w-full rounded" />
        <Skeleton className="h-3 w-2/3 rounded" />
      </div>
      <div className="border-t px-4 pb-4 pt-3 flex items-center justify-between gap-2" dir="ltr">
        <Skeleton className="h-4 w-28 rounded" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-6 rounded-full" />
          <Skeleton className="h-3 w-16 rounded" />
        </div>
      </div>
    </div>
  );
}

// ─── Video Card Skeleton ───────────────────────────────────────────
// Mimics: portrait image, overlay, title, stats
export function VideoCardSkeleton() {
  return (
    <div className="relative w-full aspect-[9/16] rounded-[var(--corner-radius)] overflow-hidden border border-border shadow-sm bg-[var(--muted-background)]">
      <Skeleton className="absolute inset-0 rounded-none" />
      {/* Overlay gradient mimic */}
      <div className="absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-black/20 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/40 to-transparent" />
      {/* Play icon placeholder */}
      <div className="absolute inset-0 flex items-center justify-center">
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
      {/* Title + stats at bottom */}
      <div className="absolute bottom-0 inset-x-0 p-3 space-y-2">
        <Skeleton className="h-3 w-4/5 rounded" />
        <Skeleton className="h-3 w-20 rounded" />
      </div>
    </div>
  );
}
