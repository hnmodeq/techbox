"use client";
import React, { createContext, useContext, useEffect, useState } from "react";

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
  if(!ctx || !ctx.open) return null;
  const { items, setOpen, remove, setQty, clear, count } = ctx;
  return (
    <div dir="rtl" className="fixed inset-0 z-[200]">
      <div className="absolute inset-0 bg-black/45" onClick={()=>setOpen(false)} />
      <aside className="absolute left-0 top-0 h-full w-[380px] max-w-[92vw] bg-card border-r border-border shadow-2xl p-4 flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-black text-lg">سبد خرید ({count.toLocaleString("fa-IR")})</h3>
          <button onClick={()=>setOpen(false)} className="text-muted-foreground hover:text-foreground">✕</button>
        </div>
        <div className="flex-1 overflow-y-auto space-y-3">
          {items.length===0 && <p className="text-sm text-muted-foreground text-center py-10">سبد خالی است</p>}
          {items.map(it=>(
            <div key={it.slug} className="flex gap-3 border border-border rounded-xl p-2">
              <img src={it.image} alt="" className="w-16 h-16 object-cover rounded-lg bg-muted" />
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-bold leading-5 line-clamp-2">{it.title}</div>
                <div className="text-[11px] text-[var(--tb-shop)] mt-1">{it.price} تومان</div>
                <div className="flex items-center gap-2 mt-2">
                  <button onClick={()=>setQty(it.slug, it.qty-1)} className="w-6 h-6 rounded border border-border text-xs">−</button>
                  <span className="text-xs w-6 text-center">{it.qty.toLocaleString("fa-IR")}</span>
                  <button onClick={()=>setQty(it.slug, it.qty+1)} className="w-6 h-6 rounded border border-border text-xs">+</button>
                  <button onClick={()=>remove(it.slug)} className="ms-auto text-[11px] text-[var(--tb-danger)] hover:underline">حذف</button>
                </div>
              </div>
            </div>
          ))}
        </div>
        {items.length>0 && (
          <div className="border-t border-border pt-3 space-y-2">
            <button className="btn btn-primary w-full">ادامه خرید / تسویه</button>
            <button onClick={clear} className="btn btn-ghost w-full text-xs">خالی کردن سبد</button>
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
    <button onClick={()=>setOpen(true)} className="relative inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
      <span>🛒</span>
      <span className="hidden sm:inline">سبد</span>
      {count>0 && <span className="absolute -top-1 -left-1 bg-[var(--tb-shop)] text-black text-[10px] min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1 font-bold">{count.toLocaleString("fa-IR")}</span>}
    </button>
  );
}
