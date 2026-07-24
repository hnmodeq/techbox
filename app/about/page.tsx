import * as React from "react";
import { pageMetadata } from "@/lib/seo";
import { prisma } from "@/lib/db";
import Image from "next/image";
import Link from "next/link";

export const metadata = pageMetadata({
  title: "درباره تکباکس | تکباکس",
  description: "درباره ماموریت تکباکس، رسانه تخصصی فناوری اطلاعات و زیرساخت.",
  path: "/about",
});
export const revalidate = 3600;

function Separator() {
  return <hr className="border-border/50 my-16" />;
}

export default async function AboutPage() {
  let sections: any[] = [];
  try {
    sections = await prisma.teamSection.findMany({
      where: { enabled: true },
      orderBy: { order: "asc" },
      include: { members: { orderBy: { order: "asc" } } },
    });
  } catch {}

  let settings: any = {};
  try {
    const row = await prisma.siteSetting.findUnique({ where: { key: "about.settings" } });
    if (row?.value) settings = JSON.parse(row.value);
  } catch {}

  const description: string = settings.description || "";

  return (
    <main className="min-h-screen" dir="rtl">
      {/* Hero Banner — with description instead of subtitle */}
      <section className="relative overflow-hidden bg-gradient-to-l from-primary/10 via-background to-primary/5 border-b border-border">
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        <div className="max-w-5xl mx-auto px-4 py-16 sm:py-20 relative">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">درباره تکباکس</h1>
          {description ? (
            <div className="mt-4 prose prose-sm max-w-2xl leading-7 text-muted-foreground" dangerouslySetInnerHTML={{ __html: description }} />
          ) : (
            <p className="mt-4 text-base sm:text-lg text-muted-foreground max-w-2xl leading-7">
              رسانه تخصصی فناوری اطلاعات، زیرساخت، شبکه، سرور، ذخیره‌سازی و امنیت — برای مهندسان ایرانی
            </p>
          )}
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-12 space-y-0">
        {/* Team sections */}
        {sections.filter((s) => s.members.length > 0).map((section, idx, arr) => (
            <React.Fragment key={section.id}>
              <section className="space-y-5">
                <h2 className="text-lg font-bold text-foreground">{section.title}</h2>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {section.members.map((member: any) => {
                    const slug = (member.name || "").trim().toLowerCase().replace(/[^a-z0-9_\u0600-\u06FF]+/g, "-");
                    return (
                      <div key={member.id} className="flex items-center gap-4">
                        <Link href={`/author/${encodeURIComponent(slug)}`} className="shrink-0">
                          <div className="relative h-[72px] w-[72px] rounded-full overflow-hidden ring-2 ring-border hover:ring-primary transition-all">
                            <Image src={member.avatar || "/assets/hooman.png"} alt={member.name} fill sizes="72px" className="object-cover" />
                          </div>
                        </Link>
                        <div className="min-w-0">
                          <Link href={`/author/${encodeURIComponent(slug)}`} className="text-sm font-extrabold text-foreground hover:text-primary transition-colors truncate block">
                            {member.name}
                          </Link>
                          {member.role && <p className="text-xs text-muted-foreground mt-0.5 truncate">{member.role}</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
              {idx < arr.length - 1 && <Separator />}
            </React.Fragment>
        ))}

        {/* Careers CTA — no background */}
        <section className="py-10 text-center">
          <h2 className="text-xl font-extrabold text-foreground">به تیم ما بپیوندید</h2>
          <p className="mt-3 text-sm text-muted-foreground max-w-lg mx-auto leading-6">
            همیشه به دنبال افراد با استعداد و علاقه‌مند به فناوری هستیم. اگر به شبکه، سرور، ذخیره‌سازی یا تولید محتوای تخصصی علاقه‌مندید، ما مشتاق شنیدن از شما هستیم.
          </p>
          <Link href="/work-with-us" className="inline-flex items-center justify-center mt-6 px-6 py-2.5 rounded-lg bg-foreground text-background text-sm font-bold hover:bg-foreground/90 transition-colors">
            مشاهده موقعیت‌های شغلی
          </Link>
        </section>
      </div>
    </main>
  );
}
