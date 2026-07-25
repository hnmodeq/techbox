import { getDbModulePosts } from "@/lib/server-posts";
import ShopGrid from "@/features/shop/components/ShopGrid";
import { pageMetadata, siteUrl } from "@/lib/seo";
import { JsonLd } from "@/components/seo/StructuredData";

export const metadata = pageMetadata({
  title: "فروشگاه ذخیره‌ساز سازمانی | تکباکس",
  description: "خرید آنلاین ذخیره‌سازهای QNAP و تجهیزات زیرساخت با مشخصات فنی، قیمت به‌روز و پرداخت امن.",
  path: "/landing/storage/shop",
});

export default async function StorageShopPage() {
  const all = await getDbModulePosts("shop", 200);
  // Filter NAS related for landing shop
  const nas = all.filter((p) => {
    const brand = (p.brand || "").toLowerCase();
    const cat = (p.category || "").toLowerCase();
    const specs = (p.specs as any) || {};
    const hasBay = !!(specs["Drive Bay"] || specs["Bay"]);
    return brand.includes("qnap") || brand.includes("synology") || cat.includes("nas") || hasBay;
  });

  return (
    <main className="mx-auto max-w-[1920px] px-0 lg:px-4 py-4" dir="rtl">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "فروشگاه ذخیره‌ساز سازمانی تکباکس",
          description: "فروشگاه آنلاین تجهیزات ذخیره‌سازی و زیرساخت",
          url: `${siteUrl()}/landing/storage/shop`,
          inLanguage: "fa-IR",
          mainEntity: {
            "@type": "ItemList",
            numberOfItems: nas.length,
            itemListElement: nas.slice(0, 24).map((product, index) => ({
              "@type": "ListItem",
              position: index + 1,
              url: `${siteUrl()}/shop/${product.slug}`,
              name: product.title,
            })),
          },
        }}
      />
      <ShopGrid serverItems={nas.length > 0 ? nas : undefined} />
    </main>
  );
}
