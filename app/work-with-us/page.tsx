import { pageMetadata } from "@/lib/seo";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export const metadata = pageMetadata({ title: "موقعیت‌های شغلی | تکباکس", description: "فرصت‌های همکاری و شغلی در تیم تکباکس.", path: "/work-with-us" });

export default async function WorkWithUs() {
  // Fetch page title from settings
  let pageTitle = "موقعیت‌های شغلی تکباکس";
  try {
    const row = await prisma.siteSetting.findUnique({ where: { key: "jobs.pageTitle" } });
    if (row?.value) pageTitle = row.value;
  } catch {}

  const jobs = await prisma.job.findMany({
    where: { active: true },
    orderBy: { order: 'asc' },
  });

  return (
    <main className="max-w-4xl mx-auto px-4 py-12" dir="rtl">
      {/* Header */}
      <header className="mb-10">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground">{pageTitle}</h1>
        {jobs.length > 0 && (
          <p className="mt-2 text-sm text-muted-foreground">{jobs.length.toLocaleString("fa-IR")} موقعیت فعال</p>
        )}
      </header>

      {/* Job list */}
      <div className="space-y-3">
        {jobs.length > 0 ? (
          jobs.map((j: any) => (
            <Link
              key={j.slug}
              href={`/work-with-us/${j.slug}`}
              className="block border border-border rounded-xl bg-card p-5 hover:border-primary/30 hover:bg-accent/30 transition-all duration-200 group"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold group-hover:text-primary transition-colors">
                    {j.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                    {j.excerpt}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <Badge variant="secondary">{j.type}</Badge>
                    <Badge variant="outline">{j.remote ? "دورکاری" : "حضوری"}</Badge>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground group-hover:text-primary transition-colors shrink-0">
                  مشاهده ←
                </span>
              </div>
            </Link>
          ))
        ) : (
          <div className="text-center py-20 border border-dashed border-border rounded-xl">
            <p className="text-muted-foreground">در حال حاضر موقعیت شغلی فعالی وجود ندارد.</p>
          </div>
        )}
      </div>
    </main>
  );
}

export const dynamic = "force-dynamic";
