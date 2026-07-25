"use client";

import React, { useMemo, useState, useRef, useEffect } from "react";
import { XIcon, HardDrive, Lock, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDbPosts } from "@/hooks/useDbPosts";
import { getModuleItems } from "@/lib/content";
import Link from "next/link";
import Image from "next/image";
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
  AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

export type RaidKey = "basic" | "jbod" | "raid0" | "raid1" | "raid5" | "raid6" | "raid10" | "shr1" | "shr2";
export type Drive = { id: string; sizeTb: number; label: string; type: "HDD" | "SSD" };
export type RaidResult = {
  usableTb: number; protectionTb: number; unusedTb: number; rawTb: number;
  activeRawTb: number; spareTb: number; valid: boolean; minDisks: number;
  warnings: string[]; description: string; faultTolerance: string; efficiency: number;
};

type RaidOption = {
  key: RaidKey; label: string; short: string; minDisks: number;
  protected: boolean; description: string; faultTolerance: string;
};

export const RAID_OPTIONS: RaidOption[] = [
  { key: "basic", label: "Basic", short: "Basic", minDisks: 1, protected: false, description: "هر دیسک مستقل – بیشترین ظرفیت، بدون تحمل خرابی.", faultTolerance: "ندارد" },
  { key: "jbod", label: "JBOD", short: "JBOD", minDisks: 1, protected: false, description: "ترکیب ظرفیت دیسک‌ها در یک Volume پیوسته.", faultTolerance: "ندارد" },
  { key: "raid0", label: "RAID 0", short: "RAID 0", minDisks: 2, protected: false, description: "Striping برای کارایی بالا، بدون تحمل خرابی.", faultTolerance: "ندارد" },
  { key: "raid1", label: "RAID 1", short: "RAID 1", minDisks: 2, protected: true, description: "Mirror کامل – امنیت بالا، تحمل خرابی تا n-1 دیسک.", faultTolerance: "تحمل خرابی n-1 دیسک" },
  { key: "raid5", label: "RAID 5", short: "RAID 5", minDisks: 3, protected: true, description: "یک دیسک Parity – تعادل ظرفیت و امنیت.", faultTolerance: "تحمل خرابی ۱ دیسک" },
  { key: "raid6", label: "RAID 6", short: "RAID 6", minDisks: 4, protected: true, description: "دو Parity – مناسب آرایه‌های بزرگ و حساس.", faultTolerance: "تحمل خرابی ۲ دیسک" },
  { key: "raid10", label: "RAID 10", short: "RAID 10", minDisks: 4, protected: true, description: "Mirror + Stripe – کارایی و امنیت.", faultTolerance: "حداقل ۱ دیسک" },
  { key: "shr1", label: "SHR", short: "SHR", minDisks: 2, protected: true, description: "Synology Hybrid RAID – بهینه برای دیسک‌های نامساوی.", faultTolerance: "تحمل خرابی ۱ دیسک" },
  { key: "shr2", label: "SHR-2", short: "SHR-2", minDisks: 4, protected: true, description: "SHR با تحمل ۲ دیسک – مناسب آرایه‌های بزرگ.", faultTolerance: "تحمل خرابی ۲ دیسک" },
];

const HDD_SIZES = [
  { tb: 1, label: "۱ ترابایت" }, { tb: 2, label: "۲ ترابایت" }, { tb: 3, label: "۳ ترابایت" },
  { tb: 4, label: "۴ ترابایت" }, { tb: 6, label: "۶ ترابایت" }, { tb: 8, label: "۸ ترابایت" },
  { tb: 10, label: "۱۰ ترابایت" }, { tb: 12, label: "۱۲ ترابایت" }, { tb: 14, label: "۱۴ ترابایت" },
  { tb: 16, label: "۱۶ ترابایت" }, { tb: 18, label: "۱۸ ترابایت" }, { tb: 20, label: "۲۰ ترابایت" },
  { tb: 24, label: "۲۴ ترابایت" },
];
const SSD_SIZES = [
  { tb: 0.48, label: "۴۸۰ گیگابایت" }, { tb: 0.96, label: "۹۶۰ گیگابایت" },
  { tb: 1.92, label: "۱.۹۲ ترابایت" }, { tb: 3.84, label: "۳.۸۴ ترابایت" },
  { tb: 7, label: "۷ ترابایت" }, { tb: 7.68, label: "۷.۶۸ ترابایت" },
];

function uid() { return `d-${Math.random().toString(36).slice(2, 10)}`; }
function sum(v: number[]) { return v.reduce((a, b) => a + b, 0); }
const nfFa0 = new Intl.NumberFormat("fa-IR", { maximumFractionDigits: 0 });

function calculateShr(sizes: number[], parity: 1 | 2) {
  const sorted = [...sizes].filter(Boolean).sort((a, b) => a - b);
  const raw = sum(sorted);
  let usable = 0, protection = 0, unused = 0, prev = 0;
  for (const b of sorted) {
    const slice = b - prev;
    if (slice <= 0) continue;
    const members = sorted.filter((s) => s >= b).length;
    if (parity === 1) {
      if (members >= 2) { usable += (members - 1) * slice; protection += slice; }
      else unused += members * slice;
    } else {
      if (members >= 3) { usable += (members - 2) * slice; protection += 2 * slice; }
      else unused += members * slice;
    }
    prev = b;
  }
  const gap = raw - usable - protection - unused;
  if (Math.abs(gap) > 0.00001) unused += gap;
  return { usable, protection, unused };
}

export function calculateRaid(raidKey: RaidKey, drives: Drive[], spareCount = 0): RaidResult {
  const option = RAID_OPTIONS.find((o) => o.key === raidKey);
  if (!option) return { usableTb: 0, protectionTb: 0, unusedTb: 0, rawTb: 0, activeRawTb: 0, spareTb: 0, valid: false, minDisks: 0, warnings: [], description: "", faultTolerance: "", efficiency: 0 };
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
  let usableTb = 0, protectionTb = 0, unusedTb = 0;

  if (n < option.minDisks) warnings.push(`برای ${option.label} حداقل ${option.minDisks.toLocaleString("fa-IR")} دیسک لازم است.`);
  if (raidKey === "raid10" && n % 2 !== 0) warnings.push("RAID 10 نیاز به تعداد دیسک زوج دارد.");

  switch (raidKey) {
    case "basic": case "jbod": usableTb = activeRawTb; break;
    case "raid0": usableTb = n >= 2 ? min * n : 0; unusedTb = Math.max(0, activeRawTb - usableTb); break;
    case "raid1": usableTb = n >= 2 ? min : 0; protectionTb = n >= 2 ? min * (n - 1) : 0; unusedTb = Math.max(0, activeRawTb - usableTb - protectionTb); break;
    case "raid5": usableTb = n >= 3 ? min * (n - 1) : 0; protectionTb = n >= 3 ? min : 0; unusedTb = Math.max(0, activeRawTb - usableTb - protectionTb); break;
    case "raid6": usableTb = n >= 4 ? min * (n - 2) : 0; protectionTb = n >= 4 ? min * 2 : 0; unusedTb = Math.max(0, activeRawTb - usableTb - protectionTb); break;
    case "raid10": usableTb = n >= 4 && n % 2 === 0 ? min * (n / 2) : 0; protectionTb = n >= 4 && n % 2 === 0 ? min * (n / 2) : 0; unusedTb = Math.max(0, activeRawTb - usableTb - protectionTb); break;
    case "shr1": if (n >= 2) { const s = calculateShr(active, 1); usableTb = s.usable; protectionTb = s.protection; unusedTb = s.unused; } break;
    case "shr2": if (n >= 4) { const s = calculateShr(active, 2); usableTb = s.usable; protectionTb = s.protection; unusedTb = s.unused; } break;
  }
  const valid = n >= option.minDisks && !(raidKey === "raid10" && n % 2 !== 0);
  const efficiency = activeRawTb > 0 ? (usableTb / activeRawTb) * 100 : 0;
  return { usableTb, protectionTb, unusedTb, rawTb, activeRawTb, spareTb, valid, minDisks: option.minDisks, warnings, description: option.description, faultTolerance: option.faultTolerance, efficiency };
}

const BINARY_FACTOR = 1000 ** 4 / 1024 ** 4;
function toBinary(tb: number) { return tb * BINARY_FACTOR; }
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
  const ranked = useMemo(() => {
    if (driveCount === 0) return [];
    const candidates = items.filter((p) => {
      const brand = (p.brand || "").toLowerCase();
      const cat = (p.category || "").toLowerCase();
      const isNasBrand = ["synology", "qnap", "asustor", "terramaster"].some((b) => brand.includes(b));
      const isNasCat = cat.includes("nas") || cat.includes("ذخیره") || cat.includes("شبکه") || cat.includes("سرور");
      const bay = parseBay(p.specs);
      return isNasBrand || isNasCat || bay !== null;
    });
    return candidates.map((p) => {
      const bay = parseBay(p.specs) ?? 0;
      let score = 40;
      if (bay >= driveCount) { const diff = bay - driveCount; score += diff === 0 ? 35 : diff <= 2 ? 25 : 15; }
      else if (bay === driveCount - 1) score += 10;
      else score -= 10;
      if (p.availability?.includes("موجود")) score += 10;
      return { ...p, score: Math.max(0, Math.min(100, score)), bay };
    }).filter((p) => p.score > 30 && p.bay >= driveCount).sort((a, b) => b.score - a.score).slice(0, 4);
  }, [items, driveCount]);

  if (driveCount === 0) return null;
  return (
    <div className="space-y-4">
      <h3 className="text-[18px] font-black">مدل‌های پیشنهادی</h3>
      <p className="text-[12px] text-muted-foreground">بر اساس {driveCount.toLocaleString("fa-IR")} دیسک – مدل‌های واقعی از فروشگاه تکباکس</p>
      {ranked.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">محصولی با مشخصات شما یافت نشد.</p>
      ) : (
        <div className="space-y-3">
          {ranked.map((product, idx) => (
            <Link key={product.slug} href={`/shop/${product.slug}`} className="group block">
              <Card className="overflow-hidden border border-border hover:border-primary/30 transition-colors">
                <div className="flex gap-4 p-4">
                  {product.image && (
                    <div className="relative w-20 h-16 shrink-0 rounded overflow-hidden bg-muted">
                      <Image src={product.image} alt={product.title} fill sizes="80px" className="object-cover" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {idx === 0 && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-bold">⭐ بهترین</span>}
                      {idx === 1 && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground font-bold">🥈 دوم</span>}
                      {idx === 2 && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground font-bold">🥉 سوم</span>}
                      {product.brand && <span className="text-[9px] px-1.5 py-0.5 rounded-full border border-border text-muted-foreground">{product.brand}</span>}
                    </div>
                    <div className="text-sm font-bold mt-1 group-hover:text-primary transition-colors truncate">{product.title}</div>
                    {product.excerpt && <div className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{product.excerpt}</div>}
                    <div className="flex items-center gap-3 mt-1.5 text-[10px] text-muted-foreground">
                      {product.bay > 0 && <span>{product.bay.toLocaleString("fa-IR")} درایو</span>}
                      {product.priceAmount && <span className="font-bold text-primary">{product.priceAmount.toLocaleString("fa-IR")} تومان</span>}
                    </div>
                  </div>
                  <div className="flex flex-col items-center justify-center shrink-0">
                    <div className={`text-lg font-black ${product.score >= 80 ? "text-green-500" : product.score >= 60 ? "text-yellow-500" : "text-muted-foreground"}`}>{product.score}%</div>
                    <div className="text-[10px] text-muted-foreground">تطابق</div>
                  </div>
                  <ArrowLeft className="size-4 shrink-0 text-muted-foreground group-hover:text-primary transition-colors self-center" />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function UsageBar({ result, driveCount }: { result: RaidResult; driveCount: number }) {
  const reservedDecimal = driveCount * 0.01;
  const reservedBinary = toBinary(reservedDecimal);
  const usableBinary = Math.max(0, toBinary(result.usableTb) - reservedBinary);
  const protectionBinary = toBinary(result.protectionTb);
  const unusedBinary = toBinary(result.unusedTb);
  const total = reservedBinary + usableBinary + protectionBinary + unusedBinary || 1;
  const segs = [
    { label: "فضای رزرو سیستم", value: reservedBinary, color: "bg-orange-400" },
    { label: "ظرفیت قابل استفاده", value: usableBinary, color: "bg-emerald-500" },
    { label: "محافظت", value: protectionBinary, color: "bg-blue-600" },
    { label: "فضای بلااستفاده", value: unusedBinary, color: "bg-zinc-300 dark:bg-zinc-600" },
  ].filter((s) => s.value > 0.005);

  return (
    <div className="space-y-3">
      <div className="flex h-12 w-full overflow-hidden rounded-lg bg-muted border shadow-inner">
        {segs.map((s, i) => (
          <Tooltip key={i}>
            <TooltipTrigger render={<div className={cn("h-full transition-all duration-700 ease-out hover:brightness-110 cursor-pointer", s.color)} style={{ width: `${(s.value / total) * 100}%` }} />} />
            <TooltipContent side="top" className="text-[11px]">{s.label}: {formatFaBinary(s.value / BINARY_FACTOR)} ({((s.value / total) * 100).toFixed(1)}٪)</TooltipContent>
          </Tooltip>
        ))}
      </div>
      <div className="flex flex-wrap gap-3 text-[11px]">
        {segs.map((s, i) => (
          <span key={i} className="flex items-center gap-1.5">
            <span className={cn("size-3 rounded-[2px]", s.color)} />
            <span className="text-muted-foreground">{s.label} {s.value > 0 ? `• ${formatFaBinary(s.value / BINARY_FACTOR)}` : ""}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function RaidCalculator() {
  const [drives, setDrives] = useState<Drive[]>([]);
  const [driveType, setDriveType] = useState<"HDD" | "SSD">("HDD");
  const [raid, setRaid] = useState<RaidKey | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingType, setPendingType] = useState<"HDD" | "SSD" | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const currentSizes = driveType === "HDD" ? HDD_SIZES : SSD_SIZES;
  const counts = useMemo(() => {
    const m = new Map<number, number>();
    for (const d of drives) m.set(d.sizeTb, (m.get(d.sizeTb) || 0) + 1);
    return m;
  }, [drives]);

  const addDrive = (sizeTb: number, label: string) => setDrives((prev) => [...prev, { id: uid(), sizeTb, label, type: driveType }]);
  const removeDrive = (id: string) => setDrives((p) => p.filter((d) => d.id !== id));
  const reset = () => { setDrives([]); setRaid(null); setShowResults(false); };

  const result = useMemo(() => raid ? calculateRaid(raid, drives, 0) : null, [raid, drives]);
  const hasDrives = drives.length > 0;
  const hasRaid = raid !== null;
  const selectedOption = raid ? RAID_OPTIONS.find((o) => o.key === raid) : null;
  const locked = showResults;
  const canRecommend = hasDrives && hasRaid;

  const handleRecommend = () => {
    if (!hasRaid || !hasDrives) return;
    setShowResults(true);
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const handleRestart = () => {
    setDrives([]);
    setRaid(null);
    setShowResults(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <TooltipProvider delay={80}>
      <div className="w-full max-w-[1280px] mx-auto space-y-6" dir="rtl">
        {/* Step 1 — Drives */}
        <div className={cn("bg-card text-card-foreground border border-border rounded-xl shadow-sm overflow-hidden transition-opacity", locked && "opacity-50 pointer-events-none")}>
          <div className="px-5 sm:px-6 py-4 border-b bg-muted/30 flex items-center gap-3">
            <span className="inline-flex items-center justify-center rounded-md bg-foreground text-background text-[11px] font-black px-2.5 py-1">مرحله ۱</span>
            <h2 className="text-[16px] sm:text-[18px] font-black">انتخاب دیسک‌ها</h2>
            {locked && <Lock className="size-4 text-muted-foreground mr-auto" />}
          </div>

          <div className="p-5 sm:p-6 space-y-6">
            <div className="flex gap-3">
              {(["HDD", "SSD"] as const).map((t) => (
                <button key={t} onClick={() => {
                  if (t !== driveType && drives.length > 0) { setPendingType(t); setConfirmOpen(true); return; }
                  setDriveType(t);
                }} className={cn(
                  "flex-1 aspect-square max-h-[80px] rounded-xl border-2 flex flex-col items-center justify-center gap-1 transition-all duration-200",
                  driveType === t
                    ? "border-primary bg-primary/10 text-primary shadow-sm"
                    : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                )}>
                  <span className="text-2xl font-black">{t}</span>
                  <span className="text-[10px] font-medium">{t === "HDD" ? "دیسک مکانیکی" : "حافظه حالت جامد"}</span>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2.5">
              {currentSizes.map((o) => {
                const c = counts.get(o.tb) || 0;
                const isSelected = c > 0;
                return (
                  <button key={`${o.tb}-${o.label}`} onClick={() => addDrive(o.tb, o.label)} className={cn("group relative flex items-center justify-between rounded-md border px-3 py-2.5 text-[12px] font-medium transition-all duration-200", "bg-card text-card-foreground border-border hover:border-primary hover:bg-accent hover:text-accent-foreground hover:shadow-sm", isSelected && "bg-primary text-primary-foreground border-primary shadow-sm hover:bg-primary/90")}>
                    <span className="truncate">{o.label}</span>
                    {isSelected ? (
                      <span className="mr-2 inline-flex size-5 items-center justify-center rounded-full bg-primary-foreground text-primary text-[11px] font-black">{c.toLocaleString("fa-IR")}</span>
                    ) : (
                      <span className="mr-2 opacity-0 group-hover:opacity-100 transition text-[10px]">+ افزودن</span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="relative rounded-lg border border-border bg-muted dark:bg-muted/40 p-3 sm:p-4 min-h-[130px] shadow-inner">
              <div className="flex flex-wrap gap-2.5 sm:gap-3">
                {[...drives].sort((a, b) => a.sizeTb - b.sizeTb).map((d) => (
                  <div key={d.id} className={cn("group relative flex h-[92px] w-[84px] flex-col items-center justify-center gap-1 rounded-md border shadow-sm transition-all duration-300 ease-out animate-in fade-in zoom-in-95", d.type === "SSD" ? "bg-primary/10 border-primary/20 text-primary hover:bg-primary/20" : "bg-card border-border text-card-foreground hover:bg-accent hover:text-accent-foreground")}>
                    <HardDrive className={cn("size-6", d.type === "SSD" ? "text-primary" : "text-muted-foreground group-hover:text-accent-foreground")} />
                    <span className="text-[11px] font-bold">{d.label}</span>
                    <span className={cn("text-[9px] px-1.5 py-0.5 rounded-md", d.type === "SSD" ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground")}>{d.type}</span>
                    <button onClick={() => removeDrive(d.id)} className="absolute -top-2 -right-2 size-6 rounded-full bg-background border border-border text-foreground flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 hover:bg-destructive hover:text-destructive-foreground transition-all">
                      <XIcon className="size-3.5" />
                    </button>
                  </div>
                ))}
                {Array.from({ length: Math.max(0, 10 - drives.length) }).map((_, i) => (
                  <div key={`ph-${i}`} className="h-[92px] w-[84px] rounded-md bg-background/60 dark:bg-card/40 border border-dashed border-border/60 transition-all duration-300" />
                ))}
              </div>
              {drives.length === 0 ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 rounded-lg bg-muted/90 dark:bg-muted/70 backdrop-blur-[1px] text-[12px] text-muted-foreground pointer-events-none">
                  <HardDrive className="size-6 opacity-60" />
                  <span>برای شروع، یک ظرفیت از بالا انتخاب کنید</span>
                </div>
              ) : (
                <div className="absolute inset-0 pointer-events-none invisible" />
              )}
            </div>

            <div className="flex items-center justify-between text-[12px] text-muted-foreground pt-1">
              <span>تعداد کل دیسک‌ها: <b className="text-foreground">{drives.length.toLocaleString("fa-IR")}</b></span>
              {!locked && (
                <button onClick={reset} className="rounded-md border border-border px-3 py-1.5 text-[11px] font-medium hover:bg-accent hover:text-accent-foreground transition-colors">بازنشانی</button>
              )}
            </div>
          </div>
        </div>

        {/* Button after step 1 — only when step 2 is NOT visible */}
        {!hasDrives && !locked && (
          <div className="flex justify-center">
            <Tooltip>
              <TooltipTrigger render={
                <Button disabled size="xl" className="gap-2">
                  <Lock className="size-5" />
                  بهترین ذخیره‌ساز بر اساس نیاز شما
                </Button>
              } />
              <TooltipContent>برای مشاهده پیشنهاد محصول مراحل رو کامل کنید</TooltipContent>
            </Tooltip>
          </div>
        )}

        {/* Step 2 — RAID selection */}
        {hasDrives && (
          <div className={cn("bg-[#f6f6f7] dark:bg-muted/20 border border-border rounded-xl overflow-hidden transition-opacity", locked && "opacity-50 pointer-events-none")}>
            <div className="px-5 sm:px-6 py-5 space-y-5">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center justify-center rounded-md bg-foreground text-background text-[11px] font-black px-2.5 py-1">مرحله ۲</span>
                <h2 className="text-[16px] sm:text-[18px] font-black">برآورد فضای قابل استفاده</h2>
                {locked && <Lock className="size-4 text-muted-foreground mr-auto" />}
              </div>

              <div className="bg-card rounded-xl border p-4 sm:p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                  <div className="lg:w-[300px] shrink-0">
                    <div className="grid grid-cols-3 gap-2">
                      {RAID_OPTIONS.map((o) => {
                        const isActive = raid === o.key;
                        return (
                          <Button key={o.key} variant={isActive ? "primary" : "outline"} size="sm" onClick={() => setRaid(o.key)} className={cn("h-auto min-h-[48px] rounded-md px-2 py-3 text-[12px] font-bold flex flex-col gap-0.5 transition-all duration-200", isActive ? "shadow-md scale-[1.02]" : "hover:border-primary/40")}>
                            <span>{o.label}</span>
                            <span className={cn("text-[10px] font-normal", isActive ? "text-primary-foreground/70" : "text-muted-foreground")}>{o.short}</span>
                          </Button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex-1 space-y-4 min-w-0">
                    {result && (
                      <>
                        <UsageBar result={result} driveCount={drives.length} />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 rounded-lg bg-muted/30 border p-4">
                          <div className="space-y-1">
                            <div className="text-[11px] text-muted-foreground">قابل استفاده</div>
                            <div className="text-[14px] font-black">{formatFaBinary(result.usableTb)}</div>
                          </div>
                          <div className="space-y-1">
                            <div className="text-[11px] text-muted-foreground">تحمل خطا</div>
                            <div className="text-[13px] font-bold">{selectedOption?.faultTolerance || result.faultTolerance}</div>
                          </div>
                          <div className="space-y-1">
                            <div className="text-[11px] text-muted-foreground">بازده</div>
                            <div className="text-[13px] font-bold">{nfFa0.format(result.efficiency)}٪</div>
                          </div>
                          <div className="space-y-1">
                            <div className="text-[11px] text-muted-foreground">توضیح</div>
                            <div className="text-[11px] leading-5">{selectedOption?.description}</div>
                          </div>
                        </div>
                        {result.warnings.length > 0 && (
                          <div className="rounded-md bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 p-3 text-[11px] leading-5 text-amber-800 dark:text-amber-200">
                            {result.warnings.map((w, i) => (<div key={i}>⚠ {w}</div>))}
                          </div>
                        )}
                      </>
                    )}
                    {!result && (
                      <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
                        یک نوع RAID انتخاب کنید
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Notes — moved inside step 2 */}
              <div className="rounded-lg bg-muted/30 border p-4 text-[11px] leading-6 text-muted-foreground space-y-2" dir="rtl">
                <p className="font-black text-foreground text-[12px]">یادداشت‌ها:</p>
                <ol className="list-decimal pr-5 space-y-1">
                  <li><b className="text-foreground">فضای رزرو سیستم</b> حدود ۱۰ گیگابایت به ازای هر دیسک برای پارتیشن سیستم و SWAP.</li>
                  <li><b className="text-foreground">ظرفیت قابل استفاده</b> پس از ساخت Volume برای متادیتا ۴٪ در Btrfs و ۲٪ در ext4 کم می‌شود.</li>
                  <li>مدل‌ها بر اساس تعداد Bay واقعی از فروشگاه تکباکس پیشنهاد می‌شوند.</li>
                  <li>اگر دیسک‌ها ظرفیت متفاوت دارند، از SHR/SHR-2 استفاده کنید.</li>
                </ol>
              </div>
            </div>
          </div>
        )}

        {/* Button after step 2 — when step 2 visible but step 3 not */}
        {hasDrives && !locked && (
          <div className="flex justify-center">
            {canRecommend ? (
              <Button onClick={handleRecommend} size="xl" className="gap-2">
                بهترین ذخیره‌ساز بر اساس نیاز شما
              </Button>
            ) : (
              <Tooltip>
                <TooltipTrigger render={
                  <Button disabled size="xl" className="gap-2">
                    <Lock className="size-5" />
                    بهترین ذخیره‌ساز بر اساس نیاز شما
                  </Button>
                } />
                <TooltipContent>برای مشاهده پیشنهاد محصول مراحل رو کامل کنید</TooltipContent>
              </Tooltip>
            )}
          </div>
        )}

        {/* Step 3 — Recommended products */}
        {showResults && (
          <div ref={resultsRef} className="bg-card border rounded-xl p-5 sm:p-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="inline-flex items-center justify-center rounded-md bg-foreground text-background text-[11px] font-black px-2.5 py-1">مرحله ۳</span>
              <h2 className="text-[16px] sm:text-[18px] font-black">بهترین ذخیره‌ساز بر اساس نیاز شما</h2>
            </div>
            <RecommendedModels driveCount={drives.length} />
          </div>
        )}

        {/* Restart button — after step 3 */}
        {locked && (
          <div className="flex justify-center">
            <Button onClick={handleRestart} variant="outline" size="xl" className="gap-2">
              <RotateCcw className="size-4" />
              شروع دوباره
            </Button>
          </div>
        )}

        <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <AlertDialogContent dir="rtl" className="max-w-[360px]">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-[14px] font-black">تغییر نوع دیسک</AlertDialogTitle>
              <AlertDialogDescription className="text-[13px] leading-6">
                تغییر نوع دیسک از <b className="text-foreground">{driveType}</b> به <b className="text-foreground">{pendingType}</b> باعث بازنشانی تنظیمات فعلی میشود
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex-row justify-start gap-2">
              <AlertDialogAction onClick={() => { if (pendingType) { setDrives([]); setDriveType(pendingType); } setConfirmOpen(false); setPendingType(null); }} className="bg-primary text-primary-foreground hover:bg-primary/90 min-w-[100px]">مشکلی نیست</AlertDialogAction>
              <AlertDialogCancel onClick={() => { setConfirmOpen(false); setPendingType(null); }}>انصراف</AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  );
}
