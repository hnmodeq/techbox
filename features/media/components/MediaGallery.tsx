"use client";
import { getModuleItems } from "@/lib/content";
import { MediaSelectorCard } from "@/components/ui/media-selector-card";
import { useState, useMemo } from "react";
import ModuleHeader from "@/components/effects/ModuleHeader";

export default function MediaGallery() {
  const allItems = useMemo(() => getModuleItems("media"), []);

  // Pagination state
  const [page, setPage] = useState(1);
  const itemsPerPage = 6;
  const totalPages = Math.max(1, Math.ceil(allItems.length / itemsPerPage));
  const displayedItems = allItems.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  return (
    <main className="mx-auto max-w-6xl px-4 py-12" dir="rtl">
      <ModuleHeader module="media" title="رسانه ویدیویی تکباکس" count={`${allItems.length.toLocaleString("fa-IR")} ویدیو`} />

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {displayedItems.map((v, idx) => (
          <MediaSelectorCard
            key={`${v.slug}-${idx}`}
            slug={v.slug}
            image={v.image}
            title={v.title}
            category={v.category}
            author={v.author?.name}
            dateFa={v.date_fa}
            onClick={() => { window.location.href = `/media/${v.slug}`; }}
          />
        ))}
      </div>

      {/* Numeric Pagination (1 2 3 4) */}
      {totalPages > 1 && (
        <div className="mt-12 flex items-center justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`h-10 w-10 rounded-[var(--corner-radius)] border font-bold transition-all ${
                page === p
                  ? "bg-[var(--media)] text-[#ffffff] border-[var(--media)] shadow-[var(--shadow-size)] scale-105"
                  : "border-[var(--border-color)] bg-[var(--card-background)] text-[var(--primary-text)] hover:border-[var(--media)] hover:text-[var(--media)]"
              }`}
            >
              {p.toLocaleString("fa-IR")}
            </button>
          ))}
        </div>
      )}
    </main>
  );
}
