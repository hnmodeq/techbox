import { pageMetadata } from "@/lib/seo";
import { prisma } from "@/lib/db";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import TeamChromaSection, { type TeamMember } from "@/features/home/components/TeamChromaSection";
import PageHeader from "@/components/effects/PageHeader";

export const metadata = pageMetadata({ title: "درباره تکباکس | تکباکس", description: "درباره ماموریت تکباکس، رسانه تخصصی فناوری اطلاعات و زیرساخت.", path: "/about" });

export const revalidate = 3600;

export default async function About() {
  let dbUsers: any[] = [];
  let faqs: { id: string; question: string; answer: string }[] = [];

  try {
    dbUsers = await prisma.user.findMany({
      where: { role: { in: ["super_admin", "admin", "editor"] }, status: "active" },
      take: 6,
      select: { id: true, name: true, roleFa: true, role: true, avatar: true, username: true },
    });
  } catch {
    // During local/offline builds the database may be unavailable.
  }

  try {
    faqs = await prisma.faq.findMany({
      where: { isActive: true },
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
      select: { id: true, question: true, answer: true },
    });
  } catch {}

  const team: TeamMember[] = dbUsers.map((u: any) => ({
    name: u.name,
    role: u.role,
    roleFa: u.roleFa || u.role,
    avatar: u.avatar || "",
    username: u.username,
    modules: [],
  }));

  return (
    <main className="max-w-6xl mx-auto px-4 py-14 space-y-14" dir="rtl">
      <PageHeader
        colorVar="--about"
        title="درباره تکباکس"
        titleClassName="text-[var(--about)]"
        description="تکباکس – پاتوق بچه‌های فناوری اطلاعات ایران. مجله، اخبار فوری، رسانه ویدیویی، نقد تخصصی، ابزارهای مهندسی، دانلود، فروشگاه زیرساخت و انجمن – همه در یک Bento feed زنده، با CMS نقش‌محور."
      />

      <div className="grid md:grid-cols-3 gap-5">
        {[
          ["۸ ماژول", "محتوای یکپارچه"],
          ["۶ ویراستار تخصصی", "RBAC واقعی"],
          ["۱۴۰۵", "هونامیک ارتباط رستاک"],
        ].map(([k, v]) => (
          <Card key={k as string} className="text-center p-0">
            <CardContent className="p-5">
              <div className="text-2xl font-extrabold text-[var(--home)]">{k}</div>
              <div className="text-sm text-muted-foreground mt-1">{v}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4">تیم تحریریه</h2>
        <TeamChromaSection team={team} />
      </div>

      <div className="grid lg:grid-cols-5 gap-5 items-start">
        <Card className="lg:col-span-3 p-0 overflow-hidden">
          <CardHeader className="border-b">
            <CardTitle className="text-base">دفتر تهران</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">میرداماد، هونامیک ارتباط رستاک</p>
          </CardHeader>
          <CardContent className="p-0">
            <iframe
              title="map"
              src="https://www.openstreetmap.org/export/embed.html?bbox=51.41%2C35.75%2C51.45%2C35.77&layer=mapnik&marker=35.76%2C51.43"
              className="w-full h-[320px] border-0"
              loading="lazy"
            />
          </CardContent>
        </Card>
        <Card className="lg:col-span-2 p-5 space-y-3">
          <p className="text-sm text-muted-foreground">ایمیل: {process.env.CONTACT_EMAIL || "info@techbox.ir"}</p>
          <p className="text-sm text-muted-foreground">ساعت کاری: شنبه–چهارشنبه ۹–۱۷</p>
          <Separator />
          <ButtonLink href="/contact" className="w-full">
            ارتباط با ما
          </ButtonLink>
          <ButtonLink href="/consultation" variant="ghost" className="w-full">
            درخواست مشاوره VIP
          </ButtonLink>
        </Card>
      </div>

      {/* Q&A — admin editable via /admin/faq, uses shadcn Accordion */}
      <Card>
        <CardHeader>
          <CardTitle>پرسش‌های متداول</CardTitle>
          <p className="text-sm text-muted-foreground">پاسخ به سوالات پرتکرار درباره تکباکس — قابل ویرایش از پنل ادمین</p>
        </CardHeader>
        <CardContent>
          {faqs.length === 0 ? (
            <div className="text-sm text-muted-foreground text-center py-8">
              هنوز پرسشی ثبت نشده. ادمین می‌تواند از <code className="bg-muted px-1 rounded">/admin/faq</code> اضافه کند.
            </div>
          ) : (
            <Accordion className="w-full" defaultValue={[faqs[0]?.id]}>
              {faqs.map((faq) => (
                <AccordionItem key={faq.id} value={faq.id}>
                  <AccordionTrigger className="text-right text-sm font-medium">{faq.question}</AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground leading-7 whitespace-pre-wrap">{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
