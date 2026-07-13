"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { moduleColors } from "@/config/module-colors";
import { HOME_ROW_SIZES } from "./HomeRowConfig";
import { HERO_MAGIC_DEFAULTS, toBooleanSetting, toNumberSetting } from "@/lib/hero-magic-settings";

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
  const [magicSettings, setMagicSettings] = useState<Record<keyof typeof HERO_MAGIC_DEFAULTS, string>>({ ...HERO_MAGIC_DEFAULTS });

  useEffect(() => {
    let mounted = true;
    fetch("/api/site-settings/hero-magic")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (mounted && data) setMagicSettings({ ...HERO_MAGIC_DEFAULTS, ...data });
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const t = setInterval(() => setIndex((p) => (p + 1) % items.length), 2800);
    return () => clearInterval(t);
  }, []);

  const item = items[index];

  return (
    <section className={`relative w-full max-w-full overflow-hidden bg-background border-0 ${HOME_ROW_SIZES.heroMinHeight} flex flex-col justify-center items-center px-4 py-16 text-center`} dir="rtl">
      <div className="absolute inset-0 opacity-70 dark:opacity-85">
        <MagicRings
          color={magicSettings["hero.magic.color"]}
          colorTwo={magicSettings["hero.magic.colorTwo"]}
          speed={toNumberSetting(magicSettings, "hero.magic.speed")}
          ringCount={toNumberSetting(magicSettings, "hero.magic.ringCount")}
          attenuation={toNumberSetting(magicSettings, "hero.magic.attenuation")}
          lineThickness={toNumberSetting(magicSettings, "hero.magic.lineThickness")}
          baseRadius={toNumberSetting(magicSettings, "hero.magic.baseRadius")}
          radiusStep={toNumberSetting(magicSettings, "hero.magic.radiusStep")}
          scaleRate={toNumberSetting(magicSettings, "hero.magic.scaleRate")}
          opacity={toNumberSetting(magicSettings, "hero.magic.opacity")}
          blur={toNumberSetting(magicSettings, "hero.magic.blur")}
          noiseAmount={toNumberSetting(magicSettings, "hero.magic.noiseAmount")}
          rotation={toNumberSetting(magicSettings, "hero.magic.rotation")}
          ringGap={toNumberSetting(magicSettings, "hero.magic.ringGap")}
          fadeIn={toNumberSetting(magicSettings, "hero.magic.fadeIn")}
          fadeOut={toNumberSetting(magicSettings, "hero.magic.fadeOut")}
          followMouse={toBooleanSetting(magicSettings, "hero.magic.followMouse")}
          mouseInfluence={toNumberSetting(magicSettings, "hero.magic.mouseInfluence")}
          hoverScale={toNumberSetting(magicSettings, "hero.magic.hoverScale")}
          parallax={toNumberSetting(magicSettings, "hero.magic.parallax")}
          clickBurst={toBooleanSetting(magicSettings, "hero.magic.clickBurst")}
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
