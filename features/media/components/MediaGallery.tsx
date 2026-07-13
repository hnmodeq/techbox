"use client";
import { getModuleItems, type ContentItem } from "@/lib/content";
import { useDbPosts } from "@/hooks/useDbPosts";
import { MediaSelectorCard } from "@/components/ui/media-selector-card";
import { useState, useMemo } from "react";
import ModuleHeader from "@/components/effects/ModuleHeader";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export default function MediaGallery({ serverItems }: { serverItems?: ContentItem[] }) {
  const fallbackItems = useMemo(() => getModuleItems("media"), []);
  const { items: dbItems } = useDbPosts("media", fallbackItems, 100);

  const allItems = serverItems && serverItems.length > 0 ? serverItems : dbItems;

  const [page, setPage] = useState(1);
  const itemsPerPage = 6;
  const totalPages = Math.max(1, Math.ceil(allItems.length / itemsPerPage));
  const displayedItems = allItems.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  return (
    <main className="mx-auto max-w-6xl px-4 py-12" dir="rtl">
      <ModuleHeader module="media" title="رسانه ویدیویی تکباکس" count={`${allItems.length.toLocaleString("fa-IR")} ویدیو`} />

      <div className="responsive-card-grid-sm grid gap-6 mt-8">
        {displayedItems.map((v, idx) => (
          <MediaSelectorCard
            key={`${v.slug}-${idx}`}
            slug={v.slug}
            image={v.image}
            title={v.title}
            category={v.category}
            author={v.author?.name}
            dateFa={v.date_fa}
            duration={(v as any).videoDuration || undefined}
            onClick={() => { window.location.href = `/media/${v.slug}`; }}
          />
        ))}
      </div>

      {totalPages > 1 && (
        <Pagination className="mt-12">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                disabled={page === 1}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
              />
            </PaginationItem>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <PaginationItem key={p}>
                <PaginationLink isActive={page === p} onClick={() => setPage(p)}>
                  {p.toLocaleString("fa-IR")}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                disabled={page === totalPages}
                onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </main>
  );
}
