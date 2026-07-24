import { pageMetadata } from "@/lib/seo";
import { prisma } from "@/lib/db";
import ContactForm from "@/features/contact/components/ContactForm";

export const metadata = pageMetadata({
  title: "ارتباط با ما | تکباکس",
  description: "راه‌های ارتباط با تیم تکباکس برای همکاری، مشاوره و پشتیبانی.",
  path: "/contact",
});

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
function PhoneIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>;
}
function MapPinIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>;
}
function ClockIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>;
}

export default async function Contact() {
  let settings: any = {};
  try {
    const row = await prisma.siteSetting.findUnique({ where: { key: "about.settings" } });
    if (row?.value) settings = JSON.parse(row.value);
  } catch {}

  const addressTitle: string = settings.addressTitle || "دفتر تهران";
  const address: string = settings.address || "";
  const email: string = settings.email || process.env.CONTACT_EMAIL || "info@techbox.ir";
  const hours: string = settings.hours || "شنبه–چهارشنبه ۹–۱۷";
  const mapUrl = "https://www.openstreetmap.org/export/embed.html?bbox=50.83%2C35.78%2C50.88%2C35.81&layer=mapnik&marker=35.809%2C50.857";

  const socials = [
    { name: "لینکدین", href: "https://linkedin.com/company/techbox", icon: LinkedInIcon },
    { name: "ایکس", href: "https://x.com/techbox_ir", icon: XIcon },
    { name: "اینستاگرام", href: "https://instagram.com/techbox.ir", icon: InstagramIcon },
    { name: "تلگرام", href: "https://t.me/techbox_ir", icon: TelegramIcon },
  ];

  const contactItems = [
    { icon: MapPinIcon, label: addressTitle, value: address },
    { icon: ClockIcon, label: "ساعت کاری", value: hours },
    { icon: EmailIcon, label: "آدرس پست الکترونیکی", value: email },
  ];

  return (
    <main className="max-w-5xl mx-auto px-4 py-12 space-y-12" dir="rtl">
      {/* Header */}
      <header>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">ارتباط با ما</h1>
        <p className="mt-3 text-base text-muted-foreground max-w-2xl leading-7">
          پاتوق بچه‌های فناوری اطلاعات – هونامیک ارتباط رستاک
        </p>
      </header>

      {/* Map */}
      {mapUrl && (
        <section className="rounded-xl border border-border overflow-hidden">
          <iframe title="map" src={mapUrl} className="w-full h-[360px] border-0" loading="lazy" referrerPolicy="no-referrer" />
        </section>
      )}

      {/* Contact info + social */}
      <section className="grid sm:grid-cols-2 gap-8">
        {/* Left: contact details */}
        <div className="space-y-5">
          {contactItems.filter((c) => c.value).map((item) => (
            <div key={item.label} className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border text-muted-foreground">
                <item.icon className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-0.5">{item.label}</div>
                <div className="text-sm font-medium text-foreground">{item.value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Right: social links */}
        <div className="space-y-5">
          <div>
            <div className="text-xs text-muted-foreground mb-3">شبکه‌های اجتماعی</div>
            <div className="flex flex-wrap gap-3">
              {socials.map((s) => (
                <a
                  key={s.name}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={s.name}
                  className="flex items-center gap-2.5 px-4 py-2.5 rounded-lg border border-border text-sm font-medium text-foreground hover:border-foreground/30 hover:bg-accent transition-colors"
                >
                  <s.icon className="w-4 h-4 text-muted-foreground" />
                  {s.name}
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact form — below everything */}
      <section>
        <h2 className="text-xl font-bold text-foreground mb-4">فرم تماس</h2>
        <div className="bg-card border border-border rounded-xl p-6">
          <ContactForm />
        </div>
      </section>
    </main>
  );
}
