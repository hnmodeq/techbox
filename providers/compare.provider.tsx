"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { toast } from "sonner";

export type CompareItem = {
  slug: string;
  title: string;
  image?: string;
  brand?: string;
  model?: string;
  priceAmount?: number;
  specs?: Record<string, unknown>;
};

type CompareCtx = {
  items: CompareItem[];
  count: number;
  add: (item: CompareItem) => void;
  remove: (slug: string) => void;
  clear: () => void;
  isInList: (slug: string) => boolean;
};

const Ctx = createContext<CompareCtx | null>(null);
const KEY = "tb_compare_v1";
const MAX_ITEMS = 4;

export function CompareProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CompareItem[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(items));
  }, [items]);

  const add = (item: CompareItem) => {
    setItems((prev) => {
      if (prev.find((p) => p.slug === item.slug)) return prev;
      if (prev.length >= MAX_ITEMS) {
        toast.error(`حداکثر ${MAX_ITEMS} محصول قابل مقایسه است`);
        return prev;
      }
      return [...prev, item];
    });
  };

  const remove = (slug: string) => setItems((prev) => prev.filter((p) => p.slug !== slug));
  const clear = () => setItems([]);
  const isInList = (slug: string) => items.some((p) => p.slug === slug);
  const count = items.length;

  return (
    <Ctx.Provider value={{ items, count, add, remove, clear, isInList }}>
      {children}
    </Ctx.Provider>
  );
}

export function useCompare() {
  const c = useContext(Ctx);
  if (!c) throw new Error("CompareProvider missing");
  return c;
}
