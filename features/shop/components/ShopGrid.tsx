"use client";
import Image from "next/image";
import { getModuleItems, moduleMeta } from "@/lib/content";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useCart } from "@/providers/cart.provider";
import { Button, ButtonLink } from "@/components/ui/Button";
import { OverlayBackdrop } from "@/components/ui/Overlay";
import { Panel } from "@/components/ui/Panel";
import { CloseButton } from "@/components/ui/CloseButton";
import { zIndex } from "@/design";
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
 <ModuleHeader module="shop" title="فروشگاه زیرساخت" description={`ارسال سریع • گارانتی اصالت • ${filtered.length.toLocaleString("fa-IR")} کالا`} />
 <div className="mb-6 grid gap-2 rounded-[var(--tb-radius-lg)] border border-[var(--tb-border)] bg-[var(--tb-bg-secondary)]/50 p-3 sm:grid-cols-[minmax(0,1fr)_auto]">
 <input value={q} onChange={e=>setQ(e.target.value)} placeholder="جستجوی محصول…" className="input tb-text-md" />
 <Button type="button" variant="ghost" onClick={()=>setFilterOpen(true)} className="tb-text-md">
 فیلترها {cat !== "all" ? `• ${cat}`: ""}
 </Button>
 </div>

 {filterOpen && (
 <div className="fixed inset-0 flex items-center justify-center p-4" style={{zIndex:zIndex.modal}} dir="rtl">
 <OverlayBackdrop onClick={()=>setFilterOpen(false)} />
 <Panel className="relative w-full max-w-md space-y-4" style={{zIndex:zIndex.modalContent}}>
 <div className="flex items-center justify-between gap-3">
 <h2 className="tb-text-lg ">فیلتر محصولات</h2>
 <CloseButton onClick={()=>setFilterOpen(false)} />
 </div>
 <div className="space-y-3">
 <label className="block tb-text-sm text-[var(--tb-fg-muted)]">دسته‌بندی
 <select value={cat} onChange={e=>setCat(e.target.value)} className="input mt-1 tb-text-md">
 <option value="all">همه دسته‌ها</option>
 {categories.map(c=> <option key={c} value={c}>{c}</option>)}
 </select>
 </label>
 <label className="block tb-text-sm text-[var(--tb-fg-muted)]">مرتب‌سازی
 <select value={sort} onChange={e=>setSort(e.target.value as any)} className="input mt-1 tb-text-md">
 <option value="new">جدیدترین</option>
 <option value="popular">پربازدیدترین</option>
 <option value="cheap">قیمت</option>
 </select>
 </label>
 </div>
 <div className="flex justify-end gap-2">
 <Button type="button" variant="ghost" onClick={()=>{setCat("all"); setSort("new");}}>پاک کردن</Button>
 <Button type="button" onClick={()=>setFilterOpen(false)}>اعمال فیلتر</Button>
 </div>
 </Panel>
 </div>
 )}

 <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
 {filtered.map(p=>{
 const pr = prices[p.slug] || { price: "تماس بگیرید" };
 return (
 <div key={p.slug} className="card overflow-hidden group flex flex-col rounded-[24px]">
 <Link href={`/shop/${p.slug}`} className="block relative aspect-[4/3] bg-muted overflow-hidden">
 <Image src={p.image || "/assets/blog-1.jpg"} alt={p.title} fill sizes="(min-width:1280px) 25vw, (min-width:640px) 50vw, 100vw" className="object-cover transition-transform duration-[var(--tb-motion-lg)] group-hover:scale-105" />
 <span className="absolute top-3 left-3 rounded-[var(--tb-radius-full)] border border-white/30 bg-transparent px-2 py-1 tb-text-sm text-white backdrop-blur-[var(--tb-blur-sm)]">موجود</span>
 {pr.old && <span className="absolute top-3 right-3 rounded-[var(--tb-radius-full)] border border-white/30 bg-transparent px-2 py-1 tb-text-sm text-white backdrop-blur-[var(--tb-blur-sm)]">تخفیف</span>}
 </Link>
 <div className="p-4 flex-1 flex flex-col">
 <div className="tb-text-sm text-muted-foreground">{p.category}</div>
 <Link href={`/shop/${p.slug}`} className=" tb-text-md mt-1 hover:text-[var(--tb-shop)] line-clamp-2 min-h-[48px]">{p.title}</Link>
 <p className="tb-text-sm text-muted-foreground line-clamp-2 mt-1 flex-1">{p.excerpt}</p>
 <div className="mt-3">
 {pr.old && <div className="tb-text-sm line-through text-muted-foreground">{pr.old} تومان</div>}
 <div className="tb-text-lg text-[var(--tb-shop)]">{pr.price} <span className="tb-text-sm text-muted-foreground ">تومان</span></div>
 </div>
 <div className="flex gap-2 mt-3">
 <Button onClick={()=>add({ slug: p.slug, title: p.title, price: pr.price, image: p.image || "" },1)} size="xs" className="flex-1">افزودن به سبد</Button>
 <ButtonLink href={`/shop/${p.slug}`} variant="ghost" size="xs" className="px-3">جزئیات</ButtonLink>
 </div>
 <div className="tb-text-sm text-muted-foreground mt-2">👁 {p.views.toLocaleString("fa-IR")} • ♥ {p.likes}</div>
 </div>
 </div>
 )
 })}
 </div>
 {filtered.length===0 && <div className="text-center py-16 text-muted-foreground">محصولی یافت نشد</div>}
 </main>
 );
}
