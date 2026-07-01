import Link from "next/link";
import RaidCalculator from "@/features/tools/components/RaidCalculator";
import PageHeader from "@/components/effects/PageHeader";
export const metadata = { title: "ماشین حساب RAID | تکباکس" };
export default function Page(){
 return (
 <main className="max-w-4xl mx-auto px-4 py-12" dir="rtl">
 <PageHeader
 colorVar="--tb-raid"
 title="RAID Calculator"
 description="محاسبه ظرفیت مفید، تحمل خطا و راندمان – اجرا مستقیم در مرورگر"
 titleClassName="text-[var(--tb-raid)]"
 />
 <RaidCalculator />
 <div className="tb-text-sm mt-4 text-[var(--tb-fg-muted)]">
 راهنما: <Link href="/blog/hp-raid-config" className="underline text-[var(--tb-raid)]">راهنمای RAID در سرورهای HP – بلاگ تکباکس</Link>
 </div>
 </main>
 );
}
