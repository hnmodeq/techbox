import { NvrCalculator } from "@/features/tools/components/nvr-calculator";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "محاسبه‌گر فضای ذخیره‌سازی دوربین | TechBox",
  description: "محاسبه فضای مورد نیاز و پهنای باند برای سیستم دوربین مداربسته.",
};

export default function NvrSelectorPage() {
  return (
    <main className="min-h-[80vh] flex items-center justify-center px-4 py-10" dir="rtl">
      <NvrCalculator />
    </main>
  );
}
