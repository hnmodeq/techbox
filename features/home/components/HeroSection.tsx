"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { moduleColors } from "@/config/module-colors";
import { HOME_ROW_SIZES } from "./HomeRowConfig";
import Strands from "@/components/effects/Strands";
import HeroLogo from "@/components/HeroLogo";

const items: { text: string; href: string; module: keyof typeof moduleColors }[] = [
  { text: "اخبار تکنولوژی رو با تکباکس دنبال کن", href: "/news", module: "news" },
  { text: "محصولات زیرساختی رو از تکباکس خریداری کن", href: "/shop", module: "shop" },
  { text: "مشکلات فنی رو داخل انجمن تکباکس مطرح کن", href: "/forum", module: "forum" },
  { text: "از ابزارهای زیرساختی تکباکس استفاده کن", href: "/tools", module: "tools" },
  { text: "فایل‌هایی که نیاز داری رو از تکباکس دانلود کن", href: "/download", module: "download" },
  { text: "نقد و بررسی‌های تکباکس رو دنبال کن", href: "/review", module: "review" },
  { text: "مقاله‌های تکنولوژی رو از تکباکس دنبال کن", href: "/blog", module: "blog" },
  { text: "ویدیوهای سرگرم‌کننده حوزه تکنولوژی رو از تکباکس دنبال کن", href: "/media", module: "media" },
  { text: "تاریخچه تحولات و رویدادها رو در تایم‌لاین فناوری دنبال کن", href: "/timeline", module: "timeline" },
];

export default function HeroSection() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIndex((p) => (p + 1) % items.length), 2800);
    return () => clearInterval(t);
  }, []);

  const item = items[index];

  return (
    <section className={`relative w-full max-w-full overflow-hidden bg-[var(--tb-bg-primary)] border-0 ${HOME_ROW_SIZES.heroMinHeight} flex items-center`} dir="rtl">
      <div className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-12 lg:py-16 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
        
        {/* RIGHT SIDE: Title + Rotating Text with Strands colorful background */}
        <div className="relative order-1 flex flex-col justify-center items-center lg:items-start text-center lg:text-right min-h-[460px] sm:min-h-[520px] p-6 rounded-3xl overflow-hidden border-0 bg-transparent">
          {/* Strands OGL Shader sitting behind title */}
          <div className="absolute inset-0 z-0 pointer-events-none opacity-85">
            <Strands
              colors={['#ffffff', '#1100ff', '#06B6D4', '#ffffff']}
              count={5}
              speed={0.4}
              glow={2.2}
              intensity={0.7}
              opacity={0.9}
            />
          </div>

          <div className="relative z-10 w-full">
            <h1 className="tb-hero font-black tracking-tight drop-shadow-lg">تکباکس</h1>
            <div className="hero-rotator mt-6 w-full max-w-xl">
              <AnimatePresence mode="wait">
                <motion.div
                  key={item.text}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -14 }}
                  transition={{ duration: 0.35 }}
                  className="hero-item"
                >
                  <Link href={item.href} className={`hero-rotator-text font-md text-lg sm:text-xl transition-colors ${moduleColors[item.module].active} hover:opacity-85 drop-shadow-md`}>
                    {item.text}
                  </Link>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* LEFT SIDE: Three.js 3D Floating Hero Logo */}
        <div className="relative order-2 h-[420px] sm:h-[480px] lg:h-[520px] w-full flex items-center justify-center rounded-3xl overflow-hidden border-0 bg-transparent">
          <HeroLogo
            logoTexturePath="/images/logo.png"
            backgroundColor="transparent"
            brandName=""
            tagline=""
          />
        </div>

      </div>
    </section>
  );
}
