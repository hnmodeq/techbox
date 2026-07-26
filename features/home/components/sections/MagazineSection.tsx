/**
 * §1 · Magazine — Spiceworks "Articles" layout
 *
 * Spiceworks runs one large lead article beside a stacked list of four
 * compact rows. Measured from their markup:
 *   lead image  578 × 325
 *   list thumb  143 × 95
 *   list row    [category] / [headline] / [date]  — no avatar, no excerpt
 *
 * That density is the signature, so the rows deliberately carry less than
 * a normal card would.
 *
 * RTL: lead sits on the RIGHT, list on the LEFT.
 *
 * Server Component.
 * Docs: docs/homepage-upgrade/02-DESIGN-SPEC.md §1
 */
import * as React from "react";
import Link from "next/link";
import type { ContentItem } from "@/lib/content";
import { SectionShell, SectionHeader, Eyebrow } from "../primitives";

export type MagazineSectionProps = {
  posts: ContentItem[];
  title?: string;
  moreLabel?: string;
  showTitle?: boolean;
  showMore?: boolean;
};

const HEADING_ID = "hp-magazine-heading";

export function MagazineSection({
  posts,
  title = "مجله تکباکس",
  moreLabel = "مشاهده همه مقالات",
  showTitle = true,
  showMore = true,
}: MagazineSectionProps) {
  // Rule 1: no data → no section. Guard is the first statement.
  if (!posts?.length) return null;

  const [lead, ...rest] = posts;
  const list = rest.slice(0, 4);

  return (
    <SectionShell labelledBy={HEADING_ID}>
      {showTitle && (
        <SectionHeader
          headingId={HEADING_ID}
          title={title}
          description="اخبار، تحلیل و منابع فناوری اطلاعات برای آماده ماندن در برابر هر چالشی."
          href={showMore ? "/blog" : undefined}
          linkLabel={moreLabel}
        />
      )}
      {!showTitle && <h2 id={HEADING_ID} className="sr-only">{title}</h2>}

      <div className="grid gap-8 lg:grid-cols-[minmax(0,578fr)_minmax(0,420fr)] lg:gap-10">
        <LeadArticle item={lead} />
        {list.length > 0 && (
          <ul className="flex flex-col">
            {list.map((item) => (
              <li key={`${item.module}-${item.slug}`}>
                <ListRow item={item} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </SectionShell>
  );
}

/** Spiceworks lead: 578×325 image, category kicker, headline, excerpt, date. */
function LeadArticle({ item }: { item: ContentItem }) {
  return (
    <article className="hp-card group">
      <Link href={`/${item.module}/${item.slug}`} className="block focus-visible:outline-none">
        <div
          className="relative w-full overflow-hidden rounded-[var(--hp-r-sm)] bg-[color:var(--hp-brand-tint)]"
          style={{ aspectRatio: "578/325" }}
        >
          {item.image && (
            // The homepage LCP element — eager, high priority. Everything
            // else on the page is lazy.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.image}
              alt={item.title}
              sizes="(min-width: 1024px) 578px, 100vw"
              loading="eager"
              fetchPriority="high"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02] motion-reduce:transform-none"
            />
          )}
        </div>

        <div className="pt-4">
          {item.category && <Eyebrow className="mb-2">{item.category}</Eyebrow>}

          <h3 className="text-[28px] font-bold leading-[38px] text-[color:var(--hp-ink)] transition-colors group-hover:text-[color:var(--hp-brand)]">
            {item.title}
          </h3>

          {item.excerpt && (
            <p className="mt-2 line-clamp-3 text-[15px] leading-[28px] text-[color:var(--hp-ink-3)]">
              {item.excerpt}
            </p>
          )}

          <p className="mt-3 text-[13px] leading-[20px] text-[color:var(--hp-ink-3)]">
            {item.date_fa}
          </p>
        </div>
      </Link>
    </article>
  );
}

/** Spiceworks list row: 143×95 thumb + three text lines. No avatar. */
function ListRow({ item }: { item: ContentItem }) {
  return (
    <Link
      href={`/${item.module}/${item.slug}`}
      className="hp-card group flex gap-4 border-b border-[color:var(--hp-border)] py-5 transition-colors last:border-b-0 hover:bg-[color:var(--hp-bg)] focus-visible:outline-none"
    >
      <div
        className="relative w-[110px] shrink-0 overflow-hidden rounded-[6px] bg-[color:var(--hp-brand-tint)] sm:w-[143px]"
        style={{ aspectRatio: "143/95" }}
      >
        {item.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.image}
            alt={item.title}
            sizes="143px"
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
      </div>

      <div className="flex min-w-0 flex-col justify-center">
        {item.category && (
          <Eyebrow className="mb-1 !text-[11px] !tracking-[1px]">{item.category}</Eyebrow>
        )}
        <h3 className="line-clamp-2 text-[16px] font-bold leading-[24px] text-[color:var(--hp-ink)] transition-colors group-hover:text-[color:var(--hp-brand)]">
          {item.title}
        </h3>
        <p className="mt-1 text-[12px] leading-[18px] text-[color:var(--hp-ink-3)]">
          {item.date_fa}
        </p>
      </div>
    </Link>
  );
}

export default MagazineSection;
