import { ToolsGrid } from "@/features/tools/components/ToolsGrid";
import { ToolPageHeader } from "@/features/tools/components/ToolPageHeader";
import Link from "next/link";
import { pageMetadata, siteUrl } from "@/lib/seo";
import { toolRoutes } from "@/config/modules.config";
import { JsonLd } from "@/components/seo/StructuredData";

export const metadata = pageMetadata({
  title: "ابزارهای تخصصی فناوری اطلاعات | تکباکس",
  description: "محاسبه RAID و زیرشبکه، انتخاب ذخیره‌ساز شبکه و انتخاب ذخیره‌ساز دوربین برای متخصصان فناوری اطلاعات.",
  path: "/tools",
});

export default function ToolsPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "ابزارهای تخصصی فناوری اطلاعات تکباکس",
          url: `${siteUrl()}/tools`,
          inLanguage: "fa-IR",
          hasPart: toolRoutes.map((tool) => ({
            "@type": "SoftwareApplication",
            name: tool.titleFa,
            applicationCategory: "UtilitiesApplication",
            operatingSystem: "Web",
            url: `${siteUrl()}${tool.href}`,
          })),
        }}
      />
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
