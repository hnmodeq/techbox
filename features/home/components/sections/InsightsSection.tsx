/**
 * §3 · Latest Insights + Newsletter — Tom's Guide `live-blog` +
 * `newsletter-sidebar`, sharing one inset band.
 *
 * TG's live feed is a stack of timestamped entries, each with a heading,
 * a 16:9 image, a lead paragraph and a bold "read the full story" link.
 * Two entries only — this is a curated digest, not a river.
 *
 * The items are ranked by ENGAGEMENT, not recency (decision D5): the
 * floating news sidebar already shows the newest posts, so a recency sort
 * here would print the same headline twice a few hundred pixels apart.
 * Dedupe happens server-side in lib/home-sections.ts.
 *
 * RTL: feed on the RIGHT (2fr), newsletter on the LEFT (1fr).
 *
 * Server Component (NewsletterCard inside is the client part).
 * Docs: docs/homepage-upgrade/02-DESIGN-SPEC.md §3
 */
import * as React from "react";
import Link from "next/link";
import type { ContentItem } from "@/lib/content";
import { InsetBand, SectionHeader } from "../primitives";
import { NewsletterCard } from "./NewsletterCard";

export type InsightsSectionProps = {
  insights: ContentItem[];
  title?: string;
};

const HEADING_ID = "hp-insights-heading";

export function InsightsSection({
  insights,
  title = "آخرین بینش‌ها",
}: InsightsSectionProps) {
  // The newsletter card needs no data, but a band containing only a signup
  // form is not "Latest Insights" — so the section still requires content.
  if (!insights?.length) return null;

  return (
    <InsetBand labelledBy={HEADING_ID} tone="tint">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:gap-10">
        <div>
          <div className="mb-6 flex items-center gap-2.5">
            <span className="hp-live-dot" aria-hidden="true" />
            <SectionHeader
              headingId={HEADING_ID}
              title={title}
              className="mb-0 flex-1"
            />
          </div>

          <div className="flex flex-col">
            {insights.map((item) => (
              <article
                key={`${item.module}-${item.slug}`}
                className="hp-card border-b border-[color:var(--hp-border)] pb-7 last:border-b-0 last:pb-0 [&:not(:first-child)]:pt-7"
              >
                <FeedEntry item={item} />
              </article>
            ))}
          </div>
        </div>

        <NewsletterCard />
      </div>
    </InsetBand>
  );
}

function FeedEntry({ item }: { item: ContentItem }) {
  return (
    <div className="group">
      <time
        dateTime={item.date}
        className="text-[12px] leading-[18px] text-[color:var(--hp-ink-3)]"
      >
        {item.date_fa}
      </time>

      <h3 className="mt-1 text-[22px] font-bold leading-[32px] text-[color:var(--hp-ink)]">
        <Link
          href={`/${item.module}/${item.slug}`}
          className="transition-colors hover:text-[color:var(--hp-brand)] focus-visible:outline-none"
        >
          {item.title}
        </Link>
      </h3>

      {item.image && (
        <Link
          href={`/${item.module}/${item.slug}`}
          className="mt-3 block overflow-hidden rounded-[var(--hp-r-sm)] focus-visible:outline-none"
        >
          <div
            className="relative w-full bg-[color:var(--hp-brand-tint)]"
            style={{ aspectRatio: "16/9" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.image}
              alt={item.title}
              sizes="(min-width: 1024px) 700px, 100vw"
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02] motion-reduce:transform-none"
            />
          </div>
        </Link>
      )}

      {item.excerpt && (
        <p className="mt-3 line-clamp-3 text-[15px] leading-[28px] text-[color:var(--hp-ink-2)]">
          {item.excerpt}
        </p>
      )}

      {/* TG closes each entry with a bulleted bold link to the full story. */}
      <p className="mt-3 text-[14px] leading-[24px] text-[color:var(--hp-ink-3)]">
        <span aria-hidden="true" className="me-2 text-[color:var(--hp-brand)]">•</span>
        خواندن کامل:{" "}
        <Link
          href={`/${item.module}/${item.slug}`}
          className="font-bold text-[color:var(--hp-brand)] hover:underline"
        >
          {item.title}
        </Link>
      </p>
    </div>
  );
}

export default InsightsSection;
