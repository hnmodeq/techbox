/**
 * §5 · Our Top Picks — Tom's Guide `best-picks--tabbed-`
 *
 * Review section with compact cards, yellow star rating, tooltips for avatar/name,
 * guarantee badge, and star rating, price on left and shop button on right,
 * and no card background.
 */
import * as React from "react";
import Link from "next/link";
import type { TopPickCard } from "@/features/home/lib/home-types";
import { SectionShell, SectionHeader, Byline, ScrollRail } from "../primitives";
import { faPrice, faRating, faCount, faDiscountedPrice, isDiscountLive } from "@/lib/format-price";
import { Num } from "@/components/ui/num";
import { RemoteImage } from "@/components/ui/remote-image";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ShieldCheck } from "lucide-react";

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

      <ScrollRail label={title} gap={20} arrowsOnMobile>
        {picks.map((pick) => (
          <div
            key={`${pick.module}-${pick.slug}`}
            className="w-[78%] shrink-0 sm:w-[46%] lg:w-[31%]"
          >
            <PickCard pick={pick} />
          </div>
        ))}
      </ScrollRail>
    </SectionShell>
  );
}

function PickCard({ pick }: { pick: TopPickCard }) {
  const p = pick.product;
  const live = isDiscountLive(p.discountPercent, p.discountEndsAt);
  const deal = live ? faDiscountedPrice(p.priceAmount, p.discountPercent) : null;
  const ratingValue = pick.rating ?? 0;
  const stars = Math.round(ratingValue);

  return (
    <article className="hp-card flex h-full flex-col overflow-hidden bg-transparent transition-shadow duration-200">
      <Link href={`/${pick.module}/${pick.slug}`} className="group block focus-visible:outline-none">
        <div
          className="relative w-full overflow-hidden bg-muted rounded-[var(--hp-r-sm)]"
          style={{ aspectRatio: "16/9" }}
        >
          <RemoteImage
            src={pick.image}
            alt={pick.title}
            sizes="(min-width: 900px) 420px, 71vw"
            className="transition-transform duration-300 group-hover:scale-[1.03] motion-reduce:transform-none object-cover"
          />
        </div>
      </Link>

      <div className="flex flex-1 flex-col py-3 px-1">
        <h3 className="line-clamp-2 text-[16px] font-bold leading-[24px] text-[color:var(--hp-ink)]">
          <Link
            href={`/${pick.module}/${pick.slug}`}
            className="transition-colors hover:text-[color:var(--top-picks-accent)] focus-visible:outline-none"
          >
            {pick.title}
          </Link>
        </h3>

        {pick.excerpt && (
          <p className="mt-1.5 line-clamp-4 text-[13px] leading-[22px] text-[color:var(--hp-ink-3)]">
            {pick.excerpt}
          </p>
        )}

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          {pick.rating != null && (
            <Tooltip>
              <TooltipTrigger
                render={<div className="flex w-fit cursor-default items-center gap-1.5" />}
              >
                <span className="flex" aria-hidden="true">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <svg
                      key={n}
                      width="14"
                      height="14"
                      viewBox="0 0 20 20"
                      className={n <= stars ? "text-[#f9bc00] fill-[#f9bc00]" : "text-muted-foreground/30 fill-muted-foreground/15"}
                    >
                      <path d="M10 1.5l2.6 5.3 5.9.9-4.2 4.1 1 5.8-5.3-2.8-5.3 2.8 1-5.8L1.5 7.7l5.9-.9L10 1.5z" />
                    </svg>
                  ))}
                </span>
                <span className="text-[13px] font-bold text-[color:var(--hp-ink)]">
                  {faRating(pick.rating)}
                </span>
                {pick.ratingCount ? (
                  <span className="text-[11px] text-[color:var(--hp-ink-3)]">
                    ({faCount(pick.ratingCount, "رأی")})
                  </span>
                ) : null}
              </TooltipTrigger>
              <TooltipContent dir="rtl" className="text-right">
                <p className="font-semibold">امتیاز: {faRating(pick.rating)} از ۵</p>
                {pick.ratingCount ? (
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    بر پایهٔ {faCount(pick.ratingCount, "رأی")}
                  </p>
                ) : null}
              </TooltipContent>
            </Tooltip>
          )}

          {p.warranty && (
            <Tooltip>
              <TooltipTrigger
                render={
                  <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground cursor-default">
                    <ShieldCheck className="size-3.5 text-emerald-500" />
                    {p.warranty}
                  </span>
                }
              />
              <TooltipContent dir="rtl">گارانتی معتبر محصول</TooltipContent>
            </Tooltip>
          )}
        </div>

        <div className="mt-auto pt-3">
          <Tooltip>
            <TooltipTrigger
              render={
                <div className="w-fit">
                  <Byline
                    author={{
                      name: pick.author?.name ?? "تحریریه",
                      username: pick.author?.username,
                      role: pick.author?.role,
                      job: pick.author?.job,
                      avatar: pick.author?.avatar,
                    }}
                    date={pick.date_fa}
                    size="sm"
                    hideRole
                  />
                </div>
              }
            >
              <TooltipContent dir="rtl">
                نویسنده مقاله: {pick.author?.name ?? "تحریریه"}
              </TooltipContent>
            </Tooltip>
          </Tooltip>
        </div>
      </div>

      {/* Price on left, shop button on right */}
      <div className="flex items-center justify-between gap-3 border-t border-[color:var(--hp-border)] bg-transparent pt-3 pb-1">
        <div className="min-w-0 text-right">
          {deal ? (
            <>
              <p className="hp-numeric truncate text-[15px] font-bold text-[color:var(--hp-ink)]">
                {deal.now}
              </p>
              <p className="hp-numeric truncate text-[11px] text-[color:var(--hp-ink-3)] line-through">
                {deal.was}
              </p>
            </>
          ) : (
            <p className="hp-numeric truncate text-[15px] font-bold text-[color:var(--hp-ink)]">
              {faPrice(p.priceAmount) || "تماس بگیرید"}
            </p>
          )}
        </div>

        <Link
          href={`/shop/${p.slug}`}
          className="shrink-0 rounded-[var(--hp-r-sm)] bg-[color:var(--hp-accent)] px-3 py-1.5 text-[12px] font-bold text-[color:var(--hp-on-accent)] transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-[color:var(--hp-brand)] focus-visible:outline-none"
        >
          ثبت سفارش این محصول از فروشگاه
        </Link>
      </div>
    </article>
  );
}

export default TopPicksSection;
