import Link from "next/link";
import { moduleColors } from "@/config/module-colors";

type NewsItem = {
  slug: string;
  title: string;
  module?: "news" | "blog" | string;
};

type NewsTickerProps = {
  items: NewsItem[];
  className?: string;
};

function getTickerModule(item: NewsItem) {
  return item.module === "blog" || item.module === "news" ? item.module : "news";
}

function getTickerHref(item: NewsItem) {
  return `/${getTickerModule(item)}/${item.slug}`;
}

export default function NewsTicker({ items, className = "" }: NewsTickerProps) {
  if (!items?.length) return null;

  const loopItems = [...items, ...items, ...items];

  return (
    <section className={`w-full overflow-hidden ${className}`} aria-label="اخبار و مجله">
      <div dir="rtl" className="ticker-wrapper relative w-full overflow-hidden">
        <div className="ticker-track flex w-max min-w-full items-center gap-8 py-2.5">
          {loopItems.map((item, index) => {
            const itemModule = getTickerModule(item);
            const tone = moduleColors[itemModule].active;
            const hoverTone = moduleColors[itemModule].hover;
            return (
              <Link
                key={`${item.module || "news"}-${item.slug}-${index}`}
                href={getTickerHref(item)}
                className={`ticker-item group flex shrink-0 items-center gap-2 whitespace-nowrap text-sm text-[var(--tb-muted-foreground)] transition-colors duration-[var(--tb-duration-fast)] ${hoverTone}`}
              >
                <span className={`h-1.5 w-1.5 rounded-[var(--tb-radius-full)] bg-current opacity-70 transition-transform group-hover:scale-125 ${tone}`} />
                <span className={`rounded-[var(--tb-radius-full)] border border-[var(--tb-border)] px-2 py-0.5 text-[11px] text-[var(--tb-muted-foreground)]`}>
                  {itemModule === "blog" ? "مجله" : "خبر"}
                </span>
                <span>{item.title}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
