import { pageMetadata } from "@/lib/seo";
import { prisma } from "@/lib/db";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { AuthorLink } from "@/components/ui/author-link";
import PageHeader from "@/components/effects/PageHeader";

export const metadata = pageMetadata({ title: "درباره تکباکس | تکباکس", description: "درباره ماموریت تکباکس، رسانه تخصصی فناوری اطلاعات و زیرساخت.", path: "/about" });
export const revalidate = 86400;

export default async function About() {
  let dbUsers: any[] = [];
  let faqs: { id: string; question: string; answer: string }[] = [];

  try {
    dbUsers = await prisma.user.findMany({
      where: { role: { in: ["super_admin", "admin", "editor"] }, status: "active" },
      take: 6,
      select: { id: true, name: true, roleFa: true, role: true, avatar: true, username: true, job: true },
    });
  } catch {}

  try {
    faqs = await prisma.faq.findMany({ where: { isActive: true }, orderBy: [{ order: "asc" }, { createdAt: "asc" }], select: { id: true, question: true, answer: true } });
  } catch {}

  return (
    <main className="max-w-6xl mx-auto px-4 py-14 space-y-14" dir="rtl">
      <PageHeader colorVar="--about" title="درباره تکباکس" titleClassName="text-[var(--about)]" description="تکباکس – رسانه تخصصی فناوری اطلاعات، زیرساخت، شبکه، سرور، ذخیره‌سازی و امنیت." />

      <div className="grid md:grid-cols-3 gap-5">
        {[["۸ ماژول", "محتوای یکپارچه"], ["تیم تخصصی", "تحریریه و کارشناسان"], ["۱۴۰۵", "هونامیک ارتباط رستاک"]].map(([k, v]) => (
          <Card key={k} className="text-center p-0">
            <CardContent className="p-5">
              <div className="text-2xl font-extrabold text-primary">{k}</div>
              <div className="text-sm text-muted-foreground mt-1">{v}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-bold">تیم تحریریه</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {dbUsers.map((user) => (
            <Card key={user.id} className="p-4">
              <AuthorLink name={user.name} username={user.username} avatar={user.avatar || ""} role={user.roleFa || user.job || user.role} />
              <p className="mt-3 text-xs leading-6 text-muted-foreground">
                عضو تیم تکباکس در تولید و بررسی محتوای تخصصی فناوری اطلاعات.
              </p>
            </Card>
          ))}
        </div>
      </section>

      <div className="grid lg:grid-cols-5 gap-5 items-start">
        <Card className="lg:col-span-3 p-0 overflow-hidden">
          <CardHeader className="border-b"><CardTitle className="text-base">دفتر تهران</CardTitle><p className="text-sm text-muted-foreground mt-1">میرداماد، هونامیک ارتباط رستاک</p></CardHeader>
          <CardContent className="p-0"><iframe title="map" src="https://www.openstreetmap.org/export/embed.html?bbox=51.41%2C35.75%2C51.45%2C35.77&layer=mapnik&marker=35.76%2C51.43" className="w-full h-[320px] border-0" loading="lazy" /></CardContent>
        </Card>
        <Card className="lg:col-span-2 p-5 space-y-3">
          <p className="text-sm text-muted-foreground">ایمیل: {process.env.CONTACT_EMAIL || "info@techbox.ir"}</p>
          <p className="text-sm text-muted-foreground">ساعت کاری: شنبه–چهارشنبه ۹–۱۷</p>
          <Separator />
          <ButtonLink href="/contact" className="w-full">ارتباط با ما</ButtonLink>
          <ButtonLink href="/consultation" variant="ghost" className="w-full">درخواست مشاوره VIP</ButtonLink>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>پرسش‌های متداول</CardTitle><p className="text-sm text-muted-foreground">پاسخ به سوالات پرتکرار درباره تکباکس</p></CardHeader>
        <CardContent>
          {faqs.length === 0 ? <div className="text-sm text-muted-foreground text-center py-8">هنوز پرسشی ثبت نشده.</div> : (
            <Accordion className="w-full" defaultValue={[faqs[0]?.id]}>
              {faqs.map((faq) => <AccordionItem key={faq.id} value={faq.id}><AccordionTrigger className="text-right text-sm font-medium">{faq.question}</AccordionTrigger><AccordionContent className="text-sm text-muted-foreground leading-7 whitespace-pre-wrap">{faq.answer}</AccordionContent></AccordionItem>)}
            </Accordion>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
