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

// Bilingual brand map: English (left) + Farsi (right)
const BRAND_FA: Record<string, string> = {
  QNAP: "کیونپ", Dell: "دل", HPE: "اچ‌پی‌ای", Synology: "سینولوژی",
  Fortinet: "فورتی‌نت", MikroTik: "میکروتیک", Cisco: "سیسکو", Huawei: "هواوی",
  Aruba: "آروبا", Juniper: "جونیپر", Netgear: "نت‌گیر",
};

const PAGE_SIZE = 16;

/** Resolve effective numeric price for sorting — priceAmount first, then parse priceLabel */
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
  // Sidebar open by default; filter sections collapsed by default
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [priceOpen, setPriceOpen] = useState(false);
  const [brandOpen, setBrandOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);

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
    (b) =>
      b.toLowerCase().includes(brandSearch.toLowerCase()) ||
      (BRAND_FA[b] || "").includes(brandSearch)
  );

  const allCategories = useMemo(
    () => Array.from(new Set(items.map((i) => i.category).filter(Boolean))) as string[],
    [items]
  );
  const [catSearch, setCatSearch] = useState("");
  const [selectedCats, setSelectedCats] = useState<Set<string>>(new Set());
  const filteredCats = allCategories.filter((c) => c.toLowerCase().includes(catSearch.toLowerCase()));

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

  // Format slider labels
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

        <div className="flex gap-6">
          {/* ── Filter Sidebar — open by default ── */}
          {sidebarOpen && (
            <aside className="w-72 shrink-0 space-y-1 text-sm sticky top-20 self-start max-h-[calc(100vh-6rem)] overflow-y-auto" dir="rtl">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b">
                <span className="font-bold text-sm">فیلترها</span>
                <div className="flex items-center gap-2">
                  {activeFilterCount > 0 && (
                    <button type="button" onClick={clearAllFilters} className="text-[11px] text-destructive hover:underline">
                      پاک کردن
                    </button>
                  )}
                  <button type="button" onClick={() => setSidebarOpen(false)}>
                    <X className="size-4 text-muted-foreground hover:text-foreground" />
                  </button>
                </div>
              </div>

              {/* فقط کالاهای موجود — toggle */}
              <div className="flex items-center justify-between py-3 border-b">
                <span className="text-sm">فقط کالاهای موجود</span>
                <Switch checked={onlyAvailable} onCheckedChange={setOnlyAvailable} />
              </div>

              {/* ── قیمت ── */}
              <div className="border-b">
                <button
                  type="button"
                  onClick={() => setPriceOpen((o) => !o)}
                  className="flex items-center justify-between w-full py-3 text-sm font-medium"
                >
                  <span>فیلتر بر اساس قیمت</span>
                  {priceOpen ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
                </button>
                {priceOpen && (
                  <div className="pb-4 space-y-3">
                    {/* Slider — uses onValueCommit to avoid jump bug */}
                    <div className="px-1">
                      <Slider
                        min={priceRange.min}
                        max={priceRange.max}
                        step={Math.max(5_000_000, Math.round((priceRange.max - priceRange.min) / 50))}
                        value={effectivePrice}
                        onValueChange={(v) => setPriceFilter(v as [number, number])}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-muted-foreground" dir="ltr">
                      <span>{fmtSliderPrice(effectivePrice[0])}</span>
                      <span>{fmtSliderPrice(effectivePrice[1])}</span>
                    </div>
                    {/* Manual min/max inputs as an alternative — more reliable than slider */}
                    <div className="grid grid-cols-2 gap-2" dir="ltr">
                      <Input
                        type="number"
                        placeholder="از"
                        className="h-7 text-xs"
                        value={effectivePrice[0] === priceRange.min ? "" : effectivePrice[0]}
                        onChange={(e) => {
                          const v = Number(e.target.value);
                          if (!isNaN(v)) setPriceFilter([v, effectivePrice[1]]);
                        }}
                      />
                      <Input
                        type="number"
                        placeholder="تا"
                        className="h-7 text-xs"
                        value={effectivePrice[1] === priceRange.max ? "" : effectivePrice[1]}
                        onChange={(e) => {
                          const v = Number(e.target.value);
                          if (!isNaN(v)) setPriceFilter([effectivePrice[0], v]);
                        }}
                      />
                    </div>
                    {priceFilter && (
                      <button type="button" onClick={() => setPriceFilter(null)} className="text-[11px] text-destructive hover:underline">
                        پاک کردن
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* ── برندها ── */}
              <div className="border-b">
                <button
                  type="button"
                  onClick={() => setBrandOpen((o) => !o)}
                  className="flex items-center justify-between w-full py-3 text-sm font-medium"
                >
                  <span>برندها</span>
                  {brandOpen ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
                </button>
                {brandOpen && (
                  <div className="pb-4 space-y-2">
                    <div className="relative">
                      <Search className="absolute right-2 top-1/2 -translate-y-1/2 size-3 text-muted-foreground" />
                      <Input
                        value={brandSearch}
                        onChange={(e) => setBrandSearch(e.target.value)}
                        placeholder="جستجوی برند…"
                        className="h-7 text-xs pr-6"
                      />
                    </div>
                    {/* No scroll — show all brands, English left, Farsi right */}
                    <div className="space-y-0.5">
                      {filteredBrands.map((brand) => (
                        <label key={brand} className="flex items-center cursor-pointer py-1 gap-2">
                          <input
                            type="checkbox"
                            checked={selectedBrands.has(brand)}
                            onChange={(e) => {
                              const n = new Set(selectedBrands);
                              e.target.checked ? n.add(brand) : n.delete(brand);
                              setSelectedBrands(n);
                            }}
                            className="rounded border-gray-300 size-3.5 shrink-0"
                          />
                          {/* English left, Farsi right — no overlap with scrollbar */}
                          <div className="flex items-center justify-between flex-1 min-w-0 pr-1">
                            <span className="text-xs font-medium text-foreground">{brand}</span>
                            {BRAND_FA[brand] && (
                              <span className="text-xs text-muted-foreground" dir="rtl">{BRAND_FA[brand]}</span>
                            )}
                          </div>
                        </label>
                      ))}
                      {filteredBrands.length === 0 && <p className="text-[11px] text-muted-foreground py-1">برندی یافت نشد</p>}
                    </div>
                  </div>
                )}
              </div>

              {/* ── کاربری ── */}
              <div>
                <button
                  type="button"
                  onClick={() => setCatOpen((o) => !o)}
                  className="flex items-center justify-between w-full py-3 text-sm font-medium"
                >
                  <span>کاربری</span>
                  {catOpen ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
                </button>
                {catOpen && (
                  <div className="pb-4 space-y-2">
                    <div className="relative">
                      <Search className="absolute right-2 top-1/2 -translate-y-1/2 size-3 text-muted-foreground" />
                      <Input
                        value={catSearch}
                        onChange={(e) => setCatSearch(e.target.value)}
                        placeholder="جستجوی دسته‌بندی…"
                        className="h-7 text-xs pr-6"
                      />
                    </div>
                    {/* No scroll on categories either */}
                    <div className="space-y-0.5">
                      {filteredCats.map((cat) => (
                        <label key={cat} className="flex items-center gap-2 cursor-pointer py-1">
                          <input
                            type="checkbox"
                            checked={selectedCats.has(cat)}
                            onChange={(e) => {
                              const n = new Set(selectedCats);
                              e.target.checked ? n.add(cat) : n.delete(cat);
                              setSelectedCats(n);
                            }}
                            className="rounded border-gray-300 size-3.5"
                          />
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

          {/* ── Product grid ── */}
          <div className="flex-1 min-w-0">
            {sorted.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground">محصولی یافت نشد</div>
            ) : (
              <>
                {/* Wider cards: 3 cols with sidebar, 4 without */}
                <div className={cn(
                  "grid gap-4",
                  sidebarOpen
                    ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3"
                    : "grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
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
