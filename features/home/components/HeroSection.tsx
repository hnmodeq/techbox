"use client";

import { useEffect, useState } from "react";
import { ButtonLink } from "@/components/ui/button";
import { TerminalHero } from "@/components/effects/TerminalHero";
import { ArrowLeft } from "lucide-react";

export default function HeroSection() {
  const [echoLines, setEchoLines] = useState<string[]>([]);
  const [codeLines, setCodeLines] = useState<string[]>([]);
  const [echoWeight, setEchoWeight] = useState(70);

  useEffect(() => {
    fetch("/api/admin/hero-terminal", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        setEchoLines(data.echoLines || []);
        setCodeLines(data.codeLines || []);
        setEchoWeight(data.echoWeight || 70);
      })
      .catch(() => {});
  }, []);

  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden" dir="rtl">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[oklch(0.13_0.01_260)] to-[oklch(0.10_0_0)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,oklch(0.25_0.08_260/20%),transparent_60%)]" />

      <div className="relative mx-auto max-w-5xl px-6 py-24 text-center space-y-10">
        {/* Headline */}
        <div className="space-y-5">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.05]">
            <span className="bg-gradient-to-r from-white via-white/90 to-white/70 bg-clip-text text-transparent">
              پلتفرم تخصصی
            </span>
            <br />
            <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/50 bg-clip-text text-transparent">
              زیرساخت IT ایران
            </span>
          </h1>

          <p className="text-lg text-muted-foreground max-w-xl mx-auto leading-8">
            مقالات، ابزارها، فروشگاه، انجمن — همه در یک پلتفرم.
          </p>
        </div>

        {/* CTA */}
        <div className="flex flex-wrap gap-3 justify-center">
          <ButtonLink href="/blog" size="lg" className="btn-glow px-8 gap-2">
            شروع مطالعه
            <ArrowLeft className="size-4" />
          </ButtonLink>
          <ButtonLink href="/tools" variant="outline" size="lg" className="px-8 border-border/50 hover:bg-muted/30">
            ابزارهای رایگان
          </ButtonLink>
        </div>

        {/* Terminal */}
        <div className="mx-auto max-w-2xl pt-4">
          <TerminalHero
            fullWidth
            echoLines={echoLines}
            codeLines={codeLines}
            echoEnabled={true}
            codeEnabled={true}
            echoWeight={echoWeight}
          />
        </div>
      </div>
    </section>
  );
}
