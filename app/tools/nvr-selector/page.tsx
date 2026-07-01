import { NvrSelector } from "@/features/tools/components/nvr-selector";
import { getNvrProducts } from "@/lib/nvr";
import { ModuleHeader } from "@/components/effects/ModuleHeader";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "انتخاب‌گر NVR | TechBox",
  description: "بهترین دستگاه NVR را بر اساس دوربین، رزولوشن، مدت ضبط و AI انتخاب کنید.",
};

export default async function NvrSelectorPage() {
  const products = await getNvrProducts();

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <ModuleHeader
        module="tools"
        title="انتخاب‌گر NVR"
        subtitle="پیشنهاد مدل NVR مناسب پروژه دوربین مداربسته"
        breadcrumbs={[
          { label: "خانه", href: "/" },
          { label: "ابزارها", href: "/tools" },
          { label: "NVR Selector" },
        ]}
      />
      <div className="mt-8">
        <NvrSelector products={products} consultationHref="/consultation" />
      </div>
    </main>
  );
}
