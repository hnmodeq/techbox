"use client";

import { motion } from "framer-motion";

const stats = [
  { number: "۴۸+", label: "ماژول تخصصی" },
  { number: "۱۲٬۴۰۰+", label: "محتوای منتشرشده" },
  { number: "۸۹٬۰۰۰+", label: "کاربر فعال" },
  { number: "۳۴۰+", label: "سازمان مشتری" },
];

export default function LandingStats() {
  return (
    <section className="w-full border-y border-[var(--border-color)] bg-[var(--card-background)] py-12" dir="rtl">
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex flex-col items-center"
            >
              <div className="text-4xl font-black text-[var(--primary-text)] tracking-tighter">
                {stat.number}
              </div>
              <div className="mt-1 text-sm paragraph-color font-medium">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
