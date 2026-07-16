"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { ArticleCardSkeleton, VideoCardSkeleton } from "@/components/ui/skeleton-layouts";

export function CardSkeleton({ imageRatio = "aspect-[16/10]" }: { imageRatio?: string }) {
  return <ArticleCardSkeleton />;
}

export function VideoCardSkeletonWrapper() {
  return <VideoCardSkeleton />;
}

export function RowGridSkeleton({ count = 5, imageRatio = "aspect-[16/10]", className = "grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5" }: { count?: number; imageRatio?: string; className?: string }) {
  return (
    <div className={className} aria-label="در حال بارگذاری">
      {Array.from({ length: count }).map((_, index) => <CardSkeleton key={index} imageRatio={imageRatio} />)}
    </div>
  );
}

export function VideoRowGridSkeleton({ count = 5, className = "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4" }: { count?: number; className?: string }) {
  return (
    <div className={className} aria-label="در حال بارگذاری">
      {Array.from({ length: count }).map((_, index) => <VideoCardSkeleton key={index} />)}
    </div>
  );
}

export function EmptyRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-[var(--card-background)] border-[length:var(--border-size)] border-[var(--border-color)] rounded-[var(--corner-radius)] p-6 text-center text-muted-foreground">
      {children}
    </div>
  );
}
