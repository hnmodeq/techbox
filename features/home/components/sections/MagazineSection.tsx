"use client";

/**
 * §1 · Magazine — Spiceworks "Articles" layout
 *
 * Spiceworks runs one large lead article beside a stacked list of four
 * compact rows. Measured from their markup:
 *   lead image  578 × 325
 *   list thumb  143 × 95
 *   list row    [tags] / [headline] / [metadata]  — no avatar, no excerpt
 *
 * That density is the signature, so the rows deliberately carry less than
 * a normal card would.
 *
 * RTL: lead sits on the RIGHT, list on the LEFT.
 *
 * Client Component — every card opens the existing ArticleModal in place
 * rather than navigating away, matching the Video section's behaviour.
 * Docs: docs/homepage-upgrade/02-DESIGN-SPEC.md §1
 */
import * as React from "react";
import Link from "next/link";
import type { ContentItem } from "@/lib/content";
import { cn } from "@/lib/utils";
import { formatReadingTimeShort } from "@/lib/reading-time";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { RelativeDate } from "@/components/ui/relative-date";
import { ArticleModal } from "@/features/blog/components/ArticleModal";
import { SectionShell, SectionHeader } from "../primitives";

export type MagazineSectionProps = {
  posts: ContentItem[];
  title?: string;
  moreLabel?: string;
  showTitle?: boolean;
  showMore?: boolean;
  /** One-line copy under the title. Admin-editable; empty falls back to the
   *  default below so the section never renders a bare heading. */
  description?: string;
  /** Article tags. Admin-editable, defaults on. */
  showTags?: boolean;
  /** Set only while the optional module-colour system is enabled. */
  accentColor?: string;
};

type MagazineStyle = React.CSSProperties & {
  "--magazine-accent"?: string;
  "--magazine-on-accent"?: string;
};

const HEADING_ID = "hp-magazine-heading";

/** Used when an admin has not written their own description. */
const DEFAULT_DESCRIPTION =
  "اخبار، تحلیل و منابع فناوری اطلاعات برای آماده ماندن در برابر هر چالشی.";

export function MagazineSection({
  posts,
  title = "مجله تکباکس",
  moreLabel = "مشاهده همه مقالات",
  showTitle = true,
  showMore = true,
  description,
  showTags = true,
  accentColor,
}: MagazineSectionProps) {
  // Modal index into `posts`, so prev/next walk the same five articles the
  // section is showing. Hooks must run before the empty guard.
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null);
  const items = posts ?? [];
  const close = React.useCallback(() => setActiveIndex(null), []);
  const prev = React.useCallback(
    () => setActiveIndex((i) => (i === null ? null : i > 0 ? i - 1 : items.length - 1)),
    [items.length],
  );
  const next = React.useCallback(
    () => setActiveIndex((i) => (i === null ? null : i < items.length - 1 ? i + 1 : 0)),
    [items.length],
  );

  // Rule 1: no data → no section. Guard is the first statement after hooks.
  if (!posts?.length) return null;

  // `getMagazinePosts()` guarantees this order: the latest published
  // article is the lead and the following items are distinct random
  // published articles from the same real DB collection.
  const [lead, ...rest] = posts;
  const list = rest.slice(0, 4);
  const style: MagazineStyle = {
    "--magazine-accent": accentColor || "var(--primary)",
    "--magazine-on-accent": accentColor ? "#fff" : "var(--primary-foreground)",
  };

  return (
    <SectionShell labelledBy={HEADING_ID} style={style}>
      {showTitle && (
        <SectionHeader
          headingId={HEADING_ID}
          title={title}
          description={description?.trim() || DEFAULT_DESCRIPTION}
          href={showMore ? "/blog" : undefined}
          linkLabel={moreLabel}
          accentColor={accentColor}
        />
      )}
      {!showTitle && <h2 id={HEADING_ID} className="sr-only">{title}</h2>}

      <div className="grid gap-10 lg:grid-cols-[minmax(0,878fr)_minmax(0,618fr)] lg:gap-10">
        <LeadArticle item={lead} showTags={showTags} onOpen={() => setActiveIndex(0)} />
        {list.length > 0 && (
          // justify-between on the main (vertical) axis. The <ul> is a grid
          // item, so it stretches to the row height set by the taller lead
          // card, and that slack is distributed into the gaps between rows —
          // no space before the first or after the last, so the rail stays
          // flush with the lead card.
          <ul className="flex flex-col justify-between">
            {list.map((item, index) => (
              <React.Fragment key={`${item.module}-${item.slug}`}>
                {/* Separators are real flex items, not an ::after pinned to
                    each row's bottom edge.

                    With justify-between the rows stay content-height and all
                    the slack is pushed into the gaps between them. A rule at
                    `bottom-0` therefore hugs the row above it and reads as
                    attached to that row rather than sitting between two —
                    and CSS cannot centre it in a gap whose height the flex
                    algorithm only computes at layout time.

                    As a sibling <li> the divider is spaced by the same
                    algorithm as the rows, so it lands in the middle of the
                    gap by construction. aria-hidden + role=separator keeps
                    it out of the list semantics. */}
                {index > 0 && (
                  <li
                    aria-hidden="true"
                    role="separator"
                    className="me-12 h-px shrink-0 self-stretch bg-border"
                  />
                )}
                <li>
                  <ListRow item={item} showTags={showTags} onOpen={() => setActiveIndex(index + 1)} />
                </li>
              </React.Fragment>
            ))}
          </ul>
        )}
      </div>

      {activeIndex !== null && items[activeIndex] && (
        <ArticleModal
          item={items[activeIndex]}
          onClose={close}
          onPrev={prev}
          onNext={next}
        />
      )}
    </SectionShell>
  );
}

/**
 * Real article tags, not a locally invented category label. Each tag routes
 * to the existing database-backed blog tag listing. Deliberately no chip
 * fill: tags are text links, using only standard shadcn semantic tokens.
 */
function ArticleTags({
  tags,
  onPrimary = false,
  className,
}: {
  tags: string[];
  onPrimary?: boolean;
  className?: string;
}) {
  // Only the primary tag. The rail is dense by design and a row of chips
  // competes with the headline for the eye.
  const primaryTag = [...new Set(tags.filter((tag) => typeof tag === "string" && tag.trim()))][0];
  if (!primaryTag) return null;

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] font-semibold leading-[16px]",
        onPrimary ? "mb-3 text-[color:var(--magazine-on-accent)]" : "mb-2 text-muted-foreground",
        className,
      )}
    >
      <Link
        href={`/blog/tag/${encodeURIComponent(primaryTag)}`}
        className={cn(
          "decoration-1 underline-offset-4 transition-colors hover:underline focus-visible:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          onPrimary ? "hover:text-[color:var(--magazine-on-accent)]" : "hover:text-[color:var(--magazine-accent)]",
        )}
      >
        {primaryTag}
      </Link>
    </div>
  );
}

/** Date has the requested shadcn tooltip; reading time is precomputed from
 * the actual article title/excerpt/body in `lib/home-server.ts`. */
function PublicationMeta({
  item,
  onPrimary = false,
  className,
}: {
  item: ContentItem;
  onPrimary?: boolean;
  className?: string;
}) {
  // The badge shows the bare duration; "زمان مطالعه" lives in the tooltip.
  const readingTime =
    item.readingTime != null ? formatReadingTimeShort(item.readingTime) : null;

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] leading-[18px]",
        onPrimary ? "text-[color:var(--magazine-on-accent)]" : "text-muted-foreground",
        className,
      )}
    >
      <RelativeDate date={item.date} label="تاریخ انتشار" />

      {readingTime && (
        <>
          <span aria-hidden="true">•</span>
          <Tooltip>
            <TooltipTrigger render={<span className="cursor-default" />}>
              {readingTime}
            </TooltipTrigger>
            <TooltipContent>زمان مطالعه</TooltipContent>
          </Tooltip>
        </>
      )}
    </div>
  );
}

/**
 * Spiceworks lead: 578×325 image sitting directly on top of a solid primary
 * panel that holds the tags, headline, excerpt and metadata. The panel is
 * the signature of this block — the image and the colour field read as one
 * object, so the image corners are squared off where the two meet rather
 * than rounded independently.
 */
function LeadArticle({
  item,
  showTags,
  onOpen,
}: {
  item: ContentItem;
  showTags: boolean;
  onOpen: () => void;
}) {
  return (
    // Rounded and elevated to match the Video section's comment card.
    // overflow-hidden clips the image to the same radius, so the photo and
    // the colour panel still read as one object.
    <article className="hp-card overflow-hidden rounded-[var(--hp-r-md)] shadow-[var(--hp-shadow-card)] transition-shadow hover:shadow-[var(--hp-shadow-hover)]">
      <button
        type="button"
        onClick={onOpen}
        aria-label={`باز کردن مقالهٔ ${item.title}`}
        className="group block w-full text-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <div
          className="relative w-full overflow-hidden bg-muted"
          style={{ aspectRatio: "1.65/1" }}
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
              className="absolute inset-0 h-full w-full object-cover"
            />
          )}
        </div>

        <div className="bg-[color:var(--magazine-accent)] px-10 pb-6 pt-10 text-[color:var(--magazine-on-accent)]">
          {showTags && <ArticleTags tags={item.tags} onPrimary />}

          <h3 className="text-[28px] font-bold leading-[38px] decoration-1 underline-offset-4 group-hover:underline">
            {item.title}
          </h3>

          {item.excerpt && (
            <p className="line-clamp-3 text-[15px] leading-[28px] text-[color:var(--magazine-on-accent)]">
              {item.excerpt}
            </p>
          )}
        </div>
      </button>

      {/* Outside the button: the meta row owns interactive tooltips and the
          tag links, which cannot be nested inside another button. */}
      <div className="bg-[color:var(--magazine-accent)] px-10 pb-10 text-[color:var(--magazine-on-accent)]">
        <PublicationMeta item={item} onPrimary />
      </div>
    </article>
  );
}

/** Spiceworks list row: 143×95 thumb + tags, title and metadata. */
function ListRow({
  item,
  showTags,
  onOpen,
}: {
  item: ContentItem;
  showTags: boolean;
  onOpen: () => void;
}) {
  return (
    <article className="hp-card group flex">
      <button
        type="button"
        onClick={onOpen}
        aria-label={`باز کردن مقالهٔ ${item.title}`}
        className="block shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <div
          className="relative w-[180px] overflow-hidden bg-muted sm:w-[150px]"
          style={{ aspectRatio: "1.3/1" }}
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
      </button>

      <div className="flex min-w-0 flex-col items-start justify-start">
        {/* Match the title's existing logical inset in RTL. */}
        {showTags && <ArticleTags tags={item.tags} className="ps-5" />}
        <h3 className="ps-5 text-[16px] font-bold leading-[24px] text-foreground">
          <button
            type="button"
            onClick={onOpen}
            className="line-clamp-2 text-start decoration-1 underline-offset-4 transition-colors hover:text-[color:var(--magazine-accent)] hover:underline focus-visible:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {item.title}
          </button>
        </h3>
        <PublicationMeta item={item} className="mt-1 ps-5" />
      </div>
    </article>
  );
}

export default MagazineSection;
