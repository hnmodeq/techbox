"use client";

import Link from "next/link";
import {
  BookOpen,
  Newspaper,
  Film,
  ShoppingBag,
  Calculator,
  MessagesSquare,
  History,
  Headphones,
  LifeBuoy,
  Sparkles,
} from "lucide-react";

const modules = [
  { 
    label: "مجله", 
    english: "Magazine", 
    href: "/blog", 
    icon: BookOpen, 
    color: "violet",
    description: "مقالات و راهنماهای تخصصی"
  },
  { 
    label: "اخبار", 
    english: "News", 
    href: "/news", 
    icon: Newspaper, 
    color: "blue",
    description: "تازه‌های دنیای فناوری"
  },
  { 
    label: "ریل‌ها", 
    english: "Reels", 
    href: "/media", 
    icon: Film, 
    color: "pink",
    description: "ویدیوهای کوتاه و آنباکسینگ"
  },
  { 
    label: "فروشگاه", 
    english: "Shop", 
    href: "/shop", 
    icon: ShoppingBag, 
    color: "green",
    description: "محصولات تخصصی زیرساخت"
  },
  { 
    label: "ابزارها", 
    english: "Tools", 
    href: "/tools", 
    icon: Calculator, 
    color: "amber",
    description: "محاسبه‌گر RAID، Subnet و..."
  },
  { 
    label: "انجمن", 
    english: "Forum", 
    href: "/forum", 
    icon: MessagesSquare, 
    color: "cyan",
    description: "پرسش و پاسخ تخصصی"
  },
  { 
    label: "تایم‌لاین", 
    english: "Timeline", 
    href: "/timeline", 
    icon: History, 
    color: "violet",
    description: "تاریخ فناوری"
  },
  { 
    label: "مشاوره", 
    english: "Consultation", 
    href: "/consultation", 
    icon: Headphones, 
    color: "blue",
    description: "راهنمایی تخصصی"
  },
  { 
    label: "پشتیبانی", 
    english: "Support", 
    href: "/support", 
    icon: LifeBuoy, 
    color: "green",
    description: "تیکت و راهنما"
  },
] as const;

const colorStyles: Record<string, { bg: string; icon: string; border: string; hover: string }> = {
  violet: { 
    bg: "bg-violet-500/10", 
    icon: "text-violet-400", 
    border: "border-violet-500/20",
    hover: "hover:border-violet-500/40 hover:bg-violet-500/15"
  },
  blue: { 
    bg: "bg-blue-500/10", 
    icon: "text-blue-400", 
    border: "border-blue-500/20",
    hover: "hover:border-blue-500/40 hover:bg-blue-500/15"
  },
  pink: { 
    bg: "bg-pink-500/10", 
    icon: "text-pink-400", 
    border: "border-pink-500/20",
    hover: "hover:border-pink-500/40 hover:bg-pink-500/15"
  },
  green: { 
    bg: "bg-green-500/10", 
    icon: "text-green-400", 
    border: "border-green-500/20",
    hover: "hover:border-green-500/40 hover:bg-green-500/15"
  },
  amber: { 
    bg: "bg-amber-500/10", 
    icon: "text-amber-400", 
    border: "border-amber-500/20",
    hover: "hover:border-amber-500/40 hover:bg-amber-500/15"
  },
  cyan: { 
    bg: "bg-cyan-500/10", 
    icon: "text-cyan-400", 
    border: "border-cyan-500/20",
    hover: "hover:border-cyan-500/40 hover:bg-cyan-500/15"
  },
};

export default function ModuleStrip() {
  return (
    <section className="relative homepage-section-dark home-section" dir="rtl">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-4">
            <Sparkles className="size-5 text-primary" />
            <span className="text-sm text-muted-foreground">همه در یک جا</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-3">
            ۹ ماژول، یک پلتفرم
          </h2>
          <p className="text-sm text-muted-foreground max-w-lg mx-auto">
            از محتوای تخصصی تا ابزارهای مهندسی — همه چیز برای جامعه IT ایران
          </p>
        </div>

        {/* Module grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-9 gap-3">
          {modules.map(({ icon: Icon, label, english, href, color }) => {
            const styles = colorStyles[color];
            return (
              <Link key={english} href={href} className="group block">
                <div className={`card-glow p-4 text-center space-y-3 transition-all duration-300 ${styles.border} ${styles.hover}`}>
                  {/* Icon */}
                  <div className={`mx-auto size-12 rounded-xl ${styles.bg} flex items-center justify-center`}>
                    <Icon className={`size-6 ${styles.icon}`} />
                  </div>

                  {/* Labels */}
                  <div className="space-y-1">
                    <div className="font-semibold text-sm leading-tight">
                      {label}
                    </div>
                    <div className="text-[10px] text-muted-foreground font-mono">
                      {english}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Bottom tagline */}
        <p className="text-center text-xs text-muted-foreground mt-8">
          TechBox — پاتوق بچه‌های IT
        </p>
      </div>
    </section>
  );
}
