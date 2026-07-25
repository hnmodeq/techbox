"use client";

import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import { MessageCircle, Ticket, ArrowLeft, Sparkles } from "lucide-react";

export default function FinalCTA() {
  return (
    <section className="relative homepage-section-darker home-section overflow-hidden" dir="rtl">
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-to-t from-[oklch(0.12_0.01_260)] via-transparent to-transparent" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px]" />
      
      <div className="relative mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
        {/* Icon */}
        <div className="inline-flex items-center justify-center size-16 rounded-2xl bg-primary/10 mb-6">
          <Sparkles className="size-8 text-primary" />
        </div>

        {/* Headline */}
        <h2 className="text-2xl sm:text-3xl font-black tracking-tight mb-4">
          نیاز به مشاوره دارید؟
        </h2>
        
        {/* Description */}
        <p className="text-muted-foreground max-w-lg mx-auto mb-8 leading-relaxed">
          تیم متخصص TechBox آماده راهنمایی شما در انتخاب تجهیزات، طراحی زیرساخت و حل مشکلات فنی است.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-wrap gap-4 justify-center">
          <ButtonLink href="/consultation" size="lg" className="btn-glow gap-2">
            <MessageCircle className="size-5" />
            درخواست مشاوره
          </ButtonLink>
          <ButtonLink href="/support" variant="outline" size="lg" className="gap-2">
            <Ticket className="size-5" />
            تیکت پشتیبانی
          </ButtonLink>
        </div>

        {/* Features */}
        <div className="flex flex-wrap justify-center gap-6 mt-10 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-green-500" />
            پاسخ در کمتر از ۲۴ ساعت
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-green-500" />
            مشاوره رایگان
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-green-500" />
            تیم متخصص
          </span>
        </div>
      </div>
    </section>
  );
}
