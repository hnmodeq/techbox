import { prisma } from "@/lib/db";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import ApplyForm from "@/features/work-with-us/components/ApplyForm";
import { pageMetadata } from "@/lib/seo";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const { slug } = await params;
  const job = await prisma.job.findFirst({ where: { slug, active: true } });
  
  if (!job) return pageMetadata({ title: "شغل یافت نشد", path: "/work-with-us" });
  
  return pageMetadata({ 
    title: `${job.title} | تکباکس`, 
    description: job.excerpt,
    path: `/work-with-us/${job.slug}`
  });
}

export default async function JobPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const job = await prisma.job.findFirst({
    where: { slug, active: true },
  });

  if (!job) {
    notFound();
  }

  const dateFa = new Intl.DateTimeFormat("fa-IR", { dateStyle: "long" }).format(job.createdAt);

  return (
    <main className="max-w-3xl mx-auto px-4 py-12" dir="rtl">
      <div className="text-sm text-muted-foreground mb-4">
        <Link href="/work-with-us" className="hover:text-[var(--home)] transition-colors">
          فرصت‌های شغلی
        </Link>{" "}
        / {job.title}
      </div>

      <h1 className="text-4xl font-extrabold text-[var(--h1-font-color)] mb-4">
        {job.title}
      </h1>

      <div className="flex flex-wrap gap-2 mb-8">
        <Badge variant="brand">{job.type}</Badge>
        <Badge variant="secondary">{job.remote ? "دورکاری" : "حضوری"}</Badge>
        <Badge variant="outline">{job.team}</Badge>
        <span className="text-muted-foreground text-sm self-center mr-auto">
          تاریخ انتشار: {dateFa}
        </span>
      </div>

      <div className="bg-[var(--card-background)] text-[var(--primary-text)] border-[length:var(--border-size)] border-[var(--border-color)] rounded-[var(--corner-radius)] shadow-[var(--shadow-size)] p-6 md:p-8 mb-8">
        <div 
          className="prose prose-invert max-w-none text-lg leading-relaxed whitespace-pre-wrap"
          style={{ color: 'var(--paragraph-color)' }}
        >
          {job.description}
        </div>
        
        <div className="mt-8 pt-6 border-t border-[var(--border-color)]">
          <h4 className="font-bold mb-4">مزایا و پیش‌نیازهای عمومی:</h4>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground list-disc pr-5">
            <li>بیمه و مزایای کامل</li>
            <li>محیط کاری پویا و حرفه‌ای</li>
            <li>امکان رشد و ارتقای شغلی</li>
            <li>دسترسی به آخرین تکنولوژی‌ها</li>
            <li>ساعات کاری منعطف</li>
            <li>پاداش عملکرد و هدایای مناسبتی</li>
          </ul>
        </div>
      </div>

      <ApplyForm jobSlug={job.slug} />
    </main>
  );
}

export const dynamic = "force-dynamic";
