/**
 * §7 · Shop / Best Deals — Tom's Guide `deals` widget
 *
 * TG's deals card is deliberately the plainest on their page: image,
 * title, nothing else. No strapline, no byline. That restraint is the
 * design — it makes the grid scan fast — so it is reproduced exactly,
 * with only the commerce block added because we have real prices and
 * they do not.
 *
 * Grid follows TG's measured values: 2-up mobile, 4-up from 900px, on a
 * tinted inset band.
 *
 * Red appears ONLY for a genuine, live discount. `isDiscountLive` gates
 * it: an expired `discountEndsAt` means no badge, no strikethrough, no
 * countdown — just the plain price.
 *
 * Server Component (CountdownBadge is the client part).
 * Docs: docs/homepage-upgrade/02-DESIGN-SPEC.md §7
 */
import * as React from "react";
import Link from "next/link";
import type { ContentItem } from "@/lib/content";
import { InsetBand, SectionHeader } from "../primitives";
import { faPrice, faDiscountedPrice, isDiscountLive } from "@/lib/format-price";
import { Num } from "@/components/ui/num";
import { Eyebrow } from "../primitives";
import { CountdownBadge } from "./CountdownBadge";

export type DealsSectionProps = {
  products: ContentItem[];
  title?: string;
  moreLabel?: string;
  showTitle?: boolean;
  showMore?: boolean;
  accentColor?: string;
};

const HEADING_ID = "hp-deals-heading";

type DealsStyle = React.CSSProperties & { "--deals-accent"?: string };
const MIN_PRODUCTS = 4;

export function DealsSection({
  products,
  title = "بهترین پیشنهادهای امروز",
  moreLabel = "مشاهده همه محصولات",
  showTitle = true,
  showMore = true,
  accentColor,
}: DealsSectionProps) {
  if (!products || products.length < MIN_PRODUCTS) return null;

  const style: DealsStyle = { "--deals-accent": accentColor || "var(--primary)" };

  return (
    <InsetBand labelledBy={HEADING_ID} tone="tint" style={style}>
      {showTitle && (
        <SectionHeader
          headingId={HEADING_ID}
          title={title}
          description="تخفیف‌های امروز را از دست ندهید. بهترین کاهش قیمت‌ها روی سخت‌افزار سازمانی."
          href={showMore ? "/shop" : undefined}
          linkLabel={moreLabel}
          accentColor={accentColor}
        />
      )}
      {!showTitle && <h2 id={HEADING_ID} className="sr-only">{title}</h2>}

      <ul className="grid grid-cols-2 gap-2.5 md:grid-cols-4 md:gap-5">
        {products.map((p) => (
          <li key={`${p.module}-${p.slug}`}>
            <DealCard item={p} />
          </li>
        ))}
      </ul>
    </InsetBand>
  );
}

function DealCard({ item }: { item: ContentItem }) {
  const live = isDiscountLive(item.discountPercent, item.discountEndsAt);
  const discounted = live ? faDiscountedPrice(item.priceAmount, item.discountPercent) : null;

  return (
    <article className="hp-card group h-full overflow-hidden rounded-[var(--hp-r-md)] border border-[color:var(--hp-border)] bg-[color:var(--hp-surface)] transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-0.5 hover:border-[color:var(--deals-accent)]/40 hover:shadow-[var(--hp-shadow-hover)] motion-reduce:transform-none">
      <Link href={`/${item.module}/${item.slug}`} className="flex h-full flex-col focus-visible:outline-none">
        <div
          className="relative w-full overflow-hidden bg-[color:var(--hp-brand-tint)]"
          style={{ aspectRatio: "450/253" }}
        >
          {item.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.image}
              alt={item.title}
              sizes="(min-width: 900px) 300px, 50vw"
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03] motion-reduce:transform-none"
            />
          )}
          {discounted && (
            <span className="absolute top-2 start-2 rounded-[4px] bg-[color:var(--hp-deal)] px-1.5 py-0.5 text-[12px] font-bold text-white">
              {discounted.badge}
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col p-4">
          {/* Brand kicker: TG's deal cards lead with the retailer, which is
              what makes the grid scannable at a glance. */}
          {item.brand && <Eyebrow className="mb-1 !text-[11px] !tracking-[1px]">{item.brand}</Eyebrow>}

          <h3 className="line-clamp-3 text-[16px] font-bold leading-[24px] text-[color:var(--hp-ink)] transition-colors group-hover:text-[color:var(--deals-accent)]">
            <Num latin>{item.title}</Num>
          </h3>

          <div className="mt-auto pt-3">
            {discounted ? (
              <>
                <p className="hp-numeric text-[18px] font-bold text-[color:var(--hp-ink)]">
                  {discounted.now}
                </p>
                <p className="hp-numeric text-[13px] text-[color:var(--hp-ink-3)] line-through">
                  {discounted.was}
                </p>
                <CountdownBadge endsAt={item.discountEndsAt ?? null} />
              </>
            ) : (
              <p className="hp-numeric text-[18px] font-bold text-[color:var(--hp-ink)]">
                {faPrice(item.priceAmount) || "تماس بگیرید"}
              </p>
            )}
          </div>
        </div>
      </Link>
    </article>
  );
}

export default DealsSection;
