"use client";

import { Badge } from "@/components/ui/badge";
import { BookOpen, ShoppingBag, Users, Download, Shield, Wrench } from "lucide-react";

const features = [
  {
    icon: BookOpen,
    title: "محتوای تخصصی",
    description: "مقالات، اخبار و ویدیوهای نوشته شده توسط مهندسان زیرساخت",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
  },
  {
    icon: ShoppingBag,
    title: "فروشگاه تجهیزات",
    description: "سرور، NAS، استوریج و تجهیزات شبکه با قیمت لحظه‌ای",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
  },
  {
    icon: Wrench,
    title: "ابزارهای محاسباتی",
    description: "RAID Calculator، NAS Selector، Subnet Calculator و بیشتر",
    color: "text-orange-400",
    bg: "bg-orange-500/10",
  },
  {
    icon: Users,
    title: "انجمن فنی",
    description: "پرسش و پاسخ با متخصصان زیرساخت ایران",
    color: "text-purple-400",
    bg: "bg-purple-500/10",
  },
  {
    icon: Download,
    title: "مرکز دانلود",
    description: "فریم‌ور، ابزار، درایور و منابع فنی قابل دانلود",
    color: "text-pink-400",
    bg: "bg-pink-500/10",
  },
  {
    icon: Shield,
    title: "مشاوره تخصصی",
    description: "مشاوره رایگان برای انتخاب و خرید تجهیزات زیرساخت",
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
  },
];

export default function WhyTechBox() {
  return (
    <section className="home-section w-full px-4 sm:px-6 lg:px-8 bg-background" dir="rtl">
      <div className="mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4 text-[11px] border-primary/30 text-primary">
            چرا تکباکس؟
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            پلتفرمی ساخته شده توسط مهندسان، برای مهندسان
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="flex items-start gap-4 rounded-xl border border-border/50 p-5 hover:bg-muted/20 hover:border-border transition-all duration-200"
              >
                <div className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${feature.bg}`}>
                  <Icon className={`size-5 ${feature.color}`} />
                </div>
                <div>
                  <h3 className="text-sm font-bold">{feature.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-5">{feature.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
