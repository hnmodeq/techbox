import { NasSelectorWizard } from "@/features/tools/components/nas-selector-wizard";
import { getDbModulePosts } from "@/lib/server-posts";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "انتخاب ذخیره‌ساز شبکه | TechBox",
  description: "با پاسخ به ۴ سؤال ساده، بهترین NAS را برای نیاز خود پیدا کنید.",
};

export default async function NasSelectorPage() {
  // Fetch real shop products
  let products: any[] = [];
  try {
    const dbItems = await getDbModulePosts("shop", 100);
    products = dbItems
      .filter((item) => {
        const title = item.title?.toLowerCase() || "";
        const specs = (item.specs as Record<string, unknown>) || {};
        const hasNasSpecs = Object.keys(specs).some((k) =>
          ["bay", "nas", "raid", "cpu", "network"].includes(k.toLowerCase())
        );
        return title.includes("nas") || title.includes("ذخیره") || title.includes("synology") || title.includes("qnap") || hasNasSpecs;
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
      <NasSelectorWizard products={products} />
    </main>
  );
}
