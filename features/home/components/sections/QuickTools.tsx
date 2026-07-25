"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Calculator, HardDrive, Network, ArrowLeft, ArrowRight } from "lucide-react";

const tools = [
  {
    title: "محاسبه RAID",
    description: "ظرفیت قابل استفاده RAID 0/1/5/6/10",
    icon: HardDrive,
    href: "/tools/raid-calculator",
    color: "cyan",
    stats: "محاسبه آنی",
  },
  {
    title: "محاسبه Subnet",
    description: "تقسیم شبکه و محاسبه محدوده آدرس",
    icon: Network,
    href: "/tools/subnet-calculator",
    color: "blue",
    stats: "پشتیبانی CIDR",
  },
];

const colorStyles = {
  cyan: {
    bg: "bg-cyan-500/10",
    icon: "text-cyan-400",
    border: "border-cyan-500/20",
    hover: "hover:border-cyan-500/40",
  },
  blue: {
    bg: "bg-blue-500/10",
    icon: "text-blue-400",
    border: "border-blue-500/20",
    hover: "hover:border-blue-500/40",
  },
};

export default function QuickTools() {
  return (
    <section className="relative homepage-section-dark home-section" dir="rtl">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <Calculator className="size-5 text-amber-400" />
            </div>
            <div>
              <Badge variant="outline" className="mb-1 text-[10px] border-amber-500/30 text-amber-400">
                ابزارها
              </Badge>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                محاسبه‌گرهای سریع
              </h2>
            </div>
          </div>
          <Link 
            href="/tools" 
            className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
          >
            همه ابزارها
            <ArrowLeft className="size-4" />
          </Link>
        </div>

        {/* Tools grid */}
        <div className="grid sm:grid-cols-2 gap-4 max-w-2xl">
          {tools.map((tool) => {
            const Icon = tool.icon;
            const styles = colorStyles[tool.color as keyof typeof colorStyles];
            
            return (
              <Link key={tool.href} href={tool.href} className="group block">
                <article className={`card-glow p-5 transition-all duration-300 ${styles.border} ${styles.hover}`}>
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={`size-12 rounded-xl ${styles.bg} flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`size-6 ${styles.icon}`} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold mb-1 group-hover:text-amber-400 transition-colors">
                        {tool.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {tool.description}
                      </p>
                      <div className="mt-2">
                        <Badge variant="outline" className="text-[10px]">
                          {tool.stats}
                        </Badge>
                      </div>
                    </div>

                    {/* Arrow */}
                    <ArrowRight className="size-4 text-muted-foreground group-hover:text-amber-400 group-hover:translate-x-1 transition-all flex-shrink-0 mt-1 rtl:rotate-180" />
                  </div>
                </article>
              </Link>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-8 text-center">
          <ButtonLink href="/tools" variant="outline" size="lg" className="gap-2">
            مشاهده همه ابزارها
            <ArrowLeft className="size-4" />
          </ButtonLink>
          <p className="text-xs text-muted-foreground mt-3">
            رایگان • بدون نیاز به ثبت‌نام • محاسبه آنی
          </p>
        </div>
      </div>
    </section>
  );
}
