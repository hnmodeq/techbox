import Link from "next/link";
import { UpsCalculator } from "@/features/tools/components/ups-calculator";
import { ToolPageHeader } from "@/features/tools/components/ToolPageHeader";
import { pageMetadata, siteUrl } from "@/lib/seo";
import { JsonLd } from "@/components/seo/StructuredData";

export const metadata = pageMetadata({
  title: "محاسبه توان و زمان پشتیبانی UPS | تکباکس",
  description:
    "برآورد ظرفیت UPS بر اساس بار رک، ضریب توان، زمان پشتیبانی و افزونگی. محاسبه بلوک باتری، گرمای تولیدی و مصرف سالانه.",
  path: "/tools/ups-calculator",
});

export default function UpsCalculatorPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10" dir="rtl">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: "محاسبه توان UPS تکباکس",
          applicationCategory: "UtilitiesApplication",
          operatingSystem: "Web",
          url: `${siteUrl()}/tools/ups-calculator`,
          inLanguage: "fa-IR",
        }}
      />
      <ToolPageHeader
        title="محاسبه توان UPS"
        subtitle="ظرفیت موردنیاز، تعداد بلوک باتری و زمان پشتیبانی را بر اساس بار واقعی رک برآورد کنید"
        accent="bg-primary"
        breadcrumbs={[
          { label: "خانه", href: "/" },
          { label: "ابزارها", href: "/tools" },
          { label: "محاسبه توان UPS" },
        ]}
      />

      <div className="mt-8">
        <UpsCalculator />
      </div>

      <section className="mt-12 rounded-lg border border-border bg-card p-6 text-foreground shadow-sm">
        <h2 className="mb-2 text-xl font-bold">این ابزار چه کاری انجام می‌دهد؟</h2>
        <p className="text-sm leading-7 text-muted-foreground">
          مجموع توان تجهیزات را می‌گیرد، حاشیه رشد را اضافه می‌کند، آن را با ضریب توان به
          توان ظاهری (VA) تبدیل می‌کند و سپس سقف بارگذاری ۸۰٪ را اعمال می‌کند تا نزدیک‌ترین
          مدل استاندارد پیشنهاد شود. برای زمان پشتیبانی نیز تعداد بلوک باتری لازم را
          محاسبه می‌کند.
        </p>
        <div className="mt-4 flex flex-wrap gap-2 text-[12px]">
          <Link href="/tools/raid-calculator" className="inline-flex items-center rounded-md border border-border bg-muted px-4 py-2 font-semibold transition-colors hover:bg-muted/80">محاسبه فضای ذخیره‌ساز</Link>
          <Link href="/tools/nas-selector" className="inline-flex items-center rounded-md border border-border bg-transparent px-4 py-2 font-semibold transition-colors hover:bg-muted/50">انتخاب ذخیره‌ساز شبکه</Link>
          <Link href="/tools" className="inline-flex items-center rounded-md border border-border bg-transparent px-4 py-2 font-semibold transition-colors hover:bg-muted/50">همه ابزارها</Link>
        </div>
      </section>
    </main>
  );
}
