import SubnetCalculator from "@/features/tools/components/SubnetCalculator";
import { ToolPageHeader } from "@/features/tools/components/ToolPageHeader";

export const metadata = {
  title: "Subnet Calculator | TechBox",
  description: "ماشین حساب ساب‌نت – بدون تغییر",
};

export default function SubnetCalculatorPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <ToolPageHeader
        title="ماشین حساب ساب‌نت"
        subtitle="بدون تغییر – نسخه فعلی شما"
        accent="var(--subnet)"
        breadcrumbs={[
          { label: "خانه", href: "/" },
          { label: "ابزارها", href: "/tools" },
          { label: "Subnet Calculator" },
        ]}
      />
      <div className="mt-8">
        <SubnetCalculator />
      </div>
    </main>
  );
}
