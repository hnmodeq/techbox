import { pageMetadata } from "@/lib/seo";
import { prisma } from "@/lib/db";
import { AuthorLink } from "@/components/ui/author-link";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = pageMetadata({
  title: "درباره تکباکس | تکباکس",
  description: "درباره ماموریت تکباکس، رسانه تخصصی فناوری اطلاعات و زیرساخت.",
  path: "/about",
});
export const revalidate = 3600;

export default async function AboutPage() {
  // Fetch team sections + members
  let sections: any[] = [];
  try {
    sections = await prisma.teamSection.findMany({
      where: { enabled: true },
      orderBy: { order: "asc" },
      include: { members: { orderBy: { order: "asc" } } },
    });
  } catch {}

  // Fetch about settings
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
  const mapUrl: string = settings.mapUrl || "";

  return (
    <main className="max-w-5xl mx-auto px-4 py-10 space-y-12" dir="rtl">
      {/* Header */}
      <header>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground">درباره تکباکس</h1>
      </header>

      {/* Description */}
      {description && (
        <section className="prose prose-sm max-w-none leading-8 text-foreground">
          <div dangerouslySetInnerHTML={{ __html: description }} />
        </section>
      )}

      {/* Team sections */}
      {sections.map((section) => (
        section.members.length > 0 && (
          <section key={section.id} className="space-y-4">
            <h2 className="text-lg font-bold text-foreground">{section.title}</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {section.members.map((member: any) => (
                <Card key={member.id} className="p-4">
                  <AuthorLink
                    name={member.name}
                    avatar={member.avatar || ""}
                    role={member.role || ""}
                  />
                </Card>
              ))}
            </div>
          </section>
        )
      ))}

      {/* Contact / Address */}
      {(address || email || mapUrl) && (
        <section className="grid lg:grid-cols-5 gap-5 items-start">
          {mapUrl && (
            <Card className="lg:col-span-3 p-0 overflow-hidden">
              <div className="border-b px-5 py-3">
                <h3 className="text-base font-bold">{addressTitle}</h3>
                {address && <p className="text-sm text-muted-foreground mt-1">{address}</p>}
              </div>
              <div>
                <iframe title="map" src={mapUrl} className="w-full h-[320px] border-0" loading="lazy" />
              </div>
            </Card>
          )}
          <Card className={mapUrl ? "lg:col-span-2 p-5" : "p-5"}>
            <div className="space-y-3 text-sm text-muted-foreground">
              {address && !mapUrl && (
                <div>
                  <span className="font-semibold text-foreground">{addressTitle}</span>
                  <p className="mt-1">{address}</p>
                </div>
              )}
              {email && <p>ایمیل: {email}</p>}
              {hours && <p>ساعت کاری: {hours}</p>}
            </div>
          </Card>
        </section>
      )}
    </main>
  );
}
