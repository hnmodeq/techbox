"use client";

import { getModuleItems, type ContentItem } from "@/lib/content";
import { useDbPosts } from "@/hooks/useDbPosts";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { SlidersHorizontal, X, Search, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import ShopProductCard from "./ShopProductCard";
import ShopBanner, { type ShopBannerItem } from "./ShopBanner";

type SortKey = "newest" | "price_asc" | "price_desc" | "discount" | "popular";

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "popular",    label: "پرفروش‌ترین" },
  { key: "newest",     label: "جدیدترین کالا" },
  { key: "price_desc", label: "بالاترین قیمت" },
  { key: "price_asc",  label: "پایین‌ترین قیمت" },
  { key: "discount",   label: "بیشترین تخفیف" },
];

const BRAND_META: Record<string, string> = {
  QNAP: "کیونپ", Dell: "دل", HPE: "اچ‌پی‌ای", Synology: "سینولوژی",
  Fortinet: "فورتی‌نت", MikroTik: "میکروتیک", Cisco: "سیسکو", Huawei: "هواوی",
};

const PAGE_SIZE = 16;

/** Resolve effective numeric price — priceAmount first, then parse priceLabel */
function resolvePrice(item: ContentItem): number {
  if (item.priceAmount && item.priceAmount > 0) return item.priceAmount;
  const label = item.priceLabel ?? "";
  const ascii = label.replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)));
  const num = parseFloat(ascii.replace(/[^\d.]/g, ""));
  if (isNaN(num) || num <= 0) return 0;
  if (/میلیارد/.test(label)) return Math.round(num * 1_000_000_000);
  if (/میلیون/.test(label))  return Math.round(num * 1_000_000);
  return Math.round(num);
}

function useShopBanners(): ShopBannerItem[] {
  const [banners, setBanners] = useState<ShopBannerItem[]>([]);
  useEffect(() => {
    fetch("/api/settings?key=shop.banners", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => { try { const raw = d["shop.banners"]; if (raw) setBanners(JSON.parse(raw)); } catch {} })
      .catch(() => {});
  }, []);
  return banners;
}

export default function ShopGrid({ serverItems }: { serverItems?: ContentItem[] }) {
  const fallbackItems = getModuleItems("shop");
  const { items: dbItems } = useDbPosts("shop", fallbackItems, 200);
  const items = dbItems.length > 0 ? dbItems : (serverItems ?? fallbackItems);
  const banners = useShopBanners();

  const [sort, setSort] = useState<SortKey>("popular");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [onlyAvailable, setOnlyAvailable] = useState(false);

  const priceRange = useMemo(() => {
    const prices = items.map(resolvePrice).filter((p) => p > 0);
    if (!prices.length) return { min: 0, max: 2_000_000_000 };
    return { min: Math.min(...prices), max: Math.max(...prices) };
  }, [items]);

  const [priceFilter, setPriceFilter] = useState<[number, number] | null>(null);
  const effectivePrice: [number, number] = priceFilter ?? [priceRange.min, priceRange.max];

  const allBrands = useMemo(
    () => Array.from(new Set(items.map((i) => i.brand).filter(Boolean))) as string[],
    [items]
  );
  const [brandSearch, setBrandSearch] = useState("");
  const [selectedBrands, setSelectedBrands] = useState<Set<string>>(new Set());
  const filteredBrands = allBrands.filter(
    (b) => b.toLowerCase().includes(brandSearch.toLowerCase()) || (BRAND_META[b] || "").includes(brandSearch)
  );

  const allCategories = useMemo(
    () => Array.from(new Set(items.map((i) => i.category).filter(Boolean))) as string[],
    [items]
  );
  const [catSearch, setCatSearch] = useState("");
  const [selectedCats, setSelectedCats] = useState<Set<string>>(new Set());
  const filteredCats = allCategories.filter((c) => c.toLowerCase().includes(catSearch.toLowerCase()));

  const [priceOpen, setPriceOpen] = useState(true);
  const [brandOpen, setBrandOpen] = useState(true);
  const [catOpen, setCatOpen] = useState(true);

  const sorted = useMemo(() => {
    let list = [...items];
    if (onlyAvailable) list = list.filter((i) => i.availability !== "ناموجود" && i.availability !== "اتمام موجودی");
    if (priceFilter) {
      list = list.filter((i) => {
        const pr = resolvePrice(i);
        return pr === 0 || (pr >= priceFilter[0] && pr <= priceFilter[1]);
      });
    }
    if (selectedBrands.size > 0) list = list.filter((i) => i.brand && selectedBrands.has(i.brand));
    if (selectedCats.size > 0) list = list.filter((i) => i.category && selectedCats.has(i.category));
    switch (sort) {
      case "newest":     list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); break;
      case "price_asc":  list.sort((a, b) => resolvePrice(a) - resolvePrice(b)); break;
      case "price_desc": list.sort((a, b) => resolvePrice(b) - resolvePrice(a)); break;
      case "discount":   list.sort((a, b) => (b.discountPercent ?? 0) - (a.discountPercent ?? 0)); break;
      default:           list.sort((a, b) => b.views - a.views);
    }
    return list;
  }, [items, sort, onlyAvailable, priceFilter, selectedBrands, selectedCats]);

  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const loaderRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setVisibleCount(PAGE_SIZE); }, [sort, onlyAvailable, priceFilter, selectedBrands, selectedCats]);

  useEffect(() => {
    const el = loaderRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisibleCount((c) => Math.min(c + PAGE_SIZE, sorted.length)); },
      { rootMargin: "300px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [sorted.length]);

  const visible = sorted.slice(0, visibleCount);
  const activeFilterCount = (onlyAvailable ? 1 : 0) + (priceFilter ? 1 : 0) + selectedBrands.size + selectedCats.size;

  const clearAllFilters = useCallback(() => {
    setOnlyAvailable(false); setPriceFilter(null);
    setSelectedBrands(new Set()); setSelectedCats(new Set());
  }, []);

  const fmtSliderPrice = (v: number) => {
    if (v >= 1_000_000_000) return (v / 1_000_000_000).toLocaleString("fa-IR", { maximumFractionDigits: 1 }) + " م";
    return Math.round(v / 1_000_000).toLocaleString("fa-IR") + " M";
  };

  return (
    <TooltipProvider>
      <div className="mx-auto max-w-7xl px-4 md:px-6 py-6" dir="rtl">

        {banners.length > 0 && <ShopBanner banners={banners} />}

        {/* Sort bar */}
        <div className="flex items-center justify-between gap-3 mb-5 flex-wrap bg-muted/40 rounded-xl px-4 py-2">
          <button
            type="button"
            onClick={() => setSidebarOpen((o) => !o)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors shrink-0"
          >
            <SlidersHorizontal className="size-4" />
            <span>فیلترها</span>
            {activeFilterCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>

          <div className="flex items-center gap-1 flex-wrap">
            <span className="text-xs text-muted-foreground ml-2 shrink-0">ترتیب:</span>
            {SORT_OPTIONS.map((o) => (
              <button
                key={o.key}
                type="button"
                onClick={() => setSort(o.key)}
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-medium transition-colors whitespace-nowrap",
                  sort === o.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                {o.label}
              </button>
            ))}
          </div>

          <span className="text-xs text-muted-foreground shrink-0">
            {sorted.length.toLocaleString("fa-IR")} کالا
          </span>
        </div>

        <div className="flex gap-5">
          {/* Filter Sidebar */}
          {sidebarOpen && (
            <aside className="w-52 shrink-0 space-y-4 text-sm sticky top-20 self-start max-h-[calc(100vh-6rem)] overflow-y-auto" dir="rtl">
              <div className="flex items-center justify-between">
                <span className="font-bold">فیلترها</span>
                <div className="flex items-center gap-2">
                  {activeFilterCount > 0 && (
                    <button type="button" onClick={clearAllFilters} className="text-[11px] text-destructive hover:underline">
                      پاک کردن همه
                    </button>
                  )}
                  <button type="button" onClick={() => setSidebarOpen(false)}>
                    <X className="size-4 text-muted-foreground" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between border-b pb-3">
                <span className="text-sm">فقط کالاهای موجود</span>
                <Switch checked={onlyAvailable} onCheckedChange={setOnlyAvailable} />
              </div>

              <div className="border-b pb-3 space-y-3">
                <button type="button" onClick={() => setPriceOpen((o) => !o)} className="flex items-center justify-between w-full">
                  <span className="font-medium text-sm">فیلتر بر اساس قیمت</span>
                  {priceOpen ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
                </button>
                {priceOpen && (
                  <div className="space-y-3 pt-1">
                    <Slider
                      min={priceRange.min} max={priceRange.max}
                      step={Math.max(1_000_000, Math.round((priceRange.max - priceRange.min) / 100))}
                      value={effectivePrice}
                      onValueChange={(v) => setPriceFilter(v as [number, number])}
                    />
                    <div className="flex justify-between text-[10px] text-muted-foreground" dir="ltr">
                      <span>{fmtSliderPrice(effectivePrice[0])}</span>
                      <span>{fmtSliderPrice(effectivePrice[1])}</span>
                    </div>
                    {priceFilter && (
                      <button type="button" onClick={() => setPriceFilter(null)} className="text-[11px] text-destructive hover:underline">
                        پاک کردن
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div className="border-b pb-3 space-y-2">
                <button type="button" onClick={() => setBrandOpen((o) => !o)} className="flex items-center justify-between w-full">
                  <span className="font-medium text-sm">برندها</span>
                  {brandOpen ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
                </button>
                {brandOpen && (
                  <div className="space-y-2">
                    <div className="relative">
                      <Search className="absolute right-2 top-1/2 -translate-y-1/2 size-3 text-muted-foreground" />
                      <Input value={brandSearch} onChange={(e) => setBrandSearch(e.target.value)} placeholder="جستجوی برند…" className="h-7 text-xs pr-6" />
                    </div>
                    <div className="max-h-40 overflow-y-auto space-y-1.5">
                      {filteredBrands.map((brand) => (
                        <label key={brand} className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" checked={selectedBrands.has(brand)}
                            onChange={(e) => { const n = new Set(selectedBrands); e.target.checked ? n.add(brand) : n.delete(brand); setSelectedBrands(n); }}
                            className="rounded border-gray-300 size-3.5" />
                          <span className="text-xs">
                            {brand}
                            {BRAND_META[brand] && <span className="text-muted-foreground"> ({BRAND_META[brand]})</span>}
                          </span>
                        </label>
                      ))}
                      {filteredBrands.length === 0 && <p className="text-[11px] text-muted-foreground">برندی یافت نشد</p>}
                    </div>
                  </div>
                )}
              </div>

              <div className="pb-3 space-y-2">
                <button type="button" onClick={() => setCatOpen((o) => !o)} className="flex items-center justify-between w-full">
                  <span className="font-medium text-sm">کاربری</span>
                  {catOpen ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
                </button>
                {catOpen && (
                  <div className="space-y-2">
                    <div className="relative">
                      <Search className="absolute right-2 top-1/2 -translate-y-1/2 size-3 text-muted-foreground" />
                      <Input value={catSearch} onChange={(e) => setCatSearch(e.target.value)} placeholder="جستجوی دسته‌بندی…" className="h-7 text-xs pr-6" />
                    </div>
                    <div className="max-h-40 overflow-y-auto space-y-1.5">
                      {filteredCats.map((cat) => (
                        <label key={cat} className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" checked={selectedCats.has(cat)}
                            onChange={(e) => { const n = new Set(selectedCats); e.target.checked ? n.add(cat) : n.delete(cat); setSelectedCats(n); }}
                            className="rounded border-gray-300 size-3.5" />
                          <span className="text-xs">{cat}</span>
                        </label>
                      ))}
                      {filteredCats.length === 0 && <p className="text-[11px] text-muted-foreground">دسته‌ای یافت نشد</p>}
                    </div>
                  </div>
                )}
              </div>
            </aside>
          )}

          {/* Product grid */}
          <div className="flex-1 min-w-0">
            {sorted.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground">محصولی یافت نشد</div>
            ) : (
              <>
                <div className={cn(
                  "grid gap-4",
                  sidebarOpen
                    ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
                    : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
                )}>
                  {visible.map((p) => <ShopProductCard key={p.slug} product={p} />)}
                </div>
                {visibleCount < sorted.length && (
                  <div ref={loaderRef} className="flex justify-center py-10">
                    <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
