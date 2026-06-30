"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import PixelBlastBackground from "@/components/effects/PixelBlastBackground";
import Shuffle from "@/components/effects/Shuffle";

const items = [
  { text: "اخبار تکنولوژی رو با تکباکس دنبال کن", href: "/news" },
  { text: "محصولات زیرساختی رو از تکباکس خریداری کن", href: "/shop" },
  { text: "مشکلات فنی رو داخل انجمن تکباکس مطرح کن", href: "/forum" },
  { text: "از ابزارهای زیرساختی تکباکس استفاده کن", href: "/tools" },
  { text: "فایل‌هایی که نیاز داری رو از تکباکس دانلود کن", href: "/download" },
  { text: "نقد و بررسی‌های تکباکس رو دنبال کن", href: "/review" },
  { text: "مقاله‌های تکنولوژی رو از تکباکس دنبال کن", href: "/blog" },
  { text: "ویدیوهای سرگرم‌کننده حوزه تکنولوژی رو از تکباکس دنبال کن", href: "/media" },
];

export default function HeroSection() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIndex((p) => (p + 1) % items.length), 2800);
    return () => clearInterval(t);
  }, []);

  const item = items[index];

  return (
    <section className="relative flex min-h-[300px] flex-col items-center overflow-hidden px-4 pb-10 pt-14 text-center md:min-h-[360px] md:pt-20" dir="rtl">
      <PixelBlastBackground variant="square" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[var(--tb-background)]/30 via-transparent to-[var(--tb-background)]" aria-hidden="true" />
      <div className="relative z-10 flex flex-col items-center">
        <Shuffle
          text="تکباکس"
          tag="h1"
          textAlign="center"
          shuffleDirection="right"
          duration={0.35}
          animationMode="evenodd"
          shuffleTimes={1}
          ease="power3.out"
          stagger={0.03}
          threshold={0.1}
          triggerOnce
          triggerOnHover
          respectReducedMotion
          colorFrom="var(--tb-shuffle-color-from)"
          colorTo="var(--tb-shuffle-color-to)"
          className="text-5xl font-black tracking-tight text-[var(--tb-brand)] md:text-7xl"
          style={{ direction: "rtl" }}
        />
        <p className="mt-3 text-sm text-[var(--tb-muted-foreground)] md:text-base">پاتوق بچه‌های فناوری اطلاعات</p>
        <div className="hero-rotator mt-6 w-full max-w-2xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={item.text}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.35 }}
              className="hero-item"
            >
              <Link href={item.href} className="hero-rotator-text transition-colors hover:text-[var(--tb-brand)]">
                {item.text}
              </Link>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
