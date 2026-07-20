"use client";

/**
 * SuggestionGrid — shows related content based on shared tags, category, and keywords.
 *
 * Scoring (works even when tags are empty — no db:seed-tags required):
 *   +3 per shared tag
 *   +2 shared category (exact match)
 *   +1 per keyword from current title found in candidate title/excerpt
 *
 * This ensures forum/media/download posts are always suggested, not just blog.
 *
 * Tooltips:
 *   - blog/review: "تاریخ انتشار این مقاله"
 *   - media:       "تاریخ انتشار این ویدیو"
 *   - forum:       "تاریخ ایجاد این موضوع"
 *   - download:    "تاریخ انتشار این فایل"
 *   - shop:        موجود / ناموجود badge (prioritise موجود)
 */
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { ContentItem } from "@/lib/content";
import { moduleMeta } from "@/lib/content";
import { formatRelativeDate } from "@/lib/date-format";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";

const SUGGEST_MODULES = ["blog", "forum", "media", "download"] as const;
const PER_MODULE = 30;

const DATE_TOOLTIP: Partial<Record<string, string>> = {
  blog:     "تاریخ انتشار این مقاله",
  review:   "تاریخ انتشار این مقاله",
  media:    "تاریخ انتشار این ویدیو",
  forum:    "تاریخ ایجاد این موضوع",
  download: "تاریخ انتشار این فایل",
  news:     "تاریخ انتشار این خبر",
};

const MIN_KW_LEN = 3;
const STOP_WORDS = new Set([
  "در", "از", "به", "با", "که", "این", "آن", "برای", "های", "یک", "است",
  "و", "یا", "را", "تا", "می", "اما", "اگر", "نیز", "هم",
  "the", "for", "and", "with", "how", "what", "why", "when",
]);

function extractKeywords(text: string): Set<string> {
  const words = text
    .toLowerCase()
    .split(/[\s\-_/،,؟?!:.]+/)
    .map((w) => w.replace(/[«»"'()\[\]{}]/g, "").trim())
    .filter((w) => w.length >= MIN_KW_LEN && !STOP_WORDS.has(w));
  return new Set(words);
}

function scoreItem(current: ContentItem, candidate: ContentItem): number {
  let score = 0;

  // Tag overlap — highest weight (explicit editorial signal)
  const currentTags = new Set((current.tags || []).map((t) => t.toLowerCase().trim()).filter(Boolean));
  const candidateTags = (candidate.tags || []).map((t) => t.toLowerCase().trim()).filter(Boolean);
  for (const tag of candidateTags) {
    if (currentTags.has(tag)) score += 3;
  }

  // Category match — medium weight
  if (
    current.category &&
    candidate.category &&
    current.category.trim().toLowerCase() === candidate.category.trim().toLowerCase()
  ) {
    score += 2;
  }

  // Title/excerpt keyword overlap — low weight fallback when tags/category absent
  const currentKws = extractKeywords(current.title + " " + (current.excerpt || ""));
  const candidateKws = extractKeywords(candidate.title + " " + (candidate.excerpt || ""));
  for (const kw of candidateKws) {
    if (currentKws.has(kw)) score += 1;
  }

  return score;
}

export default function SuggestionGrid({ current }: { current: ContentItem }) {
  const [items, setItems] = useState<ContentItem[]>([]);

  useEffect(() => {
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
    return items
      .filter((i) => !(i.module === current.module && i.slug === current.slug))
      .map((i) => ({ item: i, score: scoreItem(current, i) }))
      .filter((x) => x.score > 0)
      .sort((a, b) => {
        // Shop: prioritise موجود at equal score
        if (a.item.module === "shop" && b.item.module === "shop") {
          const aAvail = a.item.availability !== "ناموجود" ? 1 : 0;
          const bAvail = b.item.availability !== "ناموجود" ? 1 : 0;
          if (aAvail !== bAvail) return bAvail - aAvail;
        }
        return b.score - a.score;
      })
      // Cap at 2 per module so one module can't monopolise the 6 slots
      .reduce<Array<{ item: ContentItem; score: number }>>((acc, x) => {
        const moduleCount = acc.filter((r) => r.item.module === x.item.module).length;
        if (moduleCount < 2) acc.push(x);
        return acc;
      }, [])
      .slice(0, 6)
      .map((x) => x.item);
  }, [items, current]);

  if (!related.length) return null;

  return (
    <TooltipProvider>
      <section className="mt-12 border-t border-[var(--border-color)] pt-8" dir="rtl">
        <h3 className="text-[length:var(--h2-font-size)] text-[var(--h2-font-color)] font-bold mb-4">
          پیشنهادهای مرتبط
        </h3>
        <div className="space-y-2">
          {related.map((item) => {
            const isTopic = item.module === "forum";
            const isShop = item.module === "shop";
            const meta = moduleMeta[item.module];
            const dateTooltip = DATE_TOOLTIP[item.module];
            const relDate = formatRelativeDate(item.date);
            const isUnavailable = item.availability === "ناموجود";

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
                    {isShop ? (
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
                          isUnavailable
                            ? "bg-destructive/10 text-destructive"
                            : "bg-green-500/10 text-green-600 dark:text-green-400"
                        }`}
                      >
                        {isUnavailable ? "ناموجود" : "موجود"}
                      </span>
                    ) : relDate ? (
                      dateTooltip ? (
                        <Tooltip>
                          <TooltipTrigger render={<span className="text-xs text-muted-foreground cursor-default" />}>
                            {relDate}
                          </TooltipTrigger>
                          <TooltipContent>{dateTooltip}</TooltipContent>
                        </Tooltip>
                      ) : (
                        <span className="text-xs text-muted-foreground">{relDate}</span>
                      )
                    ) : null}

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
    </TooltipProvider>
  );
}
