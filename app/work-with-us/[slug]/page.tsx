import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import ApplyForm from "@/features/work-with-us/components/ApplyForm";
import { TermsModal } from "@/features/work-with-us/components/TermsModal";
import { pageMetadata } from "@/lib/seo";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const { slug } = await params;
  const job = await prisma.job.findFirst({ where: { slug, active: true } });
  if (!job) return pageMetadata({ title: "شغل یافت نشد", path: "/work-with-us" });
  return pageMetadata({ title: `${job.title} | تکباکس`, description: job.excerpt, path: `/work-with-us/${job.slug}` });
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
  const benefits: string[] = (job as any).benefits ? (job as any).benefits.split("\n").filter(Boolean) : [];

  const formatSalary = (v: number) => v.toLocaleString("fa-IR");

  // Fetch terms content
  let termsContent = "";
  try {
    const row = await (await import("@/lib/db")).prisma.siteSetting.findUnique({ where: { key: "terms.content" } });
    if (row?.value) termsContent = row.value;
  } catch {}

  return (
    <main className="max-w-3xl mx-auto px-4 py-10" dir="rtl">
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
                : salaryMin ? `از ${formatSalary(salaryMin)} تومان` : `تا ${formatSalary(salaryMax!)} تومان`}
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
          <div className="text-sm text-muted-foreground leading-7 whitespace-pre-line">{(job as any).positionDescription}</div>
        </section>
      )}

      {/* پیش‌نیازها — circle icon, no bg/border */}
      {requirements.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-bold text-foreground mb-4">پیش‌نیازها</h2>
          <ul className="space-y-2">
            {requirements.map((req, i) => (
              <li key={i} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                <span className="size-1.5 rounded-full bg-foreground shrink-0" />
                <span>{req}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* مزایا و امکانات — no bg/border */}
      {benefits.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-bold text-foreground mb-4">مزایا و امکانات</h2>
          <ul className="grid grid-cols-2 gap-2">
            {benefits.map((b, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                <svg className="size-4 text-emerald-500 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                </svg>
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* سوالات متداول — RTL */}
      {faq.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-bold text-foreground mb-4">سوالات متداول</h2>
          <Accordion className="w-full" type="multiple">
            {faq.map((item, i) => (
              <AccordionItem key={String(i)} value={`faq-${i}`}>
                <AccordionTrigger className="text-right text-sm font-medium" dir="rtl">{item.question}</AccordionTrigger>
                <AccordionContent>
                  <p className="text-sm text-muted-foreground leading-7 whitespace-pre-line text-right" dir="rtl">{item.answer}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
      )}

      <ApplyForm jobSlug={job.slug} termsContent={termsContent} />
    </main>
  );
}

export const dynamic = "force-dynamic";
