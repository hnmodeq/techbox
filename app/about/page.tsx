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

function LinkedInIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>;
}
function XIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>;
}
function InstagramIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>;
}
function TelegramIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" /></svg>;
}
function EmailIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>;
}

// Client component for email copy
function EmailCopyButton({ email }: { email: string }) {
  return <EmailCopyClient email={email} />;
}

// Separate client component
function EmailCopyClient({ email }: { email: string }) {
  return null; // Will be replaced inline
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
  const addressTitle: string = settings.addressTitle || "دفتر تهران";
  const address: string = settings.address || "";
  const email: string = settings.email || process.env.CONTACT_EMAIL || "info@techbox.ir";
  const hours: string = settings.hours || "شنبه–چهارشنبه ۹–۱۷";

  const socials = [
    { name: "لینکدین", href: "https://linkedin.com/company/techbox", icon: LinkedInIcon },
    { name: "ایکس", href: "https://x.com/techbox_ir", icon: XIcon },
    { name: "اینستاگرام", href: "https://instagram.com/techbox.ir", icon: InstagramIcon },
    { name: "تلگرام", href: "https://t.me/techbox_ir", icon: TelegramIcon },
  ];

  const mapUrl = "https://www.openstreetmap.org/export/embed.html?bbox=50.83%2C35.78%2C50.88%2C35.81&layer=mapnik&marker=35.809%2C50.857";

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
        {sections.map((section) => (
          section.members.length > 0 && (
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
              <Separator />
            </React.Fragment>
          )
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

        <Separator />

        {/* Contact section */}
        <section className="grid lg:grid-cols-5 gap-5 items-start">
          {/* Map */}
          <div className="lg:col-span-3 rounded-xl border border-border overflow-hidden">
            <div className="px-5 py-3 border-b border-border">
              <h3 className="text-base font-bold">{addressTitle}</h3>
              {address && <p className="text-sm text-muted-foreground mt-1">{address}</p>}
              {hours && <p className="text-xs text-muted-foreground mt-1">ساعت کاری: {hours}</p>}
            </div>
            <iframe title="map" src={mapUrl} className="w-full h-[320px] border-0" loading="lazy" referrerPolicy="no-referrer" />
          </div>

          {/* Right side: email icon + social links */}
          <div className="lg:col-span-2 space-y-6">
            {/* Email with copy */}
            <div>
              <p className="text-xs text-muted-foreground mb-2">ارتباط با ما</p>
              <div className="flex items-center gap-3">
                <div className="relative group">
                  <a href={`mailto:${email}`} className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors">
                    <EmailIcon className="w-4.5 h-4.5" />
                  </a>
                </div>
                <span className="text-sm text-muted-foreground font-mono" dir="ltr">{email}</span>
              </div>
            </div>

            {/* Social links below hours, left side of map */}
            <div>
              <p className="text-xs text-muted-foreground mb-2">شبکه‌های اجتماعی</p>
              <div className="flex items-center gap-2.5">
                {socials.map((s) => (
                  <a key={s.name} href={s.href} target="_blank" rel="noopener noreferrer" title={s.name}
                    className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors">
                    <s.icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
