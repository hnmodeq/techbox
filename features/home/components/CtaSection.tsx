"use client";

import { ButtonLink } from "@/components/ui/button";
import { ArrowLeft, Mail } from "lucide-react";

export default function CtaSection() {
  return (
    <section className="homepage-section-darker home-section w-full px-4 sm:px-6 lg:px-8" dir="rtl">
      <div className="mx-auto max-w-3xl text-center space-y-8">
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          آماده‌اید؟ همین حالا شروع کنید.
        </h2>
        <p className="text-base text-muted-foreground max-w-lg mx-auto leading-7">
          ثبت‌نام رایگان است. به جامعه مهندسان زیرساخت ایران بپیوندید.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <ButtonLink href="/account" size="lg" className="btn-glow gap-2 px-8">
            ثبت‌نام رایگان
            <ArrowLeft className="size-4" />
          </ButtonLink>
          <ButtonLink href="/contact" variant="outline" size="lg" className="gap-2 px-8 border-border hover:bg-muted/50">
            <Mail className="size-4" />
            ارتباط با ما
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
