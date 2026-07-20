"use client";

import { useState, useCallback } from "react";
import { type ContentItem } from "@/lib/content";
import { Card, CardContent } from "@/components/ui/card";
import { MagazineCard } from "@/components/content/MagazineCard";
import { ArticleModal } from "@/features/blog/components/ArticleModal";

export default function BlogGrid({ serverItems }: { serverItems?: ContentItem[] }) {
  const items = serverItems ?? [];
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const open = useCallback((idx: number) => setActiveIndex(idx), []);
  const close = useCallback(() => setActiveIndex(null), []);
  const prev = useCallback(
    () => setActiveIndex((i) => (i === null ? null : i > 0 ? i - 1 : items.length - 1)),
    [items.length]
  );
  const next = useCallback(
    () => setActiveIndex((i) => (i === null ? null : i < items.length - 1 ? i + 1 : 0)),
    [items.length]
  );

  if (items.length === 0) {
    return (
      <main className="mx-auto max-w-7xl px-4 md:px-8 py-14" dir="rtl">
        <Card className="p-12 text-center">
          <CardContent className="space-y-3">
            <div className="text-4xl">📝</div>
            <h3 className="text-lg font-semibold">هنوز مقاله‌ای منتشر نشده</h3>
            <p className="text-sm text-muted-foreground">به زودی مقالات تخصصی منتشر خواهد شد.</p>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <>
      <main className="mx-auto max-w-5xl px-4 md:px-8 py-14" dir="rtl">

        {/* ── Desktop: timeline tree ── */}
        <div className="relative hidden md:block">
          {/* Center vertical line */}
          <div
            className="absolute top-0 bottom-0 bg-border"
            style={{ right: "50%", width: 1, transform: "translateX(50%)" }}
          />

          <div className="flex flex-col gap-4">
            {items.map((item, idx) => {
              // In RTL: even indices → card on right half, odd → card on left half
              const cardOnRight = idx % 2 === 0;

              return (
                <div key={item.slug} className="relative flex items-center">
                  {/* RIGHT half */}
                  <div className="flex-1 flex justify-end pl-7">
                    {cardOnRight ? (
                      <div className="w-full max-w-[calc(100%-8px)]">
                        <MagazineCard item={item} onOpen={() => open(idx)} />
                      </div>
                    ) : (
                      /* spacer */
                      <div />
                    )}
                  </div>

                  {/* Center dot + horizontal connector lines */}
                  <div className="relative flex-shrink-0 flex items-center justify-center" style={{ width: 28 }}>
                    {/* Horizontal line from dot toward the card */}
                    {cardOnRight && (
                      <div
                        className="absolute bg-border"
                        style={{ right: 14, top: "50%", width: 14, height: 1, transform: "translateY(-50%)" }}
                      />
                    )}
                    {!cardOnRight && (
                      <div
                        className="absolute bg-border"
                        style={{ left: 14, top: "50%", width: 14, height: 1, transform: "translateY(-50%)" }}
                      />
                    )}
                    {/* Dot */}
                    <div className="relative z-10 w-3 h-3 rounded-full bg-primary ring-2 ring-background" />
                  </div>

                  {/* LEFT half */}
                  <div className="flex-1 flex justify-start pr-7">
                    {!cardOnRight ? (
                      <div className="w-full max-w-[calc(100%-8px)]">
                        <MagazineCard item={item} onOpen={() => open(idx)} />
                      </div>
                    ) : (
                      /* spacer */
                      <div />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Mobile / tablet: single/double column ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:hidden">
          {items.map((item, idx) => (
            <MagazineCard key={item.slug} item={item} onOpen={() => open(idx)} />
          ))}
        </div>
      </main>

      {/* Article modal */}
      {activeIndex !== null && items[activeIndex] && (
        <ArticleModal
          item={items[activeIndex] as ContentItem}
          onClose={close}
          onPrev={prev}
          onNext={next}
        />
      )}
    </>
  );
}
