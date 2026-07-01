"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { moduleColors } from "@/config/module-colors";

const items: { text: string; href: string; module: keyof typeof moduleColors }[] = [
 { text: "اخبار تکنولوژی رو با تکباکس دنبال کن", href: "/news", module: "news" },
 { text: "محصولات زیرساختی رو از تکباکس خریداری کن", href: "/shop", module: "shop" },
 { text: "مشکلات فنی رو داخل انجمن تکباکس مطرح کن", href: "/forum", module: "forum" },
 { text: "از ابزارهای زیرساختی تکباکس استفاده کن", href: "/tools", module: "tools" },
 { text: "فایل‌هایی که نیاز داری رو از تکباکس دانلود کن", href: "/download", module: "download" },
 { text: "نقد و بررسی‌های تکباکس رو دنبال کن", href: "/review", module: "review" },
 { text: "مقاله‌های تکنولوژی رو از تکباکس دنبال کن", href: "/blog", module: "blog" },
 { text: "ویدیوهای سرگرم‌کننده حوزه تکنولوژی رو از تکباکس دنبال کن", href: "/media", module: "media" },
];

export default function HeroSection() {
 const [index, setIndex] = useState(0);

 useEffect(() => {
 const t = setInterval(() => setIndex((p) => (p + 1) % items.length), 2800);
 return () => clearInterval(t);
 }, []);

 const item = items[index];

 return (
    <section className="relative flex min-h-[260px] flex-col items-center px-4 pb-10 pt-14 text-center md:min-h-[300px] md:pt-20" dir="rtl">
      <div className="relative z-10 flex flex-col items-center">
        <h1 className="text-6xl font-black tracking-tight text-[var(--tb-primary)] md:text-8xl">تکباکس</h1>
        <div className="hero-rotator mt-3 w-full max-w-2xl">
 <AnimatePresence mode="wait">
 <motion.div
 key={item.text}
 initial={{ opacity: 0, y: 14 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: -14 }}
 transition={{ duration: 0.35 }}
 className="hero-item"
 >
 <Link href={item.href} className={`hero-rotator-text transition-colors ${moduleColors[item.module].active} hover:opacity-80`}>
 {item.text}
 </Link>
 </motion.div>
 </AnimatePresence>
 </div>
 </div>
 </section>
 );
}
