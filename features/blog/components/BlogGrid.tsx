"use client";

import { getModuleItems, type ContentItem } from "@/lib/content";
import { useDbPosts } from "@/hooks/useDbPosts";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { MagazineCard } from "@/components/content/MagazineCard";

export default function BlogGrid({ serverItems }: { serverItems?: ContentItem[] }) {
  const fallbackItems = getModuleItems("blog");
  const { items: dbItems, loading } = useDbPosts("blog", fallbackItems, 100);

  // Prefer server-fetched items when available
  const items = serverItems && serverItems.length > 0 ? serverItems : dbItems;

  return (
    <main className="mx-auto max-w-7xl px-4 md:px-8 py-14" dir="rtl">
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="overflow-hidden aspect-[3/4]">
              <Skeleton className="h-full w-full" />
            </Card>
          ))}
        </div>
      ) : items.length === 0 ? (
        <Card className="p-12 text-center">
          <CardContent className="space-y-3">
            <div className="text-4xl">📝</div>
            <h3 className="text-lg font-semibold">هنوز مقاله‌ای منتشر نشده</h3>
            <p className="text-sm text-muted-foreground">
              به زودی مقالات تخصصی منتشر خواهد شد.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((p) => (
            <MagazineCard key={p.slug} item={p} />
          ))}
        </div>
      )}
    </main>
  );
}
