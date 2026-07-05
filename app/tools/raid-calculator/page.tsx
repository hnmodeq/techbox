import { RaidCalculator } from "@/features/tools/components/raid-calculator";
import { ToolPageHeader } from "@/features/tools/components/ToolPageHeader";
import type { Metadata } from "next";

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

      <section className="mt-10 card p-5">
        <h2 className="text-[length:var(--h2-font-size)] text-[var(--h2-font-color)] font-bold mb-3">پیشنهاد محصول مرتبط</h2>
        <p className="text-[length:var(--h3-font-size)] text-[var(--h3-font-color)] font-semibold paragraph-color">
          بعد از محاسبه RAID، مدل NAS پیشنهادی خود را در <a className="text-[var(--home)] font-bold hover:underline" href="/tools/nas-selector">انتخاب‌گر NAS</a> ببینید یا مستقیم از فروشگاه هارد مناسب تهیه کنید.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <a href="/tools/nas-selector" className="btn btn-primary">رفتن به NAS Selector</a>
          <a href="/shop?category=nas" className="btn btn-ghost">مشاهده NAS ها در فروشگاه</a>
          <a href="/tools/subnet-calculator" className="btn btn-ghost">Subnet Calculator</a>
        </div>
      </section>
    </main>
  );
}
