import SubnetCalculator from "@/features/tools/components/SubnetCalculator";
import PageHeader from "@/components/effects/PageHeader";
export const metadata = { title: "ماشین حساب Subnet | تکباکس" };
export default function Page(){
 return (
 <main className="max-w-3xl mx-auto px-4 py-12" dir="rtl">
 <PageHeader
 colorVar="--tb-subnet"
 title="Subnet Calculator فارسی"
 description="CIDR → Network / Broadcast / Host Range"
 titleClassName="text-[var(--tb-subnet)]"
 />
 <SubnetCalculator />
 </main>
 );
}
