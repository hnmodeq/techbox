import { pageMetadata } from "@/lib/seo";
import { prisma } from "@/lib/db";
import { ButtonLink } from "@/components/ui/button";
import TeamChromaSection, { type TeamMember } from "@/features/home/components/TeamChromaSection";
import PageHeader from "@/components/effects/PageHeader";

export const metadata = pageMetadata({ title: "درباره تکباکس | تکباکس", description: "درباره ماموریت تکباکس، رسانه تخصصی فناوری اطلاعات و زیرساخت.", path: "/about" });

export const revalidate = 3600;

export default async function About(){
 let dbUsers: any[] = [];
 
 try {
   dbUsers = await prisma.user.findMany({
     where: { role: { in: ["super_admin", "admin", "editor"] }, status: "active" },
     take: 6,
     select: { id: true, name: true, roleFa: true, role: true, avatar: true, username: true }
   });
} catch {
  // During local/offline builds the database may be unavailable.
}

 const team: TeamMember[] = dbUsers.map((u: any) => ({
   name: u.name,
   role: u.role,
   roleFa: u.roleFa || u.role,
   avatar: u.avatar || "",
   username: u.username,
   modules: [],
 }));

 return (
 <main className="max-w-6xl mx-auto px-4 py-14" dir="rtl">
 <PageHeader
 colorVar="--about"
 title="درباره تکباکس"
 titleClassName="text-[var(--about)]"
 description="تکباکس – پاتوق بچه‌های فناوری اطلاعات ایران. مجله، اخبار فوری، رسانه ویدیویی، نقد تخصصی، ابزارهای مهندسی، دانلود، فروشگاه زیرساخت و انجمن – همه در یک Bento feed زنده، با CMS نقش‌محور."
 />

 <div className="grid md:grid-cols-3 gap-5 mb-14">
 {[
 ["۸ ماژول", "محتوای یکپارچه"],
 ["۶ ویراستار تخصصی", "RBAC واقعی"],
 ["۱۴۰۵", "هونامیک ارتباط رستاک"],
 ].map(([k,v])=>(
 <div key={k as string} className="bg-[var(--card-background)] text-[var(--primary-text)] border-[length:var(--border-size)] border-[var(--border-color)] rounded-[var(--corner-radius)] shadow-[var(--shadow-size)] p-5 text-center">
 <div className="text-[length:var(--h1-font-size)] text-[var(--h1-font-color)] font-extrabold text-[var(--home)]">{k}</div>
 <div className="text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] text-muted-foreground mt-1">{v}</div>
 </div>
 ))}
 </div>

 <h2 className="text-[length:var(--h2-font-size)] text-[var(--h2-font-color)] font-bold mb-4">تیم تحریریه</h2>
 <div className="mb-14">
 <TeamChromaSection team={team} />
 </div>

 <div className="grid lg:grid-cols-5 gap-5 items-start">
 <div className="lg:col-span-3 bg-[var(--card-background)] text-[var(--primary-text)] border-[length:var(--border-size)] border-[var(--border-color)] rounded-[var(--corner-radius)] shadow-[var(--shadow-size)] p-0 overflow-hidden">
 <div className="p-4 border-b-[length:var(--border-size)] border-[var(--border-color)]">
 <h3 className="">دفتر تهران</h3>
 <p className="text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] text-muted-foreground mt-1">میرداماد، هونامیک ارتباط رستاک</p>
 </div>
 {/* OSM embed – works offline preview degraded, live works */}
 <iframe
 title="map"
 src="https://www.openstreetmap.org/export/embed.html?bbox=51.41%2C35.75%2C51.45%2C35.77&layer=mapnik&marker=35.76%2C51.43"
 className="w-full h-[320px] border-0"
 loading="lazy"
 />
 </div>
 <div className="lg:col-span-2 space-y-3 text-[length:var(--h3-font-size)] text-[var(--h3-font-color)] font-semibold text-muted-foreground bg-[var(--card-background)] text-[var(--primary-text)] border-[length:var(--border-size)] border-[var(--border-color)] rounded-[var(--corner-radius)] shadow-[var(--shadow-size)] p-5">
 <p>ایمیل: {process.env.CONTACT_EMAIL || "info@techbox.ir"}</p>
 <p>ساعت کاری: شنبه–چهارشنبه ۹–۱۷</p>
 <ButtonLink href="/contact" className="mt-2 w-full text-[length:var(--h3-font-size)] text-[var(--h3-font-color)] font-semibold">ارتباط با ما</ButtonLink>
 <ButtonLink href="/consultation" variant="ghost" className="w-full text-[length:var(--h3-font-size)] text-[var(--h3-font-color)] font-semibold">درخواست مشاوره VIP</ButtonLink>
 </div>
 </div>
 </main>
 );
}
