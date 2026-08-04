import { getDbModulePosts } from "@/lib/server-posts";
import ShopGrid from "@/features/shop/components/ShopGrid";
import { pageMetadata, siteUrl } from "@/lib/seo";
import { JsonLd } from "@/components/seo/StructuredData";
import { isDriveProduct } from "@/lib/shop-product-kind";

export const metadata = pageMetadata({
  title: "فروشگاه هارد و SSD سازمانی | تکباکس",
  description: "خرید HDD و SSD سازمانی سازگار با ذخیره‌سازها؛ فیلتر بر اساس ظرفیت، رابط، سرعت، فرم فاکتور و دوام.",
  path: "/shop/drive",
});

export default async function DriveShopPage() {
  const all = await getDbModulePosts("shop", 250);
  const drives = all.filter(isDriveProduct);

  return (
    <main className="mx-auto max-w-[1920px] px-0 py-4 lg:px-4" dir="rtl">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "فروشگاه درایو سازمانی تکباکس",
          description: "فروشگاه HDD و SSD سازمانی سازگار با ذخیره‌سازها",
          url: `${siteUrl()}/shop/drive`,
          inLanguage: "fa-IR",
          mainEntity: {
            "@type": "ItemList",
            numberOfItems: drives.length,
            itemListElement: drives.slice(0, 24).map((product, index) => ({
              "@type": "ListItem",
              position: index + 1,
              url: `${siteUrl()}/shop/${product.slug}`,
              name: product.title,
            })),
          },
        }}
      />
      <ShopGrid serverItems={drives} kind="drive" />
    </main>
  );
}
