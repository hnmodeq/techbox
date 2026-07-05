"use client";

import React, { useMemo, useState } from "react";
import { Icon } from "@/design/icons";

export type RaidKey =
  | "basic"
  | "jbod"
  | "raid0"
  | "raid1"
  | "raid5"
  | "raid6"
  | "raid10"
  | "shr1"
  | "shr2";

export type Drive = {
  id: string;
  sizeTb: number;
};

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
  maxDisks?: number;
  protected: boolean;
  description: string;
  faultTolerance: string;
};

export const RAID_OPTIONS: RaidOption[] = [
  { key: "basic", label: "Basic", short: "Basic", minDisks: 1, protected: false, description: "هر دیسک به‌صورت مستقل استفاده می‌شود؛ بیشترین ظرفیت، بدون افزونگی.", faultTolerance: "ندارد" },
  { key: "jbod", label: "JBOD", short: "JBOD", minDisks: 1, protected: false, description: "ترکیب ظرفیت دیسک‌ها در یک Volume پیوسته؛ خرابی یک دیسک می‌تواند داده‌ها را از بین ببرد.", faultTolerance: "ندارد" },
  { key: "raid0", label: "RAID 0", short: "R0", minDisks: 2, protected: false, description: "Striping برای کارایی بالا؛ بدون تحمل خرابی دیسک.", faultTolerance: "ندارد" },
  { key: "raid1", label: "RAID 1", short: "R1", minDisks: 2, protected: true, description: "Mirror کامل بین دیسک‌ها؛ مناسب داده‌های مهم با ظرفیت کمتر.", faultTolerance: "تا خرابی همه دیسک‌ها به‌جز یک دیسک" },
  { key: "raid5", label: "RAID 5", short: "R5", minDisks: 3, protected: true, description: "ترکیب ظرفیت و افزونگی با یک دیسک Parity.", faultTolerance: "خرابی ۱ دیسک" },
  { key: "raid6", label: "RAID 6", short: "R6", minDisks: 4, protected: true, description: "دو Parity برای امنیت بیشتر؛ مناسب آرایه‌های بزرگ‌تر.", faultTolerance: "خرابی ۲ دیسک" },
  { key: "raid10", label: "RAID 10", short: "R10", minDisks: 4, protected: true, description: "Mirror + Stripe برای کارایی و افزونگی؛ نیازمند تعداد دیسک زوج.", faultTolerance: "حداقل ۱ دیسک، بسته به جفت Mirror" },
  { key: "shr1", label: "SHR-1", short: "SHR1", minDisks: 2, protected: true, description: "Synology Hybrid RAID با تحمل خرابی یک دیسک و استفاده بهتر از دیسک‌های نامساوی.", faultTolerance: "خرابی ۱ دیسک" },
  { key: "shr2", label: "SHR-2", short: "SHR2", minDisks: 4, protected: true, description: "SHR با تحمل خرابی دو دیسک؛ مناسب ظرفیت‌های بالا و آرایه‌های حساس.", faultTolerance: "خرابی ۲ دیسک" },
];

const QUICK_SIZES = [1, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24];
const DEFAULT_DRIVES: Drive[] = [
  { id: "d-1", sizeTb: 8 },
  { id: "d-2", sizeTb: 8 },
  { id: "d-3", sizeTb: 8 },
  { id: "d-4", sizeTb: 8 },
];

const nf = new Intl.NumberFormat("fa-IR", { maximumFractionDigits: 2 });
const pf = new Intl.NumberFormat("fa-IR", { maximumFractionDigits: 0 });

function uid() {
  return `d-${Math.random().toString(36).slice(2, 10)}`;
}
function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}
function sum(values: number[]) {
  return values.reduce((acc, item) => acc + item, 0);
}
function formatTb(value: number) {
  if (!Number.isFinite(value) || value <= 0) return "۰ ترابایت";
  return `${nf.format(value)} ترابایت`;
}

function calculateShr(sizes: number[], parityDisks: 1 | 2) {
  const sorted = [...sizes].filter(Boolean).sort((a, b) => a - b);
  const raw = sum(sorted);
  let usable = 0;
  let protection = 0;
  let unused = 0;
  let previous = 0;

  for (const boundary of sorted) {
    const slice = boundary - previous;
    if (slice <= 0) continue;
    const members = sorted.filter((size) => size >= boundary).length;

    if (parityDisks === 1) {
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
    previous = boundary;
  }
  const roundingGap = raw - usable - protection - unused;
  if (Math.abs(roundingGap) > 0.00001) unused += roundingGap;
  return { usable, protection, unused };
}

export function calculateRaid(raidKey: RaidKey, drives: Drive[], spareCount: number): RaidResult {
  const option = RAID_OPTIONS.find((item) => item.key === raidKey);
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
      faultTolerance: "انتخاب نشده",
      efficiency: 0,
    };
  }

  const allSizes = drives.map((drive) => Number(drive.sizeTb)).filter((size) => size > 0);
  const rawTb = sum(allSizes);
  const sortedDesc = [...allSizes].sort((a, b) => b - a);
  const spareSizes = sortedDesc.slice(0, clamp(spareCount, 0, Math.max(0, sortedDesc.length - 1)));
  const activeSizes = sortedDesc.slice(spareSizes.length);
  const activeRawTb = sum(activeSizes);
  const spareTb = sum(spareSizes);
  const n = activeSizes.length;
  const min = n ? Math.min(...activeSizes) : 0;
  const warnings: string[] = [];

  let usableTb = 0;
  let protectionTb = 0;
  let unusedTb = 0;

  if (n < option.minDisks) {
    warnings.push(`برای ${option.label} حداقل ${nf.format(option.minDisks)} دیسک فعال لازم است.`);
  }
  if (raidKey === "raid10" && n % 2 !== 0) {
    warnings.push("RAID 10 به تعداد دیسک زوج نیاز دارد؛ یک دیسک اضافه باعث عدم اعتبار آرایه می‌شود.");
  }

  switch (raidKey) {
    case "basic":
    case "jbod": {
      usableTb = activeRawTb;
      break;
    }
    case "raid0": {
      usableTb = n >= 2 ? min * n : 0;
      unusedTb = Math.max(0, activeRawTb - usableTb);
      break;
    }
    case "raid1": {
      usableTb = n >= 2 ? min : 0;
      protectionTb = n >= 2 ? min * (n - 1) : 0;
      unusedTb = Math.max(0, activeRawTb - usableTb - protectionTb);
      break;
    }
    case "raid5": {
      usableTb = n >= 3 ? min * (n - 1) : 0;
      protectionTb = n >= 3 ? min : 0;
      unusedTb = Math.max(0, activeRawTb - usableTb - protectionTb);
      break;
    }
    case "raid6": {
      usableTb = n >= 4 ? min * (n - 2) : 0;
      protectionTb = n >= 4 ? min * 2 : 0;
      unusedTb = Math.max(0, activeRawTb - usableTb - protectionTb);
      break;
    }
    case "raid10": {
      usableTb = n >= 4 && n % 2 === 0 ? min * (n / 2) : 0;
      protectionTb = n >= 4 && n % 2 === 0 ? min * (n / 2) : 0;
      unusedTb = Math.max(0, activeRawTb - usableTb - protectionTb);
      break;
    }
    case "shr1": {
      if (n >= 2) {
        const shr = calculateShr(activeSizes, 1);
        usableTb = shr.usable;
        protectionTb = shr.protection;
        unusedTb = shr.unused;
      }
      break;
    }
    case "shr2": {
      if (n >= 4) {
        const shr = calculateShr(activeSizes, 2);
        usableTb = shr.usable;
        protectionTb = shr.protection;
        unusedTb = shr.unused;
      }
      break;
    }
  }

  if (["raid0", "raid1", "raid5", "raid6", "raid10"].includes(raidKey)) {
    const uniqueSizes = new Set(activeSizes);
    if (uniqueSizes.size > 1) {
      warnings.push("در RAID کلاسیک، ظرفیت قابل استفاده بر اساس کوچک‌ترین دیسک محاسبه می‌شود و بخشی از دیسک‌های بزرگ‌تر بلااستفاده می‌ماند.");
    }
  }
  if ((raidKey === "shr1" || raidKey === "shr2") && unusedTb > 0) {
    warnings.push("به‌دلیل ترکیب ظرفیت‌ها، بخشی از فضا در این چیدمان قابل استفاده نیست. افزودن دیسک هم‌اندازه می‌تواند آن را فعال کند.");
  }

  const valid = warnings.every((warning) => !warning.includes("حداقل") && !warning.includes("زوج"));
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

function Segment({ label, value, total, className }: { label: string; value: number; total: number; className: string; }) {
  const width = total > 0 ? Math.max(value > 0 ? 2 : 0, (value / total) * 100) : 0;
  return <div className={className} style={{ width: `${width}%` }} title={`${label}: ${formatTb(value)}`} aria-label={`${label}: ${formatTb(value)}`} />;
}

function StatCard({ label, value, hint, tone = "default" }: { label: string; value: string; hint: string; tone?: "default" | "accent" | "success" | "warning" }) {
  const toneClass =
    tone === "accent" ? "text-[var(--tb-raid)]"
    : tone === "success" ? "text-[var(--tb-success)]"
    : tone === "warning" ? "text-[var(--tb-warning)]"
    : "text-[var(--primary-text)]";
  return (
    <div className="rounded-[var(--corner-radius)] border border-[var(--border-color)] bg-[var(--muted-background)]/70 p-4">
      <div className="text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] paragraph-color">{label}</div>
      <div className={`mt-2 text-2xl font-black leading-none ${toneClass}`}>{value}</div>
      <div className="mt-2 text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] paragraph-color">{hint}</div>
    </div>
  );
}

export default function RaidCalculator() {
  const [drives, setDrives] = useState<Drive[]>(DEFAULT_DRIVES);
  const [raid, setRaid] = useState<RaidKey | "">("");
  const [spareCount, setSpareCount] = useState(0);

  const result = useMemo(() => calculateRaid(raid as RaidKey, drives, spareCount), [raid, drives, spareCount]);
  const selectedOption = RAID_OPTIONS.find((item) => item.key === raid);
  const canRemove = drives.length > 1;
  const effectiveSpareMax = Math.max(0, drives.length - 1);
  const barTotal = Math.max(result.activeRawTb + result.spareTb, result.rawTb, 1);

  function addDrive(sizeTb = 8) {
    setDrives((current) => [...current, { id: uid(), sizeTb: clamp(Number(sizeTb) || 1, 0.1, 100) }]);
  }
  function updateDrive(id: string, sizeTb: number) {
    setDrives((current) => current.map((drive) => (drive.id === id ? { ...drive, sizeTb: clamp(Number(sizeTb) || 0.1, 0.1, 100) } : drive)));
  }
  function removeDrive(id: string) {
    setDrives((current) => (current.length <= 1 ? current : current.filter((drive) => drive.id !== id)));
    setSpareCount((current) => clamp(current, 0, Math.max(0, drives.length - 2)));
  }
  function applyPreset(sizeTb: number, count: number) {
    setDrives(Array.from({ length: count }, () => ({ id: uid(), sizeTb })));
    setSpareCount(0);
  }

  return (
    <section dir="rtl" className="w-full font-sans text-[var(--primary-text)]">
      <div className="relative overflow-hidden rounded-[calc(var(--corner-radius)+8px)] border border-[var(--border-color)] bg-[var(--card-background)] shadow-[var(--shadow-size)]">
        <div className="pointer-events-none absolute inset-0 opacity-70 [background:radial-gradient(circle_at_12%_8%,color-mix(in_oklch,var(--tb-raid)_22%,transparent),transparent_32%),radial-gradient(circle_at_88%_0%,color-mix(in_oklch,var(--home)_18%,transparent),transparent_34%)]" />

        {/* Vertical stack or wide split: Top panel for tool options, bottom panel for results */}
        <div className="relative grid gap-6 p-4 sm:p-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(420px,0.85fr)] lg:p-8">
          <div className="space-y-6">
            <header className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="badge mb-3 border-[color-mix(in_oklch,var(--tb-raid)_35%,var(--border-color))] bg-[color-mix(in_oklch,var(--tb-raid)_12%,var(--muted-background))] text-[var(--primary-text)]">
                  <Icon name="server" className="h-3.5 w-3.5 text-[var(--tb-raid)]" />
                  ابزار محاسبه RAID
                </div>
                <h2 className="text-[length:var(--h1-font-size)] text-[var(--h1-font-color)] font-extrabold">ماشین حساب RAID و SHR</h2>
                <p className="mt-3 max-w-2xl text-[length:var(--h3-font-size)] text-[var(--h3-font-color)] font-semibold paragraph-color">
                  ظرفیت قابل استفاده، افزونگی، فضای بلااستفاده و Hot Spare را برای RAIDهای کلاسیک و Synology Hybrid RAID با دیسک‌های هم‌اندازه یا ترکیبی محاسبه کنید.
                </p>
              </div>
              <button type="button" onClick={() => applyPreset(8, 4)} className="btn btn-ghost shrink-0">
                بازنشانی نمونه ۴ دیسک ۸ ترابایت
              </button>
            </header>

            <div className="card p-5 shadow-[var(--shadow-size)]">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-[length:var(--h2-font-size)] text-[var(--h2-font-color)] font-bold font-black">انتخاب دیسک‌ها</h3>
                  <p className="text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] paragraph-color">برای افزودن دیسک جدید روی دکمه + کلیک کنید و ظرفیت مورد نظر را از منو انتخاب نمایید.</p>
                </div>
                <div className="badge">{nf.format(drives.length)} دیسک فعال</div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 items-center">
                {drives.map((drive, index) => (
                  <div key={drive.id} className="group rounded-[var(--corner-radius)] border border-[var(--border-color)] bg-[var(--card-background)] p-3.5 transition hover:border-[color-mix(in_oklch,var(--tb-raid)_42%,var(--border-color))]">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 font-black">
                        <span className="flex h-8 w-8 items-center justify-center rounded-[var(--corner-radius)] bg-[color-mix(in_oklch,var(--tb-raid)_15%,var(--muted-background))] text-[var(--tb-raid)]">
                          <Icon name="disk" className="h-4.5 w-4.5" />
                        </span>
                        دیسک {nf.format(index + 1)}
                      </div>
                      <button
                        type="button"
                        disabled={!canRemove}
                        onClick={() => removeDrive(drive.id)}
                        className="icon-rail-btn h-7 w-7 disabled:cursor-not-allowed disabled:opacity-40"
                        aria-label="حذف دیسک"
                      >
                        <Icon name="close" className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        className="input w-full font-black [direction:ltr]"
                        value={drive.sizeTb}
                        onChange={(event) => updateDrive(drive.id, Number(event.target.value))}
                        aria-label={`ظرفیت دیسک ${index + 1}`}
                      >
                        {[2, 4, 8, 12, 16, 24, 32].map(sz => (
                          <option key={sz} value={sz}>{sz} TB</option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}

                {/* Big Plus Button to Add Disk */}
                <button
                  type="button"
                  onClick={() => addDrive(8)}
                  className="h-full min-h-[110px] rounded-[var(--corner-radius)] border-2 border-dashed border-[var(--tb-raid)]/50 bg-[var(--tb-raid)]/5 hover:bg-[var(--tb-raid)]/15 transition-all flex flex-col items-center justify-center gap-2 text-[var(--tb-raid)] font-black p-4 cursor-pointer hover:scale-[1.02]"
                >
                  <Icon name="plus" className="h-8 w-8 stroke-[3]" />
                  <span className="text-sm">افزودن دیسک جدید</span>
                </button>
              </div>
            </div>

            <div className="card p-5 shadow-[var(--shadow-size)]">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-[length:var(--h2-font-size)] text-[var(--h2-font-color)] font-bold font-black">انتخاب نوع RAID</h3>
                  <p className="text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] paragraph-color">معماری و نوع آرایه دیسک را از منوی کشویی انتخاب کنید.</p>
                </div>
              </div>

              <div className="max-w-xl">
                <select
                  value={raid}
                  onChange={(e) => setRaid(e.target.value as RaidKey)}
                  className="input w-full !h-12 font-bold text-base"
                >
                  <option value="">-- انتخاب نوع آرایه RAID یا SHR --</option>
                  {RAID_OPTIONS.map((option) => (
                    <option key={option.key} value={option.key}>
                      {option.label} — حداقل {nf.format(option.minDisks)} دیسک · {option.faultTolerance}
                    </option>
                  ))}
                </select>
                {selectedOption && (
                  <div className="mt-3.5 p-3.5 rounded-lg bg-[var(--muted-background)] border border-[var(--border-color)] text-sm leading-6 text-[var(--primary-text)]">
                    <span className="font-extrabold text-[var(--tb-raid)]">{selectedOption.label}: </span>
                    {selectedOption.description}
                  </div>
                )}
              </div>

              <div className="mt-5 rounded-[var(--corner-radius)] border border-[var(--border-color)] bg-[var(--muted-background)]/60 p-4">
                <label className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <span>
                    <span className="block font-black">دیسک رزرو (Hot Spare)</span>
                    <span className="block text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] paragraph-color">بزرگ‌ترین دیسک‌ها به‌عنوان Spare رزرو می‌شوند و وارد ظرفیت Volume نمی‌شوند.</span>
                  </span>
                  <span className="flex items-center gap-2">
                    <button type="button" className="icon-rail-btn" onClick={() => setSpareCount((value) => clamp(value - 1, 0, effectiveSpareMax))}>
                      <Icon name="minus" className="h-4 w-4" />
                    </button>
                    <input
                      className="input w-20 text-center font-black"
                      type="number"
                      min={0}
                      max={effectiveSpareMax}
                      value={spareCount}
                      onChange={(event) => setSpareCount(clamp(Number(event.target.value), 0, effectiveSpareMax))}
                    />
                    <button type="button" className="icon-rail-btn" onClick={() => setSpareCount((value) => clamp(value + 1, 0, effectiveSpareMax))}>
                      <Icon name="plus" className="h-4 w-4" />
                    </button>
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Results section positioned BELOW the tool */}
          <div className="border-t border-[var(--border-color)] pt-4">
            {!raid || !selectedOption ? (
              <div className="my-6 text-center p-8 rounded-[var(--corner-radius)] border border-dashed border-[var(--border-color)] bg-[var(--muted-background)]/40">
                <Icon name="disk" className="h-10 w-10 mx-auto paragraph-color mb-3 opacity-60" />
                <p className="text-[length:var(--h3-font-size)] text-[var(--h3-font-color)] font-semibold font-bold text-[var(--primary-text)]">هیچ نوع RAID انتخاب نشده است</p>
                <p className="mt-2 text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] paragraph-color max-w-md mx-auto">
                  لطفاً برای مشاهده نتیجه محاسبه، نقشه ظرفیت و تحلیل راندمان، یکی از انواع RAID یا SHR را از گزینه‌های بالا انتخاب کنید.
                </p>
              </div>
            ) : (
              <div className="card overflow-hidden p-0 shadow-[var(--shadow-size)]">
                <div className="border-b border-[var(--border-color)] bg-[color-mix(in_oklch,var(--tb-raid)_10%,var(--card-background))] p-6">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] font-bold paragraph-color">نتیجه نهایی محاسبه برای</div>
                      <div className="mt-1 text-3xl font-black text-[var(--tb-raid)]">{selectedOption.label}</div>
                    </div>
                    <div className={`badge ${result.valid ? "border-[color-mix(in_oklch,var(--tb-success)_40%,var(--border-color))] text-[var(--tb-success)]" : "border-[color-mix(in_oklch,var(--tb-danger)_40%,var(--border-color))] text-[var(--tb-danger)]"}`}>
                      {result.valid ? "پیکربندی معتبر" : "نیازمند اصلاح دیسک‌ها"}
                    </div>
                  </div>
                  <p className="mt-3 text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] paragraph-color">{result.description}</p>
                </div>

                <div className="space-y-6 p-6">
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard label="ظرفیت قابل استفاده" value={formatTb(result.usableTb)} hint="فضای نهایی Volume" tone="accent" />
                    <StatCard label="بازده ظرفیت" value={`${pf.format(result.efficiency)}٪`} hint="نسبت به دیسک‌های فعال" tone="success" />
                    <StatCard label="حفاظت / Parity" value={formatTb(result.protectionTb)} hint={result.faultTolerance} />
                    <StatCard label="بلااستفاده + Spare" value={formatTb(result.unusedTb + result.spareTb)} hint="فضای رزرو یا غیرقابل استفاده" tone="warning" />
                  </div>

                  <div>
                    <div className="mb-2 flex items-center justify-between text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] font-bold">
                      <span>نقشه توزیع ظرفیت</span>
                      <span className="paragraph-color">ظرفیت خام کل: {formatTb(result.rawTb)}</span>
                    </div>
                    <div className="flex h-6 overflow-hidden rounded-[var(--corner-radius)] border border-[var(--border-color)] bg-[var(--muted-background)] shadow-inner" aria-label="نمودار ظرفیت RAID">
                      <Segment label="قابل استفاده" value={result.usableTb} total={barTotal} className="bg-[var(--tb-raid)]" />
                      <Segment label="حفاظت" value={result.protectionTb} total={barTotal} className="bg-[var(--tb-success)]" />
                      <Segment label="بلااستفاده" value={result.unusedTb} total={barTotal} className="bg-[var(--tb-warning)]" />
                      <Segment label="Hot Spare" value={result.spareTb} total={barTotal} className="bg-[var(--paragraph-color)]" />
                    </div>
                    <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] paragraph-color">
                      <span className="flex items-center gap-2"><i className="h-3 w-3 rounded-full bg-[var(--tb-raid)]" /> قابل استفاده</span>
                      <span className="flex items-center gap-2"><i className="h-3 w-3 rounded-full bg-[var(--tb-success)]" /> حفاظت</span>
                      <span className="flex items-center gap-2"><i className="h-3 w-3 rounded-full bg-[var(--tb-warning)]" /> بلااستفاده</span>
                      <span className="flex items-center gap-2"><i className="h-3 w-3 rounded-full bg-[var(--paragraph-color)]" /> Spare</span>
                    </div>
                  </div>

                  <div className="rounded-[var(--corner-radius)] border border-[var(--border-color)] bg-[var(--muted-background)]/60 p-5">
                    <div className="mb-3 flex items-center gap-2 font-black text-[16px]">
                      <Icon name="shield" className="h-5 w-5 text-[var(--tb-raid)]" />
                      خلاصه فنی پیکربندی
                    </div>
                    <dl className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)]">
                      <div>
                        <dt className="paragraph-color">دیسک فعال</dt>
                        <dd className="mt-1 font-black text-[16px]">{nf.format(drives.length - spareCount)} عدد</dd>
                      </div>
                      <div>
                        <dt className="paragraph-color">Hot Spare</dt>
                        <dd className="mt-1 font-black text-[16px]">{nf.format(spareCount)} عدد</dd>
                      </div>
                      <div>
                        <dt className="paragraph-color">ظرفیت خام فعال</dt>
                        <dd className="mt-1 font-black text-[16px]">{formatTb(result.activeRawTb)}</dd>
                      </div>
                      <div>
                        <dt className="paragraph-color">تحمل خرابی</dt>
                        <dd className="mt-1 font-black text-[16px]">{result.faultTolerance}</dd>
                      </div>
                    </dl>
                  </div>

                  {result.warnings.length > 0 ? (
                    <div className="space-y-2">
                      {result.warnings.map((warning) => (
                        <div key={warning} className="rounded-[var(--corner-radius)] border border-[color-mix(in_oklch,var(--tb-warning)_35%,var(--border-color))] bg-[color-mix(in_oklch,var(--tb-warning)_11%,var(--card-background))] p-3.5 text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] text-[var(--primary-text)]">
                          {warning}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-[var(--corner-radius)] border border-[color-mix(in_oklch,var(--tb-success)_35%,var(--border-color))] bg-[color-mix(in_oklch,var(--tb-success)_10%,var(--card-background))] p-3.5 text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] text-[var(--primary-text)] font-bold">
                      این چیدمان از نظر تعداد دیسک معتبر است و ظرفیت بدون هیچ هشداری محاسبه شد.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
