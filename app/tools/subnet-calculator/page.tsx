import SubnetCalculator from "@/features/tools/components/SubnetCalculator";
export const metadata = { title: "ماشین حساب Subnet | تکباکس" };
export default function Page(){
  return (
    <main className="max-w-3xl mx-auto px-4 py-12" dir="rtl">
      <h1 className="mb-2 text-2xl font-black text-[var(--tb-subnet)]">Subnet Calculator فارسی</h1>
      <p className="mb-6 text-sm text-[var(--tb-muted-foreground)]">CIDR → Network / Broadcast / Host Range</p>
      <SubnetCalculator />
    </main>
  );
}
