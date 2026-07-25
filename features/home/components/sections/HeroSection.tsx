"use client";

import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import { ArrowLeft, Sparkles } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden" dir="rtl">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[oklch(0.13_0.01_260)] to-[oklch(0.10_0_0)]" />
      
      {/* Radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,oklch(0.30_0.10_270/25%),transparent_60%)]" />
      
      {/* Grid pattern */}
      <div className="absolute inset-0 opacity-[0.03]" 
        style={{
          backgroundImage: `linear-gradient(oklch(1 0 0) 1px, transparent 1px), linear-gradient(90deg, oklch(1 0 0) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }} 
      />

      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-20 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8">
          <Sparkles className="size-4 text-primary" />
          <span className="text-sm text-primary">پلتفرم تخصصی IT ایران</span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] mb-6">
          <span className="bg-gradient-to-r from-white via-white/95 to-white/80 bg-clip-text text-transparent">
            همه چیز برای
          </span>
          <br />
          <span className="bg-gradient-to-r from-primary via-primary/90 to-primary/70 bg-clip-text text-transparent">
            متخصصان IT
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed">
          مقالات تخصصی، ابزارهای مهندسی، فروشگاه تجهیزات و انجمن پرسش و پاسخ — 
          همه در یک پلتفرم
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-wrap gap-4 justify-center mb-12">
          <ButtonLink href="/blog" size="lg" className="btn-glow px-8 gap-2">
            شروع مطالعه
            <ArrowLeft className="size-4" />
          </ButtonLink>
          <ButtonLink href="/shop" variant="outline" size="lg" className="px-8 border-border/50 hover:bg-muted/30">
            محصولات
          </ButtonLink>
          <ButtonLink href="/tools" variant="outline" size="lg" className="px-8 border-border/50 hover:bg-muted/30">
            ابزارهای رایگان
          </ButtonLink>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap justify-center gap-8 sm:gap-12 text-center">
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-primary">۹</div>
            <div className="text-xs text-muted-foreground">ماژول</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-primary">۱۵+</div>
            <div className="text-xs text-muted-foreground">ابزار رایگان</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-primary">۵۰+</div>
            <div className="text-xs text-muted-foreground">مقاله تخصصی</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-primary">۱۰۰+</div>
            <div className="text-xs text-muted-foreground">محصول</div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <div className="size-6 rounded-full border-2 border-muted-foreground/30 flex items-center justify-center animate-bounce">
          <div className="size-1.5 rounded-full bg-muted-foreground/50" />
        </div>
      </div>
    </section>
  );
}
