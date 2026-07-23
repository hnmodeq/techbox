import { SubnetCalculator } from "@/features/tools/components/subnet-calculator";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "محاسبه زیرشبکه | TechBox",
  description: "محاسبه آدرس شبکه، ماسک، محدوده IP و تعداد میزبان قابل استفاده.",
};

export default function SubnetCalculatorPage() {
  return (
    <main className="min-h-[80vh] flex items-center justify-center px-4 py-10" dir="rtl">
      <SubnetCalculator />
    </main>
  );
}
