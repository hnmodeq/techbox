import jobs from "@/data/jobs.json";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import PageHeader from "@/components/effects/PageHeader";

export const metadata = { title: "فرصت‌های شغلی | تکباکس" };

export default function WorkWithUs(){
 return (
 <main className="max-w-5xl mx-auto px-4 py-14" dir="rtl">
 <PageHeader
 colorVar="--tb-workwithus"
 title="فرصت‌های شغلی تکباکس"
 titleClassName="text-[var(--tb-workwithus)]"
 description={`به تیم رسانه زیرساخت ایران بپیوندید – ${jobs.length} موقعیت فعال`}
 />

 <div className="grid gap-4">
 {jobs.map(j=>(
 <Link key={j.slug} href={`/workwithus/${j.slug}`} className="card p-5 transition-all duration-[var(--tb-motion-md)] hover:-translate-y-0.5 hover:shadow-[var(--tb-shadow-lg)] group">
 <div className="flex flex-wrap items-start justify-between gap-3">
 <div>
 <h3 className=" tb-text-lg group-hover:text-[var(--tb-primary)]">{j.title}</h3>
 <p className="tb-text-sm text-muted-foreground mt-1">{j.excerpt}</p>
 <div className="flex flex-wrap gap-2 mt-3 tb-text-sm">
 <Badge variant="brand">{j.type}</Badge>
 <Badge variant="secondary">{j.remote}</Badge>
 <Badge variant="outline">{j.team}</Badge>
 </div>
 </div>
 <div className="text-left tb-text-sm text-muted-foreground">
 {j.date_fa}
 <div className="mt-1 text-[var(--tb-primary)]">مشاهده →</div>
 </div>
 </div>
 </Link>
 ))}
 </div>
 </main>
 );
}
