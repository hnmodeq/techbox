import jobs from "@/prisma/mock-data/jobs.json";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import PageHeader from "@/components/effects/PageHeader";

export const metadata = { title: "فرصت‌های شغلی | تکباکس" };

export default function WorkWithUs(){
 return (
 <main className="max-w-5xl mx-auto px-4 py-14" dir="rtl">
 <PageHeader
 colorVar="--workwithus"
 title="فرصت‌های شغلی تکباکس"
 titleClassName="text-[var(--workwithus)]"
 description={`به تیم رسانه زیرساخت ایران بپیوندید – ${jobs.length} موقعیت فعال`}
 />

 <div className="grid gap-4">
 {jobs.map(j=>(
 <Link key={j.slug} href={`/work-with-us/${j.slug}`} className="bg-[var(--card-background)] text-[var(--primary-text)] border-[length:var(--border-size)] border-[var(--border-color)] rounded-[var(--corner-radius)] shadow-[var(--shadow-size)] p-5 transition-all duration-[200ms] hover:-translate-y-0.5 hover:shadow-[var(--shadow-size)] group">
 <div className="flex flex-wrap items-start justify-between gap-3">
 <div>
 <h3 className=" text-[length:var(--h2-font-size)] text-[var(--h2-font-color)] font-bold group-hover:text-[var(--home)]">{j.title}</h3>
 <p className="text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] text-muted-foreground mt-1">{j.excerpt}</p>
 <div className="flex flex-wrap gap-2 mt-3 text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)]">
 <Badge variant="brand">{j.type}</Badge>
 <Badge variant="secondary">{j.remote}</Badge>
 <Badge variant="outline">{j.team}</Badge>
 </div>
 </div>
 <div className="text-left text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] text-muted-foreground">
 {j.date_fa}
 <div className="mt-1 text-[var(--home)]">مشاهده →</div>
 </div>
 </div>
 </Link>
 ))}
 </div>
 </main>
 );
}
