import { RaidCalculator } from "@/features/tools/components/raid-calculator";
import { ToolPageHeader } from "@/features/tools/components/ToolPageHeader";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "ماشین حساب RAID / SHR | TechBox",
  description: "محاسبه ظرفیت RAID 0/1/5/6/10 و SHR-1/SHR-2 با Hot Spare و دیسک ترکیبی.",
};

export default function RaidCalculatorPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <ToolPageHeader
        title="ماشین حساب RAID"
        subtitle="RAID 0 · 1 · 5 · 6 · 10 · SHR-1 · SHR-2"
        accent="var(--raid)"
        breadcrumbs={[
          { label: "خانه", href: "/" },
          { label: "ابزارها", href: "/tools" },
          { label: "RAID Calculator" },
        ]}
      />
      <div className="mt-8">
        <RaidCalculator />
      </div>

      <section className="mt-10 bg-[var(--card-background)] text-[var(--primary-text)] border-[length:var(--border-size)] border-[var(--border-color)] rounded-[var(--corner-radius)] shadow-[var(--shadow-size)] p-5">
        <h2 className="text-[length:var(--h2-font-size)] text-[var(--h2-font-color)] font-bold mb-3">پیشنهاد محصول مرتبط</h2>
        <p className="text-[length:var(--h3-font-size)] text-[var(--h3-font-color)] font-semibold paragraph-color">
          بعد از محاسبه RAID، مدل NAS پیشنهادی خود را در <Link className="text-[var(--home)] font-bold hover:underline" href="/tools/nas-selector">انتخاب‌گر NAS</Link> ببینید یا مستقیم از فروشگاه هارد مناسب تهیه کنید.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href="/tools/nas-selector" className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-[var(--corner-radius)] font-semibold transition-all cursor-pointer bg-[var(--button-background)] text-[var(--primary-text)] border-[length:var(--border-size)] border-[var(--border-color)] shadow-[var(--shadow-size)]">رفتن به NAS Selector</Link>
          <Link href="/shop?category=nas" className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-[var(--corner-radius)] font-semibold transition-all cursor-pointer bg-transparent text-[var(--primary-text)] border-[length:var(--border-size)] border-[var(--border-color)] hover:bg-[var(--button-background)]/40">مشاهده NAS ها در فروشگاه</Link>
          <Link href="/tools/subnet-calculator" className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-[var(--corner-radius)] font-semibold transition-all cursor-pointer bg-transparent text-[var(--primary-text)] border-[length:var(--border-size)] border-[var(--border-color)] hover:bg-[var(--button-background)]/40">Subnet Calculator</Link>
        </div>
      </section>
    </main>
  );
}
