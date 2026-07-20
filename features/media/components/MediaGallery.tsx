"use client";

import { type ContentItem } from "@/lib/content";
import { useState, useMemo } from "react";
import { VideoCard, VideoModal, useVideoModal } from "@/components/content/VideoCard";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const PAGE_SIZE = 8;

export default function MediaGallery({ serverItems }: { serverItems?: ContentItem[] }) {
  const items = serverItems ?? [];

  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));

  const pageItems = useMemo(
    () => items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [items, page]
  );

  // The modal works across the current page's videos only
  const { activeVideo, slideKey, slideDirection, open, close, prev, next } =
    useVideoModal(pageItems);

  const goTo = (p: number) => {
    setPage(p);
    close();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <main className="mx-auto max-w-6xl px-4 md:px-6 py-12" dir="rtl">
      {items.length === 0 ? (
        <div className="py-20 text-center text-muted-foreground">هنوز ویدیویی ثبت نشده است.</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {pageItems.map((vid, idx) => (
            <VideoCard key={vid.slug} video={vid} onOpen={() => open(idx)} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-10">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  disabled={page === 1}
                  onClick={() => page > 1 && goTo(page - 1)}
                />
              </PaginationItem>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                .reduce<(number | "…")[]>((acc, p, idx, arr) => {
                  if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("…");
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, i) =>
                  p === "…" ? (
                    <PaginationItem key={`ellipsis-${i}`}>
                      <span className="px-2 text-muted-foreground">…</span>
                    </PaginationItem>
                  ) : (
                    <PaginationItem key={p}>
                      <PaginationLink
                        isActive={page === p}
                        onClick={() => goTo(p as number)}
                      >
                        {(p as number).toLocaleString("fa-IR")}
                      </PaginationLink>
                    </PaginationItem>
                  )
                )}

              <PaginationItem>
                <PaginationNext
                  disabled={page === totalPages}
                  onClick={() => page < totalPages && goTo(page + 1)}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* Video modal — same as homepage */}
      {activeVideo && (
        <VideoModal
          key={slideKey}
          video={activeVideo}
          onClose={close}
          onPrev={prev}
          onNext={next}
          slideDirection={slideDirection}
        />
      )}
    </main>
  );
}
