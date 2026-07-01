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
  if (!Number.isFinite(value) || value <= 0) return "۰ TB";
  return `${nf.format(value)} TB`;
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
  const option = RAID_OPTIONS.find((item) => item.key === raidKey)!;
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
    : "text-[var(--tb-fg-primary)]";
  return (
    <div className="rounded-[var(--tb-radius-md)] border border-[var(--tb-border)] bg-[var(--tb-bg-muted)]/70 p-4">
      <div className="tb-text-sm text-[var(--tb-fg-muted)]">{label}</div>
      <div className={`mt-2 text-2xl font-black leading-none ${toneClass}`}>{value}</div>
      <div className="mt-2 tb-text-sm text-[var(--tb-fg-muted)]">{hint}</div>
    </div>
  );
}

export default function RaidCalculator() {
  const [drives, setDrives] = useState<Drive[]>(DEFAULT_DRIVES);
  const [raid, setRaid] = useState<RaidKey>("shr1");
  const [spareCount, setSpareCount] = useState(0);
  const [customSize, setCustomSize] = useState(8);

  const result = useMemo(() => calculateRaid(raid, drives, spareCount), [raid, drives, spareCount]);
  const selectedOption = RAID_OPTIONS.find((item) => item.key === raid)!;
  const canRemove = drives.length > 1;
  const effectiveSpareMax = Math.max(0, drives.length - 1);
  const barTotal = Math.max(result.activeRawTb + result.spareTb, result.rawTb, 1);

  function addDrive(sizeTb = customSize) {
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
    setCustomSize(sizeTb);
    setSpareCount(0);
  }

  return (
    <section dir="rtl" className="w-full font-sans text-[var(--tb-fg-primary)]">
      <div className="relative overflow-hidden rounded-[calc(var(--tb-radius-lg)+8px)] border border-[var(--tb-border)] bg-[var(--tb-bg-secondary)] shadow-[var(--tb-shadow-lg)]">
        <div className="pointer-events-none absolute inset-0 opacity-70 [background:radial-gradient(circle_at_12%_8%,color-mix(in_oklch,var(--tb-raid)_22%,transparent),transparent_32%),radial-gradient(circle_at_88%_0%,color-mix(in_oklch,var(--tb-primary)_18%,transparent),transparent_34%)]" />

        <div className="relative grid gap-6 p-4 sm:p-6 lg:grid-cols-[minmax(0,1.08fr)_minmax(360px,.92fr)] lg:p-7">
          <div className="space-y-5">
            <header className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="badge mb-3 border-[color-mix(in_oklch,var(--tb-raid)_35%,var(--tb-border))] bg-[color-mix(in_oklch,var(--tb-raid)_12%,var(--tb-bg-muted))] text-[var(--tb-fg-primary)]">
                  <Icon name="server" className="h-3.5 w-3.5 text-[var(--tb-raid)]" />
                  ابزار محاسبه RAID
                </div>
                <h2 className="tb-text-hero">ماشین حساب RAID و SHR</h2>
                <p className="mt-3 max-w-2xl tb-text-md text-[var(--tb-fg-muted)]">
                  ظرفیت قابل استفاده، افزونگی، فضای بلااستفاده و Hot Spare را برای RAIDهای کلاسیک و Synology Hybrid RAID با دیسک‌های هم‌اندازه یا ترکیبی محاسبه کنید.
                </p>
              </div>
              <button type="button" onClick={() => applyPreset(8, 4)} className="btn btn-ghost shrink-0">
                بازنشانی نمونه
              </button>
            </header>

            <div className="card p-4 shadow-[var(--tb-shadow-sm)]">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h3 className="tb-text-lg">دیسک‌ها</h3>
                  <p className="tb-text-sm text-[var(--tb-fg-muted)]">ظرفیت‌ها بر اساس TB ده‌دهی نمایش داده می‌شوند.</p>
                </div>
                <div className="badge">{nf.format(drives.length)} دیسک</div>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-6">
                {QUICK_SIZES.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => addDrive(size)}
                    className="rounded-[var(--tb-radius-md)] border border-[var(--tb-border)] bg-[var(--tb-bg-muted)] px-3 py-2 tb-text-sm font-bold transition hover:-translate-y-0.5 hover:border-[color-mix(in_oklch,var(--tb-raid)_48%,var(--tb-border))] hover:bg-[color-mix(in_oklch,var(--tb-raid)_10%,var(--tb-bg-muted))]"
                  >
                    + {nf.format(size)}TB
                  </button>
                ))}
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto]">
                <label className="block">
                  <span className="mb-2 block tb-text-sm font-bold text-[var(--tb-fg-secondary)]">ظرفیت سفارشی هر دیسک</span>
                  <input
                    className="input text-left ltr:[direction:ltr]"
                    type="number"
                    min="0.1"
                    max="100"
                    step="0.1"
                    value={customSize}
                    onChange={(event) => setCustomSize(clamp(Number(event.target.value), 0.1, 100))}
                  />
                </label>
                <button type="button" onClick={() => addDrive(customSize)} className="btn btn-primary self-end bg-[var(--tb-raid)]">
                  <Icon name="plus" className="h-4 w-4" />
                  افزودن دیسک
                </button>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {drives.map((drive, index) => (
                  <div key={drive.id} className="group rounded-[var(--tb-radius-md)] border border-[var(--tb-border)] bg-[var(--tb-bg-secondary)] p-3 transition hover:border-[color-mix(in_oklch,var(--tb-raid)_42%,var(--tb-border))]">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 font-black">
                        <span className="flex h-9 w-9 items-center justify-center rounded-[var(--tb-radius-md)] bg-[color-mix(in_oklch,var(--tb-raid)_13%,var(--tb-bg-muted))] text-[var(--tb-raid)]">
                          <Icon name="disk" className="h-5 w-5" />
                        </span>
                        دیسک {nf.format(index + 1)}
                      </div>
                      <button
                        type="button"
                        disabled={!canRemove}
                        onClick={() => removeDrive(drive.id)}
                        className="icon-rail-btn h-8 w-8 disabled:cursor-not-allowed disabled:opacity-40"
                        aria-label="حذف دیسک"
                      >
                        <Icon name="close" className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        className="input text-left font-black [direction:ltr]"
                        type="number"
                        min="0.1"
                        max="100"
                        step="0.1"
                        value={drive.sizeTb}
                        onChange={(event) => updateDrive(drive.id, Number(event.target.value))}
                        aria-label={`ظرفیت دیسک ${index + 1}`}
                      />
                      <span className="tb-text-sm font-bold text-[var(--tb-fg-muted)]">TB</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card p-4 shadow-[var(--tb-shadow-sm)]">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h3 className="tb-text-lg">نوع RAID</h3>
                  <p className="tb-text-sm text-[var(--tb-fg-muted)]">برای دیسک‌های ترکیبی، SHR معمولاً ظرفیت بهتری از RAID کلاسیک می‌دهد.</p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {RAID_OPTIONS.map((option) => {
                  const active = raid === option.key;
                  return (
                    <button
                      key={option.key}
                      type="button"
                      onClick={() => setRaid(option.key)}
                      className={`text-right rounded-[var(--tb-radius-md)] border p-4 transition ${
                        active
                          ? "border-[color-mix(in_oklch,var(--tb-raid)_70%,var(--tb-border))] bg-[color-mix(in_oklch,var(--tb-raid)_13%,var(--tb-bg-secondary))] shadow-[var(--tb-shadow-sm)]"
                          : "border-[var(--tb-border)] bg-[var(--tb-bg-muted)]/65 hover:-translate-y-0.5 hover:border-[color-mix(in_oklch,var(--tb-raid)_45%,var(--tb-border))]"
                      }`}
                    >
                      <span className="flex items-center justify-between gap-3">
                        <span className="text-base font-black">{option.label}</span>
                        <span className={`badge ${active ? "bg-[var(--tb-raid)] text-[var(--tb-on-accent)]" : ""}`}>{option.short}</span>
                      </span>
                      <span className="mt-2 block tb-text-sm text-[var(--tb-fg-muted)]">حداقل {nf.format(option.minDisks)} دیسک · {option.faultTolerance}</span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 rounded-[var(--tb-radius-md)] border border-[var(--tb-border)] bg-[var(--tb-bg-muted)]/60 p-4">
                <label className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <span>
                    <span className="block font-black">Hot Spare</span>
                    <span className="block tb-text-sm text-[var(--tb-fg-muted)]">بزرگ‌ترین دیسک‌ها به‌عنوان Spare رزرو می‌شوند و وارد ظرفیت Volume نمی‌شوند.</span>
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

          <aside className="lg:sticky lg:top-6 lg:self-start">
            <div className="card overflow-hidden p-0 shadow-[var(--tb-shadow-lg)]">
              <div className="border-b border-[var(--tb-border)] bg-[color-mix(in_oklch,var(--tb-raid)_10%,var(--tb-bg-secondary))] p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="tb-text-sm font-bold text-[var(--tb-fg-muted)]">نتیجه برای</div>
                    <div className="mt-1 text-3xl font-black text-[var(--tb-raid)]">{selectedOption.label}</div>
                  </div>
                  <div className={`badge ${result.valid ? "border-[color-mix(in_oklch,var(--tb-success)_40%,var(--tb-border))] text-[var(--tb-success)]" : "border-[color-mix(in_oklch,var(--tb-danger)_40%,var(--tb-border))] text-[var(--tb-danger)]"}`}>
                    {result.valid ? "معتبر" : "نیازمند اصلاح"}
                  </div>
                </div>
                <p className="mt-3 tb-text-sm text-[var(--tb-fg-muted)]">{result.description}</p>
              </div>

              <div className="space-y-5 p-5">
                <div className="grid grid-cols-2 gap-3">
                  <StatCard label="ظرفیت قابل استفاده" value={formatTb(result.usableTb)} hint="فضای نهایی Volume" tone="accent" />
                  <StatCard label="بازده ظرفیت" value={`${pf.format(result.efficiency)}٪`} hint="نسبت به دیسک‌های فعال" tone="success" />
                  <StatCard label="حفاظت / Parity" value={formatTb(result.protectionTb)} hint={result.faultTolerance} />
                  <StatCard label="بلااستفاده + Spare" value={formatTb(result.unusedTb + result.spareTb)} hint="فضای رزرو یا غیرقابل استفاده" tone="warning" />
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between tb-text-sm font-bold">
                    <span>نقشه ظرفیت</span>
                    <span className="text-[var(--tb-fg-muted)]">خام: {formatTb(result.rawTb)}</span>
                  </div>
                  <div className="flex h-5 overflow-hidden rounded-[var(--tb-radius-full)] border border-[var(--tb-border)] bg-[var(--tb-bg-muted)]" aria-label="نمودار ظرفیت RAID">
                    <Segment label="قابل استفاده" value={result.usableTb} total={barTotal} className="bg-[var(--tb-raid)]" />
                    <Segment label="حفاظت" value={result.protectionTb} total={barTotal} className="bg-[var(--tb-success)]" />
                    <Segment label="بلااستفاده" value={result.unusedTb} total={barTotal} className="bg-[var(--tb-warning)]" />
                    <Segment label="Hot Spare" value={result.spareTb} total={barTotal} className="bg-[var(--tb-fg-muted)]" />
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 tb-text-sm text-[var(--tb-fg-muted)]">
                    <span className="flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-full bg-[var(--tb-raid)]" /> قابل استفاده</span>
                    <span className="flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-full bg-[var(--tb-success)]" /> حفاظت</span>
                    <span className="flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-full bg-[var(--tb-warning)]" /> بلااستفاده</span>
                    <span className="flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-full bg-[var(--tb-fg-muted)]" /> Spare</span>
                  </div>
                </div>

                <div className="rounded-[var(--tb-radius-md)] border border-[var(--tb-border)] bg-[var(--tb-bg-muted)]/60 p-4">
                  <div className="mb-3 flex items-center gap-2 font-black">
                    <Icon name="shield" className="h-5 w-5 text-[var(--tb-raid)]" />
                    خلاصه پیکربندی
                  </div>
                  <dl className="grid grid-cols-2 gap-3 tb-text-sm">
                    <div>
                      <dt className="text-[var(--tb-fg-muted)]">دیسک فعال</dt>
                      <dd className="mt-1 font-black">{nf.format(drives.length - spareCount)}</dd>
                    </div>
                    <div>
                      <dt className="text-[var(--tb-fg-muted)]">Hot Spare</dt>
                      <dd className="mt-1 font-black">{nf.format(spareCount)}</dd>
                    </div>
                    <div>
                      <dt className="text-[var(--tb-fg-muted)]">ظرفیت خام فعال</dt>
                      <dd className="mt-1 font-black">{formatTb(result.activeRawTb)}</dd>
                    </div>
                    <div>
                      <dt className="text-[var(--tb-fg-muted)]">تحمل خرابی</dt>
                      <dd className="mt-1 font-black">{result.faultTolerance}</dd>
                    </div>
                  </dl>
                </div>

                {result.warnings.length > 0 ? (
                  <div className="space-y-2">
                    {result.warnings.map((warning) => (
                      <div key={warning} className="rounded-[var(--tb-radius-md)] border border-[color-mix(in_oklch,var(--tb-warning)_35%,var(--tb-border))] bg-[color-mix(in_oklch,var(--tb-warning)_11%,var(--tb-bg-secondary))] p-3 tb-text-sm text-[var(--tb-fg-primary)]">
                        {warning}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-[var(--tb-radius-md)] border border-[color-mix(in_oklch,var(--tb-success)_35%,var(--tb-border))] bg-[color-mix(in_oklch,var(--tb-success)_10%,var(--tb-bg-secondary))] p-3 tb-text-sm text-[var(--tb-fg-primary)]">
                    این چیدمان از نظر تعداد دیسک معتبر است و ظرفیت بدون هشدار محاسبه شد.
                  </div>
                )}

                <p className="tb-text-sm text-[var(--tb-fg-muted)]">
                  توجه: نتیجه‌ها تخمینی هستند. ظرفیت واقعی NAS ممکن است به‌دلیل تفاوت TB/TiB، فایل‌سیستم، Snapshot، Metadata و سیاست‌های سازنده کمتر نمایش داده شود.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
