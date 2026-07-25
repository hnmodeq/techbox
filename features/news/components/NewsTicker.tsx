"use client";

import { useMemo } from "react";
import Link from "next/link";
import { formatRelativeTime } from "@/lib/date-format";
import { moduleMeta, type ModuleSlug } from "@/lib/content";
import { useHomeTicker } from "@/features/home/lib/home-data";

type TickerItem = {
  slug: string;
  title: string;
  module?: ModuleSlug | string;
  date?: string;
};

type NewsTickerProps = { items: TickerItem[]; className?: string };

const KNOWN: ModuleSlug[] = ["blog", "news", "media", "review", "tools", "download", "shop", "forum"];
const moduleCopy: Partial<Record<ModuleSlug, { type: string; action: string }>> = {
  blog: { type: "مقاله", action: "منتشر شد" },
  news: { type: "خبر", action: "منتشر شد" },
  media: { type: "ویدیو", action: "منتشر شد" },
  review: { type: "نقد و بررسی", action: "منتشر شد" },
  download: { type: "فایل", action: "اضافه شد" },
  shop: { type: "محصول", action: "اضافه شد" },
  forum: { type: "موضوع", action: "ایجاد شد" },
  tools: { type: "ابزار", action: "اضافه شد" },
};

function getModule(item: TickerItem): ModuleSlug {
  return KNOWN.includes(item.module as ModuleSlug) ? (item.module as ModuleSlug) : "blog";
}

export default function NewsTicker({ items, className = "" }: NewsTickerProps) {
  const { items: liveItems } = useHomeTicker();
  const live = liveItems.length ? liveItems : items;
  const filtered = useMemo(
    () => live.filter((item) => item.module !== "news" && item.module !== "shop").slice(0, 30),
    [live]
  );
  if (!filtered.length) return null;

  const renderGroup = (duplicate: boolean) => (
    <div
      className="ticker-group flex shrink-0 items-center gap-8 py-1"
      aria-hidden={duplicate || undefined}
    >
      {filtered.map((item, index) => {
        const itemModule = getModule(item);
        const copy = moduleCopy[itemModule] ?? {
          type: moduleMeta[itemModule]?.titleFa || itemModule,
          action: "منتشر شد",
        };
        const relativeDate = formatRelativeTime(item.date);
        return (
          <Link
            key={`${duplicate ? "duplicate" : "primary"}-${item.module}-${item.slug}-${index}`}
            href={`/${itemModule}/${item.slug}`}
            tabIndex={duplicate ? -1 : undefined}
            className="ticker-item group flex shrink-0 items-center gap-2 whitespace-nowrap text-xs font-light text-foreground transition-colors duration-200 hover:text-foreground/80"
            dir="rtl"
          >
            <span className="size-1.5 shrink-0 rounded-full bg-muted-foreground/50" />
            <span className="font-light text-foreground">
              {copy.type}{" "}<span>{item.title}</span>{" "}<span>{copy.action}.</span>
            </span>
            {relativeDate && <span className="shrink-0 font-light text-muted-foreground">{relativeDate}</span>}
          </Link>
        );
      })}
    </div>
  );

  return (
    <section className={`w-full max-w-full overflow-hidden ${className}`} aria-label="آخرین به‌روزرسانی‌ها">
      <div dir="ltr" className="ticker-wrapper relative w-full max-w-full overflow-hidden">
        <div className="ticker-track flex w-max min-w-max items-center motion-reduce:transform-none">
          {renderGroup(false)}
          {renderGroup(true)}
        </div>
      </div>
    </section>
  );
}
