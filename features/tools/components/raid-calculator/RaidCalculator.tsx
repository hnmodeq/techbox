"use client";

import React, { useMemo, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { XIcon, HardDrive } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDbPosts } from "@/hooks/useDbPosts";
import { getModuleItems } from "@/lib/content";
import Link from "next/link";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

export type RaidKey = "basic" | "jbod" | "raid0" | "raid1" | "raid5" | "raid6" | "raid10" | "shr1" | "shr2";
export type Drive = { id: string; sizeTb: number; label: string; type: "HDD" | "SSD" };
export type RaidResult = {
  usableTb: number;
  protectionTb: number;
  unusedTb: number;
  rawTb: number;
  activeRawTb: number;
  spareTb: number;
  valid: boolean;
  minDisks: number;
  warnings: string[];
  description: string;
  faultTolerance: string;
  efficiency: number;
};

type RaidOption = {
  key: RaidKey;
  label: string;
  short: string;
  minDisks: number;
  protected: boolean;
  description: string;
  faultTolerance: string;
};

export const RAID_OPTIONS: RaidOption[] = [
  { key: "basic", label: "Basic", short: "Basic", minDisks: 1, protected: false, description: "هر دیسک مستقل – بیشترین ظرفیت، بدون تحمل خرابی.", faultTolerance: "ندارد" },
  { key: "jbod", label: "JBOD", short: "JBOD", minDisks: 1, protected: false, description: "ترکیب ظرفیت دیسک‌ها در یک Volume.", faultTolerance: "ندارد" },
  { key: "raid0", label: "RAID 0", short: "R0", minDisks: 2, protected: false, description: "Striping برای کارایی بالا، بدون تحمل خرابی.", faultTolerance: "ندارد" },
  { key: "raid1", label: "RAID 1", short: "R1", minDisks: 2, protected: true, description: "Mirror کامل – امنیت بالا.", faultTolerance: "تحمل خرابی n-1 دیسک" },
  { key: "raid5", label: "RAID 5", short: "R5", minDisks: 3, protected: true, description: "یک دیسک Parity – تعادل ظرفیت و امنیت.", faultTolerance: "تحمل خرابی ۱ دیسک" },
  { key: "raid6", label: "RAID 6", short: "R6", minDisks: 4, protected: true, description: "دو Parity – مناسب آرایه‌های بزرگ.", faultTolerance: "تحمل خرابی ۲ دیسک" },
  { key: "raid10", label: "RAID 10", short: "R10", minDisks: 4, protected: true, description: "Mirror + Stripe.", faultTolerance: "حداقل ۱ دیسک" },
  { key: "shr1", label: "SHR", short: "SHR", minDisks: 2, protected: true, description: "Synology Hybrid RAID – بهینه برای دیسک‌های نامساوی.", faultTolerance: "تحمل خرابی ۱ دیسک" },
  { key: "shr2", label: "SHR-2", short: "SHR2", minDisks: 4, protected: true, description: "SHR با تحمل ۲ دیسک – مناسب آرایه‌های حساس.", faultTolerance: "تحمل خرابی ۲ دیسک" },
];

// HDD sizes like screenshot 1: 24,20,18,16,14,12,10,8,6,4,3,2,1 TB
const HDD_SIZES: { tb: number; label: string }[] = [
  { tb: 24, label: "۲۴ ترابایت" },
  { tb: 20, label: "۲۰ ترابایت" },
  { tb: 18, label: "۱۸ ترابایت" },
  { tb: 16, label: "۱۶ ترابایت" },
  { tb: 14, label: "۱۴ ترابایت" },
  { tb: 12, label: "۱۲ ترابایت" },
  { tb: 10, label: "۱۰ ترابایت" },
  { tb: 8, label: "۸ ترابایت" },
  { tb: 6, label: "۶ ترابایت" },
  { tb: 4, label: "۴ ترابایت" },
  { tb: 3, label: "۳ ترابایت" },
  { tb: 2, label: "۲ ترابایت" },
  { tb: 1, label: "۱ ترابایت" },
];
// SSD sizes like screenshot 2: 7.68TB, 7TB, 3.84TB, 1.92TB, 960GB, 480GB
const SSD_SIZES: { tb: number; label: string; labelEn: string }[] = [
  { tb: 7.68, label: "۷.۶۸ ترابایت", labelEn: "7.68 TB" },
  { tb: 7, label: "۷ ترابایت", labelEn: "7 TB" },
  { tb: 3.84, label: "۳.۸۴ ترابایت", labelEn: "3.84 TB" },
  { tb: 1.92, label: "۱.۹۲ ترابایت", labelEn: "1.92 TB" },
  { tb: 0.96, label: "۹۶۰ گیگابایت", labelEn: "960 GB" },
  { tb: 0.48, label: "۴۸۰ گیگابایت", labelEn: "480 GB" },
];

function uid() {
  return `d-${Math.random().toString(36).slice(2, 10)}`;
}
function sum(v: number[]) {
  return v.reduce((a, b) => a + b, 0);
}
const nfFa = new Intl.NumberFormat("fa-IR", { maximumFractionDigits: 1 });
const nfFa0 = new Intl.NumberFormat("fa-IR", { maximumFractionDigits: 0 });

function calculateShr(sizes: number[], parity: 1 | 2) {
  const sorted = [...sizes].filter(Boolean).sort((a, b) => a - b);
  const raw = sum(sorted);
  let usable = 0,
    protection = 0,
    unused = 0;
  let prev = 0;
  for (const b of sorted) {
    const slice = b - prev;
    if (slice <= 0) continue;
    const members = sorted.filter((s) => s >= b).length;
    if (parity === 1) {
      if (members >= 2) {
        usable += (members - 1) * slice;
        protection += slice;
      } else {
        unused += members * slice;
      }
    } else {
      if (members >= 3) {
        usable += (members - 2) * slice;
        protection += 2 * slice;
      } else {
        unused += members * slice;
      }
    }
    prev = b;
  }
  const gap = raw - usable - protection - unused;
  if (Math.abs(gap) > 0.00001) unused += gap;
  return { usable, protection, unused };
}

export function calculateRaid(raidKey: RaidKey, drives: Drive[], spareCount = 0): RaidResult {
  const option = RAID_OPTIONS.find((o) => o.key === raidKey);
  if (!option) {
    return {
      usableTb: 0,
      protectionTb: 0,
      unusedTb: 0,
      rawTb: 0,
      activeRawTb: 0,
      spareTb: 0,
      valid: false,
      minDisks: 0,
      warnings: [],
      description: "",
      faultTolerance: "",
      efficiency: 0,
    };
  }
  const allSizes = drives.map((d) => Number(d.sizeTb)).filter((s) => s > 0);
  const rawTb = sum(allSizes);
  const sortedDesc = [...allSizes].sort((a, b) => b - a);
  const spare = sortedDesc.slice(0, Math.min(spareCount, Math.max(0, sortedDesc.length - 1)));
  const active = sortedDesc.slice(spare.length);
  const activeRawTb = sum(active);
  const spareTb = sum(spare);
  const n = active.length;
  const min = n ? Math.min(...active) : 0;
  const warnings: string[] = [];

  let usableTb = 0,
    protectionTb = 0,
    unusedTb = 0;

  if (n < option.minDisks) warnings.push(`برای ${option.label} حداقل ${option.minDisks.toLocaleString("fa-IR")} دیسک لازم است.`);
  if (raidKey === "raid10" && n % 2 !== 0) warnings.push("RAID 10 نیاز به تعداد دیسک زوج دارد.");

  switch (raidKey) {
    case "basic":
    case "jbod":
      usableTb = activeRawTb;
      break;
    case "raid0":
      usableTb = n >= 2 ? min * n : 0;
      unusedTb = Math.max(0, activeRawTb - usableTb);
      break;
    case "raid1":
      usableTb = n >= 2 ? min : 0;
      protectionTb = n >= 2 ? min * (n - 1) : 0;
      unusedTb = Math.max(0, activeRawTb - usableTb - protectionTb);
      break;
    case "raid5":
      usableTb = n >= 3 ? min * (n - 1) : 0;
      protectionTb = n >= 3 ? min : 0;
      unusedTb = Math.max(0, activeRawTb - usableTb - protectionTb);
      break;
    case "raid6":
      usableTb = n >= 4 ? min * (n - 2) : 0;
      protectionTb = n >= 4 ? min * 2 : 0;
      unusedTb = Math.max(0, activeRawTb - usableTb - protectionTb);
      break;
    case "raid10":
      usableTb = n >= 4 && n % 2 === 0 ? min * (n / 2) : 0;
      protectionTb = n >= 4 && n % 2 === 0 ? min * (n / 2) : 0;
      unusedTb = Math.max(0, activeRawTb - usableTb - protectionTb);
      break;
    case "shr1":
      if (n >= 2) {
        const s = calculateShr(active, 1);
        usableTb = s.usable;
        protectionTb = s.protection;
        unusedTb = s.unused;
      }
      break;
    case "shr2":
      if (n >= 4) {
        const s = calculateShr(active, 2);
        usableTb = s.usable;
        protectionTb = s.protection;
        unusedTb = s.unused;
      }
      break;
  }

  const valid = n >= option.minDisks && !(raidKey === "raid10" && n % 2 !== 0);
  const efficiency = activeRawTb > 0 ? (usableTb / activeRawTb) * 100 : 0;

  return {
    usableTb,
    protectionTb,
    unusedTb,
    rawTb,
    activeRawTb,
    spareTb,
    valid,
    minDisks: option.minDisks,
    warnings,
    description: option.description,
    faultTolerance: option.faultTolerance,
    efficiency,
  };
}

const BINARY_FACTOR = 1000 ** 4 / 1024 ** 4;
function toBinary(tb: number) {
  return tb * BINARY_FACTOR;
}
function formatFaBinary(tb: number) {
  const b = toBinary(tb);
  if (b <= 0) return "۰";
  if (b < 1) return `${(b * 1000).toLocaleString("fa-IR", { maximumFractionDigits: 0 })} گیگابایت`;
  return `${b.toLocaleString("fa-IR", { maximumFractionDigits: b >= 10 ? 1 : 2 })} ترابایت`;
}
function formatFaTb(tb: number) {
  if (tb <= 0) return "۰";
  if (tb < 1) return `${(tb * 1000).toLocaleString("fa-IR")} گیگابایت`;
  return `${tb.toLocaleString("fa-IR", { maximumFractionDigits: 2 })} ترابایت`;
}

function parseBay(specs: any): number | null {
  if (!specs || typeof specs !== "object") return null;
  const v = specs["Bay"] ?? specs["bay"] ?? specs["Bays"] ?? specs["تعداد Bay"];
  if (!v) return null;
  const m = String(v).match(/(\d+)/);
  return m ? parseInt(m[1], 10) : null;
}

function RecommendedModels({ driveCount }: { driveCount: number }) {
  const fallback = getModuleItems("shop");
  const { items: dbItems } = useDbPosts("shop", fallback, 120);
  const items = dbItems.length > 0 ? dbItems : fallback;

  const filtered = useMemo(() => {
    if (driveCount === 0) return [];
    const candidates = items.filter((p) => {
      const brand = (p.brand || "").toLowerCase();
      const cat = (p.category || "").toLowerCase();
      const isNasBrand = ["synology", "qnap", "asustor", "terramaster"].some((b) => brand.includes(b));
      const isNasCat = cat.includes("nas") || cat.includes("ذخیره") || cat.includes("شبکه") || cat.includes("سرور");
      const bay = parseBay(p.specs);
      return isNasBrand || isNasCat || bay !== null;
    });

    const withBay = candidates
      .map((p) => ({ p, bay: parseBay(p.specs) ?? 999 }))
      .filter(({ bay }) => bay >= driveCount)
      .sort((a, b) => a.bay - b.bay)
      .slice(0, 10)
      .map(({ p }) => p);

    if (withBay.length >= 2) return withBay;
    // fallback to any real product with image if not enough NAS
    return items.filter((p) => p.image).slice(0, 10);
  }, [items, driveCount]);

  if (driveCount === 0) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-[18px] font-black">مدل‌های پیشنهادی</h3>
      <p className="text-[12px] text-muted-foreground">
        بر اساس تعداد دیسک انتخابی ({driveCount.toLocaleString("fa-IR")} عدد) – مدل‌های واقعی از فروشگاه تکباکس
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-px bg-border border border-border rounded-lg overflow-hidden">
        {filtered.map((p) => (
          <Link key={p.slug} href={`/shop/${p.slug}`} className="group bg-card p-4 flex flex-col items-center gap-3 hover:bg-accent hover:text-accent-foreground transition-colors">
            <div className="relative w-full aspect-[4/3] bg-transparent">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.image || "/assets/blog-1.jpg"} alt={p.title} className="w-full h-full object-contain group-hover:scale-[1.02] transition-transform" />
            </div>
            <div className="text-center">
              <div className="text-[12px] font-bold line-clamp-2 leading-5">{p.model || p.title.slice(0, 50)}</div>
              <div className="text-[10px] text-muted-foreground group-hover:text-accent-foreground/70 mt-1">
                {p.brand ? `${p.brand}` : ""} {parseBay(p.specs) ? `• ${parseBay(p.specs)} Bay` : ""}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function UsageBar({ result, driveCount }: { result: RaidResult; driveCount: number }) {
  const reservedDecimal = driveCount * 0.01; // 10GB
  const reservedBinary = toBinary(reservedDecimal);
  const usableBinary = Math.max(0, toBinary(result.usableTb) - reservedBinary);
  const protectionBinary = toBinary(result.protectionTb);
  const unusedBinary = toBinary(result.unusedTb);
  const total = reservedBinary + usableBinary + protectionBinary + unusedBinary || 1;

  const segs = [
    { label: "فضای رزرو سیستم", labelEn: "Reserved capacity for system", value: reservedBinary, color: "bg-orange-400" },
    { label: "ظرفیت قابل استفاده", labelEn: "Available capacity", value: usableBinary, color: "bg-emerald-500" },
    { label: "محافظت", labelEn: "Protection", value: protectionBinary, color: "bg-blue-600" },
    { label: "فضای بلااستفاده", labelEn: "Unused space", value: unusedBinary, color: "bg-zinc-300 dark:bg-zinc-600" },
  ].filter((s) => s.value > 0.005);

  return (
    <div className="space-y-2">
      <div className="flex h-6 w-full overflow-hidden rounded-sm bg-muted border">
        {segs.map((s, i) => (
          <div key={i} className={cn("h-full", s.color)} style={{ width: `${(s.value / total) * 100}%` }} title={`${s.label}: ${s.value.toFixed(2)}`} />
        ))}
      </div>
      <div className="flex flex-wrap gap-3 text-[10px]">
        {segs.map((s, i) => (
          <span key={i} className="flex items-center gap-1.5">
            <span className={cn("size-2.5 rounded-[2px]", s.color)} />
            <span className="text-muted-foreground">
              {s.label} {s.value > 0 ? `• ${formatFaBinary(s.value / BINARY_FACTOR)}` : ""}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}

export default function RaidCalculator() {
  const [drives, setDrives] = useState<Drive[]>([]);
  const [driveType, setDriveType] = useState<"HDD" | "SSD">("HDD");
  const [raidA, setRaidA] = useState<RaidKey>("raid5");
  const [raidB, setRaidB] = useState<RaidKey>("raid6");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingType, setPendingType] = useState<"HDD" | "SSD" | null>(null);

  const currentSizes = driveType === "HDD" ? HDD_SIZES : SSD_SIZES;

  const counts = useMemo(() => {
    const m = new Map<number, number>();
    for (const d of drives) m.set(d.sizeTb, (m.get(d.sizeTb) || 0) + 1);
    return m;
  }, [drives]);

  const addDrive = (sizeTb: number, label: string) => {
    setDrives((prev) => [...prev, { id: uid(), sizeTb, label, type: driveType }]);
  };
  const removeDrive = (id: string) => setDrives((p) => p.filter((d) => d.id !== id));
  const reset = () => setDrives([]);

  const resultA = useMemo(() => calculateRaid(raidA, drives, 0), [raidA, drives]);
  const resultB = useMemo(() => calculateRaid(raidB, drives, 0), [raidB, drives]);

  const hasDrives = drives.length > 0;

  return (
    <div className="w-full max-w-[1280px] mx-auto space-y-8" dir="rtl">
      {/* Step 1 */}
      <div className="bg-card text-card-foreground border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 sm:px-6 py-4 border-b bg-muted/30 flex items-center gap-3">
          <span className="inline-flex items-center justify-center rounded-md bg-foreground text-background text-[11px] font-black px-2.5 py-1">مرحله ۱</span>
          <h2 className="text-[16px] sm:text-[18px] font-black">انتخاب دیسک‌ها</h2>
          <span className="text-[11px] text-muted-foreground mr-2">Select drives</span>
        </div>

        <div className="p-5 sm:p-6 space-y-6">
          {/* HDD / SSD tabs – with proper tokens & hover contrast */}
          <div className="flex gap-1 border-b border-border">
            {(["HDD", "SSD"] as const).map((t) => (
              <button
                key={t}
                onClick={() => {
                  if (t !== driveType && drives.length > 0) {
                    setPendingType(t);
                    setConfirmOpen(true);
                    return;
                  }
                  setDriveType(t);
                }}
                className={cn(
                  "relative px-5 py-2.5 text-[13px] font-bold border-b-2 -mb-px transition-colors",
                  driveType === t
                    ? "border-primary text-primary bg-primary/5"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:bg-accent hover:border-accent-foreground/20"
                )}
              >
                {t === "HDD" ? "هارد دیسک (HDD)" : "اس اس دی (SSD)"}
              </button>
            ))}
          </div>

          {/* Size pills – HDD vs SSD different */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2.5">
            {currentSizes.map((o) => {
              const c = counts.get(o.tb) || 0;
              const isSelected = c > 0;
              return (
                <button
                  key={`${o.tb}-${o.label}`}
                  onClick={() => addDrive(o.tb, o.label)}
                  className={cn(
                    "group relative flex items-center justify-between rounded-md border px-3 py-2.5 text-[12px] font-medium transition-all",
                    "bg-card text-card-foreground border-border",
                    "hover:border-primary hover:bg-accent hover:text-accent-foreground hover:shadow-sm",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    isSelected &&
                      "bg-primary text-primary-foreground border-primary shadow-sm hover:bg-primary/90 hover:text-primary-foreground"
                  )}
                >
                  <span className="truncate">{o.label}</span>
                  {isSelected ? (
                    <span className="mr-2 inline-flex size-5 items-center justify-center rounded-full bg-primary-foreground text-primary text-[11px] font-black">
                      {c.toLocaleString("fa-IR")}
                    </span>
                  ) : (
                    <span className="mr-2 opacity-0 group-hover:opacity-100 transition text-[10px] text-muted-foreground group-hover:text-accent-foreground">+ افزودن</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Selected tray – now 100% tokens, light in light mode / dark in dark mode */}
          <div className="rounded-lg border border-border bg-muted dark:bg-muted/40 p-3 sm:p-4 min-h-[120px] shadow-inner">
            <div className="flex flex-wrap gap-2.5 sm:gap-3">
              {drives.length === 0 ? (
                <div className="w-full h-[84px] flex flex-col items-center justify-center gap-1 text-[12px] text-muted-foreground">
                  <HardDrive className="size-6 opacity-60 text-muted-foreground" />
                  <span>برای شروع، یک ظرفیت از بالا انتخاب کنید</span>
                  <span className="text-[10px] text-muted-foreground/70">نمای دیسک‌های انتخابی اینجا خواهد بود</span>
                </div>
              ) : (
                drives.map((d) => (
                  <div
                    key={d.id}
                    className={cn(
                      "group relative flex h-[92px] w-[84px] flex-col items-center justify-center gap-1 rounded-md border shadow-sm transition-colors",
                      d.type === "SSD"
                        ? "bg-primary/10 border-primary/20 text-primary hover:bg-primary/20 hover:border-primary/30"
                        : "bg-card border-border text-card-foreground hover:bg-accent hover:text-accent-foreground hover:border-accent-foreground/20"
                    )}
                  >
                    <HardDrive className={cn("size-6 transition", d.type === "SSD" ? "text-primary" : "text-muted-foreground group-hover:text-accent-foreground")} />
                    <span className="text-[11px] font-bold">{d.label}</span>
                    <span className={cn("text-[9px] px-1.5 py-0.5 rounded-md font-medium", d.type === "SSD" ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground")}>{d.type}</span>
                    <button
                      onClick={() => removeDrive(d.id)}
                      className="absolute -top-2 -right-2 size-6 rounded-full bg-background border border-border text-foreground flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-all"
                      aria-label="حذف"
                    >
                      <XIcon className="size-3.5" />
                    </button>
                  </div>
                ))
              )}
              {Array.from({ length: Math.max(0, 12 - drives.length) }).map((_, i) => (
                <div key={`ph-${i}`} className="h-[92px] w-[84px] rounded-md bg-background/60 dark:bg-card/40 border border-dashed border-border/60" />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between text-[12px] text-muted-foreground pt-1">
            <span>
              تعداد کل دیسک‌ها: <b className="text-foreground">{drives.length.toLocaleString("fa-IR")}</b>
            </span>
            <button onClick={reset} className="rounded-md border border-border px-3 py-1.5 text-[11px] font-medium hover:bg-accent hover:text-accent-foreground hover:border-accent-foreground/20 transition-colors">
              بازنشانی / Reset
            </button>
          </div>
        </div>
      </div>

      {/* Step 2 – only when drives selected */}
      {hasDrives && (
        <div className="bg-[#f6f6f7] dark:bg-muted/20 border border-border rounded-xl overflow-hidden">
          <div className="px-5 sm:px-6 py-5">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center justify-center rounded-md bg-foreground text-background text-[11px] font-black px-2.5 py-1">مرحله ۲</span>
              <h2 className="text-[16px] sm:text-[18px] font-black">برآورد فضای قابل استفاده</h2>
              <span className="text-[11px] text-muted-foreground mr-2">Usage estimate</span>
            </div>
            <a href="#" className="mt-2 inline-flex text-[11px] text-blue-600 dark:text-blue-400 hover:underline">
              اطلاعات بیشتر درباره انواع RAID / Learn more about RAID types ↗
            </a>

            <div className="mt-6 space-y-6 bg-card rounded-lg border p-4 sm:p-5">
              {/* RAID A */}
              <div className="flex flex-col lg:flex-row gap-3 lg:items-center">
                <div className="lg:w-[160px] shrink-0">
                  <Select value={raidA} onValueChange={(v) => setRaidA(v as RaidKey)}>
                    <SelectTrigger className="h-9 text-[12px] font-bold bg-background border-border hover:border-primary hover:bg-accent transition-colors">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {RAID_OPTIONS.map((o) => (
                        <SelectItem key={o.key} value={o.key} className="text-[12px]">
                          {o.label} – {o.faultTolerance}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center justify-center rounded-sm bg-muted border px-2 py-0.5 text-[10px] font-black">
                      {resultA.valid ? RAID_OPTIONS.find((o) => o.key === raidA)?.short : "خطا"}
                    </span>
                    <div className="flex-1">
                      <UsageBar result={resultA} driveCount={drives.length} />
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] sm:text-[11px] text-muted-foreground pr-1">
                    <span>قابل استفاده: <b className="text-foreground">{formatFaBinary(resultA.usableTb)}</b></span>
                    <span>تحمل خطا: <b className="text-foreground">{resultA.faultTolerance}</b></span>
                    <span>بازده: <b className="text-foreground">{nfFa0.format(resultA.efficiency)}٪</b></span>
                    {resultA.warnings.map((w, i) => (
                      <span key={i} className="text-amber-600 dark:text-amber-400">⚠ {w}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* RAID B */}
              <div className="flex flex-col lg:flex-row gap-3 lg:items-center">
                <div className="lg:w-[160px] shrink-0">
                  <Select value={raidB} onValueChange={(v) => setRaidB(v as RaidKey)}>
                    <SelectTrigger className="h-9 text-[12px] font-bold bg-background border-border hover:border-primary hover:bg-accent transition-colors">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {RAID_OPTIONS.map((o) => (
                        <SelectItem key={o.key} value={o.key} className="text-[12px]">
                          {o.label} – {o.faultTolerance}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center justify-center rounded-sm bg-muted border px-2 py-0.5 text-[10px] font-black">
                      {resultB.valid ? RAID_OPTIONS.find((o) => o.key === raidB)?.short : "خطا"}
                    </span>
                    <div className="flex-1">
                      <UsageBar result={resultB} driveCount={drives.length} />
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] sm:text-[11px] text-muted-foreground pr-1">
                    <span>قابل استفاده: <b className="text-foreground">{formatFaBinary(resultB.usableTb)}</b></span>
                    <span>تحمل خطا: <b className="text-foreground">{resultB.faultTolerance}</b></span>
                    {resultB.warnings.map((w, i) => (
                      <span key={i} className="text-amber-600 dark:text-amber-400">⚠ {w}</span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t text-[10px] text-muted-foreground leading-4">
                نتایج بر اساس محاسبه باینری است، نه ده‌دهی. مجموع خام: {formatFaTb(resultA.rawTb || resultB.rawTb)} • فضای رزرو سیستم حدود ۱۰ گیگابایت به ازای هر دیسک.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recommended models – real shop */}
      {hasDrives && (
        <div className="bg-card border rounded-xl p-5 sm:p-6">
          <RecommendedModels driveCount={drives.length} />
        </div>
      )}

      {/* Notes – Persian like Synology */}
      <div className="rounded-xl bg-muted/40 border p-5 text-[11px] leading-6 text-muted-foreground space-y-3" dir="rtl">
        <p className="font-black text-foreground text-[12px]">یادداشت‌ها:</p>
        <ol className="list-decimal pr-5 space-y-2">
          <li>
            <b className="text-foreground">فضای رزرو سیستم</b> فضایی است که برای پارتیشن سیستم و SWAP رزرو می‌شود. هر دیسک در RAID باید تقریباً ۱۰ گیگابایت فضای سیستم رزرو کند.
          </li>
          <li>
            <b className="text-foreground">ظرفیت قابل استفاده</b> به فضایی گفته می‌شود که پس از پیکربندی RAID می‌توان Volume ساخت. هنگام ساخت Volume، سیستم برای متادیتا فضا رزرو می‌کند. فایل‌سیستم Btrfs حدود ۴٪ و ext4 حدود ۲٪ را برای متادیتا رزرو می‌کند، بنابراین فضای واقعی ذخیره داده کمتر از برآورد ماشین‌حساب خواهد بود.
          </li>
          <li>
            ماشین‌حساب مدل‌ها را بر اساس تعداد و ظرفیت کل دیسک‌های انتخابی پیشنهاد می‌دهد. برخی مدل‌ها ممکن است از ظرفیت خاصی پشتیبانی نکنند اما همان ظرفیت با ترکیب دیگر یا با یونیت توسعه قابل دستیابی است. در این صفحه مدل‌های واقعی فروشگاه تکباکس بر اساس Bay فیلتر می‌شوند.
          </li>
          <li>انواع RAID و حداکثر ظرفیت یک Volume ممکن است بسته به مدل متفاوت باشد. لطفاً DataSheet مدل NAS خود را بررسی کنید.</li>
          <li>
            اگر قصد دارید از دیسک‌هایی با ظرفیت متفاوت استفاده کنید، توصیه می‌شود از SHR یا SHR-2 برای به حداقل رساندن فضای بلااستفاده استفاده کنید.
          </li>
        </ol>
      </div>

      {/* Shadcn Dialog for HDD ↔ SSD switch – replaces browser confirm */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent dir="rtl" className="max-w-[360px]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[14px] font-black">تغییر نوع دیسک</AlertDialogTitle>
            <AlertDialogDescription className="text-[13px] leading-6">
              تغییر نوع دیسک از <b className="text-foreground">{driveType}</b> به <b className="text-foreground">{pendingType}</b> باعث بازنشانی تنظیمات فعلی میشود
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row justify-start gap-2 sm:justify-start">
            <AlertDialogAction
              onClick={() => {
                if (pendingType) {
                  setDrives([]);
                  setDriveType(pendingType);
                }
                setConfirmOpen(false);
                setPendingType(null);
              }}
              className="bg-primary text-primary-foreground hover:bg-primary/90 min-w-[100px]"
            >
              مشکلی نیست
            </AlertDialogAction>
            <AlertDialogCancel
              onClick={() => {
                setConfirmOpen(false);
                setPendingType(null);
              }}
              className="min-w-[80px]"
            >
              انصراف
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
