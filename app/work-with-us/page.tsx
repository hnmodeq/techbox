import { pageMetadata } from "@/lib/seo";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import PageHeader from "@/components/effects/PageHeader";

export const metadata = pageMetadata({ title: "فرصت‌های شغلی | تکباکس", description: "فرصت‌های همکاری و شغلی در تیم تکباکس.", path: "/work-with-us" });

export default async function WorkWithUs() {
  const jobs = await prisma.job.findMany({
    where: { active: true },
    orderBy: { order: 'asc' },
  });

  return (
    <main className="max-w-5xl mx-auto px-4 py-14" dir="rtl">
      <PageHeader
        colorVar="--workwithus"
        title="فرصت‌های شغلی تکباکس"
        titleClassName="text-[var(--workwithus)]"
        description={`به تیم رسانه زیرساخت ایران بپیوندید – ${jobs.length} موقعیت فعال`}
      />

      <div className="grid gap-4">
        {jobs.length > 0 ? (
          jobs.map((j) => (
            <Link 
              key={j.slug} 
              href={`/work-with-us/${j.slug}`} 
              className="bg-[var(--card-background)] text-[var(--primary-text)] border-[length:var(--border-size)] border-[var(--border-color)] rounded-[var(--corner-radius)] shadow-[var(--shadow-size)] p-5 transition-all duration-[200ms] hover:-translate-y-0.5 hover:shadow-[var(--shadow-size)] group"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-2xl font-bold group-hover:text-[var(--home)] transition-colors">
                    {j.title}
                  </h3>
                  <p className="text-[var(--paragraph-color)] opacity-80 mt-1">
                    {j.excerpt}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <Badge variant="brand">{j.type}</Badge>
                    <Badge variant="secondary">{j.remote ? "دورکاری" : "حضوری"}</Badge>
                    <Badge variant="outline">{j.team}</Badge>
                  </div>
                </div>
                <div className="text-left text-sm text-muted-foreground self-center">
                  <div className="mt-1 text-[var(--home)] font-medium">مشاهده و ارسال رزومه ←</div>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="text-center py-20 bg-[var(--card-background)] rounded-[var(--corner-radius)] border border-dashed border-[var(--border-color)]">
            <p className="text-muted-foreground text-lg">در حال حاضر موقعیت شغلی فعالی وجود ندارد.</p>
          </div>
        )}
      </div>
    </main>
  );
}

export const dynamic = "force-dynamic";
