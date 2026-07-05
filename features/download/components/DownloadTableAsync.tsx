'use client';
import { ContentItem } from "@/lib/content";
import Link from "next/link";
import { useMemo, useState } from "react";
import ModuleHeader from "@/components/effects/ModuleHeader";
import { CardStats } from "@/components/ui/card-stats";

export default function DownloadTableAsync({ items }: { items: ContentItem[] }) {
  const brands = Array.from(new Set(items.flatMap((i) => i.tags.filter((t) => ["dell", "hp", "qnap", "ubuntu", "mikrotik"].includes(t.toLowerCase())))));
  const [filter, setFilter] = useState<string>("همه");

  const filtered = useMemo(() => {
    if (filter === "همه") return items;
    return items.filter((i) => i.tags.some((t) => t.toLowerCase() === filter.toLowerCase()));
  }, [filter, items]);

  const getIcon = (title: string): string => {
    if (title.toLowerCase().includes("iso")) return "ISO";
    if (title.toLowerCase().includes("firmware") || title.toLowerCase().includes("bin")) return "BIN";
    if (title.toLowerCase().includes("driver") || title.toLowerCase().includes("exe")) return "EXE";
    return "ZIP";
  };

  return (
    <main className="mx-auto max-w-7xl px-4 md:px-8 py-14" dir="rtl">
      <ModuleHeader module="download" title="مرکز دانلود تکباکس" description={`ISOها، فریم‌ورها، درایورها و ابزارهای تخصصی • ${items.length.toLocaleString("fa-IR")} فایل`} />
      
      <div className="flex flex-wrap gap-2 mb-6">
        <button onClick={() => setFilter("همه")} className={`px-3 py-1.5 rounded-[var(--corner-radius)] text-xs font-bold transition-colors border-[length:var(--border-size)] border-[var(--border-color)] ${filter === "همه" ? "bg-[var(--download)] text-[var(--main-background)]" : "bg-[var(--card-background)] paragraph-color hover:bg-[var(--muted-background)]"} cursor-pointer`}>همه</button>
        {brands.map((b) => (
          <button key={b} onClick={() => setFilter(b)} className={`px-3 py-1.5 rounded-[var(--corner-radius)] text-xs font-bold transition-colors border-[length:var(--border-size)] border-[var(--border-color)] ${filter === b ? "bg-[var(--download)] text-[var(--main-background)]" : "bg-[var(--card-background)] paragraph-color hover:bg-[var(--muted-background)]"} cursor-pointer`}>{b}</button>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.map((file) => (
          <Link key={file.slug} href={`/download/${file.slug}`} className="group flex items-center gap-4 p-4 bg-[var(--card-background)] border-[length:var(--border-size)] border-[var(--border-color)] rounded-[var(--corner-radius)] shadow-[var(--shadow-size)] hover:bg-[var(--muted-background)]/40 transition-all">
            <span className="flex flex-col items-center justify-center h-12 w-12 shrink-0 rounded-[var(--corner-radius)] bg-[var(--warning)]/15 text-[var(--warning)] border-[length:var(--border-size)] border-[var(--warning)]/35 text-[9px] font-mono font-black">{getIcon(file.title)}</span>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-[var(--primary-text)] group-hover:text-[var(--download)] transition-colors line-clamp-1">{file.title}</h3>
              <p className="text-xs paragraph-color mt-0.5 line-clamp-1">{file.excerpt}</p>
            </div>
            <CardStats module="download" slug={file.slug} initialViews={file.views ?? 0} initialLikes={file.likes ?? 0} showComments={true} />
          </Link>
        ))}
      </div>
    </main>
  );
}