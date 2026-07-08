"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { CardStats } from "@/components/ui/card-stats";
import type { ContentItem } from "@/lib/content";

export default function RecommendationRow({ 
  items, 
  title = "پیشنهادهای ویژه برای شما" 
}: { 
  items: ContentItem[]; 
  title?: string;
}) {
  if (!items.length) return null;

  return (
    <section className="w-full py-12 border-t border-[var(--border-color)] bg-[var(--main-background)]" dir="rtl">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-black text-[var(--primary-text)]">{title}</h2>
          <Link href="/search" className="text-sm font-bold text-[var(--primary)] hover:underline">
            مشاهده همه ←
          </Link>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {items.map((item, index) => (
            <motion.div
              key={item.slug}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
            >
              <Link
                href={`/${item.module}/${item.slug}`}
                className="group block overflow-hidden rounded-[var(--corner-radius)] border border-[var(--border-color)] bg-[var(--card-background)] shadow-[var(--shadow-size)] transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-size)]"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-[var(--muted-background)]">
                  <Image
                    src={item.image || "/assets/blog-1.jpg"}
                    alt={item.title}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 20vw"
                  />
                  <div className="absolute top-3 right-3 rounded bg-black/60 px-2 py-0.5 text-xs font-bold text-white">
                    {item.module}
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="line-clamp-2 font-bold text-[var(--primary-text)] group-hover:text-[var(--home)]">
                    {item.title}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-sm paragraph-color">
                    {item.excerpt}
                  </p>

                  <div className="mt-4 flex items-center justify-between text-xs">
                    <div className="paragraph-color">
                      {item.date_fa?.split(" ")[0]}
                    </div>
                    <CardStats module={item.module} slug={item.slug} showComments={false} />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
