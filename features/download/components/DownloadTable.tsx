"use client";
import { getModuleItems, type ContentItem } from "@/lib/content";
import { useDbPosts } from "@/hooks/useDbPosts";
import Link from "next/link";
import { useMemo, useState } from "react";
import ModuleHeader from "@/components/effects/ModuleHeader";
import { CardStats } from "@/components/ui/card-stats";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";

export default function DownloadTable({ serverItems }: { serverItems?: ContentItem[] }) {
  const fallbackItems = getModuleItems("download");
  const { items: dbItems } = useDbPosts("download", fallbackItems, 100);

  const items = serverItems && serverItems.length > 0 ? serverItems : dbItems;
  const brands = Array.from(new Set(items.flatMap((i) => i.tags.filter((t) => ["dell", "hp", "qnap", "ubuntu", "mikrotik"].includes(t.toLowerCase())))));
  const types = Array.from(new Set(items.map((i) => i.category).filter(Boolean))) as string[];

  const [q, setQ] = useState("");
  const [brand, setBrand] = useState("all");
  const [type, setType] = useState("all");
  const [os, setOs] = useState("all");

  const filtered = useMemo(() => {
    return items.filter((f) => {
      if (q && !`${f.title} ${f.excerpt} ${f.tags.join(" ")}`.toLowerCase().includes(q.toLowerCase())) return false;
      if (brand !== "all" && !f.tags.map((t) => t.toLowerCase()).includes(brand.toLowerCase())) return false;
      if (type !== "all" && f.category !== type) return false;
      if (os !== "all" && !f.tags.some((t) => t.toLowerCase().includes(os.toLowerCase()))) return false;
      return true;
    });
  }, [items, q, brand, type, os]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-12" dir="rtl">
      <ModuleHeader module="download" title="مرکز دانلود تکباکس" description="ISO • Firmware • Driver – لینک مستقیم داخل ایران" count={`${filtered.length.toLocaleString("fa-IR")} فایل`} />

      <Card className="p-4 mb-6">
        <div className="grid md:grid-cols-4 gap-3">
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="جستجو فایل…" />
          <Select value={brand} onValueChange={(v) => setBrand((v as string) || "all")}>
            <SelectTrigger><SelectValue placeholder="برند" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">همه برندها</SelectItem>
              <SelectItem value="dell">DELL</SelectItem>
              <SelectItem value="hp">HP</SelectItem>
              <SelectItem value="qnap">QNAP</SelectItem>
              <SelectItem value="ubuntu">Ubuntu</SelectItem>
              <SelectItem value="mikrotik">MikroTik</SelectItem>
              {brands.filter((b) => !["dell", "hp", "qnap", "ubuntu", "mikrotik"].includes(b.toLowerCase())).map((b) => (
                <SelectItem key={b} value={b}>{b}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={type} onValueChange={(v) => setType((v as string) || "all")}>
            <SelectTrigger><SelectValue placeholder="نوع" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">همه نوع‌ها</SelectItem>
              {types.map((t) => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={os} onValueChange={(v) => setOs((v as string) || "all")}>
            <SelectTrigger><SelectValue placeholder="OS" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">همه سیستم‌عامل‌ها</SelectItem>
              <SelectItem value="linux">Linux</SelectItem>
              <SelectItem value="windows">Windows</SelectItem>
              <SelectItem value="vmware">VMware</SelectItem>
              <SelectItem value="qnap">QTS</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      <Card className="overflow-hidden p-0">
        <div className="hidden md:grid grid-cols-12 bg-muted/30 px-5 py-3 text-xs text-muted-foreground font-bold">
          <div className="col-span-7">نام فایل و توضیحات</div>
          <div className="col-span-3 text-right">تاریخ انتشار</div>
          <div className="col-span-2 text-left">دفعات دانلود</div>
        </div>

        {filtered.map((f) => (
          <Link key={f.slug} href={`/download/${f.slug}`} className="group grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-4 sm:px-5 py-4 hover:bg-muted/25 transition-all items-center">
            <div className="col-span-7">
              <div className="font-semibold group-hover:text-[var(--download)] transition-colors">{f.title}</div>
              <div className="text-sm text-muted-foreground mt-1 line-clamp-2">{f.excerpt}</div>
            </div>
            <div className="col-span-3 text-sm text-muted-foreground">
              <span className="md:hidden font-bold">تاریخ انتشار: </span>
              {f.date_fa}
            </div>
            <div className="col-span-2 flex justify-end">
              <CardStats module="download" slug={f.slug} initialViews={f.views} initialLikes={f.likes} initialComments={f.comments || 0} showComments={true} />
            </div>
          </Link>
        ))}

        {filtered.length === 0 && <div className="p-10 text-center text-sm text-muted-foreground">فایلی یافت نشد – فیلتر را تغییر دهید</div>}
      </Card>
    </main>
  );
}
