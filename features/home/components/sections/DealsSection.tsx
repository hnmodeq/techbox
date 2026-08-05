/** Homepage shop: one section header and three simple product groups. */
import * as React from "react";
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

export function DealsSection({
  products,
  driveProducts = [],
  title = "پر فروش‌ترین محصولات دیتاسنتری",
  moreLabel = "مشاهده همه محصولات",
  showTitle = true,
  showMore = true,
  accentColor,
}: DealsSectionProps) {
  const enterpriseStorage = products.slice(0, 8);
  const homeStorage = products.slice(8, 12);
  const drives = driveProducts.slice(0, 4);
  if (enterpriseStorage.length < 4) return null;

  const style: DealsStyle = { "--deals-accent": accentColor || "var(--primary)" };

  return (
    <SectionShell labelledBy={HEADING_ID} style={style}>
      {showTitle && (
        <SectionHeader
          headingId={HEADING_ID}
          title={title}
          description="ذخیره‌سازهای رک‌مونت سازمانی، مدل‌های خانگی و درایوهای پرکاربرد؛ همگی با قیمت زنده فروشگاه."
          href={showMore ? "/shop/storage" : undefined}
          linkLabel={moreLabel}
          accentColor={accentColor}
        />
      )}
      {!showTitle && <h2 id={HEADING_ID} className="sr-only">{title}</h2>}

      <ProductGroup title="ذخیره‌سازهای سازمانی" products={enterpriseStorage} />
      {homeStorage.length > 0 && <ProductGroup title="ذخیره‌سازهای خانگی" products={homeStorage} className="mt-10" />}
      {drives.length > 0 && <ProductGroup title="پر استفاده ترین درایو های SSD و HDD" products={drives} className="mt-10" />}
    </SectionShell>
  );
}

function ProductGroup({ title, products, className = "" }: { title: string; products: ContentItem[]; className?: string }) {
  return (
    <div className={className}>
      {/* A plain title—not another section header/rule/action treatment. */}
      <p className="mb-5 text-lg font-bold text-foreground sm:text-xl">{title}</p>
      <ul className="grid grid-cols-2 gap-2.5 md:grid-cols-4 md:gap-5">
        {products.map((product) => (
          <li key={`${product.module}-${product.slug}`}>
            <ShopProductCard product={product} />
          </li>
        ))}
      </ul>
    </div>
  );
}

export default DealsSection;
