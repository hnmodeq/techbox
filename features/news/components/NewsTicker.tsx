import Link from "next/link";

type NewsItem = {
  slug: string;
  title: string;
  module?: "news" | "blog" | string;
};

type NewsTickerProps = {
  items: NewsItem[];
  className?: string;
};

function getTickerHref(item: NewsItem) {
  const itemModule = item.module === "blog" || item.module === "news" ? item.module : "news";
  return `/${itemModule}/${item.slug}`;
}

export default function NewsTicker({ items, className = "" }: NewsTickerProps) {
  if (!items?.length) return null;

  const loopItems = [...items, ...items, ...items];

  return (
    <section className={`w-full overflow-hidden ${className}`} aria-label="اخبار و مجله">
      <div dir="rtl" className="ticker-wrapper relative w-full overflow-hidden border-y border-[var(--tb-border)] bg-[var(--tb-card)]/65 backdrop-blur-[var(--tb-blur-sm)]">
        <div className="ticker-track flex w-max min-w-full items-center gap-10 py-2.5">
          {loopItems.map((item, index) => (
            <Link
              key={`${item.module || "news"}-${item.slug}-${index}`}
              href={getTickerHref(item)}
              className="ticker-item group flex shrink-0 items-center gap-2 whitespace-nowrap text-sm text-[var(--tb-muted-foreground)] transition-colors duration-[var(--tb-duration-fast)] hover:text-[var(--tb-brand)]"
            >
              <span className="text-[10px] leading-none text-[var(--tb-brand)]/70 transition-transform group-hover:scale-125">●</span>
              <span className="text-[11px] rounded-full border border-[var(--tb-border)] px-2 py-0.5 text-[var(--tb-muted-foreground)]">
                {item.module === "blog" ? "مجله" : "خبر"}
              </span>
              <span>{item.title}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
