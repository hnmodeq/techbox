"use client";
import Image from "next/image";
import { getModuleItems, moduleMeta } from "@/lib/content";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useCart } from "@/providers/cart.provider";
import { Button, ButtonLink } from "@/components/ui/Button";

const prices: Record<string, {price: string, old?: string}> = {
  "qnap-ts-2277": { price: "۴۸,۹۰۰,۰۰۰", old: "۵۲,۰۰۰,۰۰۰" },
  "dell-r750": { price: "۲۹۵,۰۰۰,۰۰۰" }
};

export default function ShopGrid(){
  const items = getModuleItems("shop");
  const meta = moduleMeta.shop;
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("all");
  const [sort, setSort] = useState<"new"|"popular"|"cheap">("new");
  const { add } = useCart();

  const categories = Array.from(new Set(items.map(i=>i.category).filter(Boolean))) as string[];

  const filtered = useMemo(()=>{
    let list = [...items];
    if(q) { const s=q.toLowerCase(); list = list.filter(i=> i.title.toLowerCase().includes(s) || i.tags.some(t=>t.includes(s))); }
    if(cat !== "all") list = list.filter(i=>i.category===cat);
    if(sort==="popular") list.sort((a,b)=>b.views-a.views);
    if(sort==="cheap") list.sort((a,b)=>a.likes-b.likes); // mock price sort
    return list;
  }, [items, q, cat, sort]);

  return (
    <main className="mx-auto max-w-7xl px-4 md:px-6 py-12" dir="rtl">
      <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
        <div>
          <h1 className={`text-3xl font-black ${meta.color}`}>فروشگاه زیرساخت</h1>
          <p className="text-xs text-muted-foreground mt-1">ارسال سریع • گارانتی اصالت • {filtered.length} کالا</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="جستجوی محصول…" className="input w-48 text-sm" />
          <select value={cat} onChange={e=>setCat(e.target.value)} className="input w-36 text-sm">
            <option value="all">همه دسته‌ها</option>
            {categories.map(c=> <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={sort} onChange={e=>setSort(e.target.value as any)} className="input w-36 text-sm">
            <option value="new">جدیدترین</option>
            <option value="popular">پربازدیدترین</option>
            <option value="cheap">قیمت</option>
          </select>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filtered.map(p=>{
          const pr = prices[p.slug] || { price: "تماس بگیرید" };
          return (
            <div key={p.slug} className="card overflow-hidden group flex flex-col rounded-[24px]">
              <Link href={`/shop/${p.slug}`} className="block relative aspect-[4/3] bg-muted overflow-hidden">
                <Image src={p.image || "/assets/blog-1.jpg"} alt={p.title} fill sizes="(min-width:1280px) 25vw, (min-width:640px) 50vw, 100vw" className="object-cover transition-transform duration-[var(--tb-duration-slower)] group-hover:scale-105" />
                <span className="absolute top-3 left-3 text-[10px] px-2 py-1 rounded-full bg-[color-mix(in_oklch,var(--tb-shop)_15%,transparent)] text-[var(--tb-shop)] border border-[color-mix(in_oklch,var(--tb-shop)_20%,transparent)]">موجود</span>
                {pr.old && <span className="absolute top-3 right-3 text-[10px] bg-[var(--tb-danger)] text-white px-2 py-1 rounded-full">تخفیف</span>}
              </Link>
              <div className="p-4 flex-1 flex flex-col">
                <div className="text-[11px] text-muted-foreground">{p.category}</div>
                <Link href={`/shop/${p.slug}`} className="font-extrabold text-[14px] leading-6 mt-1 hover:text-[var(--tb-shop)] line-clamp-2 min-h-[48px]">{p.title}</Link>
                <p className="text-[12px] text-muted-foreground line-clamp-2 mt-1 flex-1">{p.excerpt}</p>
                <div className="mt-3">
                  {pr.old && <div className="text-[11px] line-through text-muted-foreground">{pr.old} تومان</div>}
                  <div className="text-[18px] font-black text-[var(--tb-shop)]">{pr.price} <span className="text-[11px] text-muted-foreground font-normal">تومان</span></div>
                </div>
                <div className="flex gap-2 mt-3">
                  <Button onClick={()=>add({ slug: p.slug, title: p.title, price: pr.price, image: p.image || "" },1)} size="xs" className="flex-1">افزودن به سبد</Button>
                  <ButtonLink href={`/shop/${p.slug}`} variant="ghost" size="xs" className="px-3">جزئیات</ButtonLink>
                </div>
                <div className="text-[10px] text-muted-foreground mt-2">👁 {p.views.toLocaleString("fa-IR")} • ♥ {p.likes}</div>
              </div>
            </div>
          )
        })}
      </div>
      {filtered.length===0 && <div className="text-center py-16 text-muted-foreground">محصولی یافت نشد</div>}
    </main>
  );
}
