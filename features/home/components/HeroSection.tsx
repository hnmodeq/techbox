"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TerminalHero } from "@/components/effects/TerminalHero";
import { ArrowLeft, Zap, Shield, Server } from "lucide-react";

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
    <section className="homepage-hero w-full" dir="rtl">
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-20 sm:pt-28 pb-16 sm:pb-24">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16 items-center">
          {/* Left: Text content */}
          <div className="space-y-8 text-center lg:text-right">
            <Badge variant="outline" className="text-[11px] border-primary/30 text-primary">
              پلتفرم تخصصی زیرساخت IT ایران
            </Badge>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] text-foreground">
              همه چیز برای{" "}
              <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                مهندسان زیرساخت
              </span>
            </h1>

            <p className="text-base sm:text-lg text-muted-foreground leading-8 max-w-lg mx-auto lg:mx-0 lg:ms-auto">
              مقالات تخصصی، ابزارهای محاسباتی، فروشگاه سرور و استوریج، انجمن فنی، ویدیوهای آموزشی — همه در یک پلتفرم.
            </p>

            <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
              <ButtonLink href="/blog" size="lg" className="btn-glow gap-2 px-8">
                شروع مطالعه
                <ArrowLeft className="size-4" />
              </ButtonLink>
              <ButtonLink href="/tools" variant="outline" size="lg" className="gap-2 px-8 border-border hover:bg-muted/50">
                <Zap className="size-4" />
                ابزارهای رایگان
              </ButtonLink>
            </div>

            {/* Quick stats */}
            <div className="flex flex-wrap gap-8 justify-center lg:justify-start pt-4">
              {[
                { icon: Server, label: "+۵۰۰ محصول" },
                { icon: Shield, label: "گارانتی اصالت" },
                { icon: Zap, label: "ارسال سراسر کشور" },
              ].map((stat) => (
                <div key={stat.label} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <stat.icon className="size-4 text-primary/60" />
                  <span>{stat.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Terminal preview */}
          <div className="flex justify-center lg:justify-end">
            <div className="w-full max-w-xl">
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
        </div>
      </div>
    </section>
  );
}
