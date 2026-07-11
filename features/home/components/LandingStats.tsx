"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

type StatItem = { number: string; label: string };

export default function LandingStats() {
  const [stats, setStats] = useState<StatItem[]>([]);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await fetch("/api/home", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();

        const items: StatItem[] = [];
        if (data.postCount != null) {
          items.push({
            number: Number(data.postCount).toLocaleString("fa-IR"),
            label: "محتوای منتشرشده",
          });
        }
        if (data.userCount != null) {
          items.push({
            number: Number(data.userCount).toLocaleString("fa-IR"),
            label: "کاربر عضو",
          });
        }
        if (data.moduleCount != null) {
          items.push({
            number: Number(data.moduleCount).toLocaleString("fa-IR"),
            label: "ماژول تخصصی",
          });
        }
        if (items.length > 0) setStats(items);
      } catch {
        // DB unavailable — show nothing rather than fake numbers
      }
    }
    loadStats();
  }, []);

  // Don't render the section if we have no real data
  if (stats.length === 0) return null;

  return (
    <section className="w-full border-y border-[var(--border-color)] bg-[var(--card-background)] py-12" dir="rtl">
      <div className="mx-auto max-w-6xl px-4">
        <div className={`grid gap-8 text-center`} style={{ gridTemplateColumns: `repeat(${stats.length}, 1fr)` }}>
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
