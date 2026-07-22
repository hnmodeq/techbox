"use client";
import Image from "next/image";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { zIndex } from "@/design";
import { Button } from "@/components/ui/button";
import { XIcon } from "lucide-react";
import { Icon } from "@/design/icons";

export type ConsultationItem = { slug: string; title: string; image?: string; notes?: string; quantity?: number; price?: number };

type ConsultationCtx = {
  items: ConsultationItem[];
  count: number;
  add: (item: ConsultationItem) => void;
  remove: (slug: string) => void;
  clear: () => void;
  open: boolean;
  setOpen: (v: boolean) => void;
};

const Ctx = createContext<ConsultationCtx | null>(null);
const KEY = "tb_cart_v1";

export function ConsultationProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ConsultationItem[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(items));
  }, [items]);

  const add = (item: ConsultationItem) => {
    setItems((prev) => {
      if (prev.find((p) => p.slug === item.slug)) return prev;
      return [...prev, { ...item, quantity: 1 }];
    });
    setOpen(true);
  };

  const remove = (slug: string) => setItems((prev) => prev.filter((p) => p.slug !== slug));
  const clear = () => setItems([]);
  const count = items.length;

  return (
    <Ctx.Provider value={{ items, count, add, remove, clear, open, setOpen }}>
      {children}
      <CartDrawer />
    </Ctx.Provider>
  );
}

function CartDrawer() {
  const ctx = useContext(Ctx);
  const router = useRouter();

  const open = ctx?.open ?? false;
  const setOpenFn = ctx?.setOpen;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenFn?.(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, setOpenFn]);

  if (!ctx || !ctx.open) return null;
  const { items, setOpen, remove, count } = ctx;

  const handleContinueShopping = () => {
    setOpen(false);
    router.push("/buying");
  };

  return (
    <div dir="rtl" className="fixed inset-0" style={{ zIndex: zIndex.cart }}>
      <div className="fixed inset-0 bg-black/50" onClick={() => setOpen(false)} />
      <aside className="absolute left-0 top-0 flex h-full w-[420px] max-w-[92vw] flex-col border-r border-border bg-card shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Icon name="cart" size={20} className="text-[var(--primary)]" />
            <h3 className="text-lg font-bold">سبد خرید ({(count ?? 0).toLocaleString("fa-IR")})</h3>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setOpen(false)} aria-label="بستن">
            <XIcon className="h-4 w-4" />
          </Button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 && (
            <div className="text-center py-10">
              <Icon name="cart" size={40} className="mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground">سبد خرید شما خالی است</p>
              <p className="text-xs text-muted-foreground mt-1">از فروشگاه محصول مورد نظر خود را اضافه کنید</p>
            </div>
          )}
          {items.map((it) => (
            <div key={it.slug} className="flex gap-3 border border-border rounded-[var(--corner-radius)] p-3 transition-colors hover:bg-muted/30">
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-[var(--corner-radius)] bg-white">
                <Image src={it.image || "/assets/blog-1.jpg"} alt={it.title} fill sizes="56px" className="object-contain" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold line-clamp-2">{it.title}</div>
              </div>
              <Button onClick={() => remove(it.slug)} variant="ghost" size="xs" className="text-destructive shrink-0 self-start">
                حذف
              </Button>
            </div>
          ))}
        </div>

        {/* Continue shopping button */}
        {items.length > 0 && (
          <div className="border-t p-4 space-y-3">
            <Button
              type="button"
              onClick={handleContinueShopping}
              className="w-full bg-[#ef4056] hover:bg-[#e03a4f] text-white h-11 text-[13px] font-bold rounded-lg"
            >
              ادامه خرید
            </Button>
          </div>
        )}
      </aside>
    </div>
  );
}

export function useConsultation() {
  const c = useContext(Ctx);
  if (!c) throw new Error("ConsultationProvider missing");
  return c;
}
