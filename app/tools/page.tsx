import { ToolsGrid } from "@/features/tools/components/ToolsGrid";
import { ToolPageHeader } from "@/features/tools/components/ToolPageHeader";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ابزارها | TechBox",
  description: "NAS Selector، NVR Selector، RAID Calculator، Subnet Calculator",
};

export default function ToolsPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <ToolPageHeader
        title="ابزارهای TechBox"
        subtitle="انتخاب‌گر NAS و NVR، محاسبه RAID/SHR و ساب‌نت"
        accent="var(--tb-tools)"
        breadcrumbs={[{ label: "خانه", href: "/" }, { label: "ابزارها" }]}
      />

      <div className="mt-8">
        <ToolsGrid />
      </div>

      <section className="mt-12 card p-6">
        <h2 className="text-[length:var(--h2-font-size)] text-[var(--h2-font-color)] font-bold mb-2">اتصال به فروشگاه</h2>
        <p className="text-[length:var(--h3-font-size)] text-[var(--h3-font-color)] font-semibold paragraph-color">
          ابزارهای انتخاب‌گر به صورت زنده از <code className="text-[11px]">/data/nas-products.json</code> و <code className="text-[11px]">/data/nvr-products.json</code> می‌خوانند و با <code className="text-[11px]">/data/shop.json</code> مرج می‌شوند. 
          برای افزودن محصول واقعی کافیست <b>shopSlug</b> را برابر slug فروشگاه قرار دهید – قیمت، موجودی و تصویر به صورت خودکار sync می‌شود.
        </p>
        <div className="mt-4 flex flex-wrap gap-2 text-[12px]">
          <a href="/tools/nas-selector" className="btn btn-primary">NAS Selector</a>
          <a href="/tools/nvr-selector" className="btn btn-primary" style={{ background: "var(--tb-raid)" }}>NVR Selector</a>
          <a href="/tools/raid-calculator" className="btn btn-ghost">RAID Calculator v2</a>
          <a href="/tools/subnet-calculator" className="btn btn-ghost">Subnet Calculator</a>
        </div>
      </section>
    </main>
  );
}
