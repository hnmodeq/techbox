import { ToolsGrid } from "@/features/tools/components/ToolsGrid";
import { ToolPageHeader } from "@/features/tools/components/ToolPageHeader";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "ابزارها | TechBox",
  description: "محاسبه فضای ذخیره‌ساز، انتخاب ذخیره‌ساز شبکه، انتخاب ذخیره‌ساز دوربین، محاسبه زیرشبکه",
};

export default function ToolsPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <ToolPageHeader
        title="ابزارهای TechBox"
        subtitle="محاسبه فضای ذخیره‌ساز، انتخاب ذخیره‌ساز شبکه و دوربین، محاسبه زیرشبکه"
        accent="primary"
        breadcrumbs={[{ label: "خانه", href: "/" }, { label: "ابزارها" }]}
      />

      <div className="mt-8">
        <ToolsGrid />
      </div>

      <section className="mt-12 bg-card text-foreground border border-border rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-bold mb-2">توضیحات ابزارها</h2>
        <p className="text-sm text-muted-foreground">
          ابزارهای انتخاب‌گر به صورت زنده از کاتالوگ محصولات تخصصی در <code className="text-[11px]">/data/tools/</code> استفاده می‌کنند.
          این ابزارها برای کمک به مهندسین در انتخاب بهینه‌ترین سخت‌افزار بر اساس نیازهای پروژه طراحی شده‌اند.
        </p>
        <div className="mt-4 flex flex-wrap gap-2 text-[12px]">
          <Link href="/tools/raid-calculator" className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md font-semibold transition-all cursor-pointer bg-muted text-foreground border border-border hover:bg-muted/80">محاسبه فضای ذخیره‌ساز</Link>
          <Link href="/tools/nas-selector" className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md font-semibold transition-all cursor-pointer bg-primary text-primary-foreground border border-border hover:bg-primary/90">انتخاب ذخیره‌ساز شبکه</Link>
          <Link href="/tools/nvr-selector" className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md font-semibold transition-all cursor-pointer bg-transparent text-foreground border border-border hover:bg-muted/50">انتخاب ذخیره‌ساز دوربین</Link>
          <Link href="/tools/subnet-calculator" className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md font-semibold transition-all cursor-pointer bg-transparent text-foreground border border-border hover:bg-muted/50">محاسبه زیرشبکه</Link>
        </div>
      </section>
    </main>
  );
}
