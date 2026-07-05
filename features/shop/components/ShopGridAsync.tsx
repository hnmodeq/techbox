'use client';
import Image from "next/image";
import { ContentItem } from "@/lib/content";
import Link from "next/link";
import { useMemo, useState, useRef, useEffect } from "react";
import { useCart } from "@/providers/cart.provider";
import { Button } from "@/components/ui/button";
import { Icon } from "@/design/icons";
import ModuleHeader from "@/components/effects/ModuleHeader";
import { CardStats } from "@/components/ui/card-stats";

export default function ShopGridAsync({ items }: { items: ContentItem[] }) {
  const { addToCart } = useCart();
  const categories = useMemo(() => Array.from(new Set(items.map(i => i.category).filter(Boolean))) as string[], [items]);
  const [filter, setFilter] = useState<string>("همه");

  const filtered = useMemo(() => {
    if (filter === "همه") return items;
    return items.filter(i => i.category === filter);
  }, [filter, items]);

  return (
    <main className="mx-auto max-w-7xl px-4 md:px-8 py-14" dir="rtl">
      <ModuleHeader module="shop" title="فروشگاه تجهیزات زیرساخت" description={`سرور، استوریج، شبکه و تجهیزات تخصصی • ${items.length.toLocaleString("fa-IR")} محصول`} />
      
      <div className="flex flex-wrap gap-2 mb-6">
        <button onClick={() => setFilter("همه")} className={`px-3 py-1.5 rounded-[var(--corner-radius)] text-xs font-bold transition-colors border-[length:var(--border-size)] border-[var(--border-color)] ${filter === "همه" ? "bg-[var(--shop)] text-[var(--main-background)]" : "bg-[var(--card-background)] paragraph-color hover:bg-[var(--muted-background)]"} cursor-pointer`}>همه</button>
        {categories.map((cat) => (
          <button key={cat} onClick={() => setFilter(cat)} className={`px-3 py-1.5 rounded-[var(--corner-radius)] text-xs font-bold transition-colors border-[length:var(--border-size)] border-[var(--border-color)] ${filter === cat ? "bg-[var(--shop)] text-[var(--main-background)]" : "bg-[var(--card-background)] paragraph-color hover:bg-[var(--muted-background)]"} cursor-pointer`}>{cat}</button>
        ))}
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((prod) => (
          <div key={prod.slug} className="group bg-[var(--card-background)] border-[length:var(--border-size)] border-[var(--border-color)] rounded-[var(--corner-radius)] shadow-[var(--shadow-size)] overflow-hidden hover:shadow-[var(--shadow-size)] transition-all">
            <Link href={`/shop/${prod.slug}`} className="block">
              <div className="relative aspect-[4/3] overflow-hidden bg-[var(--muted-background)]">
                <Image src={prod.image || "/assets/blog-1.jpg"} alt={prod.title} fill sizes="(min-width:1024px) 25vw, 100vw" className="object-cover transition-transform group-hover:scale-105" />
              </div>
              <div className="p-4">
                <h3 className="text-sm font-bold text-[var(--primary-text)] group-hover:text-[var(--shop)] transition-colors line-clamp-2 min-h-[42px]">{prod.title}</h3>
                <p className="text-xs paragraph-color mt-2 line-clamp-3">{prod.excerpt}</p>
              </div>
            </Link>
            <div className="px-4 pb-4 pt-0 flex items-center justify-between border-t-[length:var(--border-size)] border-[var(--border-color)]/40 mx-4">
              <CardStats module="shop" slug={prod.slug} initialViews={prod.views ?? 0} initialLikes={prod.likes ?? 0} showComments={true} />
              <Button size="xs" variant="ghost" onClick={() => addToCart(prod)}>+ سبد خرید</Button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}