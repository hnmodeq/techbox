/** Review homepage: newest review feature + four rotating archive cards. */
import * as React from "react";
import Link from "next/link";
import type { ContentItem } from "@/lib/content";
import { RemoteImage } from "@/components/ui/remote-image";
import { RelativeDate } from "@/components/ui/relative-date";
import { SectionShell, SectionHeader, Byline } from "../primitives";

export type TopPicksSectionProps = {
  picks: ContentItem[];
  title?: string;
  moreLabel?: string;
  showTitle?: boolean;
  showMore?: boolean;
  accentColor?: string;
};

const HEADING_ID = "hp-toppicks-heading";
type TopPicksStyle = React.CSSProperties & { "--top-picks-accent"?: string };

export function TopPicksSection({
  picks,
  title = "انتخاب‌های برتر ما",
  moreLabel = "همه بررسی‌ها",
  showTitle = true,
  showMore = true,
  accentColor,
}: TopPicksSectionProps) {
  if (!picks?.length) return null;
  const [latest, ...archive] = picks;
  const style: TopPicksStyle = { "--top-picks-accent": accentColor || "var(--primary)" };

  return (
    <SectionShell labelledBy={HEADING_ID} style={style}>
      {showTitle && (
        <SectionHeader
          headingId={HEADING_ID}
          title={title}
          description="جدیدترین بررسی تکباکس، در کنار انتخابی تازه از آرشیو بررسی‌های تخصصی."
          href={showMore ? "/review" : undefined}
          linkLabel={moreLabel}
          accentColor={accentColor}
        />
      )}
      {!showTitle && <h2 id={HEADING_ID} className="sr-only">{title}</h2>}

      <LatestReviewCard item={latest} />
      {archive.length > 0 && (
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {archive.slice(0, 4).map((item) => (
            <CompactReviewCard key={`${item.module}-${item.slug}`} item={item} />
          ))}
        </div>
      )}
    </SectionShell>
  );
}

function LatestReviewCard({ item }: { item: ContentItem }) {
  return (
    <article className="grid overflow-hidden border border-border bg-card md:grid-cols-[1.25fr_.75fr]">
      <Link href={`/${item.module}/${item.slug}`} className="group relative min-h-[300px] md:min-h-[430px]">
        <RemoteImage
          src={item.image}
          alt={item.title}
          sizes="(min-width: 1024px) 760px, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.02] motion-reduce:transform-none"
        />
      </Link>
      <div className="flex flex-col justify-center p-6 sm:p-8">
        <RelativeDate date={item.date} className="text-xs text-muted-foreground" />
        <h3 className="mt-2 text-2xl font-bold leading-9 text-foreground sm:text-3xl sm:leading-10">
          <Link href={`/${item.module}/${item.slug}`} className="transition-colors hover:text-[color:var(--top-picks-accent)]">
            {item.title}
          </Link>
        </h3>
        {item.excerpt && <p className="mt-3 line-clamp-5 text-sm leading-7 text-muted-foreground">{item.excerpt}</p>}
        <div className="mt-6">
          <Byline author={item.author} date={item.date_fa} size="sm" hideRole />
        </div>
      </div>
    </article>
  );
}

function CompactReviewCard({ item }: { item: ContentItem }) {
  return (
    <article className="flex h-full flex-col border border-border bg-transparent">
      <Link href={`/${item.module}/${item.slug}`} className="group relative aspect-[16/10] overflow-hidden bg-muted">
        <RemoteImage
          src={item.image}
          alt={item.title}
          sizes="(min-width: 1024px) 310px, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-400 group-hover:scale-[1.025] motion-reduce:transform-none"
        />
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <RelativeDate date={item.date} className="text-[11px] text-muted-foreground" />
        <h3 className="mt-1 line-clamp-2 text-base font-bold leading-6 text-foreground">
          <Link href={`/${item.module}/${item.slug}`} className="transition-colors hover:text-[color:var(--top-picks-accent)]">
            {item.title}
          </Link>
        </h3>
        {item.excerpt && <p className="mt-2 line-clamp-3 text-xs leading-5 text-muted-foreground">{item.excerpt}</p>}
      </div>
    </article>
  );
}

export default TopPicksSection;
