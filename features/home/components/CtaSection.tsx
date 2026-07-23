"use client";

import { ButtonLink } from "@/components/ui/button";
import { ArrowLeft, Mail } from "lucide-react";

export default function CtaSection() {
  return (
    <section className="w-full py-16 px-4 sm:px-6 lg:px-8 bg-foreground text-background" dir="rtl">
      <div className="mx-auto max-w-3xl text-center space-y-6">
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          آماده‌اید؟ همین حالا شروع کنید.
        </h2>
        <p className="text-sm text-background/70 max-w-lg mx-auto">
          ثبت‌نام رایگان است. به جامعه مهندسان زیرساخت ایران بپیوندید.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <ButtonLink href="/account" variant="secondary" size="lg" className="gap-2">
            ثبت‌نام رایگان
            <ArrowLeft className="size-4" />
          </ButtonLink>
          <ButtonLink href="/contact" variant="outline" size="lg" className="gap-2 border-background/20 text-background hover:bg-background/10">
            <Mail className="size-4" />
            ارتباط با ما
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
