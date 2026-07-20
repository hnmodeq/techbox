"use client";

/**
 * SuggestionGrid — shows related content based on shared tags.
 *
 * Fetches posts from each allowed module separately so a single module
 * cannot dominate the 200-item fetch limit.
 * Suggests blog, forum, media, download — all must share ≥1 tag.
 */
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { ContentItem } from "@/lib/content";
import { moduleMeta } from "@/lib/content";
import { formatRelativeDate } from "@/lib/date-format";

const SUGGEST_MODULES = ["blog", "forum", "media", "download"] as const;
const PER_MODULE = 30; // fetch this many per module

export default function SuggestionGrid({ current }: { current: ContentItem }) {
  const [items, setItems] = useState<ContentItem[]>([]);

  useEffect(() => {
    // Fetch from each module separately so no module dominates the result pool
    Promise.all(
      SUGGEST_MODULES.map((mod) =>
        fetch(`/api/posts?module=${mod}&take=${PER_MODULE}`, { cache: "no-store" })
          .then((r) => r.json())
          .then((d) => (Array.isArray(d) ? d : []))
          .catch(() => [] as ContentItem[])
      )
    ).then((results) => {
      setItems(results.flat());
    });
  }, []);

  const related = useMemo(() => {
    const tags = new Set((current.tags || []).filter(Boolean));
    if (tags.size === 0) return [];

    return items
      .filter((i) => !(i.module === current.module && i.slug === current.slug))
      .map((i) => ({
        item: i,
        score: (i.tags || []).filter((t) => tags.has(t)).length,
      }))
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 6)
      .map((x) => x.item);
  }, [items, current]);

  if (!related.length) return null;

  return (
    <section className="mt-12 border-t border-[var(--border-color)] pt-8" dir="rtl">
      <h3 className="text-[length:var(--h2-font-size)] text-[var(--h2-font-color)] font-bold mb-4">
        پیشنهادهای مرتبط
      </h3>
      <div className="space-y-2">
        {related.map((item) => {
          const isTopic = item.module === "forum";
          const meta = moduleMeta[item.module];
          return (
            <Link
              key={`${item.module}:${item.slug}`}
              href={`/${item.module}/${item.slug}`}
              className="group flex gap-3 rounded-lg border border-border bg-card p-3 transition hover:bg-muted/40"
            >
              {!isTopic && item.image && (
                <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-md bg-muted">
                  <Image src={item.image} alt={item.title} fill className="object-cover" sizes="64px" unoptimized />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{formatRelativeDate(item.date)}</span>
                  <span
                    className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium"
                    style={{ color: `var(--${item.module})` }}
                  >
                    {meta?.titleFa || item.module}
                  </span>
                </div>
                <div className="mt-0.5 line-clamp-1 font-semibold text-foreground group-hover:underline text-sm">
                  {item.title}
                </div>
                {isTopic && (item as any).authorName && (
                  <div className="text-xs text-muted-foreground mt-0.5">توسط {(item as any).authorName}</div>
                )}
                {!isTopic && item.excerpt && (
                  <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{item.excerpt}</p>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
