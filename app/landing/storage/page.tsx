import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { getDbModulePosts } from "@/lib/server-posts";

import { Button, ButtonLink } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HardDrive, Server, Cpu, Cloud, Building, Home, Briefcase, Camera } from "lucide-react";

export const metadata: Metadata = {
  title: "انتخاب ذخیره‌ساز سازمانی – تکباکس",
  description: "راهنمای خرید NAS و ذخیره‌ساز سازمانی کیونپ، سینولوژی – بر اساس تعداد Bay، پردازنده، رم، شبکه 10GbE – با قیمت لحظه‌ای دلاری",
};

const BRANDS = [
  { name: "QNAP", fa: "کیونپ", slug: "QNAP" },
  { name: "Synology", fa: "سینولوژی", slug: "Synology" },
  { name: "HPE", fa: "اچ‌پی‌ای", slug: "HPE" },
  { name: "Dell", fa: "دل", slug: "Dell" },
  { name: "WD", fa: "وسترن دیجیتال", slug: "WD" },
  { name: "Seagate", fa: "سیگیت", slug: "Seagate" },
];

const USAGES = [
  { id: "home", title: "خانگی", desc: "بکاپ عکس و فیلم", icon: Home },
  { id: "small", title: "اداره کوچک", desc: "فایل سرور 5-10 کاربر", icon: Briefcase },
  { id: "enterprise", title: "سازمان متوسط", desc: "مجازی‌سازی و بکاپ", icon: Building },
  { id: "surveillance", title: "دوربین مداربسته", desc: "ذخیره 30+ کانال", icon: Camera },
  { id: "backup", title: "بکاپ سازمانی", desc: "Snapshات و رپلیکیشن", icon: Cloud },
  { id: "virtual", title: "مجازی‌سازی", desc: "iSCSI و VM", icon: Server },
];

const PRICE_RANGES = [
  { label: "تا ۵۰ میلیون", range: "0-50000000", accent: "bg-sky-100 dark:bg-sky-950" },
  { label: "۵۰ تا ۱۰۰ میلیون", range: "50000000-100000000", accent: "bg-blue-100 dark:bg-blue-950" },
  { label: "۱۰۰ تا ۲۰۰ میلیون", range: "100000000-200000000", accent: "bg-indigo-100 dark:bg-indigo-950" },
  { label: "بالای ۲۰۰ میلیون", range: "200000000-9999999999", accent: "bg-violet-100 dark:bg-violet-950" },
];

const CPU_TYPES = [
  { name: "Intel Celeron", desc: "اقتصادی، خانگی", color: "bg-[#1e3a8a]" },
  { name: "Intel Xeon", desc: "سازمانی، پایدار", color: "bg-[#1e40af]" },
  { name: "AMD Ryzen", desc: "قدرتمند، چندکاره", color: "bg-[#172554]" },
  { name: "ARM", desc: "کم‌مصرف، بی‌صدا", color: "bg-[#0f172a]" },
];

const BAY_TYPES = [
  { bay: "2", label: "۲ Bay", desc: "خانگی، بکاپ شخصی" },
  { bay: "4", label: "۴ Bay", desc: "اداره کوچک، ۴۰ ترابایت" },
  { bay: "8", label: "۸ Bay", desc: "سازمان متوسط، ۱۰۰ ترابایت" },
  { bay: "12", label: "۱۲+ Bay", desc: "سازمان بزرگ، رک" },
];

export default async function StorageLandingPage() {
  const allShop = await getDbModulePosts("shop", 100);
  const nasProducts = allShop.filter((p) => {
    const brand = (p.brand || "").toLowerCase();
    const cat = (p.category || "").toLowerCase();
    return brand.includes("qnap") || brand.includes("synology") || cat.includes("nas") || (p.specs as any)?.["Drive Bay"] || (p.specs as any)?.["Bay"];
  }).slice(0, 8);

  return (
    <main className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 space-y-8" dir="rtl">
      {/* Hero Banner – like Digikala laptop landing */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-l from-slate-900 via-slate-800 to-slate-900 text-white p-6 sm:p-10">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] items-center">
          <div className="space-y-4">
            <Badge className="bg-white/10 text-white border-white/20">تکنولوژی ذخیره‌سازی سازمانی</Badge>
            <h1 className="text-[24px] sm:text-[36px] font-black leading-tight">
              انتخاب حرفه‌ای <span className="text-sky-400">ذخیره‌ساز تحت شبکه</span> برای شرکت شما
            </h1>
            <p className="text-[13px] sm:text-[14px] leading-7 text-white/70 max-w-2xl">
              از ۲ تا ۲۴ Bay، از Celeron اقتصادی تا Xeon سازمانی، با قابلیت مجازی‌سازی، دوربین مداربسته، بکاپ خودکار و قیمت دلاری لحظه‌ای. تمام محصولات QNAP واقعی با گارانتی تکباکس.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <ButtonLink href="/landing/storage/shop" size="lg" className="bg-white text-black hover:bg-white/90">ورود به فروشگاه ذخیره‌ساز</ButtonLink>
              <ButtonLink href="/tools/nas-selector" variant="outline" size="lg" className="border-white/20 text-white hover:bg-white/10">انتخاب ذخیره‌ساز شبکه</ButtonLink>
              <ButtonLink href="/tools/raid-calculator" variant="ghost" size="lg" className="text-white/70 hover:text-white">محاسبه فضای ذخیره‌ساز</ButtonLink>
            </div>
            <div className="flex flex-wrap gap-2 pt-4 text-[11px] text-white/50">
              <span>✓ قیمت مبدا دلاری مخفی، تومان لحظه‌ای</span>
              <span>•</span>
              <span>✓ ۴ مشخصه مهم روی کارت: CPU / RAM / Bay / شبکه</span>
              <span>•</span>
              <span>✓ فیلتر کاربردی فقط ۷ فاکتور مهم</span>
            </div>
          </div>
          <div className="relative hidden lg:block">
            <div className="absolute -top-10 -right-10 size-64 rounded-full bg-sky-500/20 blur-3xl" />
            <div className="relative grid grid-cols-2 gap-3">
              {nasProducts.slice(0, 4).map((p) => (
                <div key={p.slug} className="rounded-xl bg-white/5 backdrop-blur border border-white/10 p-3 flex flex-col items-center gap-2">
                  <div className="relative w-full h-[80px]">
                    <Image src={p.image || "/assets/blog-1.jpg"} alt={p.title} fill sizes="120px" className="object-contain" />
                  </div>
                  <span className="text-[10px] font-bold line-clamp-1">{p.title}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Brand filter like Digikala */}
      <section className="bg-card border rounded-xl p-4 sm:p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[14px] font-bold">بر اساس برند</h2>
          <Link href="/shop" className="text-[11px] text-primary hover:underline">مشاهده همه برندها ←</Link>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {BRANDS.map((b) => (
            <Link
              key={b.slug}
              href={`/shop?brand=${b.slug}`}
              className="group flex flex-col items-center gap-2 rounded-lg border bg-card p-3 hover:border-primary hover:bg-accent transition-colors"
            >
              <div className="size-10 rounded-full bg-muted flex items-center justify-center text-[11px] font-black group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                {b.name.slice(0, 2)}
              </div>
              <span className="text-[11px] font-medium">{b.name}</span>
              <span className="text-[10px] text-muted-foreground">{b.fa}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured products */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-[16px] font-black">منتخب ذخیره‌سازهای سازمانی</h2>
          <Link href="/landing/storage/shop" className="text-[12px] text-primary hover:underline">مشاهده همه در فروشگاه ←</Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-px bg-border border rounded-xl overflow-hidden">
          {nasProducts.map((p) => (
            <Link key={p.slug} href={`/shop/${p.slug}`} className="bg-card p-3 flex flex-col gap-2 hover:bg-accent/50 transition-colors group">
              <div className="relative aspect-[4/3] bg-transparent">
                <Image src={p.image || "/assets/blog-1.jpg"} alt={p.title} fill sizes="(max-width: 640px) 50vw, 25vw" className="object-contain group-hover:scale-[1.02] transition-transform" />
              </div>
              <h3 className="text-[11px] sm:text-[12px] font-bold line-clamp-2 leading-5">{p.title}</h3>
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <HardDrive className="size-3" />
                <span>{(p.specs as any)?.["Drive Bay"] || (p.specs as any)?.["Bay"] || "NAS"}</span>
              </div>
              <div className="mt-auto flex items-center justify-between">
                <span className="text-[11px] font-bold">{p.priceAmount ? `${Math.round(p.priceAmount / 1000000).toLocaleString("fa-IR")} م. تومان` : "تماس بگیرید"}</span>
                <span className="text-[10px] text-muted-foreground">{p.brand}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Based on usage – like Digikala */}
      <section className="bg-card border rounded-xl p-5">
        <h2 className="text-[14px] font-bold mb-4">بر اساس کاربری</h2>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {USAGES.map((u) => (
            <Link key={u.id} href={`/shop?category=NAS&usage=${u.id}`} className="flex flex-col items-center gap-2 rounded-lg border bg-card p-3 hover:border-primary hover:bg-accent transition-colors group">
              <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <u.icon className="size-5" />
              </div>
              <span className="text-[11px] font-bold">{u.title}</span>
              <span className="text-[10px] text-muted-foreground text-center leading-4">{u.desc}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Price ranges */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {PRICE_RANGES.map((pr) => (
          <Link key={pr.label} href={`/shop?price=${pr.range}`} className={`rounded-xl border p-4 flex flex-col gap-2 hover:shadow-md transition-shadow ${pr.accent}`}>
            <span className="text-[12px] font-bold">{pr.label}</span>
            <span className="text-[11px] text-muted-foreground">ذخیره‌سازهای {pr.label}</span>
            <span className="text-[10px] text-primary mt-2">مشاهده ←</span>
          </Link>
        ))}
      </section>

      {/* CPU types – dark blue cards like Digikala */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {CPU_TYPES.map((cpu) => (
          <Link key={cpu.name} href={`/shop?cpu=${encodeURIComponent(cpu.name)}`} className={`rounded-xl p-4 text-white flex flex-col gap-1 hover:scale-[1.02] transition-transform ${cpu.color}`}>
            <Cpu className="size-5 text-white/80" />
            <span className="text-[13px] font-black">{cpu.name}</span>
            <span className="text-[11px] text-white/70">{cpu.desc}</span>
            <span className="mt-2 inline-flex text-[10px] bg-white/15 rounded-full px-2 py-0.5 w-fit">کارایی {cpu.name}</span>
          </Link>
        ))}
      </section>

      {/* Bay types */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {BAY_TYPES.map((b) => (
          <Link key={b.bay} href={`/shop?bay=${b.bay}`} className="rounded-xl border bg-card p-4 flex flex-col gap-1 hover:border-primary hover:bg-accent transition-colors">
            <HardDrive className="size-5 text-muted-foreground" />
            <span className="text-[13px] font-bold">{b.label}</span>
            <span className="text-[11px] text-muted-foreground">{b.desc}</span>
          </Link>
        ))}
      </section>

      {/* Why NAS + Tools */}
      <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-xl bg-gradient-to-l from-blue-600 to-indigo-700 text-white p-6 flex flex-col justify-between min-h-[200px]">
          <div>
            <h3 className="text-[18px] font-black">چرا ذخیره‌ساز سازمانی؟</h3>
            <p className="text-[12px] leading-6 text-white/80 mt-2 max-w-xl">
              برخلاف هارد اکسترنال، NAS با RAID، Snapshot، بکاپ خودکار و دسترسی از راه دور، از داده‌های شرکت شما در برابر خرابی دیسک، باج‌افزار و خطای انسانی محافظت می‌کند. محاسبه RAID را قبل از خرید انجام دهید.
            </p>
          </div>
          <div className="flex gap-2 mt-4">
            <ButtonLink href="/tools/raid-calculator" className="bg-white text-black hover:bg-white/90" size="sm">محاسبه فضای ذخیره‌ساز</ButtonLink>
            <ButtonLink href="/tools/nas-selector" variant="outline" className="border-white/20 text-white hover:bg-white/10" size="sm">انتخاب ذخیره‌ساز شبکه</ButtonLink>
          </div>
        </div>
        <div className="rounded-xl border bg-card p-5">
          <h4 className="text-[13px] font-bold mb-3">ابزارهای تکباکس برای IT</h4>
          <div className="grid grid-cols-2 gap-2">
            <Link href="/tools/raid-calculator" className="rounded-lg border p-3 hover:bg-accent text-[11px] font-medium">محاسبه فضای ذخیره‌ساز ←</Link>
            <Link href="/tools/nas-selector" className="rounded-lg border p-3 hover:bg-accent text-[11px] font-medium">انتخاب ذخیره‌ساز شبکه ←</Link>
            <Link href="/tools/nvr-selector" className="rounded-lg border p-3 hover:bg-accent text-[11px] font-medium">انتخاب ذخیره‌ساز دوربین ←</Link>
            <Link href="/tools/subnet-calculator" className="rounded-lg border p-3 hover:bg-accent text-[11px] font-medium">محاسبه زیرشبکه ←</Link>
          </div>
        </div>
      </section>

      {/* CTA to shop */}
      <section className="rounded-xl bg-foreground text-background p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-[16px] font-black">آماده خرید هستید؟</h3>
          <p className="text-[12px] text-background/70 mt-1">۱۴۴ محصول QNAP واقعی با قیمت دلاری و تبدیل لحظه‌ای به تومان، با فیلتر کاربردی Bay، CPU، RAM، 10GbE</p>
        </div>
        <div className="flex gap-2">
          <ButtonLink href="/landing/storage/shop" size="lg" className="bg-background text-foreground hover:bg-background/90">ورود به فروشگاه /shop</ButtonLink>
          <ButtonLink href="/shop" variant="outline" size="lg" className="border-background/20 text-background hover:bg-background/10">مشاهده همه محصولات</ButtonLink>
        </div>
      </section>
    </main>
  );
}
