"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { HardDrive, Network, ArrowLeft } from "lucide-react";

const tools = [
  {
    title: "RAID Calculator",
    titleFa: "محاسبه فضای ذخیره‌ساز",
    description: "محاسبه ظرفیت قابل استفاده برای RAID 0/1/5/6/10 و SHR",
    href: "/tools/raid-calculator",
    icon: HardDrive,
    preview: (
      <div className="space-y-3">
        <div className="flex gap-2">
          {["4TB", "4TB", "4TB", "4TB"].map((size, i) => (
            <div key={i} className="flex-1 rounded-lg border border-border/50 bg-background/50 p-2 text-center">
              <HardDrive className="size-4 mx-auto text-muted-foreground mb-1" />
              <div className="text-[10px] font-mono">{size}</div>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">RAID 5</span>
          <span className="font-bold text-primary">12 TB usable</span>
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <div className="h-full w-3/4 bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full" />
        </div>
      </div>
    ),
  },
  {
    title: "NAS Selector",
    titleFa: "انتخاب ذخیره‌ساز شبکه",
    description: "پیدا کردن NAS مناسب بر اساس نیاز شما",
    href: "/tools/nas-selector",
    icon: HardDrive,
    preview: (
      <div className="space-y-2">
        {[
          { name: "QNAP TS-464", bay: "4 Bay", price: "۴۵ م." },
          { name: "Synology DS923+", bay: "4 Bay", price: "۵۲ م." },
          { name: "QNAP TS-873A", bay: "8 Bay", price: "۸۵ م." },
        ].map((item, i) => (
          <div key={i} className="flex items-center justify-between text-xs border border-border/50 rounded-lg p-2.5 bg-background/30">
            <div>
              <div className="font-medium">{item.name}</div>
              <div className="text-muted-foreground text-[10px]">{item.bay}</div>
            </div>
            <Badge variant="outline" className="text-[10px]">{item.price}</Badge>
          </div>
        ))}
      </div>
    ),
  },
  {
    title: "Subnet Calculator",
    titleFa: "محاسبه زیرشبکه",
    description: "محاسبه شبکه، ماسک، آدرس‌های قابل استفاده",
    href: "/tools/subnet-calculator",
    icon: Network,
    preview: (
      <div className="space-y-1.5 font-mono text-xs">
        {[
          { label: "IP", value: "192.168.1.0/24" },
          { label: "Mask", value: "255.255.255.0" },
          { label: "Range", value: ".1 – .254" },
          { label: "Hosts", value: "254", highlight: true },
          { label: "Broadcast", value: "192.168.1.255" },
        ].map((row) => (
          <div key={row.label} className="flex justify-between">
            <span className="text-muted-foreground">{row.label}</span>
            <span className={row.highlight ? "text-primary font-bold" : ""}>{row.value}</span>
          </div>
        ))}
      </div>
    ),
  },
];

export default function ToolsShowcase() {
  return (
    <section className="homepage-section-dark home-section w-full px-4 sm:px-6 lg:px-8" dir="rtl">
      <div className="mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4 text-[11px] border-primary/30 text-primary">
            ابزارهای رایگان
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            ابزارهایی که هر مهندس IT نیاز دارد
          </h2>
          <p className="text-sm text-muted-foreground mt-3 max-w-lg mx-auto leading-6">
            بدون ثبت‌نام، بدون هزینه. محاسبات RAID، انتخاب NAS، و محاسبه Subnet.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Link key={tool.href} href={tool.href} className="group block">
                <div className="card-glow p-5 h-full space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="size-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold">{tool.titleFa}</h3>
                      <p className="text-[10px] text-muted-foreground font-mono" dir="ltr">{tool.title}</p>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground leading-5">
                    {tool.description}
                  </p>

                  <div className="rounded-lg border border-border/50 bg-background/30 p-3">
                    {tool.preview}
                  </div>

                  <div className="flex items-center gap-1.5 text-xs font-medium text-primary group-hover:gap-2.5 transition-all">
                    استفاده از ابزار
                    <ArrowLeft className="size-3.5" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
