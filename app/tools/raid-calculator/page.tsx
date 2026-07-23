import { RaidCalculator } from "@/features/tools/components/raid-calculator";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "محاسبه فضای ذخیره‌ساز | TechBox",
  description: "محاسبه ظرفیت RAID 0/1/5/6/10 و SHR-1/SHR-2 با ظرفیت‌های ترکیبی.",
};

export default function RaidCalculatorPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-6">
      <RaidCalculator />
    </main>
  );
}
