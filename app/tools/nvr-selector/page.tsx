import { NvrSelectorWizard } from "@/features/tools/components/nvr-selector-wizard";
import { getDbModulePosts } from "@/lib/server-posts";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "انتخاب ذخیره‌ساز دوربین | تکباکس",
  description: "محاسبه ظرفیت و انتخاب ذخیره‌ساز مناسب بر اساس تعداد دوربین، وضوح تصویر و مدت نگهداری.",
  path: "/tools/nvr-selector",
});

export default async function NvrSelectorPage() {
  // Fetch NAS/server products that can be used as NVR
  let products: any[] = [];
  try {
    const dbItems = await getDbModulePosts("shop", 100);
    products = dbItems
      .filter((item) => {
        const title = (item.title || "").toLowerCase();
        const specs = (item.specs as Record<string, unknown>) || {};
        const hasNasSpecs = Object.keys(specs).some((k) =>
          ["bay", "nas", "raid", "cpu"].includes(k.toLowerCase())
        );
        return title.includes("nas") || title.includes("qnap") || title.includes("synology") || hasNasSpecs;
      })
      .map((item) => ({
        slug: item.slug,
        title: item.title,
        excerpt: item.excerpt,
        image: item.image,
        brand: item.brand,
        price: item.priceAmount,
        specs: item.specs || {},
        availability: item.availability,
      }));
  } catch {}

  return (
    <main className="min-h-[80vh] flex items-center justify-center px-4 py-10" dir="rtl">
      <NvrSelectorWizard products={products} />
    </main>
  );
}
