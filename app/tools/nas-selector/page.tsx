import { NasSelector } from "@/features/tools/components/nas-selector";
import { getNasProducts } from "@/lib/nas";
import { ToolPageHeader } from "@/features/tools/components/ToolPageHeader";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "انتخاب‌گر NAS | TechBox",
  description: "با انتخاب نوع کاربری و ظرفیت مورد نیاز، بهترین تجهیزات ذخیره‌سازی را از فروشگاه تکباکس پیدا کنید.",
};

export default async function NasSelectorPage() {
  const products = await getNasProducts();

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <ToolPageHeader
        title="NAS Selector"
        subtitle="با انتخاب نوع کاربری و ظرفیت مورد نیاز، بهترین تجهیزات ذخیره‌سازی را پیدا کنید."
        accent="bg-primary"
        breadcrumbs={[
          { label: "خانه", href: "/" },
          { label: "ابزارها", href: "/tools" },
          { label: "NAS Selector" },
        ]}
      />

      <div className="mt-8">
        <NasSelector
          products={products}
          compareHref="/shop"
          consultationHref="/consultation"
        />
      </div>
    </main>
  );
}
