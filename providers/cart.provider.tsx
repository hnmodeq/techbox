"use client";

import Image from "next/image";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { zIndex } from "@/design";
import { Button, ButtonLink } from "@/components/ui/button";
import { XIcon } from "lucide-react";

export type CartItem = {
  slug: string;
  title: string;
  displayPrice: number;
  image?: string;
  qty: number;
};

type CartCtx = {
  items: CartItem[];
  count: number;
  add: (item: Omit<CartItem, "qty">, qty?: number) => void;
  remove: (slug: string) => void;
  clear: () => void;
  setQty: (slug: string, qty: number) => void;
  open: boolean;
  setOpen: (value: boolean) => void;
};

const Ctx = createContext<CartCtx | null>(null);
const KEY = "tb_cart_v3";
const LEGACY_KEYS = ["tb_cart_v2", "tb_cart_v1"];

function parseDisplayPrice(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return Math.max(0, Math.round(value));
  if (typeof value !== "string") return 0;
  return Math.max(0, parseInt(value.replace(/[^\d]/g, ""), 10) || 0);
}

function normalizeStoredCart(raw: string | null): CartItem[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((item) => item && typeof item.slug === "string" && typeof item.title === "string")
      .map((item) => ({
        slug: item.slug,
        title: item.title,
        image: typeof item.image === "string" ? item.image : undefined,
        displayPrice: parseDisplayPrice(item.displayPrice ?? item.price),
        qty: Math.min(20, Math.max(1, Number(item.qty ?? item.quantity) || 1)),
      }));
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [open, setOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const current = normalizeStoredCart(localStorage.getItem(KEY));
    if (current.length > 0) {
      setItems(current);
    } else {
      for (const legacyKey of LEGACY_KEYS) {
        const legacy = normalizeStoredCart(localStorage.getItem(legacyKey));
        if (legacy.length > 0) {
          setItems(legacy);
          break;
        }
      }
    }
    for (const legacyKey of LEGACY_KEYS) localStorage.removeItem(legacyKey);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(KEY, JSON.stringify(items));
  }, [hydrated, items]);

  const add = useCallback((item: Omit<CartItem, "qty">, qty = 1) => {
    setItems((previous) => {
      const existing = previous.find((entry) => entry.slug === item.slug);
      if (existing) {
        return previous.map((entry) =>
          entry.slug === item.slug
            ? { ...entry, ...item, qty: Math.min(20, entry.qty + Math.max(1, qty)) }
            : entry
        );
      }
      return [...previous, { ...item, qty: Math.min(20, Math.max(1, qty)) }];
    });
    setOpen(true);
  }, []);

  const remove = useCallback((slug: string) => {
    setItems((previous) => previous.filter((item) => item.slug !== slug));
  }, []);
  const clear = useCallback(() => setItems([]), []);
  const setQty = useCallback((slug: string, qty: number) => {
    setItems((previous) =>
      previous.map((item) =>
        item.slug === slug ? { ...item, qty: Math.min(20, Math.max(1, qty)) } : item
      )
    );
  }, []);
  const count = items.reduce((sum, item) => sum + item.qty, 0);
  const value = useMemo(
    () => ({ items, count, add, remove, clear, setQty, open, setOpen }),
    [items, count, add, remove, clear, setQty, open]
  );

  return (
    <Ctx.Provider value={value}>
      {children}
      <CartDrawer />
    </Ctx.Provider>
  );
}

function CartDrawer() {
  const ctx = useContext(Ctx);
  const asideRef = React.useRef<HTMLElement>(null);
  const open = ctx?.open ?? false;
  const setOpen = ctx?.setOpen;

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen?.(false);
    };
    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Element;
      if (asideRef.current?.contains(target)) return;
      if (target.closest("[data-cart-toggle]")) return;
      setOpen?.(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onPointerDown);
    };
  }, [open, setOpen]);

  if (!ctx) return null;
  const { items, remove, setQty, clear, count } = ctx;

  return (
    <div
      dir="rtl"
      aria-hidden={!open}
      className="pointer-events-none fixed inset-0"
      style={{ zIndex: zIndex.cart }}
    >
      {/* No dimming overlay: the page remains visible and interactive, like
          the news sidebar. The drawer itself slides in from the left. */}
      <aside
        ref={asideRef}
        inert={!open}
        className={`pointer-events-auto absolute left-0 top-0 flex h-full w-[380px] max-w-[92vw] flex-col border-r border-border bg-card p-4 shadow-lg transition-transform duration-300 ease-in-out motion-reduce:transition-none ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-bold">سبد خرید ({count.toLocaleString("fa-IR")})</h3>
          <Button variant="ghost" size="icon" onClick={() => ctx.setOpen(false)} aria-label="بستن سبد">
            <XIcon className="size-4" />
          </Button>
        </div>
        <div className="flex-1 space-y-3 overflow-y-auto">
          {items.length === 0 && <p className="py-10 text-center text-muted-foreground">سبد خالی است</p>}
          {items.map((item) => (
            <div key={item.slug} className="flex gap-3 rounded-md border border-border p-2">
              <div className="relative size-16 shrink-0 overflow-hidden rounded-md bg-muted">
                <Image src={item.image || "/assets/blog-1.jpg"} alt={item.title} fill sizes="64px" className="object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="line-clamp-2 text-sm">{item.title}</div>
                <div className="mt-1 text-sm text-primary">
                  {item.displayPrice > 0 ? `${item.displayPrice.toLocaleString("fa-IR")} تومان` : "قیمت در حال بررسی"}
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <Button onClick={() => setQty(item.slug, item.qty - 1)} variant="outline" size="icon-sm" disabled={item.qty <= 1}>−</Button>
                  <span className="w-6 text-center text-sm">{item.qty.toLocaleString("fa-IR")}</span>
                  <Button onClick={() => setQty(item.slug, item.qty + 1)} variant="outline" size="icon-sm" disabled={item.qty >= 20}>+</Button>
                  <Button onClick={() => remove(item.slug)} variant="link" size="xs" className="ms-auto text-destructive">حذف</Button>
                </div>
              </div>
            </div>
          ))}
        </div>
        {items.length > 0 && (
          <div className="space-y-2 border-t border-border pt-3">
            <p className="text-[11px] text-muted-foreground">مبلغ نهایی و موجودی در مرحله پرداخت از سرور بررسی می‌شود.</p>
            <ButtonLink href="/shop/checkout" onClick={() => ctx.setOpen(false)} className="w-full">ادامه خرید / تسویه</ButtonLink>
            <Button onClick={clear} variant="ghost" className="w-full text-sm">خالی کردن سبد</Button>
          </div>
        )}
      </aside>
    </div>
  );
}

const NOOP = () => {};
const emptyCart: CartCtx = {
  items: [],
  count: 0,
  add: NOOP,
  remove: NOOP,
  clear: NOOP,
  setQty: NOOP,
  open: false,
  setOpen: NOOP,
};

export function useCart(): CartCtx {
  return useContext(Ctx) ?? emptyCart;
}

export function CartIconButton() {
  const { count, setOpen } = useCart();
  return (
    <Button variant="outline" size="sm" data-cart-toggle onClick={() => setOpen(true)} className="relative gap-1" aria-label="سبد خرید">
      <span>🛒</span>
      <span className="hidden sm:inline">سبد</span>
      {count > 0 && (
        <span className="absolute -left-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-primary px-1 text-xs text-primary-foreground">
          {count.toLocaleString("fa-IR")}
        </span>
      )}
    </Button>
  );
}
