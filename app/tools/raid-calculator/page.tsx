import { RaidCalculator } from "@/features/tools/components/raid-calculator";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "محاسبه ظرفیت RAID و SHR | تکباکس",
  description: "محاسبه ظرفیت قابل استفاده، فضای افزونگی و تحمل خرابی RAID 0، 1، 5، 6، 10 و SHR.",
  path: "/tools/raid-calculator",
});

export default function RaidCalculatorPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-6">
      <RaidCalculator />
    </main>
  );
}
