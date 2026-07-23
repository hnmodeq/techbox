"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button, ButtonLink } from "@/components/ui/button";
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
    <section className="relative w-full overflow-hidden bg-background" dir="rtl">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/3 via-transparent to-transparent pointer-events-none" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 items-center">
          {/* Left: Text content */}
          <div className="space-y-6 text-center lg:text-right">
            <Badge variant="secondary" className="text-xs">
              پلتفرم تخصصی زیرساخت IT ایران
            </Badge>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
              همه چیز برای{" "}
              <span className="text-primary">مهندسین زیرساخت</span>
            </h1>

            <p className="text-sm sm:text-base text-muted-foreground leading-7 max-w-lg mx-auto lg:mx-0 lg:ms-auto">
              مقالات تخصصی، ابزارهای محاسباتی، فروشگاه سرور و استوریج، انجمن فنی، ویدیوهای آموزشی — همه در یک پلتفرم.
            </p>

            <div className="flex flex-wrap gap-3 justify-center lg:justify-end">
              <ButtonLink href="/blog" size="lg" className="gap-2">
                شروع مطالعه
                <ArrowLeft className="size-4" />
              </ButtonLink>
              <ButtonLink href="/tools" variant="outline" size="lg" className="gap-2">
                <Zap className="size-4" />
                ابزارهای رایگان
              </ButtonLink>
            </div>

            {/* Quick stats */}
            <div className="flex flex-wrap gap-6 justify-center lg:justify-end pt-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Server className="size-4 text-primary" />
                <span>+۵۰۰ محصول</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Shield className="size-4 text-primary" />
                <span>گارانتی اصالت</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Zap className="size-4 text-primary" />
                <span>ارسال سراسر کشور</span>
              </div>
            </div>
          </div>

          {/* Right: Terminal preview */}
          <div className="flex justify-center lg:justify-end">
            <div className="w-full max-w-lg">
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
