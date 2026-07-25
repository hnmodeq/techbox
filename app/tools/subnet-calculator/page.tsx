import { SubnetCalculator } from "@/features/tools/components/subnet-calculator";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "محاسبه زیرشبکه و CIDR | تکباکس",
  description: "محاسبه آدرس شبکه، Subnet Mask، Broadcast، محدوده IP و تعداد میزبان قابل استفاده.",
  path: "/tools/subnet-calculator",
});

export default function SubnetCalculatorPage() {
  return (
    <main className="min-h-[80vh] flex items-center justify-center px-4 py-10" dir="rtl">
      <SubnetCalculator />
    </main>
  );
}
