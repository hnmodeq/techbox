"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

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
    <section className="flex flex-col items-center pt-10 pb-6 text-center px-4" dir="rtl">
      <h1 className="hero-title">تکباکس</h1>
      <p className="mt-2 text-sm md:text-base text-muted-foreground">پاتوق بچه‌های فناوری اطلاعات</p>
      <div className="mt-5 hero-rotator w-full max-w-2xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={item.text}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.35 }}
            className="hero-item"
          >
            <Link href={item.href} className="hero-rotator-text hover:text-[var(--tb-brand)] transition-colors">
              {item.text}
            </Link>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
