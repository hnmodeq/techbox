"use client";

export function CardSkeleton({ imageRatio = "aspect-[16/10]" }: { imageRatio?: string }) {
  return (
    <div className="overflow-hidden rounded-[var(--corner-radius)] border-[length:var(--border-size)] border-[var(--border-color)] bg-[var(--card-background)] shadow-[var(--shadow-size)]">
      <div className={`${imageRatio} animate-pulse bg-[var(--muted-background)]`} />
      <div className="space-y-3 p-4">
        <div className="h-4 w-2/3 animate-pulse rounded-[var(--corner-radius)] bg-[var(--muted-background)]" />
        <div className="h-4 w-full animate-pulse rounded-[var(--corner-radius)] bg-[var(--muted-background)]" />
        <div className="h-4 w-1/2 animate-pulse rounded-[var(--corner-radius)] bg-[var(--muted-background)]" />
      </div>
    </div>
  );
}

export function RowGridSkeleton({ count = 5, imageRatio = "aspect-[16/10]", className = "grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5" }: { count?: number; imageRatio?: string; className?: string }) {
  return (
    <div className={className} aria-label="در حال بارگذاری">
      {Array.from({ length: count }).map((_, index) => <CardSkeleton key={index} imageRatio={imageRatio} />)}
    </div>
  );
}

export function EmptyRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-[var(--corner-radius)] border-[length:var(--border-size)] border-[var(--border-color)] bg-[var(--card-background)] p-6 text-center paragraph-color">
      {children}
    </div>
  );
}
