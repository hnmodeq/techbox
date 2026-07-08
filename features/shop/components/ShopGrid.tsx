"use client";
import Image from "next/image";
import { blurProps } from "@/lib/image-placeholder";
import { getModuleItems, type ContentItem } from "@/lib/content";
import { useDbPosts } from "@/hooks/useDbPosts";
import Link from "next/link";
import { useMemo, useState, useRef, useEffect } from "react";
import { useCart } from "@/providers/cart.provider";
import { Button } from "@/components/ui/button";
import { Icon } from "@/design/icons";
import ModuleHeader from "@/components/effects/ModuleHeader";
import { CardStats } from "@/components/ui/card-stats";
import { useProductComparison } from "@/hooks/useProductComparison";
import ProductComparisonModal from "@/components/ui/product-comparison-modal";

export default function ShopGrid({ serverItems }: { serverItems?: ContentItem[] }) {
 const fallbackItems = getModuleItems("shop");
 const { items: dbItems } = useDbPosts("shop", fallbackItems, 100);

 const items = serverItems && serverItems.length > 0 ? serverItems : dbItems;
 const [q, setQ] = useState("");
 const [cat, setCat] = useState<string>("all");
 const [sort, setSort] = useState<"new"|"popular"|"liked">("new");
 const [filterOpen, setFilterOpen] = useState(false);
 const dropdownRef = useRef<HTMLDivElement>(null);
 const { add } = useCart();

 // Product Comparison (Step 13)
 const {
   comparedProducts,
   addToComparison,
   removeFromComparison,
   clearComparison,
   isInComparison,
   count: compareCount,
 } = useProductComparison();

 const [showComparisonModal, setShowComparisonModal] = useState(false);

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
 if(sort==="liked") list.sort((a,b)=>b.likes-a.likes);
 return list;
 }, [items, q, cat, sort]);

 return (
 <main className="mx-auto max-w-7xl px-4 md:px-6 py-12" dir="rtl">
 <ModuleHeader module="shop" title="فروشگاه زیرساخت" description={`ارسال سریع • گارانتی اصالت • ${filtered.length.toLocaleString("fa-IR")} کالا`} />
 
 <div className="relative mb-6" ref={dropdownRef}>
   <div className="grid gap-2 rounded-[var(--corner-radius)] border-[length:var(--border-size)] border-[var(--border-color)] bg-[var(--card-background)]/50 p-3 sm:grid-cols-[minmax(0,1fr)_auto] items-center">
     <input value={q} onChange={e=>setQ(e.target.value)} placeholder="جستجوی محصول…" className="input text-[length:var(--h3-font-size)] text-[var(--h3-font-color)] font-semibold" />
     <Button type="button" variant={filterOpen ? "primary" : "ghost"} onClick={()=>setFilterOpen(!filterOpen)} className="text-[length:var(--h3-font-size)] text-[var(--h3-font-color)] font-semibold flex items-center gap-2">
       <span>فیلترها {cat !== "all" ? `• ${cat}`: ""}</span>
       <Icon name="chevronDown" className={`h-4 w-4 transition-transform ${filterOpen ? "rotate-180" : ""}`} />
     </Button>
   </div>

   {/* Dropdown Menu Filter */}
   {filterOpen && (
     <div className="absolute left-0 right-0 sm:right-auto sm:w-96 top-full mt-2 z-30 rounded-[var(--corner-radius)] border-[length:var(--border-size)] border-[var(--border-color)] bg-[var(--main-background)] p-4 shadow-[var(--shadow-size)] space-y-4 animate-in fade-in-0 zoom-in-95 duration-[150ms]">
       <div className="space-y-3">
         <label className="block text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] paragraph-color">دسته‌بندی
           <select value={cat} onChange={e=>setCat(e.target.value)} className="input mt-1 w-full text-[length:var(--h3-font-size)] text-[var(--h3-font-color)] font-semibold">
             <option value="all">همه دسته‌ها</option>
             {categories.map(c=> <option key={c} value={c}>{c}</option>)}
           </select>
         </label>
         <label className="block text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] paragraph-color">مرتب‌سازی
           <select value={sort} onChange={e=>setSort(e.target.value as any)} className="input mt-1 w-full text-[length:var(--h3-font-size)] text-[var(--h3-font-color)] font-semibold">
             <option value="new">جدیدترین</option>
             <option value="popular">پربازدیدترین</option>
             <option value="liked">محبوب‌ترین</option>
           </select>
         </label>
       </div>
       <div className="flex justify-end gap-2 pt-2 border-t-[length:var(--border-size)] border-[var(--border-color)]">
         <Button type="button" variant="ghost" size="xs" onClick={()=>{setCat("all"); setSort("new");}}>پاک کردن</Button>
         <Button type="button" size="xs" onClick={()=>setFilterOpen(false)}>بستن منو</Button>
       </div>
     </div>
   )}
 </div>

 <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
 {filtered.map(p=>(
        <Link key={p.slug} href={`/shop/${p.slug}`} className="bg-[var(--card-background)] text-[var(--primary-text)] border-[length:var(--border-size)] border-[var(--border-color)] rounded-[var(--corner-radius)] shadow-[var(--shadow-size)] overflow-hidden group flex flex-col rounded-[var(--corner-radius)] !p-0">
              <div className="block relative aspect-[4/3] bg-[var(--muted-background)] overflow-hidden">
                <Image src={p.image || "/assets/blog-1.jpg"} alt={p.title} fill sizes="(min-width:1280px) 25vw, (min-width:640px) 50vw, 100vw" className="object-cover transition-transform duration-[300ms] group-hover:scale-105" {...blurProps(p.image || "/assets/blog-1.jpg")} />
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <div className="text-[length:var(--h3-font-size)] text-[var(--h3-font-color)] font-semibold mt-1 transition-colors group-hover:text-[var(--shop)] line-clamp-2 min-h-[48px]">{p.title}</div>
                <div className="mt-1 flex flex-wrap gap-1 text-[11px] paragraph-color">
                  {p.brand && <span>{p.brand}</span>}
                  {p.model && <span dir="ltr">{p.model}</span>}
                  {p.availability && <span className="text-[var(--success)]">{p.availability}</span>}
                </div>
                <p className="text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] paragraph-color line-clamp-2 mt-1 flex-1">{p.excerpt}</p>
                <div className="mt-3 flex items-center justify-between gap-2">
                  <span className="text-sm font-black text-[var(--shop)]">{p.priceLabel || "مشاوره خرید"}</span>
                  <Button onClick={(e)=>{ e.preventDefault(); e.stopPropagation(); add({ slug: p.slug, title: p.title, price: p.priceLabel || "مشاوره خرید", image: p.image || "" },1); }} size="sm" variant="outline" className="border-[var(--shop)] text-[var(--shop)] hover:bg-[var(--shop)]/10 font-bold">مشاوره</Button>
                </div>
                <div className="mt-3 pt-3 border-t-[length:var(--border-size)] border-[var(--border-color)] flex items-center justify-between">
                  <CardStats module="shop" slug={p.slug} showComments={true} />
                  
                  {/* Compare Button (Step 13) */}
                  <Button
                    size="xs"
                    variant={isInComparison(p.slug) ? "primary" : "ghost"}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (isInComparison(p.slug)) {
                        removeFromComparison(p.slug);
                      } else {
                        addToComparison(p);
                      }
                    }}
                    className="text-xs"
                  >
                    {isInComparison(p.slug) ? "حذف از مقایسه" : "مقایسه"}
                  </Button>
                </div>
              </div>
            </Link>
          ))}
 </div>
 {filtered.length===0 && <div className="text-center py-16 text-muted-foreground">محصولی یافت نشد</div>}

      {/* Floating Compare Button (Step 13) */}
      {compareCount > 0 && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button
            onClick={() => setShowComparisonModal(true)}
            className="shadow-[var(--shadow-size)] flex items-center gap-2"
          >
            مقایسه محصولات ({compareCount})
          </Button>
        </div>
      )}

      {/* Comparison Modal */}
      <ProductComparisonModal
        isOpen={showComparisonModal}
        onClose={() => setShowComparisonModal(false)}
        products={comparedProducts}
        onRemove={removeFromComparison}
        onClear={clearComparison}
      />
    </main>
  );
}
