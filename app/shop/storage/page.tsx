import { getDbModulePosts } from "@/lib/server-posts";
import ShopGrid from "@/features/shop/components/ShopGrid";
import { pageMetadata, siteUrl } from "@/lib/seo";
import { JsonLd } from "@/components/seo/StructuredData";
import { isDriveProduct } from "@/lib/shop-product-kind";

export const metadata = pageMetadata({
  title: "فروشگاه ذخیره‌ساز سازمانی | تکباکس",
  description: "خرید ذخیره‌سازهای رک‌مونت و تاور با مشخصات فنی، فیلترهای تخصصی و قیمت به‌روز.",
  path: "/shop/storage",
});

export default async function StorageShopPage() {
  const all = await getDbModulePosts("shop", 250);
  const storageSystems = all.filter((product) => !isDriveProduct(product));

  return (
    <main className="mx-auto max-w-[1920px] px-0 py-4 lg:px-4" dir="rtl">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "فروشگاه ذخیره‌ساز سازمانی تکباکس",
          description: "فروشگاه آنلاین ذخیره‌سازهای سازمانی، رک‌مونت و تاور",
          url: `${siteUrl()}/shop/storage`,
          inLanguage: "fa-IR",
          mainEntity: {
            "@type": "ItemList",
            numberOfItems: storageSystems.length,
            itemListElement: storageSystems.slice(0, 24).map((product, index) => ({
              "@type": "ListItem",
              position: index + 1,
              url: `${siteUrl()}/shop/${product.slug}`,
              name: product.title,
            })),
          },
        }}
      />
      <ShopGrid serverItems={storageSystems} kind="storage" />
    </main>
  );
}
