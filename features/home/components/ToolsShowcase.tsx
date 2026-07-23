"use client";

import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HardDrive, Network, Calculator, ArrowLeft } from "lucide-react";

const tools = [
  {
    title: "RAID Calculator",
    titleFa: "ماشین‌حساب RAID",
    description: "محاسبه ظرفیت قابل استفاده برای RAID 0/1/5/6/10 و SHR",
    href: "/tools/raid-calculator",
    icon: HardDrive,
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
    preview: (
      <div className="space-y-3">
        <div className="flex gap-2">
          {["4TB", "4TB", "4TB", "4TB"].map((size, i) => (
            <div key={i} className="flex-1 rounded border bg-background p-2 text-center">
              <HardDrive className="size-4 mx-auto text-muted-foreground mb-1" />
              <div className="text-[10px] font-mono">{size}</div>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">RAID 5</span>
          <span className="font-bold text-primary">12 TB usable</span>
        </div>
        <div className="h-3 rounded-full bg-muted overflow-hidden">
          <div className="h-full w-3/4 bg-emerald-500 rounded-full" />
        </div>
      </div>
    ),
  },
  {
    title: "NAS Selector",
    titleFa: "انتخاب‌گر NAS",
    description: "پیدا کردن NAS مناسب بر اساس نیاز شما",
    href: "/tools/nas-selector",
    icon: HardDrive,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    preview: (
      <div className="space-y-3">
        {[
          { name: "QNAP TS-464", bay: "4 Bay", price: "۴۵ میلیون" },
          { name: "Synology DS923+", bay: "4 Bay", price: "۵۲ میلیون" },
          { name: "QNAP TS-873A", bay: "8 Bay", price: "۸۵ میلیون" },
        ].map((item, i) => (
          <div key={i} className="flex items-center justify-between text-xs border rounded p-2">
            <div>
              <div className="font-medium">{item.name}</div>
              <div className="text-muted-foreground">{item.bay}</div>
            </div>
            <Badge variant="outline" className="text-[10px]">{item.price}</Badge>
          </div>
        ))}
      </div>
    ),
  },
  {
    title: "Subnet Calculator",
    titleFa: "ماشین‌حساب Subnet",
    description: "محاسبه شبکه، ماسک، آدرس‌های قابل استفاده",
    href: "/tools/subnet-calculator",
    icon: Network,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    preview: (
      <div className="space-y-2 font-mono text-xs">
        <div className="flex justify-between"><span className="text-muted-foreground">IP:</span><span>192.168.1.0/24</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">Mask:</span><span>255.255.255.0</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">Range:</span><span>192.168.1.1 – .254</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">Hosts:</span><span className="text-primary font-bold">254</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">Broadcast:</span><span>192.168.1.255</span></div>
      </div>
    ),
  },
];

export default function ToolsShowcase() {
  return (
    <section className="w-full py-16 px-4 sm:px-6 lg:px-8 bg-muted/30" dir="rtl">
      <div className="mx-auto max-w-6xl">
        <div className="text-center mb-10">
          <Badge variant="secondary" className="mb-3 text-xs">ابزارهای رایگان</Badge>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            ابزارهایی که هر مهندس IT نیاز دارد
          </h2>
          <p className="text-sm text-muted-foreground mt-2 max-w-lg mx-auto">
            بدون ثبت‌نام، بدون هزینه. محاسبات RAID، انتخاب NAS، و محاسبه Subnet.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Link key={tool.href} href={tool.href} className="group block">
                <Card className="h-full hover:border-primary/30 transition-all duration-300 hover:shadow-lg">
                  <CardContent className="p-5 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className={`flex size-10 items-center justify-center rounded-lg ${tool.bgColor}`}>
                        <Icon className={`size-5 ${tool.color}`} />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold">{tool.titleFa}</h3>
                        <p className="text-[10px] text-muted-foreground font-mono" dir="ltr">{tool.title}</p>
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground leading-5">
                      {tool.description}
                    </p>

                    {/* Live preview */}
                    <div className="rounded-lg border bg-muted/30 p-3">
                      {tool.preview}
                    </div>

                    <div className="flex items-center gap-1.5 text-xs font-medium text-primary group-hover:gap-2.5 transition-all">
                      استفاده از ابزار
                      <ArrowLeft className="size-3.5" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
