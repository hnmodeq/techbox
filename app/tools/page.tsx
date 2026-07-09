import { ToolsGrid } from "@/features/tools/components/ToolsGrid";
import { ToolPageHeader } from "@/features/tools/components/ToolPageHeader";
import type { Metadata } from "next";
import Link from "next/link";

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
        accent="var(--tools)"
        breadcrumbs={[{ label: "خانه", href: "/" }, { label: "ابزارها" }]}
      />

      <div className="mt-8">
        <ToolsGrid />
      </div>

      <section className="mt-12 bg-[var(--card-background)] text-[var(--primary-text)] border-[length:var(--border-size)] border-[var(--border-color)] rounded-[var(--corner-radius)] shadow-[var(--shadow-size)] p-6">
        <h2 className="text-[length:var(--h2-font-size)] text-[var(--h2-font-color)] font-bold mb-2">توضیحات ابزارها</h2>
        <p className="text-[length:var(--h3-font-size)] text-[var(--h3-font-color)] font-semibold paragraph-color">
          ابزارهای انتخاب‌گر به صورت زنده از کاتالوگ محصولات تخصصی در <code className="text-[11px]">/data/tools/</code> استفاده می‌کنند.
          این ابزارها برای کمک به مهندسین در انتخاب بهینه‌ترین سخت‌افزار بر اساس نیازهای پروژه طراحی شده‌اند.
        </p>
        <div className="mt-4 flex flex-wrap gap-2 text-[12px]">
          <Link href="/tools/nas-selector" className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-[var(--corner-radius)] font-semibold transition-all cursor-pointer bg-[var(--button-background)] text-[var(--primary-text)] border-[length:var(--border-size)] border-[var(--border-color)] shadow-[var(--shadow-size)]">NAS Selector</Link>
          <Link href="/tools/nvr-selector" className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-[var(--corner-radius)] font-semibold transition-all cursor-pointer bg-[var(--button-background)] text-[var(--primary-text)] border-[length:var(--border-size)] border-[var(--border-color)] shadow-[var(--shadow-size)]" style={{ background: "var(--raid)" }}>NVR Selector</Link>
          <Link href="/tools/raid-calculator" className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-[var(--corner-radius)] font-semibold transition-all cursor-pointer bg-transparent text-[var(--primary-text)] border-[length:var(--border-size)] border-[var(--border-color)] hover:bg-[var(--button-background)]/40">RAID Calculator v2</Link>
          <Link href="/tools/subnet-calculator" className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-[var(--corner-radius)] font-semibold transition-all cursor-pointer bg-transparent text-[var(--primary-text)] border-[length:var(--border-size)] border-[var(--border-color)] hover:bg-[var(--button-background)]/40">Subnet Calculator</Link>
        </div>
      </section>
    </main>
  );
}
