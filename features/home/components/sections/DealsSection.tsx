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
import ShopProductCard from "@/features/shop/components/ShopProductCard";
import { SectionShell, SectionHeader } from "../primitives";

export type DealsSectionProps = {
  products: ContentItem[];
  driveProducts?: ContentItem[];
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
  driveProducts = [],
  title = "بهترین پیشنهادهای امروز",
  moreLabel = "مشاهده همه محصولات",
  showTitle = true,
  showMore = true,
  accentColor,
}: DealsSectionProps) {
  if (!products || products.length < MIN_PRODUCTS) return null;

  const style: DealsStyle = { "--deals-accent": accentColor || "var(--primary)" };

  return (
    <SectionShell labelledBy={HEADING_ID} style={style}>
      {showTitle && (
        <SectionHeader
          headingId={HEADING_ID}
          title={title}
          description="ترکیبی از پرفروش‌ترین‌ها و بیشترین تخفیف‌ها؛ شش ذخیره‌ساز رک‌مونت و دو مدل تاور."
          href={showMore ? "/shop/storage" : undefined}
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

      {driveProducts.length > 0 && (
        <div className="mt-10">
          <div className="mb-5 flex items-center gap-4">
            <h3 className="shrink-0 text-xl font-bold text-foreground">پراستفاده‌ترین درایوها</h3>
            <span aria-hidden="true" className="hidden h-px flex-1 bg-[color:var(--deals-accent)] sm:block" />
            <Link href="/shop/drive" className="shrink-0 text-xs font-bold text-[color:var(--deals-accent)] underline-offset-4 hover:underline">
              مشاهده همه درایوها
            </Link>
          </div>
          <ul className="grid grid-cols-2 gap-2.5 md:grid-cols-4 md:gap-5">
            {driveProducts.map((product) => (
              <li key={`${product.module}-${product.slug}`}>
                <DealCard item={product} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </SectionShell>
  );
}

function DealCard({ item }: { item: ContentItem }) {
  // Keep homepage commerce visually and behaviourally identical to /shop.
  return <ShopProductCard product={item} />;
}

export default DealsSection;
