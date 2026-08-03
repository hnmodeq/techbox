"use client";

import { useMemo, type CSSProperties } from "react";
import Link from "next/link";
import { formatRelativeTime } from "@/lib/date-format";
import { moduleMeta, type ModuleSlug } from "@/lib/content";
import { useHomeTicker } from "@/features/home/lib/home-data";
import { useModuleTitles } from "@/providers/module-config.provider";

type TickerItem = {
  slug: string;
  title: string;
  module?: ModuleSlug | string;
  date?: string;
};

type NewsTickerProps = { items: TickerItem[]; className?: string };

const KNOWN: ModuleSlug[] = ["blog", "news", "media", "review", "tools", "download", "shop", "forum"];
function getModule(item: TickerItem): ModuleSlug {
  return KNOWN.includes(item.module as ModuleSlug) ? (item.module as ModuleSlug) : "blog";
}

export default function NewsTicker({ items, className = "" }: NewsTickerProps) {
  const { items: liveItems } = useHomeTicker();
  const moduleTitles = useModuleTitles();
  const live = liveItems.length ? liveItems : items;
  // The ticker is a compact cross-module recency feed: the ten newest
  // eligible rows across Video, Reviews, Magazine, Forum, and other active
  // modules — never News or Shop, which have their own dedicated surfaces.
  const filtered = useMemo(
    () => live.filter((item) => item.module !== "news" && item.module !== "shop").slice(0, 10),
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
        // Admin-managed `modules.titles` is the same source the main sidebar
        // uses. Never substitute a second hardcoded ticker vocabulary here.
        const moduleTitle = moduleTitles[itemModule] || moduleMeta[itemModule]?.titleFa || itemModule;
        const relativeDate = formatRelativeTime(item.date);
        const style = {
          "--ticker-accent": `var(--module-${itemModule}-color, var(--primary))`,
        } as CSSProperties;
        return (
          <Link
            key={`${duplicate ? "duplicate" : "primary"}-${item.module}-${item.slug}-${index}`}
            href={`/${itemModule}/${item.slug}`}
            tabIndex={duplicate ? -1 : undefined}
            className="ticker-item group flex shrink-0 items-center gap-2 whitespace-nowrap text-xs font-light transition-opacity duration-200 hover:opacity-80"
            style={style}
            dir="rtl"
          >
            {/* RTL reading order: module → title → publication date. */}
            <span className="font-light text-[color:var(--ticker-accent)]">{moduleTitle}</span>
            <span className="font-light text-foreground">{item.title}</span>
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
