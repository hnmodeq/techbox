"use client";
import Image from "next/image";
import { getModuleItems } from "@/lib/content";
import Link from "next/link";
import { useMemo, useState, useRef, useEffect } from "react";
import { useCart } from "@/providers/cart.provider";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/design/icons";
import ModuleHeader from "@/components/effects/ModuleHeader";

const prices: Record<string, {price: string, old?: string}> = {
 "qnap-ts-2277": { price: "۴۸,۹۰۰,۰۰۰", old: "۵۲,۰۰۰,۰۰۰" },
 "dell-r750": { price: "۲۹۵,۰۰۰,۰۰۰" }
};

export default function ShopGrid(){
 const items = getModuleItems("shop");
 const [q, setQ] = useState("");
 const [cat, setCat] = useState<string>("all");
 const [sort, setSort] = useState<"new"|"popular"|"cheap">("new");
 const [filterOpen, setFilterOpen] = useState(false);
 const dropdownRef = useRef<HTMLDivElement>(null);
 const { add } = useCart();

 const categories = Array.from(new Set(items.map(i=>i.category).filter(Boolean))) as string[];

 useEffect(() => {
   const handleClickOutside = (e: MouseEvent) => {
     if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
       setFilterOpen(false);
     }
   };
   document.addEventListener("mousedown", handleClickOutside);
   return () => document.removeEventListener("mousedown", handleClickOutside);
 }, []);

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
 <ModuleHeader module="shop" title="فروشگاه زیرساخت" description={`ارسال سریع • گارانتی اصالت • ${filtered.length.toLocaleString("fa-IR")} کالا`} />
 
 <div className="relative mb-6" ref={dropdownRef}>
   <div className="grid gap-2 rounded-[var(--tb-radius-lg)] border border-[var(--tb-border)] bg-[var(--tb-bg-secondary)]/50 p-3 sm:grid-cols-[minmax(0,1fr)_auto] items-center">
     <input value={q} onChange={e=>setQ(e.target.value)} placeholder="جستجوی محصول…" className="input tb-text-md" />
     <Button type="button" variant={filterOpen ? "primary" : "ghost"} onClick={()=>setFilterOpen(!filterOpen)} className="tb-text-md flex items-center gap-2">
       <span>فیلترها {cat !== "all" ? `• ${cat}`: ""}</span>
       <Icon name="chevronDown" className={`h-4 w-4 transition-transform ${filterOpen ? "rotate-180" : ""}`} />
     </Button>
   </div>

   {/* Dropdown Menu Filter */}
   {filterOpen && (
     <div className="absolute left-0 right-0 sm:right-auto sm:w-96 top-full mt-2 z-30 rounded-[var(--tb-radius-lg)] border border-[var(--tb-border)] bg-[var(--tb-bg-primary)] p-4 shadow-xl space-y-4 animate-in fade-in-0 zoom-in-95 duration-[var(--tb-motion-sm)]">
       <div className="space-y-3">
         <label className="block tb-text-sm text-[var(--tb-fg-muted)]">دسته‌بندی
           <select value={cat} onChange={e=>setCat(e.target.value)} className="input mt-1 w-full tb-text-md">
             <option value="all">همه دسته‌ها</option>
             {categories.map(c=> <option key={c} value={c}>{c}</option>)}
           </select>
         </label>
         <label className="block tb-text-sm text-[var(--tb-fg-muted)]">مرتب‌سازی
           <select value={sort} onChange={e=>setSort(e.target.value as any)} className="input mt-1 w-full tb-text-md">
             <option value="new">جدیدترین</option>
             <option value="popular">پربازدیدترین</option>
             <option value="cheap">محبوب‌ترین</option>
           </select>
         </label>
       </div>
       <div className="flex justify-end gap-2 pt-2 border-t border-[var(--tb-border)]">
         <Button type="button" variant="ghost" size="xs" onClick={()=>{setCat("all"); setSort("new");}}>پاک کردن</Button>
         <Button type="button" size="xs" onClick={()=>setFilterOpen(false)}>بستن منو</Button>
       </div>
     </div>
   )}
 </div>

 <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
 {filtered.map(p=>{
 const pr = prices[p.slug] || { price: "تماس بگیرید" };
 return (
        <Link key={p.slug} href={`/shop/${p.slug}`} className="card overflow-hidden group flex flex-col rounded-[var(--tb-radius-lg)] !p-0">
              <div className="block relative aspect-[4/3] bg-[var(--tb-bg-muted)] overflow-hidden">
                <Image src={p.image || "/assets/blog-1.jpg"} alt={p.title} fill sizes="(min-width:1280px) 25vw, (min-width:640px) 50vw, 100vw" className="object-cover transition-transform duration-[var(--tb-motion-lg)] group-hover:scale-105" />
                <span className="absolute top-3 left-3 rounded-[var(--tb-radius-full)] border border-white/30 bg-transparent px-2 py-1 tb-text-sm text-white backdrop-blur-[var(--tb-blur-sm)]">موجود</span>
                {pr.old && <span className="absolute top-3 right-3 rounded-[var(--tb-radius-full)] border border-white/30 bg-transparent px-2 py-1 tb-text-sm text-white backdrop-blur-[var(--tb-blur-sm)]">تخفیف</span>}
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <div className="tb-text-md mt-1 transition-colors group-hover:text-[var(--tb-shop)] line-clamp-2 min-h-[48px]">{p.title}</div>
                <p className="tb-text-sm text-[var(--tb-fg-muted)] line-clamp-2 mt-1 flex-1">{p.excerpt}</p>
                
                {/* Price section removed from card display per request, keeping add to cart / consultation system underlying */}
                
                <div className="flex gap-2 mt-4">
                  <Button onClick={(e)=>{ e.preventDefault(); e.stopPropagation(); add({ slug: p.slug, title: p.title, price: pr.price, image: p.image || "" },1); }} size="sm" variant="outline" className="flex-1 border-[var(--tb-shop)] text-[var(--tb-shop)] hover:bg-[var(--tb-shop)]/10 font-bold">مشاوره خرید</Button>
                </div>
                <div className="flex items-center gap-3 tb-text-sm text-[var(--tb-fg-muted)] mt-3 pt-3 border-t border-[var(--tb-border)]">
                  <span className="inline-flex items-center gap-1"><Icon name="view" size={14} strokeWidth={1.75} />{p.views.toLocaleString("fa-IR")}</span>
                  <span className="inline-flex items-center gap-1"><Icon name="like" size={14} strokeWidth={1.75} />{p.likes.toLocaleString("fa-IR")}</span>
                  <span className="inline-flex items-center gap-1"><Icon name="comment" size={14} strokeWidth={1.75} />{((p.likes % 9) + 1).toLocaleString("fa-IR")}</span>
                </div>
              </div>
            </Link>
          )
 })}
 </div>
 {filtered.length===0 && <div className="text-center py-16 text-muted-foreground">محصولی یافت نشد</div>}
 </main>
 );
}
