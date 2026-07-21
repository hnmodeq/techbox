"use client";
import Image from "next/image";
import { blurProps } from "@/lib/image-placeholder";
import { getModuleItems, type ContentItem } from "@/lib/content";
import { useDbPosts } from "@/hooks/useDbPosts";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import ModuleHeader from "@/components/effects/ModuleHeader";
import { useProductComparison } from "@/hooks/useProductComparison";
import ProductComparisonModal from "@/components/ui/product-comparison-modal";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { GitCompareArrows } from "lucide-react";

const PAGE_SIZE = 12;

export default function ShopGrid({ serverItems }: { serverItems?: ContentItem[] }) {
  const fallbackItems = getModuleItems("shop");
  const { items: dbItems } = useDbPosts("shop", fallbackItems, 100);
  const items = serverItems && serverItems.length > 0 ? serverItems : dbItems;

  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);

  const {
    comparedProducts,
    addToComparison,
    removeFromComparison,
    clearComparison,
    isInComparison,
    count: compareCount,
  } = useProductComparison();

  const [showComparisonModal, setShowComparisonModal] = useState(false);

  // Filter by search only (no category / sort filter — hidden per request)
  const filtered = useMemo(() => {
    if (!q.trim()) return items;
    const s = q.trim().toLowerCase();
    return items.filter(
      (i) =>
        i.title.toLowerCase().includes(s) ||
        (i.excerpt || "").toLowerCase().includes(s) ||
        i.tags.some((t) => t.toLowerCase().includes(s))
    );
  }, [items, q]);

  // Reset to page 1 whenever filter changes
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const goPage = (p: number) => setPage(Math.max(1, Math.min(p, totalPages)));

  // Build page numbers with ellipsis
  const pageNums: (number | "…")[] = useMemo(() => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: (number | "…")[] = [1];
    if (safePage > 3) pages.push("…");
    for (let i = Math.max(2, safePage - 1); i <= Math.min(totalPages - 1, safePage + 1); i++) {
      pages.push(i);
    }
    if (safePage < totalPages - 2) pages.push("…");
    pages.push(totalPages);
    return pages;
  }, [totalPages, safePage]);

  return (
    <TooltipProvider>
      <main className="mx-auto max-w-7xl px-4 md:px-6 py-12" dir="rtl">
        <ModuleHeader
          module="shop"
          description={`ارسال سریع • گارانتی اصالت • ${filtered.length.toLocaleString("fa-IR")} کالا`}
        />

        {/* ── Toolbar: search (right) + compare button (left) ── */}
        <Card className="p-3 mb-6">
          <div className="flex items-center gap-3">
            {/* Search — takes all remaining space */}
            <Input
              value={q}
              onChange={(e) => { setQ(e.target.value); setPage(1); }}
              placeholder="جستجوی محصول…"
              className="flex-1"
            />

            {/* Compare button — always visible on the left */}
            <Tooltip>
              <TooltipTrigger render={<span className="shrink-0" />}>
                <Button
                  type="button"
                  variant={compareCount > 0 ? "primary" : "outline"}
                  onClick={() => { if (compareCount > 0) setShowComparisonModal(true); }}
                  className="flex items-center gap-2"
                >
                  <GitCompareArrows className="size-4" />
                  <span>مقایسه</span>
                  {compareCount > 0 && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-foreground text-primary text-[10px] font-bold">
                      {compareCount}
                    </span>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>افزودن به مقایسه</TooltipContent>
            </Tooltip>
          </div>
        </Card>

        {/* ── Product grid ── */}
        <div className="responsive-card-grid grid gap-5">
          {paginated.map((p) => {
            const inCompare = isInComparison(p.slug);
            return (
              <Link
                key={p.slug}
                href={`/shop/${p.slug}`}
                className="border rounded-lg shadow-sm overflow-hidden group flex flex-col bg-card text-card-foreground hover:shadow-lg transition-all duration-300 ease-out"
              >
                {/* Image — white bg, no crop, no overflow */}
                <div className="relative aspect-[4/3] bg-white flex items-center justify-center p-3">
                  <Image
                    src={p.image || "/assets/blog-1.jpg"}
                    alt={p.title}
                    fill
                    sizes="(min-width:1280px) 25vw, (min-width:640px) 50vw, 100vw"
                    className="object-contain"
                    {...blurProps(p.image || "/assets/blog-1.jpg")}
                  />
                </div>

                {/* Card body */}
                <div className="p-4 flex-1 flex flex-col gap-2">
                  {/* Title */}
                  <div className="font-semibold line-clamp-2 min-h-[48px] group-hover:text-[var(--primary)] transition-colors">
                    {p.title}
                  </div>

                  {/* Excerpt */}
                  {p.excerpt && (
                    <p className="text-sm text-muted-foreground line-clamp-2 flex-1">{p.excerpt}</p>
                  )}

                  {/* Compare toggle — bottom action, no other buttons */}
                  <div className="pt-3 border-t mt-auto">
                    <Tooltip>
                      <TooltipTrigger render={<span className="w-full block" />}>
                        <Button
                          type="button"
                          size="sm"
                          variant={inCompare ? "primary" : "outline"}
                          className="w-full flex items-center gap-2"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (inCompare) {
                              removeFromComparison(p.slug);
                            } else {
                              addToComparison(p);
                            }
                          }}
                        >
                          <GitCompareArrows className="size-4" />
                          {inCompare ? "حذف از مقایسه" : "افزودن به مقایسه"}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>افزودن به مقایسه</TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">محصولی یافت نشد</div>
        )}

        {/* ── Shadcn Pagination ── */}
        {totalPages > 1 && (
          <div className="mt-10">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => goPage(safePage - 1)}
                    aria-disabled={safePage === 1}
                    className={safePage === 1 ? "pointer-events-none opacity-40" : "cursor-pointer"}
                  />
                </PaginationItem>

                {pageNums.map((n, idx) =>
                  n === "…" ? (
                    <PaginationItem key={`ellipsis-${idx}`}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  ) : (
                    <PaginationItem key={n}>
                      <PaginationLink
                        isActive={n === safePage}
                        onClick={() => goPage(n as number)}
                        className="cursor-pointer"
                      >
                        {(n as number).toLocaleString("fa-IR")}
                      </PaginationLink>
                    </PaginationItem>
                  )
                )}

                <PaginationItem>
                  <PaginationNext
                    onClick={() => goPage(safePage + 1)}
                    aria-disabled={safePage === totalPages}
                    className={safePage === totalPages ? "pointer-events-none opacity-40" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}

        {/* ── Comparison modal ── */}
        {showComparisonModal && (
          <ProductComparisonModal
            isOpen={showComparisonModal}
            products={comparedProducts}
            onClose={() => setShowComparisonModal(false)}
            onRemove={removeFromComparison}
            onClear={clearComparison}
          />
        )}
      </main>
    </TooltipProvider>
  );
}
