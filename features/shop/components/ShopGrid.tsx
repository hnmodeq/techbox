"use client";

import { getModuleItems, type ContentItem } from "@/lib/content";
import { useDbPosts } from "@/hooks/useDbPosts";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { SlidersHorizontal, X, Search, ChevronDown, ChevronUp, ArrowUpDown, Truck } from "lucide-react";
import { cn } from "@/lib/utils";
import ShopProductCard from "./ShopProductCard";
import ShopBanner, { type ShopBannerItem } from "./ShopBanner";

// ── Sort — 9 options matching Digikala screenshot ──────────────────────────
type SortKey =
  | "relevant"
  | "most_viewed"
  | "newest"
  | "popular"
  | "price_asc"
  | "price_desc"
  | "fastest"
  | "buyers"
  | "selected";

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "relevant", label: "مرتبط‌ترین" },
  { key: "most_viewed", label: "پربازدیدترین" },
  { key: "newest", label: "جدیدترین" },
  { key: "popular", label: "پرفروش‌ترین" },
  { key: "price_asc", label: "ارزان‌ترین" },
  { key: "price_desc", label: "گران‌ترین" },
  { key: "fastest", label: "سریع‌ترین ارسال" },
  { key: "buyers", label: "پیشنهاد خریداران" },
  { key: "selected", label: "منتخب" },
];

// ── Brand Fa map ────────────────────────────────────────────────────────────
const BRAND_FA: Record<string, string> = {
  QNAP: "کیونپ",
  Dell: "دل",
  HPE: "اچ‌پی‌ای",
  Synology: "سینولوژی",
  Fortinet: "فورتی‌نت",
  MikroTik: "میکروتیک",
  Cisco: "سیسکو",
  Huawei: "هواوی",
  Aruba: "آروبا",
  Juniper: "جونیپر",
  Netgear: "نت‌گیر",
  ASUS: "ایسوس",
  Lenovo: "لنوو",
  HP: "اچ‌پی",
  Apple: "اپل",
  Acer: "ایسر",
  MSI: "ام‌اس‌آی",
};

const PAGE_SIZE = 20;

// ── Price resolve ───────────────────────────────────────────────────────────
function resolvePrice(item: ContentItem): number {
  if (item.priceAmount && item.priceAmount > 0) return item.priceAmount;
  const label = item.priceLabel ?? "";
  const ascii = label.replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)));
  const num = parseFloat(ascii.replace(/[^\\d.]/g, ""));
  if (isNaN(num) || num <= 0) return 0;
  if (/میلیارد/.test(label)) return Math.round(num * 1_000_000_000);
  if (/میلیون/.test(label)) return Math.round(num * 1_000_000);
  return Math.round(num);
}

function useShopBanners(): ShopBannerItem[] {
  const [banners, setBanners] = useState<ShopBannerItem[]>([]);
  useEffect(() => {
    fetch("/api/settings?key=shop.banners", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        try {
          const raw = d["shop.banners"];
          if (raw) setBanners(JSON.parse(raw));
        } catch {}
      })
      .catch(() => {});
  }, []);
  return banners;
}

// ── Filter section wrapper — Digikala style ─────────────────────────────────
function FilterSection({
  title,
  children,
  open,
  onToggle,
  badgeCount,
  subtitle,
}: {
  title: string;
  children: React.ReactNode;
  open: boolean;
  onToggle: () => void;
  badgeCount?: number;
  subtitle?: string;
}) {
  return (
    <div className="border-b border-border/60 last:border-b-0">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-2 px-4 py-3.5 text-right"
      >
        <div className="flex flex-col items-start">
          <span className="text-[13px] font-medium text-foreground">{title}</span>
          {subtitle && <span className="text-[10px] text-muted-foreground">{subtitle}</span>}
        </div>
        <span className="flex items-center gap-2">
          {badgeCount ? (
            <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
              {badgeCount.toLocaleString("fa-IR")}
            </span>
          ) : null}
          {open ? <ChevronUp className="size-4 text-muted-foreground" /> : <ChevronDown className="size-4 text-muted-foreground" />}
        </span>
      </button>
      {open && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
}

// ── Main ShopGrid ────────────────────────────────────────────────────────────
export default function ShopGrid({ serverItems }: { serverItems?: ContentItem[] }) {
  const fallbackItems = getModuleItems("shop");
  const { items: dbItems } = useDbPosts("shop", fallbackItems, 200);
  const items = dbItems.length > 0 ? dbItems : serverItems ?? fallbackItems;
  const banners = useShopBanners();

  const [sort, setSort] = useState<SortKey>("relevant");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const [onlyAvailable, setOnlyAvailable] = useState(false);

  // open states for filter sections
  const [openMap, setOpenMap] = useState<Record<string, boolean>>({
    fast: true,
    price: false,
    brand: true,
    category: false,
  });
  const toggleSection = (k: string) => setOpenMap((m) => ({ ...m, [k]: !m[k] }));

  const priceRange = useMemo(() => {
    const prices = items.map(resolvePrice).filter((p) => p > 0);
    if (!prices.length) return { min: 0, max: 2_000_000_000 };
    return { min: Math.min(...prices), max: Math.max(...prices) };
  }, [items]);

  const [priceFilter, setPriceFilter] = useState<[number, number] | null>(null);
  const effectivePrice: [number, number] = priceFilter ?? [priceRange.min, priceRange.max];

  const allBrands = useMemo(() => Array.from(new Set(items.map((i) => i.brand).filter(Boolean))) as string[], [items]);
  const [brandSearch, setBrandSearch] = useState("");
  const [selectedBrands, setSelectedBrands] = useState<Set<string>>(new Set());
  const filteredBrands = allBrands.filter(
    (b) => b.toLowerCase().includes(brandSearch.toLowerCase()) || (BRAND_FA[b] || "").includes(brandSearch)
  );

  const allCategories = useMemo(() => Array.from(new Set(items.map((i) => i.category).filter(Boolean))) as string[], [items]);
  const [catSearch, setCatSearch] = useState("");
  const [selectedCats, setSelectedCats] = useState<Set<string>>(new Set());
  const filteredCats = allCategories.filter((c) => c.toLowerCase().includes(catSearch.toLowerCase()));

  // ── Spec based filters (to cover Digikala-like filters: RAM, CPU, etc.) ──
  const specMap = useMemo(() => {
    const map: Record<string, Set<string>> = {};
    for (const it of items) {
      const s = it.specs as Record<string, unknown> | null;
      if (!s || typeof s !== "object") continue;
      for (const [k, v] of Object.entries(s)) {
        const val = String(v).trim();
        if (!val || ["n/a", "na", "-", "N/A"].includes(val.toLowerCase())) continue;
        if (!map[k]) map[k] = new Set();
        map[k].add(val);
      }
    }
    return map;
  }, [items]);

  const [selectedSpecs, setSelectedSpecs] = useState<Record<string, Set<string>>>({});
  const [specSearch, setSpecSearch] = useState<Record<string, string>>({});

  const toggleSpecValue = (key: string, value: string) => {
    setSelectedSpecs((prev) => {
      const next = { ...prev };
      const set = new Set(next[key] ?? []);
      if (set.has(value)) set.delete(value);
      else set.add(value);
      if (set.size === 0) delete next[key];
      else next[key] = set;
      return next;
    });
  };

  // Map spec English keys to Persian labels matching screenshot
  const SPEC_FA: Record<string, string> = {
    Bay: "ظرفیت حافظه داخلی",
    CPU: "سری پردازنده",
    RAM: "ظرفیت حافظه رم (RAM)",
    "Network Card": "سازنده پردازنده",
    Brand: "برند",
    Model: "مدل",
    Storage: "ظرفیت حافظه داخلی",
    Color: "رنگ",
    "Screen Size": "سایز صفحه نمایش",
    "Graphics": "مدل پردازنده گرافیکی",
    "GPU Memory": "حافظه اختصاصی پردازنده گرافیکی",
    Generation: "نسل پردازنده",
    Usage: "کاربری",
  };

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

    // spec filters
    for (const [sk, svSet] of Object.entries(selectedSpecs)) {
      if (svSet.size === 0) continue;
      list = list.filter((it) => {
        const s = (it.specs as Record<string, unknown>) ?? {};
        const v = s[sk];
        if (v == null) return false;
        return svSet.has(String(v));
      });
    }

    switch (sort) {
      case "most_viewed":
        list.sort((a, b) => b.views - a.views);
        break;
      case "newest":
        list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        break;
      case "popular":
        list.sort((a, b) => (b.likes + b.views) - (a.likes + a.views));
        break;
      case "price_asc":
        list.sort((a, b) => resolvePrice(a) - resolvePrice(b));
        break;
      case "price_desc":
        list.sort((a, b) => resolvePrice(b) - resolvePrice(a));
        break;
      case "fastest":
        list.sort((a, b) => {
          const aAvail = a.availability === "ناموجود" ? 1 : 0;
          const bAvail = b.availability === "ناموجود" ? 1 : 0;
          return aAvail - bAvail || new Date(b.date).getTime() - new Date(a.date).getTime();
        });
        break;
      case "buyers":
        list.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
        break;
      case "selected":
        list.sort((a, b) => (b.ratingCount ?? 0) - (a.ratingCount ?? 0));
        break;
      case "relevant":
      default:
        // relevant = weighted: rating* views
        list.sort((a, b) => (b.rating ?? 0) * 0.6 + b.views * 0.4 - ((a.rating ?? 0) * 0.6 + a.views * 0.4));
        break;
    }
    return list;
  }, [items, sort, onlyAvailable, priceFilter, selectedBrands, selectedCats, selectedSpecs]);

  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const loaderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [sort, onlyAvailable, priceFilter, selectedBrands, selectedCats, selectedSpecs]);

  useEffect(() => {
    const el = loaderRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisibleCount((c) => Math.min(c + PAGE_SIZE, sorted.length));
      },
      { rootMargin: "400px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [sorted.length]);

  const visible = sorted.slice(0, visibleCount);
  const activeFilterCount =
    (onlyAvailable ? 1 : 0) +
    (priceFilter ? 1 : 0) +
    selectedBrands.size +
    selectedCats.size +
    Object.values(selectedSpecs).reduce((acc, s) => acc + s.size, 0);

  const clearAllFilters = useCallback(() => {
    setOnlyAvailable(false);
    setPriceFilter(null);
    setSelectedBrands(new Set());
    setSelectedCats(new Set());
    setSelectedSpecs({});
  }, []);

  const fmtSliderPrice = (v: number) => {
    if (v >= 1_000_000_000) return (v / 1_000_000_000).toLocaleString("fa-IR", { maximumFractionDigits: 1 }) + " میلیارد";
    if (v >= 1_000_000) return Math.round(v / 1_000_000).toLocaleString("fa-IR") + " میلیون";
    return v.toLocaleString("fa-IR");
  };

  // ── Sidebar content component ──────────────────────────────────────────────
  const SidebarContent = (
    <div className="flex flex-col bg-card">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-border">
        <span className="text-[15px] font-bold">فیلترها</span>
        {activeFilterCount > 0 && (
          <button
            type="button"
            onClick={clearAllFilters}
            className="text-[12px] font-medium text-[#19bfd3] hover:underline"
          >
            حذف فیلترها
          </button>
        )}
      </div>

      {/* Fast shipping */}
      <FilterSection
        title="ارسال سریع"
        open={!!openMap.fast}
        onToggle={() => toggleSection("fast")}
        subtitle="دیجی‌کالا فروشنده و ۳ ساعته"
      >
        <div className="flex items-center justify-between py-1">
          <div className="flex items-center gap-2">
            <Truck className="size-4 text-[#19bfd3]" />
            <span className="text-[12px]">ارسال امروز</span>
          </div>
          <Switch checked={onlyAvailable} onCheckedChange={setOnlyAvailable} />
        </div>
      </FilterSection>

      {/* Price */}
      <FilterSection title="محدوده قیمت" open={!!openMap.price} onToggle={() => toggleSection("price")} badgeCount={priceFilter ? 1 : 0}>
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span>{fmtSliderPrice(effectivePrice[0])}</span>
            <span>{fmtSliderPrice(effectivePrice[1])}</span>
          </div>
          <Slider
            min={priceRange.min}
            max={priceRange.max}
            value={effectivePrice}
            onValueChange={(v) => {
              if (Array.isArray(v) && v.length === 2) setPriceFilter([v[0], v[1]]);
            }}
            className="py-2"
          />
          <div className="flex items-center gap-2">
            <Input
              type="number"
              value={Math.round(effectivePrice[0])}
              onChange={(e) => {
                const vv = parseInt(e.target.value, 10);
                if (!isNaN(vv)) setPriceFilter([vv, effectivePrice[1]]);
              }}
              className="h-8 text-[11px]"
              placeholder="از"
            />
            <span className="text-muted-foreground">-</span>
            <Input
              type="number"
              value={Math.round(effectivePrice[1])}
              onChange={(e) => {
                const vv = parseInt(e.target.value, 10);
                if (!isNaN(vv)) setPriceFilter([effectivePrice[0], vv]);
              }}
              className="h-8 text-[11px]"
              placeholder="تا"
            />
          </div>
          {priceFilter && (
            <button onClick={() => setPriceFilter(null)} className="text-[11px] text-destructive hover:underline w-full text-right">
              حذف فیلتر قیمت
            </button>
          )}
        </div>
      </FilterSection>

      {/* Brand */}
      <FilterSection
        title="برند"
        open={!!openMap.brand}
        onToggle={() => toggleSection("brand")}
        badgeCount={selectedBrands.size}
      >
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute right-2 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <Input value={brandSearch} onChange={(e) => setBrandSearch(e.target.value)} placeholder="جستجوی برند…" className="h-8 text-xs pr-7 bg-muted/40" />
          </div>
          <div className="space-y-0.5 max-h-64 overflow-y-auto scrollbar-thin pr-1">
            {filteredBrands.map((brand) => (
              <label key={brand} className="flex items-center gap-2 py-1.5 cursor-pointer group hover:bg-muted/40 rounded px-1">
                <input
                  type="checkbox"
                  checked={selectedBrands.has(brand)}
                  onChange={(e) => {
                    const n = new Set(selectedBrands);
                    e.target.checked ? n.add(brand) : n.delete(brand);
                    setSelectedBrands(n);
                  }}
                  className="rounded border-border size-4 accent-primary"
                />
                <span className="flex-1 flex items-center justify-between min-w-0">
                  <span className="text-[12px] font-medium group-hover:text-foreground">{brand}</span>
                  {BRAND_FA[brand] && <span className="text-[11px] text-muted-foreground">{BRAND_FA[brand]}</span>}
                </span>
              </label>
            ))}
            {filteredBrands.length === 0 && <p className="text-[11px] text-muted-foreground py-2">برندی یافت نشد</p>}
          </div>
        </div>
      </FilterSection>

      {/* Category = کاربری */}
      <FilterSection title="کاربری" open={!!openMap.category} onToggle={() => toggleSection("category")} badgeCount={selectedCats.size}>
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute right-2 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <Input value={catSearch} onChange={(e) => setCatSearch(e.target.value)} placeholder="جستجوی کاربری…" className="h-8 text-xs pr-7 bg-muted/40" />
          </div>
          <div className="space-y-0.5">
            {filteredCats.map((cat) => (
              <label key={cat} className="flex items-center gap-2 py-1.5 cursor-pointer hover:bg-muted/40 rounded px-1">
                <input
                  type="checkbox"
                  checked={selectedCats.has(cat)}
                  onChange={(e) => {
                    const n = new Set(selectedCats);
                    e.target.checked ? n.add(cat) : n.delete(cat);
                    setSelectedCats(n);
                  }}
                  className="rounded border-border size-4 accent-primary"
                />
                <span className="text-[12px]">{cat}</span>
              </label>
            ))}
            {filteredCats.length === 0 && <p className="text-[11px] text-muted-foreground">موردی یافت نشد</p>}
          </div>
        </div>
      </FilterSection>

      {/* Dynamic spec filters — covers رنگ, سری پردازنده, RAM, GPU, etc. */}
      {Object.entries(specMap).map(([key, valuesSet]) => {
        const values = Array.from(valuesSet).sort();
        const isOpen = !!openMap[`spec-${key}`];
        const searchVal = specSearch[key] ?? "";
        const filtered = values.filter((v) => v.toLowerCase().includes(searchVal.toLowerCase()));
        const selectedCount = selectedSpecs[key]?.size ?? 0;
        const titleFa = SPEC_FA[key] ?? key;
        // Skip huge sets to keep UI clean, but still show top values
        if (values.length === 0) return null;
        return (
          <FilterSection
            key={key}
            title={titleFa}
            open={isOpen}
            onToggle={() => toggleSection(`spec-${key}`)}
            badgeCount={selectedCount}
          >
            <div className="space-y-2">
              {values.length > 6 && (
                <div className="relative">
                  <Search className="absolute right-2 top-1/2 -translate-y-1/2 size-3 text-muted-foreground" />
                  <Input
                    value={searchVal}
                    onChange={(e) => setSpecSearch((m) => ({ ...m, [key]: e.target.value }))}
                    placeholder={`جستجوی ${titleFa}…`}
                    className="h-7 text-[11px] pr-6 bg-muted/40"
                  />
                </div>
              )}
              <div className="space-y-0.5 max-h-56 overflow-y-auto scrollbar-thin pr-1">
                {filtered.slice(0, 30).map((val) => (
                  <label key={val} className="flex items-center gap-2 py-1 cursor-pointer hover:bg-muted/30 rounded px-1">
                    <input
                      type="checkbox"
                      checked={!!selectedSpecs[key]?.has(val)}
                      onChange={() => toggleSpecValue(key, val)}
                      className="rounded border-border size-3.5 accent-primary shrink-0"
                    />
                    <span className="text-[11px] leading-4 line-clamp-1" dir="auto">
                      {val}
                    </span>
                  </label>
                ))}
                {filtered.length === 0 && <p className="text-[11px] text-muted-foreground">موردی یافت نشد</p>}
              </div>
            </div>
          </FilterSection>
        );
      })}

      {/* Static placeholders to fully match screenshot visual density (optional) */}
      {allCategories.length === 0 && (
        <>
          <FilterSection title="رنگ" open={!!openMap.color} onToggle={() => toggleSection("color")}>
            <p className="text-[11px] text-muted-foreground py-2">فیلتر رنگ به زودی</p>
          </FilterSection>
          <FilterSection title="سری پردازنده" open={!!openMap.cpu_series} onToggle={() => toggleSection("cpu_series")}>
            <p className="text-[11px] text-muted-foreground py-2">بر اساس پردازنده فیلتر می‌شود</p>
          </FilterSection>
        </>
      )}
    </div>
  );

  return (
    <TooltipProvider>
      <div className="mx-auto max-w-[1920px] px-0 lg:px-4 py-0 lg:py-4" dir="rtl">
        {banners.length > 0 && (
          <div className="px-4 lg:px-0 mb-4">
            <ShopBanner banners={banners} />
          </div>
        )}

        <div className="flex gap-0 lg:gap-4 items-start">
          {/* ── Desktop Sidebar ── */}
          {sidebarOpen && (
            <aside className="hidden lg:block w-[280px] shrink-0 sticky top-[4.5rem] self-start max-h-[calc(100vh-5rem)] overflow-y-auto scrollbar-thin rounded-lg border border-border bg-card">
              {SidebarContent}
            </aside>
          )}

          {/* ── Main content ── */}
          <div className="flex-1 min-w-0 flex flex-col">
            {/* Sort bar — Digikala style */}
            <div className="w-full bg-card border-b lg:border lg:rounded-lg border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 px-3 sm:px-4 py-2.5 sticky top-0 lg:static z-20">
              <div className="flex items-center gap-2 w-full sm:w-auto overflow-hidden">
                {/* Filter toggle */}
                <button
                  type="button"
                  onClick={() => setSidebarOpen((o) => !o)}
                  className="hidden lg:flex items-center gap-1.5 text-[12px] text-muted-foreground hover:text-foreground shrink-0 px-1"
                >
                  <SlidersHorizontal className="size-4" />
                  <span>فیلترها</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMobileFiltersOpen(true)}
                  className="lg:hidden flex items-center gap-1.5 text-[12px] bg-muted px-3 py-1.5 rounded-full"
                >
                  <SlidersHorizontal className="size-4" />
                  فیلترها
                  {activeFilterCount > 0 && (
                    <span className="bg-[#ef394e] text-white text-[10px] size-4 rounded-full flex items-center justify-center">
                      {activeFilterCount.toLocaleString("fa-IR")}
                    </span>
                  )}
                </button>

                <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto scrollbar-none">
                  <span className="hidden sm:flex items-center gap-1 text-[12px] font-bold shrink-0 ml-2">
                    <ArrowUpDown className="size-4" />
                    مرتب سازی:
                  </span>
                  <div className="flex items-center gap-0.5">
                    {SORT_OPTIONS.map((o) => (
                      <button
                        key={o.key}
                        type="button"
                        onClick={() => setSort(o.key)}
                        className={cn(
                          "whitespace-nowrap rounded-full px-3 py-1.5 text-[12px] transition-colors",
                          sort === o.key
                            ? "bg-[#ef394e]/10 text-[#ef394e] font-bold"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted"
                        )}
                      >
                        {o.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                <span className="text-[12px] text-muted-foreground">
                  {sorted.length.toLocaleString("fa-IR")} کالا
                </span>
              </div>
            </div>

            {/* Mobile sheet */}
            <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
              <SheetContent side="right" className="w-[85vw] max-w-[340px] p-0 overflow-y-auto bg-card [&>button:last-of-type]:hidden">
                <SheetHeader className="p-0">
                  <SheetTitle className="sr-only">فیلترها</SheetTitle>
                </SheetHeader>
                <div className="flex items-center justify-between p-4 border-b">
                  <span className="font-bold">فیلترها</span>
                  <button type="button" onClick={() => setMobileFiltersOpen(false)} className="p-1">
                    <X className="size-5" />
                  </button>
                </div>
                {SidebarContent}
              </SheetContent>
            </Sheet>

            {/* Product grid — gap-px technique for Digikala dividers */}
            {sorted.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-muted-foreground bg-card border border-border rounded-lg mt-3">
                <p className="text-sm">محصولی با این فیلترها یافت نشد</p>
                <button onClick={clearAllFilters} className="mt-3 text-[12px] text-[#19bfd3] hover:underline">
                  پاک کردن فیلترها
                </button>
              </div>
            ) : (
              <>
                <div
                  className={cn(
                    "grid bg-border gap-px border-x lg:border border-border lg:rounded-b-lg overflow-hidden mt-0",
                    sidebarOpen
                      ? "grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5"
                      : "grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
                  )}
                >
                  {visible.map((p) => (
                    <ShopProductCard key={p.slug} product={p} />
                  ))}
                </div>

                {visibleCount < sorted.length && (
                  <div ref={loaderRef} className="flex justify-center py-8">
                    <div className="h-6 w-6 rounded-full border-2 border-[#ef394e] border-t-transparent animate-spin" />
                  </div>
                )}

                <div className="py-4 text-center text-[11px] text-muted-foreground">
                  {visible.length.toLocaleString("fa-IR")} از {sorted.length.toLocaleString("fa-IR")} کالا نمایش داده شده
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
