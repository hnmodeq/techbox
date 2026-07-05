"use client";
import Image from "next/image";
import React, { createContext, useContext, useEffect, useState } from "react";
import Link from "next/link";
import { zIndex } from "@/design";
import { Button, ButtonLink } from "@/components/ui/button";
import { CloseButton } from "@/components/ui/close-button";
import { IconRailButton } from "@/components/ui/icon-rail-button";
import { OverlayBackdrop } from "@/components/ui/overlay";

export type CartItem = { slug: string; title: string; price: string; image?: string; qty: number };
type CartCtx = {
 items: CartItem[];
 count: number;
 add: (item: Omit<CartItem,"qty">, qty?: number) => void;
 remove: (slug: string) => void;
 clear: () => void;
 setQty: (slug: string, qty: number) => void;
 open: boolean;
 setOpen: (v:boolean)=>void;
};

const Ctx = createContext<CartCtx | null>(null);
const KEY = "tb_cart_v2";

export function CartProvider({ children }: { children: React.ReactNode }){
 const [items, setItems] = useState<CartItem[]>([]);
 const [open, setOpen] = useState(false);

 useEffect(()=>{
 try{ const raw = localStorage.getItem(KEY); if(raw) setItems(JSON.parse(raw)); }catch{}
 },[]);
 useEffect(()=>{
 localStorage.setItem(KEY, JSON.stringify(items));
 },[items]);

 const add = (item: Omit<CartItem,"qty">, qty = 1)=>{
 setItems(prev=>{
 const f = prev.find(p=>p.slug===item.slug);
 if(f) return prev.map(p=> p.slug===item.slug ? {...p, qty: p.qty+qty} : p);
 return [...prev, {...item, qty}];
 });
 setOpen(true);
 };
 const remove = (slug:string)=> setItems(prev=>prev.filter(p=>p.slug!==slug));
 const clear = ()=> setItems([]);
 const setQty = (slug:string, qty:number)=> setItems(prev=> prev.map(p=> p.slug===slug ? {...p, qty: Math.max(1,qty)}:p));
 const count = items.reduce((s,i)=>s+i.qty,0);

 return <Ctx.Provider value={{items, count, add, remove, clear, setQty, open, setOpen}}>{children}
 <CartDrawer />
 </Ctx.Provider>;
}

function CartDrawer(){
 const ctx = useContext(Ctx);
 const open = ctx?.open ?? false;
 const setOpenFn = ctx?.setOpen;

 // Close on Escape.
 useEffect(() => {
 if (!open) return;
 const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpenFn?.(false); };
 document.addEventListener("keydown", onKey);
 return () => document.removeEventListener("keydown", onKey);
 }, [open, setOpenFn]);

 if(!ctx || !ctx.open) return null;
 const { items, setOpen, remove, setQty, clear, count } = ctx;
 return (
 <div dir="rtl" className="fixed inset-0" style={{ zIndex: zIndex.cart }}>
 <OverlayBackdrop onClick={()=>setOpen(false)} />
 <aside className="absolute left-0 top-0 flex h-full w-[380px] max-w-[92vw] flex-col border-r border-[var(--tb-border)] bg-[var(--tb-bg-secondary)] p-4 shadow-[var(--tb-shadow-lg)]">
 <div className="flex items-center justify-between mb-3">
 <h3 className=" tb-text-lg">سبد خرید ({(count ?? 0).toLocaleString("fa-IR")})</h3>
 <CloseButton onClick={()=>setOpen(false)} label="بستن سبد" />
 </div>
 <div className="flex-1 overflow-y-auto space-y-3">
 {items.length===0 && <p className="tb-text-md text-muted-foreground text-center py-10">سبد خالی است</p>}
 {items.map(it=>(
 <div key={it.slug} className="flex gap-3 border border-[var(--tb-border)] rounded-[var(--tb-radius-lg)] p-2">
 <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-[var(--tb-radius-md)] bg-[var(--tb-bg-muted)]"><Image src={it.image || "/assets/blog-1.jpg"} alt={it.title} fill sizes="64px" className="object-cover" /></div>
 <div className="flex-1 min-w-0">
 <div className="tb-text-sm line-clamp-2">{it.title}</div>
 <div className="tb-text-sm text-[var(--tb-shop)] mt-1">{it.price} تومان</div>
 <div className="flex items-center gap-2 mt-2">
 <Button onClick={()=>setQty(it.slug, it.qty-1)} variant="outline" size="iconSm" className="h-6 w-6 tb-text-sm">−</Button>
 <span className="tb-text-sm w-6 text-center">{(it.qty ?? 1).toLocaleString("fa-IR")}</span>
 <Button onClick={()=>setQty(it.slug, it.qty+1)} variant="outline" size="iconSm" className="h-6 w-6 tb-text-sm">+</Button>
 <Button onClick={()=>remove(it.slug)} variant="link" size="xs" className="ms-auto tb-text-sm text-[var(--tb-danger)]">حذف</Button>
 </div>
 </div>
 </div>
 ))}
 </div>
 {items.length>0 && (
 <div className="border-t border-[var(--tb-border)] pt-3 space-y-2">
 <ButtonLink href="/shop/checkout" onClick={()=>setOpen(false)} className="w-full">ادامه خرید / تسویه</ButtonLink>
 <Button onClick={clear} variant="ghost" className="w-full tb-text-sm">خالی کردن سبد</Button>
 </div>
 )}
 </aside>
 </div>
 );
}

export function useCart(){
 const c = useContext(Ctx);
 if(!c) throw new Error("CartProvider missing – wrap LayoutShell with <CartProvider>");
 return c;
}

export function CartIconButton(){
 const { count, setOpen } = useCart();
 return (
 <IconRailButton tone="shop" onClick={()=>setOpen(true)} className="gap-1 tb-text-md" aria-label="سبد خرید">
 <span>🛒</span>
 <span className="hidden sm:inline">سبد</span>
 {count>0 && <span className="absolute -top-1 -left-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-[var(--tb-radius-full)] bg-[var(--tb-shop)] px-1 tb-text-sm text-black">{(count ?? 0).toLocaleString("fa-IR")}</span>}
 </IconRailButton>
 );
}
