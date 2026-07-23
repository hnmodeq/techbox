"use client";

import * as React from "react";
import { Icon } from "@/design/icons";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

import {
  defaultSelectorState,
  estimateUsableCapacity,
  minimumBaysForCapacity,
  personaLabels,
  raidLabels,
  workloadLabels,
  type NasPersona,
  type NasProduct,
  type NasWorkload,
  type RaidType,
  type SelectorState,
} from "./nas-selector-data";
import { motion, AnimatePresence } from "framer-motion";

type ScoredProduct = NasProduct & {
  score: number;
  match: number;
  reasons: string[];
  warnings: string[];
  usableTb: number;
};

type NasSelectorProps = {
  products: NasProduct[];
  initialState?: Partial<SelectorState>;
  compareHref?: string;
  consultationHref?: string;
  className?: string;
};

const personas = Object.keys(personaLabels) as NasPersona[];
const workloads = Object.keys(workloadLabels) as NasWorkload[];
const raidTypes = Object.keys(raidLabels) as RaidType[];

const formatter = new Intl.NumberFormat("fa-IR");

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}
function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}
function persianNumber(value: number | string) {
  return formatter.format(Number(value));
}

// ─── Step Indicators ───────────────────────────────────────────────────
const STEPS = [
  { id: "persona", label: "شخصیت کاربری", icon: "user" },
  { id: "workloads", label: "نیازمندی‌ها", icon: "tools" },
  { id: "capacity", label: "ظرفیت و RAID", icon: "disk" },
  { id: "results", label: "نتایج", icon: "star" },
] as const;

type StepId = (typeof STEPS)[number]["id"];

function StepIndicator({ current, onStep }: { current: StepId; onStep: (s: StepId) => void }) {
  const idx = STEPS.findIndex((s) => s.id === current);
  return (
    <div className="flex items-center justify-center gap-1 sm:gap-2 mb-8 px-2" dir="rtl">
      {STEPS.map((step, i) => {
        const done = i < idx;
        const active = i === idx;
        return (
          <React.Fragment key={step.id}>
            {i > 0 && (
              <div
                className={cn(
                  "h-0.5 flex-1 max-w-12 transition-colors duration-300",
                  done ? "bg-primary" : "bg-muted-foreground/20"
                )}
              />
            )}
            <button
              type="button"
              onClick={() => done && onStep(step.id)}
              disabled={!done}
              className={cn(
                "flex flex-col items-center gap-1.5 transition-all duration-300",
                done ? "cursor-pointer" : "cursor-default"
              )}
            >
              <div
                className={cn(
                  "flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full text-sm font-bold transition-all duration-300",
                  active
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30 scale-110"
                    : done
                    ? "bg-primary/20 text-primary"
                    : "bg-muted text-muted-foreground/50"
                )}
              >
                {done ? (
                  <Icon name="check" className="h-4 w-4" />
                ) : (
                  <span className="text-xs">{i + 1}</span>
                )}
              </div>
              <span
                className={cn(
                  "text-[10px] sm:text-[11px] font-medium whitespace-nowrap transition-colors",
                  active
                    ? "text-foreground"
                    : done
                    ? "text-primary"
                    : "text-muted-foreground/50"
                )}
              >
                {step.label}
              </span>
            </button>
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ─── Token Card (Visual Toggle) ────────────────────────────────────────
function TokenCard({
  selected,
  title,
  desc,
  emoji,
  onClick,
  className,
}: {
  selected: boolean;
  title: string;
  desc?: string;
  emoji?: string;
  onClick: () => void;
  className?: string;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "group relative flex w-full cursor-pointer flex-col items-center gap-2 rounded-xl border-2 p-4 sm:p-5 text-center transition-all duration-200",
        selected
          ? "border-primary bg-primary/5 shadow-md shadow-primary/10"
          : "border-border/60 bg-card hover:border-primary/30 hover:shadow-sm hover:bg-accent/30",
        className
      )}
    >
      {selected && (
        <div className="absolute -top-2 -left-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground shadow-sm">
          <Icon name="check" className="h-3 w-3" />
        </div>
      )}
      {emoji && <span className="text-2xl sm:text-3xl">{emoji}</span>}
      <div className="space-y-1">
        <div className={cn("text-[13px] font-extrabold", selected ? "text-primary" : "text-foreground")}>
          {title}
        </div>
        {desc && <div className="text-[11px] leading-5 text-muted-foreground">{desc}</div>}
      </div>
    </motion.button>
  );
}

// ─── Workload Token ────────────────────────────────────────────────────
function WorkloadToken({
  selected,
  title,
  desc,
  icon,
  onClick,
}: {
  selected: boolean;
  title: string;
  desc?: string;
  icon?: string;
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      className={cn(
        "flex items-center gap-3 rounded-xl border-2 px-3.5 py-2.5 transition-all duration-200 text-right",
        selected
          ? "border-primary bg-primary/5 shadow-sm"
          : "border-border/50 bg-card hover:border-primary/20 hover:bg-accent/20"
      )}
    >
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm transition-colors",
          selected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
        )}
      >
        <Icon name={(icon as any) || "check"} className="h-4 w-4" />
      </div>
      <div className="min-w-0 text-right">
        <div className={cn("text-[12px] font-bold", selected && "text-primary")}>{title}</div>
        {desc && <div className="text-[10px] text-muted-foreground">{desc}</div>}
      </div>
      {selected && (
        <div className="mr-auto flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary">
          <Icon name="check" className="h-3 w-3 text-primary-foreground" />
        </div>
      )}
    </motion.button>
  );
}

// ─── RangeField ────────────────────────────────────────────────────────
function RangeField({
  label,
  value,
  min,
  max,
  step = 1,
  suffix,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  suffix?: string;
  onChange: (next: number) => void;
}) {
  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between gap-3">
        <Label className="text-[12px] font-bold text-foreground">{label}</Label>
        <Badge variant="secondary" className="text-[11px] font-bold">
          {persianNumber(value)} {suffix}
        </Badge>
      </div>
      <Slider
        min={min}
        max={max}
        step={step}
        value={[value]}
        onValueChange={(v: any) => {
          const val = Array.isArray(v) ? v[0] : v;
          onChange(Number(val));
        }}
        className="py-1"
      />
      <div className="flex justify-between text-[10px] text-muted-foreground">
        <span>{persianNumber(min)}</span>
        <span>{persianNumber(max)}</span>
      </div>
    </div>
  );
}

// ─── RAID Selector ─────────────────────────────────────────────────────
function RaidSelector({
  selected,
  onChange,
}: {
  selected: RaidType;
  onChange: (r: RaidType) => void;
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
      {raidTypes.map((r) => {
        const info = raidLabels[r];
        const isSelected = selected === r;
        return (
          <motion.button
            key={r}
            type="button"
            onClick={() => onChange(r)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
              "flex flex-col items-center gap-1.5 rounded-xl border-2 p-3 transition-all duration-200 text-center",
              isSelected
                ? "border-primary bg-primary/5 shadow-sm"
                : "border-border/50 bg-card hover:border-primary/20"
            )}
          >
            <Icon
              name={info.icon as any}
              className={cn("h-5 w-5", isSelected ? "text-primary" : "text-muted-foreground")}
            />
            <div className={cn("text-[11px] font-bold", isSelected && "text-primary")}>{info.title}</div>
            <div className="text-[9px] text-muted-foreground leading-4">{info.desc}</div>
          </motion.button>
        );
      })}
    </div>
  );
}

// ─── Scoring Engine ────────────────────────────────────────────────────
function scoreProduct(product: NasProduct, state: SelectorState): ScoredProduct {
  const minBays = minimumBaysForCapacity(state.usableTb, state.driveTb, state.raid);
  const usableTb = estimateUsableCapacity(product.bays, state.driveTb, state.raid);
  const requiredCpu = Math.max(
    state.workloads.includes("virtualization") || state.workloads.includes("database") ? 4 : 0,
    state.workloads.includes("docker") || state.workloads.includes("surveillance") ? 3 : 0,
    state.users > 45 ? 4 : state.users > 18 ? 3 : 2,
  );
  const requiredNetwork = state.networkGbE;
  const workloadMatches = state.workloads.filter((w) => product.bestFor.includes(w)).length;
  const reasons: string[] = [];
  const warnings: string[] = [];
  let score = 38;

  if (product.bays >= minBays) {
    score += 18;
    reasons.push(`${persianNumber(product.bays)} Bay برای ظرفیت و RAID انتخابی کافی است.`);
  } else {
    score -= 35;
    warnings.push(`برای ظرفیت ${persianNumber(state.usableTb)} ترابایت با ${raidLabels[state.raid].title} حداقل ${persianNumber(minBays)} Bay پیشنهاد می‌شود.`);
  }

  if (usableTb >= state.usableTb) score += 12;
  else score -= 20;

  if (product.cpuTier >= requiredCpu) {
    score += 12;
    reasons.push("توان پردازشی با سرویس‌های انتخابی هم‌خوان است.");
  } else {
    score -= 16;
    warnings.push("برای سرویس‌های سنگین‌تر CPU قوی‌تر پیشنهاد می‌شود.");
  }

  score += workloadMatches * 8;
  if (workloadMatches) reasons.push(`${persianNumber(workloadMatches)} نیاز اصلی شما را پوشش می‌دهد.`);

  if (product.networkGbE >= requiredNetwork) {
    score += 8;
    if (requiredNetwork > 1) reasons.push(`شبکه ${persianNumber(product.networkGbE)}GbE برای سرعت مدنظر مناسب است.`);
  } else {
    score -= 12;
    warnings.push(`برای این سناریو شبکه ${persianNumber(requiredNetwork)}GbE بهتر است.`);
  }

  if (state.nvme) {
    if (product.nvme) {
      score += 8;
      reasons.push("اسلات NVMe برای کش یا فضای سریع دارد.");
    } else {
      score -= 10;
      warnings.push("NVMe ندارد؛ برای کش SSD گزینه بالاتری انتخاب کنید.");
    }
  }

  if (state.rackmount) {
    if (product.formFactor === "rackmount") score += 18;
    else score -= 18;
  } else if (product.formFactor === "desktop") {
    score += 4;
  }

  if (state.cameras > 0) {
    const cameraNeed = state.cameras > 24 ? 5 : state.cameras > 12 ? 4 : state.cameras > 6 ? 3 : 2;
    if (product.cpuTier >= cameraNeed && product.bays >= 4) {
      score += 8;
      reasons.push("برای ضبط دوربین‌ها ظرفیت و توان مناسبی دارد.");
    } else {
      score -= 10;
      warnings.push("برای تعداد دوربین انتخابی، Bay/CPU بیشتری در نظر بگیرید.");
    }
  }

  const budgetDelta = Math.abs(product.priceTier - state.budgetTier);
  score += Math.max(0, 10 - budgetDelta * 4);
  if (product.priceTier > state.budgetTier + 1) warnings.push("ممکن است از بودجه هدف شما بالاتر باشد.");

  const match = clamp(Math.round(score), 0, 100);
  return { ...product, score, match, reasons: reasons.slice(0, 4), warnings: warnings.slice(0, 3), usableTb };
}

// ─── Capacity Matrix ───────────────────────────────────────────────────
function CapacityMatrix({ state }: { state: SelectorState }) {
  const rows = [2, 4, 6, 8, 12];
  const raids: RaidType[] = ["raid1", "raid5", "raid6", "raid10"];
  return (
    <Card className="overflow-hidden p-0 border-2">
      <CardHeader className="flex flex-row items-center justify-between gap-3 border-b p-3 sm:p-4">
        <div>
          <CardTitle className="text-[14px]">جدول ظرفیت قابل استفاده</CardTitle>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            بر اساس دیسک {persianNumber(state.driveTb)} ترابایت
          </p>
        </div>
        <Icon name="disk" className="h-5 w-5 text-primary" />
      </CardHeader>
      <CardContent className="p-0 overflow-x-auto">
        <table className="w-full min-w-[500px] border-collapse text-center text-[11px]">
          <thead>
            <tr className="bg-muted/50">
              <th className="p-2.5 font-black text-muted-foreground">Bay</th>
              {raids.map((raid) => (
                <th key={raid} className="p-2.5 font-black text-muted-foreground">
                  {raidLabels[raid].title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((bays) => (
              <tr key={bays} className="border-t border-border/50 hover:bg-muted/20">
                <td className="p-2.5 font-black">{persianNumber(bays)}</td>
                {raids.map((raid) => {
                  const value = estimateUsableCapacity(bays, state.driveTb, raid);
                  const active = state.raid === raid && value >= state.usableTb;
                  return (
                    <td
                      key={raid}
                      className={cn(
                        "p-2.5 font-medium transition-colors",
                        active && "bg-primary/10 font-black text-primary"
                      )}
                    >
                      {value > 0 ? `${persianNumber(value)} TB` : "—"}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}

// ─── Product Result Card ───────────────────────────────────────────────
function ProductResultCard({
  product,
  isTop,
}: {
  product: ScoredProduct;
  isTop?: boolean;
}) {
  const matchColor =
    product.match >= 85
      ? "text-green-600 dark:text-green-400"
      : product.match >= 65
      ? "text-amber-600 dark:text-amber-400"
      : "text-muted-foreground";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "group relative overflow-hidden rounded-xl border-2 transition-all duration-300",
        isTop
          ? "border-primary/40 bg-gradient-to-br from-primary/5 to-transparent shadow-lg shadow-primary/10"
          : "border-border/60 bg-card hover:border-primary/20 hover:shadow-md"
      )}
    >
      {/* Match badge */}
      <div className="absolute top-3 left-3 z-10">
        <div
          className={cn(
            "flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold shadow-sm",
            isTop
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-foreground"
          )}
        >
          {isTop && <Icon name="flame" className="h-3 w-3" />}
          <span>{product.match}%</span>
        </div>
      </div>

      <div className="p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-start gap-3">
          {/* Product info */}
          <div className="flex-1 min-w-0 text-right">
            <div className="flex items-center gap-2 flex-wrap">
              {product.brand && (
                <Badge variant="outline" className="text-[9px] px-1.5 py-0">
                  {product.brand}
                </Badge>
              )}
              {isTop && (
                <Badge className="bg-primary text-primary-foreground text-[9px]">
                  بهترین پیشنهاد
                </Badge>
              )}
            </div>
            <h3 className={cn("mt-1.5 text-[15px] font-extrabold", isTop && "text-primary")}>
              {product.title}
            </h3>
            <p className="mt-0.5 text-[12px] text-muted-foreground">{product.subtitle}</p>

            {/* Spec chips */}
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-[10px] font-medium">
                <Icon name="disk" className="h-3 w-3" />
                {persianNumber(product.bays)} Bay
              </span>
              <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-[10px] font-medium">
                <Icon name="server" className="h-3 w-3" />
                {product.formFactor === "rackmount" ? "Rackmount" : "Desktop"}
              </span>
              <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-[10px] font-medium">
                <Icon name="disk" className="h-3 w-3" />
                {persianNumber(product.usableTb)} TB
              </span>
              {product.nvme && (
                <span className="inline-flex items-center gap-1 rounded-md bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 px-2 py-1 text-[10px] font-medium">
                  NVMe
                </span>
              )}
            </div>

            {/* Reasons */}
            {product.reasons.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1">
                {product.reasons.map((r, i) => (
                  <Badge key={i} variant="secondary" className="text-[10px] font-medium">
                    ✓ {r}
                  </Badge>
                ))}
              </div>
            )}

            {/* Warnings */}
            {product.warnings.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {product.warnings.map((w, i) => (
                  <Badge key={i} variant="destructive" className="text-[10px] font-medium">
                    ⚠ {w}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Price & CTA */}
          <div className="flex flex-row sm:flex-col items-center sm:items-stretch gap-3 sm:min-w-[140px] sm:text-left shrink-0">
            <div className={cn("text-left", isTop && "sm:bg-primary/5 sm:p-3 sm:rounded-xl")}>
              <div className="text-[10px] text-muted-foreground">قیمت</div>
              <div className={cn("text-[16px] font-black mt-0.5", matchColor)}>
                {typeof product.price === "number"
                  ? persianNumber(product.price)
                  : product.price || "تماس بگیرید"}
              </div>
              <div className="text-[10px] text-muted-foreground">تومان</div>
            </div>
            <div className="flex flex-col gap-1.5">
              <ButtonLink
                size="sm"
                className={cn(
                  "text-[11px] font-bold h-9 px-4 rounded-xl",
                  isTop
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "bg-muted text-foreground hover:bg-muted/80"
                )}
                href={product.href || `/shop/${product.shopSlug || product.id}`}
              >
                مشاهده محصول
              </ButtonLink>
              <ButtonLink
                size="sm"
                variant="outline"
                className="text-[10px] h-8 rounded-xl border-border/50"
                href={product.href || `/shop/${product.shopSlug || product.id}`}
              >
                <Icon name="cart" className="h-3 w-3 ml-1" />
                خرید
              </ButtonLink>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────
export default function NasSelector({
  products,
  initialState,
  compareHref,
  consultationHref,
  className,
}: NasSelectorProps) {
  const [state, setState] = React.useState<SelectorState>({
    ...defaultSelectorState,
    ...initialState,
  });
  const [step, setStep] = React.useState<StepId>("persona");

  const update = <K extends keyof SelectorState>(key: K, value: SelectorState[K]) => {
    setState((prev) => ({ ...prev, [key]: value }));
  };

  const toggleWorkload = (workload: NasWorkload) => {
    setState((prev) => ({
      ...prev,
      workloads: prev.workloads.includes(workload)
        ? prev.workloads.filter((w) => w !== workload)
        : [...prev.workloads, workload],
    }));
  };

  const scored = React.useMemo(() => {
    return products
      .map((p) => scoreProduct(p, state))
      .sort((a, b) => b.match - a.match);
  }, [products, state]);

  const top = scored[0];
  const hasPersona = !!state.persona;
  const hasWorkloads = state.workloads.length > 0;

  const goNext = () => {
    const idx = STEPS.findIndex((s) => s.id === step);
    if (idx < STEPS.length - 1) setStep(STEPS[idx + 1].id);
  };

  const goBack = () => {
    const idx = STEPS.findIndex((s) => s.id === step);
    if (idx > 0) setStep(STEPS[idx - 1].id);
  };

  const variants = {
    enter: { opacity: 0, x: 40 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -40 },
  };

  return (
    <div className={cn("space-y-4", className)} dir="rtl">
      {/* Step Indicator */}
      <StepIndicator current={step} onStep={setStep} />

      {/* Steps Content */}
      <AnimatePresence mode="wait">
        {/* ── Step 1: Persona ── */}
        {step === "persona" && (
          <motion.div
            key="persona"
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25 }}
            className="space-y-5"
          >
            <Card className="p-5 sm:p-6 border-2 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <Icon name="user" className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-[16px]">شخصیت کاربری خود را انتخاب کنید</CardTitle>
                  <p className="text-[12px] text-muted-foreground mt-0.5">
                    نوع استفاده شما به ما کمک می‌کند بهترین گزینه را پیشنهاد دهیم
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {personas.map((persona) => (
                  <TokenCard
                    key={persona}
                    selected={state.persona === persona}
                    title={personaLabels[persona].title}
                    desc={personaLabels[persona].desc}
                    emoji={personaLabels[persona].emoji}
                    onClick={() => update("persona", persona)}
                  />
                ))}
              </div>
            </Card>

            <div className="flex justify-center">
              <Button
                onClick={goNext}
                disabled={!hasPersona}
                size="lg"
                className="h-12 px-10 text-[14px] font-bold rounded-xl"
              >
                {hasPersona ? "مرحله بعد — نیازمندی‌ها" : "لطفاً یک گزینه انتخاب کنید"}
                <Icon name="chevronLeft" className="mr-2 h-4 w-4 rtl:rotate-180" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* ── Step 2: Workloads ── */}
        {step === "workloads" && (
          <motion.div
            key="workloads"
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25 }}
            className="space-y-5"
          >
            <Card className="p-5 sm:p-6 border-2 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <Icon name="tools" className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-[16px]">سرویس‌ها و نیازمندی‌های خود را انتخاب کنید</CardTitle>
                  <p className="text-[12px] text-muted-foreground mt-0.5">
                    هرچه تعداد بیشتری انتخاب کنید، پیشنهاد دقیق‌تری دریافت می‌کنید
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {workloads.map((w) => (
                  <WorkloadToken
                    key={w}
                    selected={state.workloads.includes(w)}
                    title={workloadLabels[w].title}
                    desc={workloadLabels[w].desc}
                    icon={workloadLabels[w].icon}
                    onClick={() => toggleWorkload(w)}
                  />
                ))}
              </div>

              {hasWorkloads && (
                <div className="mt-4 flex flex-wrap gap-1.5 p-3 rounded-xl bg-muted/30">
                  <span className="text-[11px] text-muted-foreground ml-2">انتخاب شده:</span>
                  {state.workloads.map((w) => (
                    <Badge key={w} variant="secondary" className="text-[10px]">
                      {workloadLabels[w].title}
                      <button
                        type="button"
                        onClick={() => toggleWorkload(w)}
                        className="mr-1 hover:text-destructive"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </Card>

            <div className="flex justify-between">
              <Button onClick={goBack} variant="outline" size="sm" className="rounded-xl">
                <Icon name="chevronRight" className="ml-1 h-4 w-4 rtl:rotate-180" />
                مرحله قبل
              </Button>
              <Button
                onClick={goNext}
                size="lg"
                className="h-12 px-10 text-[14px] font-bold rounded-xl"
                disabled={!hasWorkloads}
              >
                مرحله بعد — ظرفیت و RAID
                <Icon name="chevronLeft" className="mr-2 h-4 w-4 rtl:rotate-180" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* ── Step 3: Capacity & RAID ── */}
        {step === "capacity" && (
          <motion.div
            key="capacity"
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25 }}
            className="space-y-5"
          >
            <Card className="p-5 sm:p-6 border-2 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <Icon name="disk" className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-[16px]">مشخصات فنی و ظرفیت</CardTitle>
                  <p className="text-[12px] text-muted-foreground mt-0.5">
                    RAID، تعداد کاربران، ظرفیت و بودجه خود را مشخص کنید
                  </p>
                </div>
              </div>

              {/* RAID Selection */}
              <div className="mb-6">
                <Label className="text-[13px] font-extrabold mb-3 block">نوع RAID</Label>
                <RaidSelector selected={state.raid} onChange={(r) => update("raid", r)} />
              </div>

              {/* Sliders */}
              <div className="grid gap-5 sm:grid-cols-2">
                <RangeField
                  label="تعداد کاربران همزمان"
                  value={state.users}
                  min={1}
                  max={120}
                  suffix="کاربر"
                  onChange={(v) => update("users", v)}
                />
                <RangeField
                  label="ظرفیت قابل استفاده موردنیاز"
                  value={state.usableTb}
                  min={2}
                  max={160}
                  step={2}
                  suffix="TB"
                  onChange={(v) => update("usableTb", v)}
                />
                <RangeField
                  label="تعداد دوربین‌ها"
                  value={state.cameras}
                  min={0}
                  max={64}
                  suffix="دوربین"
                  onChange={(v) => update("cameras", v)}
                />
                <RangeField
                  label="بودجه هدف"
                  value={state.budgetTier}
                  min={1}
                  max={5}
                  suffix="از ۵"
                  onChange={(v) => update("budgetTier", v as SelectorState["budgetTier"])}
                />
              </div>

              {/* Toggle options */}
              <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="flex items-center gap-3 p-3 rounded-xl border-2 border-border/50 hover:border-primary/20 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={state.nvme}
                    onChange={(e) => update("nvme", e.target.checked)}
                    className="rounded border-border size-4 accent-primary"
                  />
                  <div>
                    <div className="text-[12px] font-bold">NVMe / کش SSD</div>
                    <div className="text-[10px] text-muted-foreground">دسترسی پرسرعت با حافظه NVMe</div>
                  </div>
                </label>
                <label className="flex items-center gap-3 p-3 rounded-xl border-2 border-border/50 hover:border-primary/20 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={state.rackmount}
                    onChange={(e) => update("rackmount", e.target.checked)}
                    className="rounded border-border size-4 accent-primary"
                  />
                  <div>
                    <div className="text-[12px] font-bold">فرم‌فکتور Rackmount</div>
                    <div className="text-[10px] text-muted-foreground">قابلیت نصب در رک و دیتاسنتر</div>
                  </div>
                </label>
              </div>
            </Card>

            {/* Capacity Matrix */}
            <CapacityMatrix state={state} />

            <div className="flex justify-between">
              <Button onClick={goBack} variant="outline" size="sm" className="rounded-xl">
                <Icon name="chevronRight" className="ml-1 h-4 w-4 rtl:rotate-180" />
                مرحله قبل
              </Button>
              <Button
                onClick={() => setStep("results")}
                size="lg"
                className="h-12 px-10 text-[14px] font-bold rounded-xl"
              >
                مشاهده نتایج
                <Icon name="star" className="mr-2 h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* ── Step 4: Results ── */}
        {step === "results" && (
          <motion.div
            key="results"
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="space-y-5"
          >
            {/* Summary Bar */}
            <Card className="p-4 sm:p-5 border-2 bg-gradient-to-l from-primary/5 to-transparent">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                    <Icon name="star" className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-[15px]">نتایج انتخاب ذخیره‌ساز شبکه</CardTitle>
                    <p className="text-[11px] text-muted-foreground">
                      {state.persona && personaLabels[state.persona]?.title} • {state.workloads.length} سرویس • {persianNumber(state.usableTb)} TB • {raidLabels[state.raid]?.title}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setStep("persona")}
                  className="rounded-xl text-[11px]"
                >
                  شروع مجدد
                  <Icon name="refresh" className="mr-1 h-3 w-3" />
                </Button>
              </div>
            </Card>

            {/* Top Pick */}
            {top && top.match > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Icon name="flame" className="h-4 w-4 text-primary" />
                  <h3 className="text-[14px] font-extrabold">بهترین پیشنهاد برای شما</h3>
                </div>
                <ProductResultCard product={top} isTop />
              </div>
            )}

            {/* No results */}
            {(!top || top.match <= 0) && (
              <Card className="p-8 text-center border-2">
                <Icon name="server" className="h-12 w-12 mx-auto text-muted-foreground/40" />
                <h3 className="mt-4 text-[15px] font-bold">محصولی با مشخصات شما یافت نشد</h3>
                <p className="mt-1 text-[12px] text-muted-foreground">
                  لطفاً تنظیمات خود را تغییر دهید یا با کارشناسان ما تماس بگیرید.
                </p>
                <div className="mt-4 flex justify-center gap-3">
                  <Button variant="outline" onClick={() => setStep("capacity")} size="sm">
                    تغییر تنظیمات
                  </Button>
                  {consultationHref && (
                    <ButtonLink size="sm" href={consultationHref}>مشاوره رایگان</ButtonLink>
                  )}
                </div>
              </Card>
            )}

            {/* All Results */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Icon name="server" className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-[14px] font-extrabold">تمام محصولات (مرتب‌سازی بر اساس تطابق)</h3>
                </div>
              </div>
              <div className="grid gap-3">
                {scored.slice(0, 8).map((p) => (
                  <ProductResultCard key={p.id} product={p} />
                ))}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 pb-6">
              <Button
                variant="outline"
                onClick={() => setStep("capacity")}
                className="rounded-xl text-[12px]"
              >
                <Icon name="settings" className="ml-1 h-4 w-4" />
                بازگشت به تنظیمات
              </Button>
              {compareHref && (
                <ButtonLink variant="secondary" className="rounded-xl text-[12px]" href={compareHref}>
                  <Icon name="shuffle" className="ml-1 h-4 w-4" />
                  مقایسه محصولات
                </ButtonLink>
              )}
              {consultationHref && (
                <ButtonLink className="rounded-xl text-[12px]" href={consultationHref}>
                  <Icon name="headset" className="ml-1 h-4 w-4" />
                  مشاوره رایگان تخصصی
                </ButtonLink>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
