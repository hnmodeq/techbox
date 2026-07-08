"use client";

import { motion } from "framer-motion";

const companies = [
  "همراه اول", "ایرانسل", "رایتل", "بانک ملی", "بانک پاسارگاد",
  "دیجی‌کالا", "اسنپ", "تپسی", "آپارات", "فیلیمو"
];

export default function TrustSection() {
  return (
    <section className="w-full py-16 border-b border-[var(--border-color)] bg-[var(--main-background)]" dir="rtl">
      <div className="mx-auto max-w-6xl px-4 text-center">
        <p className="text-sm paragraph-color mb-8 font-bold">بیش از ۳۴۰ سازمان و تیم فنی به تکباکس اعتماد کرده‌اند</p>
        
        <div className="flex flex-wrap justify-center gap-x-12 gap-y-6 opacity-80">
          {companies.map((company, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.05 }}
              className="text-lg font-bold text-[var(--primary-text)]"
            >
              {company}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
