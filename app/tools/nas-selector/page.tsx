import { NasSelector } from "@/features/tools/components/nas-selector";
import { getNasProducts } from "@/lib/nas";
import { getDbModulePosts } from "@/lib/server-posts";
import { ToolPageHeader } from "@/features/tools/components/ToolPageHeader";
import type { Metadata } from "next";
import type { NasProduct } from "@/features/tools/components/nas-selector/nas-selector-data";

export const metadata: Metadata = {
  title: "انتخاب‌گر هوشمند NAS | TechBox",
  description: "با پاسخ به چند سؤال ساده، بهترین NAS را برای نیاز خود پیدا کنید. مقایسه قیمت، مشخصات و خرید از فروشگاه تکباکس.",
  openGraph: {
    title: "انتخاب‌گر هوشمند NAS | TechBox",
    description: "با پاسخ به چند سؤال ساده، بهترین NAS را برای نیاز خود پیدا کنید.",
  },
};

export default async function NasSelectorPage() {
  // 1. Get static NAS products (our curated catalog)
  const catalogProducts = await getNasProducts();

  // 2. Try fetching real shop products that might be NAS-related
  let shopProducts: NasProduct[] = [];
  try {
    const dbShopItems = await getDbModulePosts("shop", 50);
    // Map shop items to NasProduct format where applicable
    shopProducts = dbShopItems
      .filter((item) => {
        const title = item.title?.toLowerCase() || "";
        const tags = Array.isArray(item.tags) ? item.tags.join(" ").toLowerCase() : "";
        const specs = (item.specs as Record<string, unknown>) || {};
        const hasNasSpecs = Object.keys(specs).some((k) =>
          ["bay", "nas", "raid", "cpu", "network"].includes(k.toLowerCase())
        );
        return (
          title.includes("nas") ||
          title.includes("ذخیره") ||
          title.includes("سرور") ||
          title.includes("synology") ||
          title.includes("شبکه") ||
          hasNasSpecs
        );
      })
      .map((item, idx) => ({
        id: `shop-${item.slug || idx}`,
        title: item.title || "محصول فروشگاه",
        subtitle: item.excerpt || item.category || "",
        brand: item.brand || undefined,
        imageUrl: item.image || undefined,
        href: `/shop/${item.slug || ""}`,
        shopSlug: item.slug || "",
        bays: parseInt(String((item.specs as any)?.Bay || "0"), 10) || 4,
        maxRawTb: 0,
        maxRamGb: 0,
        cpuTier: 3 as const,
        networkGbE: 1,
        nvme: false,
        expansion: false,
        formFactor: "desktop" as const,
        priceTier: 3 as const,
        tags: Array.isArray(item.tags) ? item.tags : [],
        bestFor: ["backup"] as any[],
        inStock: item.availability !== "ناموجود",
        price: item.priceAmount || item.priceLabel || 0,
      }));
  } catch {
    // Non-critical; fall back to catalog
  }

  // Merge: catalog products first, then any shop products found
  const allProducts = [...catalogProducts, ...shopProducts];

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <ToolPageHeader
        title="انتخاب‌گر هوشمند NAS"
        subtitle="با回答 به ۴ سؤال ساده، بهترین NAS را برای نیاز خود پیدا کنید. نتایج بر اساس محصولات واقعی فروشگاه محاسبه می‌شوند."
        accent="bg-primary"
        breadcrumbs={[
          { label: "خانه", href: "/" },
          { label: "ابزارها", href: "/tools" },
          { label: "NAS Selector" },
        ]}
      />

      {/* Stats banner */}
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "محصولات قابل مقایسه", value: allProducts.length, icon: "server" },
          { label: "سناریوی کاربری", value: "۵ حالت", icon: "user" },
          { label: "نوع RAID قابل پشتیبانی", value: "۵ نوع", icon: "shield" },
          { label: "محصولات واقعی از فروشگاه", value: "با قیمت", icon: "cart" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="flex flex-col items-center justify-center rounded-xl border-2 border-border/60 bg-card p-3 sm:p-4 text-center"
          >
            <span className="text-[18px] sm:text-[22px] font-black text-foreground">
              {stat.value}
            </span>
            <span className="mt-1 text-[10px] sm:text-[11px] text-muted-foreground font-medium">
              {stat.label}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <NasSelector
          products={allProducts}
          compareHref="/shop"
          consultationHref="/consultation"
        />
      </div>
    </main>
  );
}
