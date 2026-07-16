"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
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
    <section className="w-full py-12 border-t border-border bg-background" dir="rtl">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-black text-foreground">{title}</h2>
          <ButtonLink variant="link" size="sm" className="font-bold shrink-0" href="/search">
            مشاهده همه ←
          </ButtonLink>
        </div>

        <div className="responsive-card-grid grid gap-6">
          {items.map((item, index) => (
            <motion.div
              key={item.slug}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
            >
              <Link href={`/${item.module}/${item.slug}`} className="group block h-full">
                <Card className="h-full overflow-hidden hover:shadow-md transition-all group-hover:-translate-y-0.5">
                  <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                    <Image
                      src={item.image || "/assets/blog-1.jpg"}
                      alt={item.title}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, 20vw"
                    />
                    <Badge variant="secondary" className="absolute top-3 right-3 bg-black/60 text-white border-none text-[10px]">
                      {item.module}
                    </Badge>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="line-clamp-2 font-bold text-foreground group-hover:text-[var(--home)] transition-colors">
                      {item.title}
                    </h3>
                    <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                      {item.excerpt}
                    </p>

                    <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                      <div>{item.date_fa?.split(" ")[0]}</div>
                      <CardStats module={item.module} slug={item.slug} initialViews={item.views} initialLikes={item.likes} initialComments={item.comments || 0} showComments={false} />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
