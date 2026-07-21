"use client";

import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { XIcon, PlusIcon, HardDrive } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDbPosts } from "@/hooks/useDbPosts";
import { getModuleItems, type ContentItem } from "@/lib/content";
import Link from "next/link";
import Image from "next/image";
import { blurProps } from "@/lib/image-placeholder";

export type RaidKey = "basic" | "jbod" | "raid0" | "raid1" | "raid5" | "raid6" | "raid10" | "shr1" | "shr2";
export type Drive = { id: string; sizeTb: number };
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
  { key: "basic", label: "Basic", short: "Basic", minDisks: 1, protected: false, description: "هر دیسک مستقل استفاده می‌شود.", faultTolerance: "ندارد" },
  { key: "jbod", label: "JBOD", short: "JBOD", minDisks: 1, protected: false, description: "ترکیب دیسک‌ها در یک Volume.", faultTolerance: "ندارد" },
  { key: "raid0", label: "RAID 0", short: "R0", minDisks: 2, protected: false, description: "Striping برای کارایی.", faultTolerance: "ندارد" },
  { key: "raid1", label: "RAID 1", short: "R1", minDisks: 2, protected: true, description: "Mirror کامل.", faultTolerance: "n-1 دیسک" },
  { key: "raid5", label: "RAID 5", short: "R5", minDisks: 3, protected: true, description: "یک دیسک Parity.", faultTolerance: "۱ دیسک" },
  { key: "raid6", label: "RAID 6", short: "R6", minDisks: 4, protected: true, description: "دو Parity.", faultTolerance: "۲ دیسک" },
  { key: "raid10", label: "RAID 10", short: "R10", minDisks: 4, protected: true, description: "Mirror + Stripe.", faultTolerance: "۱+ دیسک" },
  { key: "shr1", label: "SHR", short: "SHR", minDisks: 2, protected: true, description: "Synology Hybrid RAID – بهینه برای دیسک‌های نامساوی.", faultTolerance: "۱ دیسک" },
  { key: "shr2", label: "SHR-2", short: "SHR2", minDisks: 4, protected: true, description: "SHR با تحمل ۲ دیسک.", faultTolerance: "۲ دیسک" },
];

// Synology size pills - same as screenshot
const DRIVE_SIZE_OPTIONS = [24, 20, 18, 16, 14, 12, 10, 8, 6, 4, 3, 2, 1];

function uid() {
  return `d-${Math.random().toString(36).slice(2, 10)}`;
}
function sum(v: number[]) {
  return v.reduce((a, b) => a + b, 0);
}
const nf = new Intl.NumberFormat("fa-IR", { maximumFractionDigits: 1 });
const nf0 = new Intl.NumberFormat("fa-IR", { maximumFractionDigits: 0 });

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

  if (n < option.minDisks) warnings.push(`حداقل ${option.minDisks} دیسک برای ${option.label} نیاز است.`);
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

// Binary conversion: Synology shows TiB but labels TB (1000^4 / 1024^4 = 0.9094947)
const BINARY_FACTOR = 1000 ** 4 / 1024 ** 4; // 0.909...
function toBinary(tb: number) {
  return tb * BINARY_FACTOR;
}
function formatBinary(tb: number) {
  const b = toBinary(tb);
  if (b <= 0) return "۰";
  if (b < 1) return `${(b * 1000).toFixed(0)} GB`;
  return `${b.toFixed(b >= 10 ? 1 : 2)} TB`;
}

function parseBay(specs: any): number | null {
  if (!specs || typeof specs !== "object") return null;
  const v = specs["Bay"] ?? specs["bay"] ?? specs["Bays"] ?? specs["تعداد Bay"] ?? specs["ظرفیت نصب"];
  if (!v) return null;
  const m = String(v).match(/(\d+)/);
  if (m) return parseInt(m[1], 10);
  return null;
}

function RecommendedModels({ driveCount }: { driveCount: number }) {
  const fallback = getModuleItems("shop");
  const { items: dbItems } = useDbPosts("shop", fallback, 100);
  const items = dbItems.length > 0 ? dbItems : fallback;

  const filtered = useMemo(() => {
    if (driveCount === 0) return [];
    // Consider NAS-like items: brand Synology/QNAP or category NAS or has Bay spec
    const candidates = items.filter((p) => {
      const brand = (p.brand || "").toLowerCase();
      const cat = (p.category || "").toLowerCase();
      const isNasBrand = ["synology", "qnap", "asustor", "terramaster"].some((b) => brand.includes(b));
      const isNasCat = cat.includes("nas") || cat.includes("ذخیره") || cat.includes("شبکه");
      const bay = parseBay(p.specs);
      return (isNasBrand || isNasCat || bay !== null) && (bay === null || bay >= 1);
    });

    const withBay = candidates
      .map((p) => ({ p, bay: parseBay(p.specs) ?? 999 }))
      .filter(({ bay }) => bay >= driveCount)
      .sort((a, b) => a.bay - b.bay)
      .slice(0, 12)
      .map(({ p }) => p);

    // If not enough, fallback to any shop product with image to show at least something real
    if (withBay.length < 3) {
      const anyWithImage = items.filter((p) => p.image).slice(0, 12);
      return withBay.length > 0 ? withBay : anyWithImage;
    }
    return withBay;
  }, [items, driveCount]);

  if (driveCount === 0) return null;
  if (filtered.length === 0) return (
    <div className="rounded-lg border border-dashed p-6 text-center text-[12px] text-muted-foreground">
      هیچ محصول NAS با {driveCount} Bay در فروشگاه یافت نشد. محصولات را از ادمین اضافه کنید.
    </div>
  );

  return (
    <div className="space-y-3">
      <h3 className="text-[16px] font-bold">Recommended models</h3>
      <p className="text-[12px] text-muted-foreground">مدل‌های واقعی از فروشگاه تکباکس بر اساس تعداد دیسک انتخابی ({driveCount} Bay)</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-px bg-border border border-border rounded-lg overflow-hidden">
        {filtered.map((p) => (
          <Link key={`${p.module}-${p.slug}`} href={`/shop/${p.slug}`} className="bg-card p-4 flex flex-col items-center gap-3 hover:bg-accent/50 transition group">
            <div className="relative w-full aspect-square">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.image || "/assets/blog-1.jpg"} alt={p.title} className="w-full h-full object-contain group-hover:scale-105 transition" />
            </div>
            <div className="text-center">
              <div className="text-[12px] font-bold line-clamp-2 leading-5">{p.model || p.title.slice(0, 40)}</div>
              {p.brand && <div className="text-[10px] text-muted-foreground mt-1">{p.brand}</div>}
              {parseBay(p.specs) && <div className="text-[10px] text-muted-foreground">{parseBay(p.specs)} Bay</div>}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function UsageBar({ result, driveCount }: { result: RaidResult; driveCount: number }) {
  // System reserved: 10GB per drive ~ 0.01TB decimal -> binary
  const reservedDecimal = driveCount * 0.01;
  const reservedBinary = toBinary(reservedDecimal);
  const usableBinary = Math.max(0, toBinary(result.usableTb) - reservedBinary);
  const protectionBinary = toBinary(result.protectionTb);
  const unusedBinary = toBinary(result.unusedTb);
  const totalBinary = reservedBinary + usableBinary + protectionBinary + unusedBinary || 1;

  const segs = [
    { label: "Reserved capacity for system", value: reservedBinary, color: "bg-[#f5a623]" },
    { label: "Available capacity", value: usableBinary, color: "bg-[#38c172] dark:bg-[#2ecc9a]" },
    { label: "Protection", value: protectionBinary, color: "bg-[#2d7ff9]" },
    { label: "Unused space", value: unusedBinary, color: "bg-[#d8d8d8] dark:bg-zinc-600" },
  ].filter((s) => s.value > 0.001);

  return (
    <div className="space-y-2">
      <div className="flex h-6 w-full overflow-hidden rounded-sm bg-muted">
        {segs.map((s, i) => (
          <div
            key={i}
            className={cn("h-full transition-all", s.color)}
            style={{ width: `${(s.value / totalBinary) * 100}%` }}
            title={`${s.label}: ${s.value.toFixed(2)} TB`}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-3 text-[10px] text-muted-foreground">
        {segs.map((s, i) => (
          <span key={i} className="flex items-center gap-1.5">
            <span className={cn("size-2 rounded-sm", s.color)} />
            {s.label} {s.value > 0 ? `(${s.value.toFixed(1)} TB)` : ""}
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

  const counts = useMemo(() => {
    const m = new Map<number, number>();
    for (const d of drives) m.set(d.sizeTb, (m.get(d.sizeTb) || 0) + 1);
    return m;
  }, [drives]);

  const addDrive = (size: number) => {
    setDrives((prev) => [...prev, { id: uid(), sizeTb: size }]);
  };
  const removeDrive = (id: string) => {
    setDrives((prev) => prev.filter((d) => d.id !== id));
  };
  const reset = () => setDrives([]);

  const resultA = useMemo(() => calculateRaid(raidA, drives, 0), [raidA, drives]);
  const resultB = useMemo(() => calculateRaid(raidB, drives, 0), [raidB, drives]);

  const hasDrives = drives.length > 0;

  return (
    <div className="w-full max-w-[1280px] mx-auto space-y-8" dir="ltr">
      {/* Step 1 */}
      <div className="bg-card border border-border rounded-lg shadow-sm">
        <div className="p-5 sm:p-6 border-b">
          <h2 className="flex items-center gap-3 text-[16px] font-bold">
            <span className="inline-flex items-center justify-center rounded bg-foreground text-background text-[11px] font-bold px-2 py-0.5">Step 1</span>
            Select drives
          </h2>
        </div>

        <div className="p-5 sm:p-6 space-y-5">
          <div className="flex gap-2 border-b">
            {(["HDD", "SSD"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setDriveType(t)}
                className={cn(
                  "px-4 py-2 text-[13px] font-medium border-b-2 -mb-px",
                  driveType === t ? "border-foreground text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-2">
            {DRIVE_SIZE_OPTIONS.map((sz) => {
              const c = counts.get(sz) || 0;
              return (
                <button
                  key={sz}
                  onClick={() => addDrive(sz)}
                  className={cn(
                    "relative flex items-center justify-between rounded-sm border bg-muted/30 px-3 py-2.5 text-[12px] hover:bg-muted transition",
                    c > 0 && "bg-foreground text-background border-foreground"
                  )}
                >
                  <span>{sz} TB</span>
                  {c > 0 && <span className="ml-2 inline-flex size-5 items-center justify-center rounded-full bg-background text-foreground text-[11px] font-bold">{c}</span>}
                </button>
              );
            })}
          </div>

          <div className="rounded-md bg-[#2f333a] dark:bg-[#1e2126] p-3 sm:p-4 min-h-[112px]">
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {drives.length === 0 ? (
                <div className="w-full h-[80px] flex items-center justify-center text-[12px] text-white/40">
                  برای شروع، یک سایز دیسک از بالا انتخاب کنید — لیست دیسک‌های انتخابی اینجا نمایش داده می‌شود.
                </div>
              ) : (
                drives.map((d) => (
                  <div key={d.id} className="group relative flex h-[84px] w-[76px] flex-col items-center justify-center rounded-sm bg-[#3a3e47] text-white border border-white/10 hover:border-white/20">
                    <HardDrive className="size-6 mb-1 text-white/70" />
                    <span className="text-[11px] font-bold">{d.sizeTb} TB</span>
                    <button onClick={() => removeDrive(d.id)} className="absolute -top-1.5 -right-1.5 size-5 rounded-full bg-white text-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                      <XIcon className="size-3" />
                    </button>
                  </div>
                ))
              )}
              {/* empty placeholders like Synology */}
              {Array.from({ length: Math.max(0, 12 - drives.length) }).map((_, i) => (
                <div key={`ph-${i}`} className="h-[84px] w-[76px] rounded-sm bg-white/[0.04] border border-dashed border-white/10" />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between text-[12px] text-muted-foreground">
            <span>Total number of drives: {drives.length}</span>
            <button onClick={reset} className="hover:text-foreground underline underline-offset-4">Reset</button>
          </div>
        </div>
      </div>

      {/* Step 2 - appears when drives selected */}
      {hasDrives && (
        <div className="bg-[#f5f5f5] dark:bg-muted/20 border border-border rounded-lg">
          <div className="p-5 sm:p-6">
            <h2 className="flex items-center gap-3 text-[16px] font-bold">
              <span className="inline-flex items-center justify-center rounded bg-foreground text-background text-[11px] font-bold px-2 py-0.5">Step 2</span>
              Usage estimate
            </h2>
            <a href="#" className="mt-2 inline-flex text-[11px] text-[#2d7ff9] hover:underline">
              Learn more about RAID types ↗
            </a>

            <div className="mt-6 space-y-6">
              {/* RAID A row */}
              <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                <div className="sm:w-[140px] shrink-0">
                  <Select value={raidA} onValueChange={(v) => setRaidA(v as RaidKey)}>
                    <SelectTrigger className="h-8 text-[12px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {RAID_OPTIONS.map((o) => (
                        <SelectItem key={o.key} value={o.key} className="text-[12px]">
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center justify-center rounded-sm bg-muted px-1.5 py-0.5 text-[10px] font-bold border">
                      {resultA.valid ? RAID_OPTIONS.find((o) => o.key === raidA)?.short : "!"}
                    </span>
                    <div className="flex-1">
                      <UsageBar result={resultA} driveCount={drives.length} />
                    </div>
                  </div>
                  <div className="flex gap-2 text-[10px] text-muted-foreground">
                    <span>Usable: {formatBinary(resultA.usableTb)} • Fault: {resultA.faultTolerance} • Eff: {nf0.format(resultA.efficiency)}%</span>
                    {resultA.warnings.length > 0 && <span className="text-amber-600">{resultA.warnings[0]}</span>}
                  </div>
                </div>
              </div>

              {/* RAID B row */}
              <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                <div className="sm:w-[140px] shrink-0">
                  <Select value={raidB} onValueChange={(v) => setRaidB(v as RaidKey)}>
                    <SelectTrigger className="h-8 text-[12px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {RAID_OPTIONS.map((o) => (
                        <SelectItem key={o.key} value={o.key} className="text-[12px]">
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center justify-center rounded-sm bg-muted px-1.5 py-0.5 text-[10px] font-bold border">
                      {resultB.valid ? RAID_OPTIONS.find((o) => o.key === raidB)?.short : "!"}
                    </span>
                    <div className="flex-1">
                      <UsageBar result={resultB} driveCount={drives.length} />
                    </div>
                  </div>
                  <div className="flex gap-2 text-[10px] text-muted-foreground">
                    <span>Usable: {formatBinary(resultB.usableTb)} • Fault: {resultB.faultTolerance}</span>
                    {resultB.warnings.length > 0 && <span className="text-amber-600">{resultB.warnings[0]}</span>}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 text-[10px] text-muted-foreground">
              Results of Synology RAID Calculator are based on a binary storage calculation, not decimal. • Raw: {formatBinary(resultA.rawTb || resultB.rawTb)} • System reserved ~10GB/drive
            </div>
          </div>
        </div>
      )}

      {/* Recommended models — real shop products */}
      {hasDrives && (
        <div className="space-y-4">
          <RecommendedModels driveCount={drives.length} />
        </div>
      )}

      {/* Notes like Synology */}
      <div className="rounded-lg bg-muted/40 border p-4 text-[11px] leading-5 text-muted-foreground space-y-2">
        <p className="font-bold text-foreground">Notes:</p>
        <ol className="list-decimal pl-4 space-y-1">
          <li>
            <span className="font-medium">Reserved capacity for system</span> is ~10GB per drive for OS/SWAP. {" "}
            <span className="text-[10px]">Similar to Synology KB.</span>
          </li>
          <li>
            <span className="font-medium">Available capacity</span> after RAID loses 4% for Btrfs metadata, 2% for ext4. Actual data space less than estimate.
          </li>
          <li>
            Synology RAID Calculator recommends models based on total bays. We use real products from your /shop (Brand Synology/QNAP or Bay spec) filtered by bay count ≥ {drives.length}.
          </li>
          <li>RAID types and max single volume capacity vary by model. Check DataSheet of each NAS.</li>
          <li>If using different capacities, use SHR/SHR-2 to minimize unused space — like Synology Hybrid RAID.</li>
        </ol>
      </div>
    </div>
  );
}
