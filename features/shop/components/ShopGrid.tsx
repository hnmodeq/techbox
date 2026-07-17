"use client";
import Image from "next/image";
import { blurProps } from "@/lib/image-placeholder";
import { getModuleItems, type ContentItem } from "@/lib/content";
import { useDbPosts } from "@/hooks/useDbPosts";
import Link from "next/link";
import { useMemo, useState, useRef, useEffect } from "react";
import { useConsultation } from "@/providers/consultation.provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/design/icons";
import ModuleHeader from "@/components/effects/ModuleHeader";
import { CardStats } from "@/components/ui/card-stats";
import { useProductComparison } from "@/hooks/useProductComparison";
import ProductComparisonModal from "@/components/ui/product-comparison-modal";

export default function ShopGrid({ serverItems }: { serverItems?: ContentItem[] }) {
  const fallbackItems = getModuleItems("shop");
  const { items: dbItems } = useDbPosts("shop", fallbackItems, 100);

  const items = serverItems && serverItems.length > 0 ? serverItems : dbItems;
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("all");
  const [sort, setSort] = useState<"new" | "popular" | "liked">("new");
  const [filterOpen, setFilterOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { add } = useConsultation();

  const { comparedProducts, addToComparison, removeFromComparison, clearComparison, isInComparison, count: compareCount } =
    useProductComparison();

  const [showComparisonModal, setShowComparisonModal] = useState(false);

  const categories = Array.from(new Set(items.map((i) => i.category).filter(Boolean))) as string[];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = useMemo(() => {
    let list = [...items];
    if (q) {
      const s = q.toLowerCase();
      list = list.filter((i) => i.title.toLowerCase().includes(s) || i.tags.some((t) => t.includes(s)));
    }
    if (cat !== "all") list = list.filter((i) => i.category === cat);
    if (sort === "popular") list.sort((a, b) => b.views - a.views);
    if (sort === "liked") list.sort((a, b) => b.likes - a.likes);
    return list;
  }, [items, q, cat, sort]);

  return (
    <main className="mx-auto max-w-7xl px-4 md:px-6 py-12" dir="rtl">
      <ModuleHeader module="shop" title="فروشگاه زیرساخت" description={`ارسال سریع • گارانتی اصالت • ${filtered.length.toLocaleString("fa-IR")} کالا`} />

      <div className="relative mb-6" ref={dropdownRef}>
        <Card className="p-3">
          <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto] items-center">
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="جستجوی محصول…" />
            <Button type="button" variant={filterOpen ? "secondary" : "ghost"} onClick={() => setFilterOpen(!filterOpen)} className="flex items-center gap-2">
              <span>فیلترها {cat !== "all" ? `• ${cat}` : ""}</span>
              <Icon name="chevronDown" className={`h-4 w-4 transition-transform ${filterOpen ? "rotate-180" : ""}`} />
            </Button>
          </div>
        </Card>

        {filterOpen && (
          <Card className="absolute left-0 right-0 sm:right-auto sm:w-96 top-full mt-2 z-30 p-4 space-y-4 shadow-lg animate-in fade-in-0 zoom-in-95">
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">دسته‌بندی</label>
                <Select value={cat} onValueChange={(v) => setCat((v as string) || "all")}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">همه دسته‌ها</SelectItem>
                    {categories.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">مرتب‌سازی</label>
                <Select value={sort} onValueChange={(v) => setSort(v as any)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">جدیدترین</SelectItem>
                    <SelectItem value="popular">پربازدیدترین</SelectItem>
                    <SelectItem value="liked">محبوب‌ترین</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button
                type="button"
                variant="ghost"
                size="xs"
                onClick={() => {
                  setCat("all");
                  setSort("new");
                }}
              >
                پاک کردن
              </Button>
              <Button type="button" size="xs" onClick={() => setFilterOpen(false)}>
                بستن منو
              </Button>
            </div>
          </Card>
        )}
      </div>

      <div className="responsive-card-grid grid gap-5">
        {filtered.map((p) => {
          const available = p.availability !== "ناموجود";
          return (
            <Link
              key={p.slug}
              href={`/shop/${p.slug}`}
              className="border rounded-lg shadow-sm overflow-hidden group flex flex-col bg-card text-card-foreground hover:shadow-lg transition-all duration-300 ease-out"
            >
              <div className="block relative aspect-[4/3] bg-white overflow-hidden">
                <Image
                  src={p.image || "/assets/blog-1.jpg"}
                  alt={p.title}
                  fill
                  sizes="(min-width:1280px) 25vw, (min-width:640px) 50vw, 100vw"
                  className="object-contain transition-transform duration-500 ease-out group-hover:scale-105"
                  {...blurProps(p.image || "/assets/blog-1.jpg")}
                />
                <Badge
                  className={`absolute top-2 left-2 border-none text-[10px] font-bold ${
                    available ? "bg-[var(--success)]/85 text-white" : "bg-[var(--danger)]/85 text-white"
                  }`}
                >
                  {available ? "موجود" : "ناموجود"}
                </Badge>
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <div className="font-semibold mt-1 line-clamp-2 min-h-[48px] group-hover:text-[var(--shop)] transition-colors">{p.title}</div>
                <div className="mt-1 flex flex-wrap gap-1 text-[11px] text-muted-foreground">
                  {p.brand && <Badge variant="outline">{p.brand}</Badge>}
                  {p.category && <Badge variant="secondary">{p.category}</Badge>}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 mt-1 flex-1">{p.excerpt}</p>
                <div className="mt-3 flex items-center justify-between gap-2 pt-3 border-t">
                  <Button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      add({ slug: p.slug, title: p.title, image: p.image || "" });
                    }}
                    size="sm"
                    variant="outline"
                    className="border-[var(--shop)] text-[var(--shop)] hover:bg-[var(--shop)]/10 font-bold"
                  >
                    ثبت درخواست مشاوره
                  </Button>
                  <div dir="ltr">
                    <CardStats module="shop" slug={p.slug} initialViews={p.views} initialLikes={p.likes} initialComments={p.comments || 0} showComments={false} />
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
      {filtered.length === 0 && <div className="text-center py-16 text-muted-foreground">محصولی یافت نشد</div>}

      {compareCount > 0 && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button onClick={() => setShowComparisonModal(true)} className="shadow-lg flex items-center gap-2">
            مقایسه ({compareCount})
          </Button>
        </div>
      )}

      {showComparisonModal && <ProductComparisonModal isOpen={showComparisonModal} products={comparedProducts} onClose={() => setShowComparisonModal(false)} onRemove={removeFromComparison} onClear={clearComparison} />}
    </main>
  );
}
