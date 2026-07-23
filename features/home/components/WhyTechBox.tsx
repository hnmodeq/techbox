"use client";

import { Badge } from "@/components/ui/badge";
import { BookOpen, ShoppingBag, Users, Download, Shield, Wrench } from "lucide-react";

const features = [
  {
    icon: BookOpen,
    title: "محتوای تخصصی",
    description: "مقالات، اخبار و ویدیوهای نوشته شده توسط مهندسان زیرساخت",
    color: "text-blue-500",
  },
  {
    icon: ShoppingBag,
    title: "فروشگاه تجهیزات",
    description: "سرور، NAS، استوریج و تجهیزات شبکه با قیمت لحظه‌ای",
    color: "text-green-500",
  },
  {
    icon: Wrench,
    title: "ابزارهای محاسباتی",
    description: "RAID Calculator، NAS Selector، Subnet Calculator و بیشتر",
    color: "text-orange-500",
  },
  {
    icon: Users,
    title: "انجمن فنی",
    description: "پرسش و پاسخ با متخصصان زیرساخت ایران",
    color: "text-purple-500",
  },
  {
    icon: Download,
    title: "مرکز دانلود",
    description: "فریم‌ور، ابزار، درایور و منابع فنی قابل دانلود",
    color: "text-pink-500",
  },
  {
    icon: Shield,
    title: "مشاوره تخصصی",
    description: "مشاوره رایگان برای انتخاب و خرید تجهیزات زیرساخت",
    color: "text-cyan-500",
  },
];

export default function WhyTechBox() {
  return (
    <section className="w-full py-16 px-4 sm:px-6 lg:px-8 bg-background" dir="rtl">
      <div className="mx-auto max-w-6xl">
        <div className="text-center mb-10">
          <Badge variant="secondary" className="mb-3 text-xs">چرا تکباکس؟</Badge>
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
                className="flex items-start gap-3 rounded-lg border p-4 hover:bg-muted/30 transition-colors"
              >
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <Icon className={`size-4 ${feature.color}`} />
                </div>
                <div>
                  <h3 className="text-sm font-bold">{feature.title}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-5">{feature.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
