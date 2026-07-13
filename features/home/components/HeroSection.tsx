"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { moduleColors } from "@/config/module-colors";
import { HOME_ROW_SIZES } from "./HomeRowConfig";

const MagicRings = dynamic(() => import("@/components/effects/MagicRings"), { ssr: false });

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
    <section className={`relative w-full max-w-full overflow-hidden bg-background border-0 ${HOME_ROW_SIZES.heroMinHeight} flex flex-col justify-center items-center px-4 py-16 text-center`} dir="rtl">
      <div className="absolute inset-0 opacity-70 dark:opacity-85">
        <MagicRings
          color="#fc42ff"
          colorTwo="#42fcff"
          speed={0.75}
          ringCount={7}
          attenuation={9}
          lineThickness={2.4}
          baseRadius={0.26}
          radiusStep={0.075}
          scaleRate={0.16}
          opacity={0.75}
          noiseAmount={0.04}
          rotation={-18}
          followMouse
          mouseInfluence={0.09}
          hoverScale={1.06}
          parallax={0.025}
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/75 to-background" />
      <div className="relative z-10 flex flex-col items-center w-full max-w-3xl">
        <h1 className="text-[length:var(--hero-font-size)] text-foreground font-black tracking-tight">تکباکس</h1>
        <p className="mt-2 text-sm sm:text-base text-muted-foreground font-bold">پلتفرم جامع زیرساخت و فناوری اطلاعات</p>
        <div className="hero-rotator mt-6 w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={item.text}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.35 }}
              className="hero-item"
            >
              <Link href={item.href} className={`hero-rotator-text font-black text-lg sm:text-2xl transition-colors ${moduleColors[item.module].active} hover:opacity-85`}>
                {item.text} ←
              </Link>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
