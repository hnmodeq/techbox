/**
 * §5 · Our Top Picks — Tom's Guide `best-picks--tabbed-`
 *
 * Grid values are TG's own, measured from their live CSS:
 *   --wdn-listv2-gridX: 1.4   (mobile — the 0.4 deliberately peeks the
 *                              next card so the rail reads as scrollable)
 *   --wdn-listv2-gridX: 3     (>= 900px)
 *   gap 10px mobile / 20px desktop
 *
 * TG's cards carry a "Short List Includes" block; ours carries the verdict
 * — score, live price, warranty — because that is the equivalent
 * at-a-glance summary for a product review.
 *
 * The byline is pinned to the bottom with margin-top:auto, exactly as TG
 * does it, so bylines line up across cards of different title lengths.
 *
 * TechBox addition: a footer strip with the live price and a buy link.
 * Neither source can do content→commerce in one hop; we own the checkout.
 *
 * Server Component.
 * Docs: docs/homepage-upgrade/02-DESIGN-SPEC.md §5
 */
import * as React from "react";
import Link from "next/link";
import type { TopPickCard } from "@/features/home/lib/home-types";
import { SectionShell, SectionHeader, Byline, Eyebrow } from "../primitives";
import { faPrice, faRating, faCount, faDiscountedPrice, isDiscountLive } from "@/lib/format-price";
import { Num } from "@/components/ui/num";
import { RemoteImage } from "@/components/ui/remote-image";

export type TopPicksSectionProps = {
  picks: TopPickCard[];
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

  const style: TopPicksStyle = { "--top-picks-accent": accentColor || "var(--primary)" };

  return (
    <SectionShell labelledBy={HEADING_ID} style={style}>
      {showTitle && (
        <SectionHeader
          headingId={HEADING_ID}
          title={title}
          description="کارشناسان ما هر سال ده‌ها محصول را تست می‌کنند. این‌ها قهرمانان فعلی دسته‌بندی خود هستند."
          href={showMore ? "/review" : undefined}
          linkLabel={moreLabel}
          accentColor={accentColor}
        />
      )}
      {!showTitle && <h2 id={HEADING_ID} className="sr-only">{title}</h2>}

      {/*
        TG peeks the next card on mobile (gridX 1.4). A horizontal scroll
        with a fractional basis reproduces that without a carousel script.
      */}
      <ul className="hp-rail gap-2.5 md:grid md:grid-cols-3 md:gap-5 md:overflow-visible">
        {picks.map((pick, i) => (
          <li
            key={`${pick.module}-${pick.slug}`}
            className="w-[78%] shrink-0 sm:w-[46%] md:w-auto"
          >
            <PickCard pick={pick} />
          </li>
        ))}
      </ul>
    </SectionShell>
  );
}

function PickCard({ pick }: { pick: TopPickCard }) {
  const p = pick.product;
  const live = isDiscountLive(p.discountPercent, p.discountEndsAt);
  const deal = live ? faDiscountedPrice(p.priceAmount, p.discountPercent) : null;
  const stars = Math.round(pick.rating ?? 0);

  return (
    <article className="hp-card flex h-full flex-col overflow-hidden rounded-[var(--hp-r-md)] border border-[color:var(--hp-border)] bg-[color:var(--hp-surface)] transition-shadow duration-200 hover:shadow-[var(--hp-shadow-hover)]">
      <Link href={`/${pick.module}/${pick.slug}`} className="group block focus-visible:outline-none">
        <div
          className="relative w-full overflow-hidden bg-[color:var(--hp-brand-tint)]"
          style={{ aspectRatio: "16/9" }}
        >
          <RemoteImage
            src={pick.image}
            alt={pick.title}
            sizes="(min-width: 900px) 420px, 71vw"
            className="transition-transform duration-300 group-hover:scale-[1.03] motion-reduce:transform-none"
          />
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-2 text-[17px] font-bold leading-[26px] text-[color:var(--hp-ink)]">
          <Link
            href={`/${pick.module}/${pick.slug}`}
            className="transition-colors hover:text-[color:var(--top-picks-accent)] focus-visible:outline-none"
          >
            {pick.title}
          </Link>
        </h3>

        {pick.excerpt && (
          <p className="mt-1.5 line-clamp-4 text-[13px] leading-[21px] text-[color:var(--hp-ink-3)]">
            {pick.excerpt}
          </p>
        )}

        {/* Verdict — our equivalent of TG's "Short List Includes". */}
        <div className="mt-3">
          {/* Rating is hidden entirely when null — never defaults to a
              flattering 5. */}
          {pick.rating != null && (
            <div className="flex items-center gap-2">
              <span className="flex" aria-hidden="true">
                {[1, 2, 3, 4, 5].map((n) => (
                  <svg
                    key={n}
                    width="16"
                    height="16"
                    viewBox="0 0 20 20"
                    className={n <= stars ? "text-[#f9bc00]" : "text-[color:var(--hp-border)]"}
                    fill="currentColor"
                  >
                    <path d="M10 1.5l2.6 5.3 5.9.9-4.2 4.1 1 5.8-5.3-2.8-5.3 2.8 1-5.8L1.5 7.7l5.9-.9L10 1.5z" />
                  </svg>
                ))}
              </span>
              <span className="text-[14px] font-bold text-[color:var(--hp-ink)]">
                {faRating(pick.rating)}
              </span>
              {pick.ratingCount ? (
                <span className="text-[12px] text-[color:var(--hp-ink-3)]">
                  ({faCount(pick.ratingCount, "رأی")})
                </span>
              ) : null}
            </div>
          )}

          <ul className="mt-2 space-y-0.5 text-[12px] leading-[20px] text-[color:var(--hp-ink-2)]">
            {p.model && (
              <li className="flex gap-1.5">
                <span aria-hidden="true" className="text-[color:var(--hp-brand)]">•</span>
                <span>مدل: <Num latin>{p.model}</Num></span>
              </li>
            )}
            {p.warranty && (
              <li className="flex gap-1.5">
                <span aria-hidden="true" className="text-[color:var(--hp-brand)]">•</span>
                <span>گارانتی: {p.warranty}</span>
              </li>
            )}
          </ul>
        </div>

        {/* TG pins the byline to the bottom of the card. */}
        <div className="mt-auto pt-3">
          <Byline
            author={{
              name: pick.author?.name ?? "تحریریه",
              username: pick.author?.username,
              role: pick.author?.role,
              job: pick.author?.job,
              avatar: pick.author?.avatar,
            }}
            date={pick.date_fa}
            datePrefix="آخرین بروزرسانی"
            size="md"
          />
        </div>
      </div>

      {/* Content → commerce in one hop. Neither source has a checkout. */}
      <div className="flex items-center justify-between gap-3 border-t border-[color:var(--hp-border)] bg-[color:var(--hp-brand-tint)] px-5 py-3">
        <div className="min-w-0">
          {deal ? (
            <>
              <p className="hp-numeric truncate text-[17px] font-bold text-[color:var(--hp-ink)]">
                {deal.now}
              </p>
              <p className="hp-numeric truncate text-[12px] text-[color:var(--hp-ink-3)] line-through">
                {deal.was}
              </p>
            </>
          ) : (
            <p className="hp-numeric truncate text-[17px] font-bold text-[color:var(--hp-ink)]">
              {faPrice(p.priceAmount) || "تماس بگیرید"}
            </p>
          )}
        </div>

        <Link
          href={`/shop/${p.slug}`}
          className="shrink-0 rounded-[var(--hp-r-sm)] bg-[color:var(--hp-accent)] px-4 py-2 text-[13px] font-bold text-[color:var(--hp-on-accent)] transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-[color:var(--hp-brand)] focus-visible:outline-none"
        >
          ثبت سفارش این محصول از فروشگاه
        </Link>
      </div>
    </article>
  );
}

export default TopPicksSection;
