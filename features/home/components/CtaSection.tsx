"use client";

import { ButtonLink } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function CtaSection() {
  return (
    <section className="py-20 px-6 text-center" dir="rtl">
      <div className="mx-auto max-w-lg space-y-5">
        <h2 className="text-2xl font-bold">شروع کنید</h2>
        <p className="text-sm text-muted-foreground">ثبت‌نام رایگان. بدون تعهد.</p>
        <ButtonLink href="/account" size="lg" className="btn-glow px-8 gap-2">
          ثبت‌نام رایگان
          <ArrowLeft className="size-4" />
        </ButtonLink>
      </div>
    </section>
  );
}
