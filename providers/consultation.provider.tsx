"use client";
import Image from "next/image";
import React, { createContext, useContext, useEffect, useState } from "react";
import { zIndex } from "@/design";
import { Button, ButtonLink } from "@/components/ui/button";
import { XIcon } from "lucide-react";
import { Icon } from "@/design/icons";
import { useAuth } from "@/providers/auth.provider";
import { toast } from "sonner";

export type ConsultationItem = { slug: string; title: string; image?: string; notes?: string };

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
const KEY = "tb_consultation_v1";

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
      return [...prev, item];
    });
    setOpen(true);
  };

  const remove = (slug: string) => setItems((prev) => prev.filter((p) => p.slug !== slug));
  const clear = () => setItems([]);
  const count = items.length;

  return (
    <Ctx.Provider value={{ items, count, add, remove, clear, open, setOpen }}>
      {children}
      <ConsultationDrawer />
    </Ctx.Provider>
  );
}

function ConsultationDrawer() {
  const ctx = useContext(Ctx);
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [notes, setNotes] = useState("");

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
  const { items, setOpen, remove, clear, count } = ctx;

  const handleSubmit = async () => {
    if (items.length === 0) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/consultation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ slug: i.slug, title: i.title })),
          notes: notes.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "submit_failed");
      toast.success("درخواست مشاوره شما ثبت شد! تیم فروش ما به‌زودی با شما تماس خواهد گرفت.");
      clear();
      setNotes("");
      setOpen(false);
    } catch {
      toast.error("خطا در ثبت درخواست مشاوره. لطفاً دوباره تلاش کنید.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div dir="rtl" className="fixed inset-0" style={{ zIndex: zIndex.cart }}>
      <div className="fixed inset-0 bg-black/50" onClick={() => setOpen(false)} />
      <aside className="absolute left-0 top-0 flex h-full w-[420px] max-w-[92vw] flex-col border-r border-border bg-card shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Icon name="cart" size={20} className="text-[var(--shop)]" />
            <h3 className="text-lg font-bold">اتاق مشاوره ({(count ?? 0).toLocaleString("fa-IR")})</h3>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setOpen(false)} aria-label="بستن">
            <XIcon className="h-4 w-4" />
          </Button>
        </div>

        {/* Info banner */}
        <div className="px-4 py-3 bg-[var(--shop)]/5 border-b text-xs text-muted-foreground leading-5">
          محصولاتی که نیاز دارید را اضافه کنید و درخواست مشاوره بدهید. تیم متخصصین ما با شما تماس می‌گیرند و بهترین پیکربندی را پیشنهاد می‌دهند.
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 && (
            <div className="text-center py-10">
              <Icon name="cart" size={40} className="mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground">هنوز محصولی اضافه نشده است</p>
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

        {/* Submit section */}
        {items.length > 0 && (
          <div className="border-t p-4 space-y-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">توضیحات نیاز شما (اختیاری)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="مثلاً: نیاز به سرور با ۲۰۰ کاربر داریم..."
                className="w-full rounded-[var(--corner-radius)] border border-border bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30 resize-none min-h-[70px]"
                rows={2}
              />
            </div>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              loading={submitting}
              className="w-full"
            >
              {submitting ? "در حال ارسال..." : "ثبت درخواست مشاوره"}
            </Button>
            <Button onClick={clear} variant="ghost" className="w-full text-sm">
              خالی کردن اتاق مشاوره
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
