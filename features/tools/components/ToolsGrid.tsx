"use client";

import Link from "next/link";
import { Icon, type IconName } from "@/design/icons";

type ToolCard = {
  slug: string;
  title: string;
  titleFa: string;
  descFa: string;
  icon: IconName;
  accent: string; // css var e.g. var(--tb-tools)
  badge?: string;
  href: string;
  stats?: { label: string; value: string }[];
};

const TOOLS: ToolCard[] = [
  {
    slug: "nas-selector",
    title: "NAS Selector",
    titleFa: "انتخاب‌گر NAS",
    descFa: "بهترین NAS را بر اساس کاربران، ظرفیت، RAID، سرویس‌ها و بودجه پیدا کنید. رتبه‌بندی زنده + دلیل پیشنهاد.",
    icon: "nas",
    accent: "var(--tb-nas)",
    badge: "جدید",
    href: "/tools/nas-selector",
    stats: [
      { label: "محصول", value: "۶+" },
      { label: "RAID", value: "۵ نوع" },
    ],
  },
  {
    slug: "nvr-selector",
    title: "NVR Selector",
    titleFa: "انتخاب‌گر NVR",
    descFa: "تعداد دوربین، رزولوشن و مدت ضبط را وارد کنید تا NVR مناسب با AI پیشنهاد شود.",
    icon: "nvr",
    accent: "var(--tb-nvr)",
    badge: "جدید",
    href: "/tools/nvr-selector",
    stats: [
      { label: "مدل", value: "۵" },
      { label: "تا", value: "۶۴ دوربین" },
    ],
  },
  {
    slug: "raid-calculator",
    title: "RAID Calculator",
    titleFa: "ماشین حساب RAID",
    descFa: "RAID 0/1/5/6/10 + SHR-1/SHR-2، دیسک ترکیبی، Hot Spare، نقشه ظرفیت زنده.",
    icon: "disk",
    accent: "var(--tb-raid)",
    badge: "v2",
    href: "/tools/raid-calculator",
    stats: [
      { label: "RAID", value: "۹ حالت" },
      { label: "SHR", value: "۱/۲" },
    ],
  },
  {
    slug: "subnet-calculator",
    title: "Subnet Calculator",
    titleFa: "ماشین حساب ساب‌نت",
    descFa: "محاسبه سریع IP، ماسک، تعداد هاست و محدوده شبکه – بدون تغییر.",
    icon: "tools",
    accent: "var(--tb-subnet)",
    href: "/tools/subnet-calculator",
    stats: [
      { label: "IPv4", value: "✓" },
      { label: "CIDR", value: "✓" },
    ],
  },
];

export function ToolsGrid({ className }: { className?: string }) {
  return (
    <section dir="rtl" className={["grid gap-5 sm:grid-cols-2 xl:grid-cols-4", className].filter(Boolean).join(" ")}>
      {TOOLS.map((tool) => (
        <Link
          key={tool.slug}
          href={tool.href}
          className="group relative flex flex-col overflow-hidden rounded-[var(--tb-radius-lg)] border border-[var(--tb-border)] bg-[var(--tb-bg-secondary)] p-5 shadow-[var(--tb-shadow-sm)] transition-all duration-[var(--tb-motion-md)] hover:-translate-y-1 hover:shadow-[var(--tb-shadow-md)]"
        >
          <div
            className="absolute -left-10 -top-10 h-28 w-28 rounded-full opacity-[0.14] blur-[28px] transition-opacity group-hover:opacity-25"
            style={{ background: tool.accent }}
            aria-hidden
          />
          <div className="flex items-start justify-between gap-3">
            <span
              className="inline-flex h-11 w-11 items-center justify-center rounded-[var(--tb-radius-md)] border"
              style={{
                background: `color-mix(in oklch, ${tool.accent} 14%, var(--tb-bg-muted))`,
                borderColor: `color-mix(in oklch, ${tool.accent} 30%, var(--tb-border))`,
                color: tool.accent,
              }}
            >
              <Icon name={tool.icon} className="h-5 w-5" />
            </span>
            {tool.badge && (
              <span className="badge" style={{
                background: `color-mix(in oklch, ${tool.accent} 12%, var(--tb-bg-muted))`,
                color: "var(--tb-fg-primary)",
                borderColor: `color-mix(in oklch, ${tool.accent} 28%, var(--tb-border))`
              }}>
                {tool.badge}
              </span>
            )}
          </div>

          <h3 className="mt-4 text-[16px] font-black text-[var(--tb-fg-primary)]">{tool.titleFa}</h3>
          <p className="mt-2 text-[12px] leading-7 text-[var(--tb-fg-muted)] min-h-[84px]">{tool.descFa}</p>

          {tool.stats && (
            <div className="mt-4 flex gap-2 flex-wrap">
              {tool.stats.map((s) => (
                <span key={s.label} className="badge">
                  {s.label}: <b className="mr-1" style={{ color: tool.accent }}>{s.value}</b>
                </span>
              ))}
            </div>
          )}

          <div className="mt-5 flex items-center justify-between text-[12px] font-bold">
            <span className="text-[var(--tb-fg-muted)] group-hover:text-[var(--tb-fg-primary)] transition-colors">
              {tool.title}
            </span>
            <span style={{ color: tool.accent }} className="flex items-center gap-1">
              باز کردن
              <Icon name="chevronLeft" className="h-4 w-4 rtl:rotate-180" />
            </span>
          </div>
        </Link>
      ))}
    </section>
  );
}

export default ToolsGrid;
