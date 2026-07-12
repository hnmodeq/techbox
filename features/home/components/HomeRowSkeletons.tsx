"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function CardSkeleton({ imageRatio = "aspect-[16/10]" }: { imageRatio?: string }) {
  return (
    <Card className="overflow-hidden">
      <Skeleton className={`${imageRatio} w-full`} />
      <CardContent className="p-4 space-y-3">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-1/2" />
      </CardContent>
    </Card>
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
    <Card className="p-6 text-center text-muted-foreground">
      {children}
    </Card>
  );
}
