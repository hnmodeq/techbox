"use client";

import { BookOpen, ShoppingBag, Wrench, Users, Download, Shield } from "lucide-react";

const features = [
  { icon: BookOpen, title: "محتوای تخصصی", desc: "نوشته مهندسان" },
  { icon: ShoppingBag, title: "فروشگاه", desc: "سرور و استوریج" },
  { icon: Wrench, title: "ابزارها", desc: "RAID، NAS، Subnet" },
  { icon: Users, title: "انجمن", desc: "پرسش و پاسخ" },
  { icon: Download, title: "دانلود", desc: "فریم‌ور و ابزار" },
  { icon: Shield, title: "مشاوره", desc: "رایگان و تخصصی" },
];

export default function WhyTechBox() {
  return (
    <section className="py-20 px-6" dir="rtl">
      <div className="mx-auto max-w-4xl">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 text-center">
          {features.map((f) => (
            <div key={f.title} className="space-y-2">
              <f.icon className="size-6 mx-auto text-muted-foreground/60" />
              <div className="text-sm font-semibold">{f.title}</div>
              <div className="text-[11px] text-muted-foreground">{f.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
