"use client";

import * as React from "react";
import { Icon } from "@/design/icons";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  defaultSelectorState,
  estimateUsableCapacity,
  minimumBaysForCapacity,
  userTypeLabels,
  raidLabels,
  workloadLabels,
  type NasUserType,
  type NasProduct,
  type NasWorkload,
  type RaidType,
  type SelectorState,
} from "./nas-selector-data";

type ScoredProduct = NasProduct & {
  match: number;
  usableTb: number;
  reasons: string[];
};

type NasSelectorProps = {
  products: NasProduct[];
  consultationHref?: string;
  compareHref?: string;
  className?: string;
};

const formatter = new Intl.NumberFormat("fa-IR");
function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}
function persianNumber(value: number | string) {
  return formatter.format(Number(value));
}

const DRIVE_OPTIONS = [4, 6, 8, 10, 12, 14, 16, 18, 20, 22] as const;
const BAY_ROWS = [1, 2, 4, 5, 6, 8, 12, 16, 24] as const;
const RAID_TYPES: RaidType[] = ["raid1", "raid5", "raid6", "raid10"];

function hasOneBayWarning(raid: RaidType) {
  return raid === "none";
}

// ─── Score product ────────────────────────────────────────────────────
function scoreProduct(product: NasProduct, state: SelectorState): ScoredProduct {
  const minBays = minimumBaysForCapacity(state.usableTb, state.driveTb, state.raid);
  const usableTb = estimateUsableCapacity(product.bays, state.driveTb, state.raid);
  const reasons: string[] = [];
  let score = 50;

  // Bay adequacy
  if (product.bays >= minBays) {
    score += 20;
    reasons.push(`${persianNumber(product.bays)} Bay کافی است`);
  } else {
    score -= 30;
  }

  // Usable capacity
  if (usableTb >= state.usableTb) {
    score += 15;
    reasons.push(`حدود ${persianNumber(usableTb)} TB فضای قابل استفاده`);
  } else {
    score -= 15;
  }

  // User type match
  if (state.userType === "business" && product.formFactor === "rackmount") score += 10;
  if (state.userType === "home" && product.formFactor === "desktop") score += 5;

  // Workload match
  const matchedWorkloads = state.workloads.filter((w) => product.bestFor.includes(w));
  score += matchedWorkloads.length * 5;
  if (matchedWorkloads.length > 0) {
    reasons.push(`مناسب ${persianNumber(matchedWorkloads.length)} سرویس انتخابی شما`);
  }

  // Rack preference
  if (state.racksize && product.formFactor === "rackmount") score += 10;

  const match = Math.min(Math.max(Math.round(score), 0), 100);
  return { ...product, match, usableTb, reasons: reasons.slice(0, 3) };
}

// ─── Sub-components ───────────────────────────────────────────────────

function UserTypeCard({
  type,
  selected,
  title,
  desc,
  emoji,
  onClick,
}: {
  type: NasUserType;
  selected: boolean;
  title: string;
  desc: string;
  emoji: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group relative flex w-full cursor-pointer flex-col items-center gap-4 rounded-2xl border-2 p-6 sm:p-8 text-center transition-all duration-200",
        selected
          ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
          : "border-border/60 bg-card hover:border-primary/30 hover:shadow-md hover:bg-accent/20"
      )}
    >
      {selected && (
        <div className="absolute -top-2.5 -left-2.5 flex h-7 w-7 items-center justify-center rounded-full bg-primary shadow-sm">
          <Icon name="check" className="h-3.5 w-3.5 text-primary-foreground" />
        </div>
      )}
      <span className="text-4xl sm:text-5xl">{emoji}</span>
      <div className="space-y-1.5">
        <h3 className={cn("text-lg sm:text-xl font-extrabold", selected && "text-primary")}>
          {title}
        </h3>
        <p className="text-sm text-muted-foreground leading-6">{desc}</p>
      </div>
    </button>
  );
}

function CapacityTable({ state, onDriveChange, onRaidChange }: {
  state: SelectorState;
  onDriveChange: (tb: number) => void;
  onRaidChange: (r: RaidType) => void;
}) {
  return (
    <div className="overflow-hidden rounded-xl border-2 border-border/60 bg-card">
      <div className="border-b border-border/60 bg-muted/30 p-4 sm:p-5">
        <h3 className="text-sm font-extrabold">جدول ظرفیت قابل استفاده</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          بر اساس ظرفیت و RAID می‌توانید Bay مناسب را انتخاب کنید
        </p>
      </div>

      {/* Drive size selector */}
      <div className="border-b border-border/40 px-4 sm:px-5 py-3.5 flex flex-col sm:flex-row sm:items-center gap-3">
        <label className="text-xs font-bold text-foreground whitespace-nowrap">
          ظرفیت هر دیسک را انتخاب کنید:
        </label>
        <div className="flex flex-wrap gap-1.5">
          {DRIVE_OPTIONS.map((tb) => (
            <button
              key={tb}
              type="button"
              onClick={() => onDriveChange(tb)}
              className={cn(
                "inline-flex items-center justify-center rounded-lg border-2 px-3 py-1.5 text-xs font-bold transition-all",
                state.driveTb === tb
                  ? "border-primary bg-primary text-primary-foreground shadow-sm"
                  : "border-border/60 bg-card text-foreground hover:border-primary/30 hover:bg-accent/20"
              )}
            >
              {persianNumber(tb)} TB
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px] border-collapse text-center text-xs">
          <thead>
            <tr className="bg-muted/40">
              <th className="p-3 font-black text-muted-foreground border-l border-border/40">Bay</th>
              {RAID_TYPES.map((raid) => (
                <th key={raid} className="p-3 font-black text-muted-foreground border-l border-border/40 last:border-l-0">
                  {raidLabels[raid].title}
                </th>
              ))}
            </tr>
            <tr className="bg-muted/20 text-[10px] text-muted-foreground">
              <th className="p-1.5 border-l border-border/40" />
              {RAID_TYPES.map((raid) => (
                <th key={raid} className="p-1.5 font-medium border-l border-border/40 last:border-l-0">
                  {raidLabels[raid].desc}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {BAY_ROWS.map((bays) => (
              <tr key={bays} className="border-t border-border/30 hover:bg-muted/10 transition-colors">
                <td className="p-2.5 font-black text-foreground border-l border-border/30">
                  {persianNumber(bays)}
                </td>
                {RAID_TYPES.map((raid) => {
                  const capacity = estimateUsableCapacity(bays, state.driveTb, raid);
                  const isActive = state.raid === raid && state.usableTb <= capacity && bays >= raidLabels[raid].minBays;
                  const isSelectable = bays >= raidLabels[raid].minBays && capacity > 0;
                  return (
                    <td
                      key={raid}
                      className={cn(
                        "p-2.5 border-l border-border/30 last:border-l-0 transition-colors",
                        isActive ? "bg-primary/10 font-black text-primary" : "font-medium",
                        isSelectable ? "text-foreground" : "text-muted-foreground/40"
                      )}
                    >
                      {capacity > 0 ? (
                        <span className="flex flex-col items-center gap-0.5">
                          <span>{persianNumber(capacity)} TB</span>
                          {isActive && <Icon name="check" className="h-3 w-3 text-primary" />}
                        </span>
                      ) : "—"}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="border-t border-border/40 px-4 sm:px-5 py-2.5 text-[10px] text-muted-foreground bg-muted/20">
        <p>مدل‌های 1 Bay فاقد مکانیزم افزونگی داده هستند و ظرفیت قابل استفاده برابر با ظرفیت یک دیسک است.</p>
      </div>
    </div>
  );
}

function WorkloadChip({
  workload,
  selected,
  onClick,
}: {
  workload: NasWorkload;
  selected: boolean;
  onClick: () => void;
}) {
  const info = workloadLabels[workload];
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border-2 px-3 py-1.5 text-xs font-bold transition-all",
        selected
          ? "border-primary bg-primary/5 text-primary shadow-sm"
          : "border-border/50 text-foreground hover:border-primary/30 hover:bg-accent/20"
      )}
    >
      {selected && <Icon name="check" className="h-3 w-3" />}
      {info.title}
    </button>
  );
}

function ProductCard({ product, state }: { product: ScoredProduct; state: SelectorState }) {
  const matchColor = product.match >= 70 ? "text-green-600 dark:text-green-400" : product.match >= 45 ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground";
  const isGood = product.match >= 60;
  return (
    <div className={cn(
      "group relative overflow-hidden rounded-xl border-2 transition-all duration-200",
      isGood ? "border-primary/20 hover:border-primary/40 hover:shadow-lg" : "border-border/50 hover:border-border/80 hover:shadow-sm"
    )}>
      <div className="p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5">
          {/* Match badge */}
          <div className="flex sm:flex-col items-center sm:items-center gap-2 sm:gap-1 sm:min-w-[70px] shrink-0">
            <div className={cn(
              "flex items-center justify-center rounded-full text-sm font-black tabular-nums",
              product.match >= 70 ? "text-green-600 dark:text-green-400" : product.match >= 45 ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground"
            )}>
              <span className="text-2xl sm:text-3xl font-black">{product.match}</span>
              <span className="text-xs mt-1">%</span>
            </div>
            <div className="text-[10px] text-muted-foreground">تطابق</div>
          </div>

          {/* Divider */}
          <div className="hidden sm:block w-px h-16 bg-border/50 shrink-0" />

          {/* Info */}
          <div className="flex-1 min-w-0 text-right">
            <div className="flex items-center gap-2 flex-wrap">
              {product.brand && (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0">{product.brand}</Badge>
              )}
              {isGood && (
                <Badge className="bg-green-600/10 text-green-700 dark:text-green-300 text-[9px] border-0">پیشنهادی</Badge>
              )}
            </div>
            <h4 className="mt-1 text-sm font-extrabold text-foreground">{product.title}</h4>
            <p className="text-xs text-muted-foreground">{product.subtitle}</p>
            {product.reasons.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {product.reasons.map((r, i) => (
                  <span key={i} className="inline-flex items-center gap-0.5 rounded-md bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 text-[10px] font-medium">
                    ↑ {r}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* CTA */}
          <div className="flex sm:flex-col items-center gap-2 sm:gap-1.5 shrink-0">
            <Button size="sm" variant={isGood ? "default" : "outline"} className="text-xs h-9 rounded-xl font-bold" asChild>
              <Link href={product.href || `/shop/${product.shopSlug || product.id}`}>
                مشاهده محصول
              </Link>
            </Button>
            <Button size="sm" variant="ghost" className="text-xs h-8 rounded-xl" asChild>
              <Link href={`/shop/${product.shopSlug || product.id}`}>
                <Icon name="cart" className="h-3 w-3 ml-1" />
                خرید
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────
export default function NasSelector({
  products,
  consultationHref,
  compareHref,
  className,
}: NasSelectorProps) {
  const [state, setState] = React.useState<SelectorState>(defaultSelectorState);
  const [showWorkloads, setShowWorkloads] = React.useState(false);

  const update = <K extends keyof SelectorState>(key: K, value: SelectorState[K]) => {
    setState((prev) => ({ ...prev, [key]: value }));
  };

  const toggleWorkload = (w: NasWorkload) => {
    setState((prev) => ({
      ...prev,
      workloads: prev.workloads.includes(w)
        ? prev.workloads.filter((x) => x !== w)
        : [...prev.workloads, w],
    }));
  };

  const scored = React.useMemo(() => {
    return products
      .map((p) => scoreProduct(p, state))
      .sort((a, b) => b.match - a.match);
  }, [products, state]);

  const topMatch = scored[0];
  const goodMatches = scored.filter((p) => p.match >= 40);

  return (
    <div className={cn("space-y-8", className)} dir="rtl">
      {/* ── User Type Selector ── */}
      <section>
        <h2 className="text-base sm:text-lg font-extrabold text-foreground mb-4">
          چه نوع کاربری هستید؟
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {(Object.keys(userTypeLabels) as NasUserType[]).map((type) => {
            const info = userTypeLabels[type];
            return (
              <UserTypeCard
                key={type}
                type={type}
                selected={state.userType === type}
                title={info.title}
                desc={info.desc}
                emoji={info.emoji}
                onClick={() => update("userType", type)}
              />
            );
          })}
        </div>
      </section>

      {/* ── Workload selector (expandable) ── */}
      <section>
        <button
          type="button"
          onClick={() => setShowWorkloads(!showWorkloads)}
          className="flex items-center gap-2 text-sm font-extrabold text-foreground mb-3 hover:text-primary transition-colors"
        >
          {showWorkloads ? "−" : "+"} سرویس‌های مورد نیاز خود را انتخاب کنید
        </button>
        {showWorkloads && (
          <Card className="p-4 border-2">
            <div className="flex flex-wrap gap-2">
              {(Object.keys(workloadLabels) as NasWorkload[]).map((w) => (
                <WorkloadChip
                  key={w}
                  workload={w}
                  selected={state.workloads.includes(w)}
                  onClick={() => toggleWorkload(w)}
                />
              ))}
            </div>
          </Card>
        )}
      </section>

      {/* ── Rack mount toggle ── */}
      <section className="flex items-center gap-3">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={state.racksize}
            onChange={(e) => update("racksize", e.target.checked)}
            className="rounded border-border size-4 accent-primary"
          />
          <div>
            <div className="text-sm font-bold">Rackmount / رک</div>
            <div className="text-xs text-muted-foreground">مناسب نصب در رک و دیتاسنتر</div>
          </div>
        </label>
      </section>

      {/* ── Capacity Table ── */}
      <CapacityTable
        state={state}
        onDriveChange={(tb) => update("driveTb", tb)}
        onRaidChange={(r) => update("raid", r)}
      />

      {/* ── Contact / Compare Bar ── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl border-2 border-border/60 bg-card p-4 sm:p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Icon name="headset" className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold">نیاز به کمک برای انتخاب دارید؟</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              نیازهای خود را با ما در میان بگذارید، کارشناسان ما بهترین گزینه را پیشنهاد می‌دهند.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {compareHref && (
            <Button variant="outline" size="sm" asChild className="rounded-xl text-xs">
              <Link href={compareHref}>
                <Icon name="shuffle" className="h-3.5 w-3.5 ml-1" />
                مقایسه
              </Link>
            </Button>
          )}
          {consultationHref && (
            <Button size="sm" asChild className="rounded-xl text-xs">
              <Link href={consultationHref}>
                تماس با کارشناس
              </Link>
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setState(defaultSelectorState)}
            className="rounded-xl text-xs"
          >
            <Icon name="refresh" className="h-3.5 w-3.5 ml-1" />
            بازنشانی
          </Button>
        </div>
      </div>

      {/* ── Results ── */}
      {goodMatches.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Icon name="server" className="h-5 w-5 text-primary" />
              <h2 className="text-base sm:text-lg font-extrabold">
                محصولات پیشنهادی
              </h2>
            </div>
            <Badge variant="secondary" className="text-xs">
              {persianNumber(goodMatches.length)} محصول
            </Badge>
          </div>

          {/* Top pick */}
          {topMatch && topMatch.match >= 60 && (
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Icon name="flame" className="h-4 w-4 text-primary" />
                <span className="text-xs font-extrabold text-primary">بهترین تطابق</span>
              </div>
              <ProductCard product={topMatch} state={state} />
            </div>
          )}

          {/* All matches */}
          <div className="grid gap-3">
            {goodMatches.slice(0, 8).map((p) => (
              <ProductCard key={p.id} product={p} state={state} />
            ))}
          </div>
        </section>
      )}

      {/* No matches */}
      {goodMatches.length === 0 && (
        <section className="rounded-xl border-2 border-dashed border-border/60 p-10 text-center">
          <Icon name="server" className="h-10 w-10 mx-auto text-muted-foreground/30" />
          <h3 className="mt-3 text-sm font-extrabold text-foreground">محصولی مطابق با نیاز شما یافت نشد</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            لطفاً تنظیمات را تغییر دهید یا با کارشناسان ما تماس بگیرید.
          </p>
        </section>
      )}
    </div>
  );
}
