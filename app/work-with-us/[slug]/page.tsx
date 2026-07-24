import { prisma } from "@/lib/db";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import ApplyForm from "@/features/work-with-us/components/ApplyForm";
import { pageMetadata } from "@/lib/seo";
import { Metadata } from "next";
import { Check } from "lucide-react";

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
  const job = await prisma.job.findFirst({ where: { slug, active: true } });
  if (!job) notFound();

  const dateFa = new Intl.DateTimeFormat("fa-IR", { dateStyle: "long" }).format(job.createdAt);
  const requirements: string[] = Array.isArray((job as any).requirements) ? (job as any).requirements : [];
  const faq: Array<{ question: string; answer: string }> = Array.isArray((job as any).faq) ? (job as any).faq : [];
  const salaryMin = (job as any).salaryMin as number | null;
  const salaryMax = (job as any).salaryMax as number | null;

  const formatSalary = (v: number) => v.toLocaleString("fa-IR");

  return (
    <main className="max-w-3xl mx-auto px-4 py-10" dir="rtl">
      {/* Breadcrumb */}
      <nav className="text-xs text-muted-foreground mb-6">
        <Link href="/work-with-us" className="hover:text-foreground transition-colors">موقعیت‌های شغلی</Link>
        <span className="mx-1.5">/</span>
        <span className="text-foreground font-medium">{job.title}</span>
      </nav>

      {/* Title + meta */}
      <header className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground mb-3">{job.title}</h1>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{job.type}</Badge>
          <Badge variant="outline">{job.remote ? "دورکاری" : "حضوری"}</Badge>
          {(salaryMin || salaryMax) && (
            <Badge variant="outline" className="text-primary">
              {salaryMin && salaryMax
                ? `${formatSalary(salaryMin)} – ${formatSalary(salaryMax)} تومان`
                : salaryMin
                ? `از ${formatSalary(salaryMin)} تومان`
                : `تا ${formatSalary(salaryMax!)} تومان`}
            </Badge>
          )}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger render={<span className="text-xs text-muted-foreground cursor-default" />}>
                {dateFa}
              </TooltipTrigger>
              <TooltipContent>تاریخ انتشار</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </header>

      {/* شرح موقعیت شغلی */}
      {(job as any).positionDescription && (
        <section className="mb-8">
          <h2 className="text-lg font-bold text-foreground mb-3">شرح موقعیت شغلی</h2>
          <div className="text-sm text-muted-foreground leading-7 whitespace-pre-line">
            {(job as any).positionDescription}
          </div>
        </section>
      )}

      {/* Description */}
      <section className="border border-border rounded-xl bg-card p-6 mb-8">
        <div className="prose prose-sm max-w-none leading-8 text-foreground whitespace-pre-line">
          {job.description}
        </div>
      </section>

      {/* پیش‌نیازها */}
      {requirements.length > 0 && (
        <section className="border border-border rounded-xl bg-card p-6 mb-8">
          <h2 className="text-lg font-bold text-foreground mb-4">پیش‌نیازها</h2>
          <ul className="space-y-2">
            {requirements.map((req, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                <Check className="size-4 text-primary shrink-0 mt-0.5" />
                <span>{req}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* مزایا و امکانات */}
      {(job as any).benefits && (
        <section className="border border-border rounded-xl bg-card p-6 mb-8">
          <h2 className="text-lg font-bold text-foreground mb-3">مزایا و امکانات</h2>
          <div className="text-sm text-muted-foreground leading-7 whitespace-pre-line">
            {(job as any).benefits}
          </div>
        </section>
      )}

      {/* سوالات متداول */}
      {faq.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-bold text-foreground mb-4">سوالات متداول</h2>
          <Accordion className="w-full" type="multiple">
            {faq.map((item, i) => (
              <AccordionItem key={String(i)} value={`faq-${i}`}>
                <AccordionTrigger className="text-right text-sm font-medium">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-7 whitespace-pre-line">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
      )}

      {/* Apply form */}
      <ApplyForm jobSlug={job.slug} />
    </main>
  );
}

export const dynamic = "force-dynamic";
