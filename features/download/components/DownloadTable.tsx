"use client";
import { getModuleItems } from "@/lib/content";
import Link from "next/link";
import { useMemo, useState } from "react";
import ModuleHeader from "@/components/effects/ModuleHeader";
import { CardStats } from "@/components/ui/CardStats";

export default function DownloadTable() {
  const items = getModuleItems("download");
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

      {/* filters */}
      <div className="card p-4 mb-6 grid md:grid-cols-4 gap-3 tb-text-md">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="جستجو فایل…" className="input md:col-span-1" />
        <select value={brand} onChange={(e) => setBrand(e.target.value)} className="input">
          <option value="all">همه برندها</option>
          <option value="dell">DELL</option>
          <option value="hp">HP</option>
          <option value="qnap">QNAP</option>
          <option value="ubuntu">Ubuntu</option>
          <option value="mikrotik">MikroTik</option>
          {brands.filter((b) => !["dell", "hp", "qnap", "ubuntu", "mikrotik"].includes(b.toLowerCase())).map((b) => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>
        <select value={type} onChange={(e) => setType(e.target.value)} className="input">
          <option value="all">همه نوع‌ها</option>
          {types.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <select value={os} onChange={(e) => setOs(e.target.value)} className="input">
          <option value="all">همه سیستم‌عامل‌ها</option>
          <option value="linux">Linux</option>
          <option value="windows">Windows</option>
          <option value="vmware">VMware</option>
          <option value="qnap">QTS</option>
        </select>
      </div>

      <div className="card overflow-hidden divide-y divide-[var(--tb-border)]/60">
        <div className="hidden md:grid grid-cols-12 bg-[var(--tb-bg-muted)]/30 px-5 py-3 tb-text-sm text-[var(--tb-fg-muted)] font-bold">
          <div className="col-span-7">نام فایل و توضیحات</div>
          <div className="col-span-3 text-right">تاریخ انتشار</div>
          <div className="col-span-2 text-left">دفعات دانلود</div>
        </div>

        {filtered.map((f) => (
          <Link
            key={f.slug}
            href={`/download/${f.slug}`}
            className="group grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-4 sm:px-5 py-4 hover:bg-[var(--tb-bg-muted)]/25 transition-all items-center cursor-pointer"
          >
            <div className="col-span-7">
              <div className="tb-text-md font-bold transition-colors group-hover:text-[var(--tb-download)]">{f.title}</div>
              <div className="tb-text-sm text-[var(--tb-fg-muted)] mt-1 line-clamp-2">{f.excerpt}</div>
            </div>

            <div className="col-span-3 tb-text-sm text-[var(--tb-fg-muted)]">
              <span className="md:hidden font-bold">تاریخ انتشار: </span>
              {f.date_fa}
            </div>

            <div className="col-span-2 text-left md:text-left flex justify-end">
              <CardStats module="download" slug={f.slug} initialViews={f.views ?? 0} initialLikes={f.likes ?? 0} showComments={true} />
            </div>
          </Link>
        ))}

        {filtered.length === 0 && <div className="p-10 text-center text-muted-foreground tb-text-md">فایلی یافت نشد – فیلتر را تغییر دهید</div>}
      </div>
    </main>
  );
}
