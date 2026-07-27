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
import { cn } from "@/lib/utils";
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
  /** Category chips on cards. Admin-editable, defaults on. */
  showTags?: boolean;
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
          description={description?.trim() || DEFAULT_DESCRIPTION}
          href={showMore ? "/blog" : undefined}
          linkLabel={moreLabel}
          rule
        />
      )}
      {!showTitle && <h2 id={HEADING_ID} className="sr-only">{title}</h2>}

      <div className="grid gap-10 lg:grid-cols-[minmax(0,878fr)_minmax(0,618fr)] lg:gap-10">
        <LeadArticle item={lead} showTags={showTags} />
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
                    className="h-px shrink-0 self-stretch bg-[color:var(--hp-rule)] me-12"
                  />
                )}
                <li className="group/row">
                  <ListRow item={item} showTags={showTags} />
                </li>
              </React.Fragment>
            ))}
          </ul>
        )}
      </div>
    </SectionShell>
  );
}

/**
 * Spiceworks renders the category as a small filled chip, not the bare
 * tracked kicker the other sections use. Kept local to this file rather
 * than pushed into the shared `Eyebrow` primitive, because changing that
 * would restyle every section that already ships.
 *
 * `onBrand` is the reversed variant used inside the lead's colour panel.
 */
function CategoryChip({ label, onBrand = false }: { label: string; onBrand?: boolean }) {
  return (
    <span
      className={
        onBrand
          ? "mb-3 inline-block bg-[color:var(--hp-on-brand)] px-2 py-[3px] text-[12px] font-semibold leading-[16px] text-[color:var(--hp-brand-ink)]"
          : "mb-2 inline-block bg-[color:var(--hp-brand-tint)] px-2 py-[3px] text-[11px] font-semibold leading-[16px] text-[color:var(--hp-ink-2)]"
      }
    >
      {label}
    </span>
  );
}

/**
 * Spiceworks lead: 578×325 image sitting directly on top of a solid brand
 * panel that holds the kicker, headline, excerpt and date in reversed
 * text. The panel is the signature of this block — the image and the
 * colour field read as one object, so the image corners are squared off
 * where the two meet rather than rounded independently.
 */
function LeadArticle({ item, showTags }: { item: ContentItem; showTags: boolean }) {
  return (
    <article className="hp-card group">
      <Link href={`/${item.module}/${item.slug}`} className="block focus-visible:outline-none">
        <div
          className="relative w-full overflow-hidden bg-[color:var(--hp-brand-tint)]"
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

        {/* Reversed panel.
            Uses --hp-brand-ink, NOT --hp-brand. shadcn flips --primary to
            near-white in dark mode, which is right for text but would make
            this filled panel white-on-white — measured at 1.21:1, i.e.
            invisible. --hp-brand-ink is the token that stays a dark surface
            in both themes (17.2:1 light, 13.0:1 dark).
            No hover colour shift on the headline: there is no contrast
            headroom left on a saturated ground. */}
        <div className="bg-[color:var(--hp-brand-ink)] px-10 pb-6 pt-20">
          {showTags && item.category && <CategoryChip label={item.category} onBrand />}

          <h3 className="text-[28px] font-bold leading-[38px] text-[color:var(--hp-on-brand)] transition-colors duration-200 group-hover:text-[color:var(--hp-accent-on-ink)]">
            {item.title}
          </h3>

          {item.excerpt && (
            <p className="line-clamp-3 text-[15px] leading-[28px] text-[color:var(--hp-on-brand-mut)]">
              {item.excerpt}
            </p>
          )}

          <p className="mt-3 text-[13px] leading-[20px] text-[color:var(--hp-on-brand-mut)]">
            {item.date_fa}
          </p>
        </div>
      </Link>
    </article>
  );
}

/** Spiceworks list row: 143×95 thumb + three text lines. No avatar. */
function ListRow({ item, showTags }: { item: ContentItem; showTags: boolean }) {
  return (
    <Link
      href={`/${item.module}/${item.slug}`}
      className={cn(
        "hp-card group flex focus-visible:outline-none",
        "group-first/row:pt-0 group-last/row:pb-0",
      )}
    >
      <div
        className="relative w-[180px] shrink-0 overflow-hidden bg-[color:var(--hp-brand-tint)] sm:w-[150px]"
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

      {/* items-start, not the default stretch. A flex column stretches its
          children across the cross axis, which overrides the chip's
          inline-block and renders it as a full-width bar instead of a pill
          hugging its label. The lead panel is unaffected because its parent
          is a plain block. */}
      <div className="flex min-w-0 flex-col items-start justify-start">
        {showTags && item.category && <CategoryChip label={item.category} />}
        <h3 className="line-clamp-2 text-[16px] font-bold leading-[24px] text-[color:var(--hp-ink)] transition-colors group-hover:text-[color:var(--hp-brand)] pr-5">
          {item.title}
        </h3>
        <p className="mt-1 text-[12px] leading-[18px] text-[color:var(--hp-ink-3)] pr-5">
          {item.date_fa}
        </p>
      </div>
    </Link>
  );
}

export default MagazineSection;
