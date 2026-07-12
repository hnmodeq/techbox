"use client";

import * as React from "react";
import { Icon } from "@/design/icons";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  onProductSelect?: (product: ScoredProduct, state: SelectorState) => void;
  compareHref?: string;
  consultationHref?: string;
  className?: string;
};

const personas = Object.keys(personaLabels) as NasPersona[];
const workloads = Object.keys(workloadLabels) as NasWorkload[];
const raidTypes = Object.keys(raidLabels) as RaidType[];
const driveSizes = [4, 8, 12, 16, 20, 22] as const;

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

function ToggleCard({
  selected,
  title,
  desc,
  onClick,
  icon = "check",
}: {
  selected: boolean;
  title: string;
  desc?: string;
  onClick: () => void;
  icon?: "check" | "server" | "disk" | "shield";
}) {
  return (
    <Card
      onClick={onClick}
      className={`group relative flex min-h-[92px] w-full cursor-pointer flex-col items-start gap-3 p-4 text-right transition-all ${selected ? "border-primary/50 bg-primary/10 shadow-sm" : "hover:-translate-y-0.5 hover:bg-muted"}`}
    >
      <div className="flex w-full items-start gap-3">
        <div className={`mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border ${selected ? "border-primary/35 bg-primary text-primary-foreground" : "border-border bg-muted text-muted-foreground"}`}>
          <Icon name={icon} className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="block text-[14px] font-black">{title}</div>
          {desc ? <div className="mt-1 block text-[12px] leading-6 text-muted-foreground">{desc}</div> : null}
        </div>
        {selected && <Badge variant="default" className="ms-auto">انتخاب</Badge>}
      </div>
    </Card>
  );
}

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
    <Card className="p-4 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <Label className="text-[13px] font-extrabold">{label}</Label>
        <Badge variant="secondary">
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
      />
    </Card>
  );
}

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

function CapacityMatrix({ state }: { state: SelectorState }) {
  const rows = [2, 4, 6, 8, 12];
  const raids: RaidType[] = ["raid1", "raid5", "raid6", "raid10"];
  return (
    <Card className="overflow-hidden p-0">
      <CardHeader className="flex flex-row items-center justify-between gap-3 border-b p-4">
        <div>
          <CardTitle className="text-[15px]">جدول سریع ظرفیت قابل استفاده</CardTitle>
          <p className="mt-1 text-[12px] text-muted-foreground">بر اساس دیسک {persianNumber(state.driveTb)} ترابایت</p>
        </div>
        <Icon name="disk" className="h-5 w-5 text-primary" />
      </CardHeader>
      <CardContent className="p-0 overflow-x-auto">
        <table className="w-full min-w-[520px] border-collapse text-center text-[12px]">
          <thead className="bg-muted text-muted-foreground">
            <tr>
              <th className="p-3 font-black">Bay</th>
              {raids.map((raid) => (
                <th key={raid} className="p-3 font-black">{raidLabels[raid].title}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((bays) => (
              <tr key={bays} className="border-t">
                <td className="p-3 font-black">{persianNumber(bays)}</td>
                {raids.map((raid) => {
                  const value = estimateUsableCapacity(bays, state.driveTb, raid);
                  const active = state.raid === raid && value >= state.usableTb;
                  return (
                    <td key={raid} className={cn("p-3", active && "bg-green-500/10 font-black")}>
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

export default function NasSelector({ products, initialState, onProductSelect, compareHref, consultationHref, className }: NasSelectorProps) {
  const [state, setState] = React.useState<SelectorState>({ ...defaultSelectorState, ...initialState });

  const update = <K extends keyof SelectorState>(key: K, value: SelectorState[K]) => {
    setState((prev) => ({ ...prev, [key]: value }));
  };

  const toggleWorkload = (workload: NasWorkload) => {
    setState((prev) => ({
      ...prev,
      workloads: prev.workloads.includes(workload) ? prev.workloads.filter((w) => w !== workload) : [...prev.workloads, workload],
    }));
  };

  const scored = React.useMemo(() => {
    return products.map((p) => scoreProduct(p, state)).sort((a, b) => b.match - a.match);
  }, [products, state]);

  const top = scored[0];

  return (
    <div className={cn("space-y-6", className)} dir="rtl">
      <Card className="p-5 space-y-4">
        <CardTitle>انتخاب‌گر NAS — نیازسنجی هوشمند</CardTitle>
        <p className="text-sm text-muted-foreground">پرسونای کاری، حجم کاربران و سرویس‌ها را انتخاب کنید تا بهترین NAS پیشنهاد شود.</p>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {personas.map((persona) => (
            <ToggleCard
              key={persona}
              selected={state.persona === persona}
              title={personaLabels[persona].title}
              desc={personaLabels[persona].desc}
              onClick={() => update("persona", persona)}
              icon="server"
            />
          ))}
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-4 space-y-3">
          <CardTitle className="text-sm">نوع کاربری</CardTitle>
          <div className="grid grid-cols-2 gap-2">
            {workloads.map((w) => (
              <Button key={w} variant={state.workloads.includes(w) ? "secondary" : "ghost"} size="sm" onClick={() => toggleWorkload(w)} className="justify-start">
                {workloadLabels[w].title}
              </Button>
            ))}
          </div>
        </Card>

        <Card className="p-4 space-y-3">
          <CardTitle className="text-sm">RAID مورد نظر</CardTitle>
          <div className="grid grid-cols-2 gap-2">
            {raidTypes.map((r) => (
              <Button key={r} variant={state.raid === r ? "secondary" : "ghost"} size="sm" onClick={() => update("raid", r)} className="justify-start">
                {raidLabels[r].title}
              </Button>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <RangeField label="تعداد کاربران همزمان" value={state.users} min={1} max={120} suffix="کاربر" onChange={(v) => update("users", v)} />
        <RangeField label="ظرفیت قابل استفاده موردنیاز" value={state.usableTb} min={2} max={160} step={2} suffix="TB" onChange={(v) => update("usableTb", v)} />
        <RangeField label="تعداد دوربین‌ها" value={state.cameras} min={0} max={64} suffix="دوربین" onChange={(v) => update("cameras", v)} />
        <RangeField label="بودجه هدف" value={state.budgetTier} min={1} max={5} suffix="از ۵" onChange={(v) => update("budgetTier", v as SelectorState["budgetTier"])} />
      </div>

      <CapacityMatrix state={state} />

      {top && (
        <Card className="p-5 border-primary/30 bg-primary/5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <Badge variant="default">بهترین پیشنهاد — {top.match}% تطابق</Badge>
              <h3 className="mt-2 text-lg font-black">{top.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{top.bays} Bay • {persianNumber(top.usableTb)} TB قابل استفاده • {top.cpuTier} CPU Tier</p>
              <div className="mt-3 flex flex-wrap gap-1">
                {top.reasons.map((r, i) => (
                  <Badge key={i} variant="secondary" className="text-[11px]">{r}</Badge>
                ))}
              </div>
              {top.warnings.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {top.warnings.map((w, i) => (
                    <Badge key={i} variant="destructive" className="text-[11px]">{w}</Badge>
                  ))}
                </div>
              )}
            </div>
            <Button
              onClick={() => onProductSelect?.(top, state)}
              size="sm"
            >
              انتخاب
            </Button>
          </div>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {scored.slice(0, 6).map((p) => (
          <Card key={p.id} className="p-4 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start gap-2">
              <h4 className="font-bold text-sm">{p.title}</h4>
              <Badge variant={p.match > 70 ? "default" : "secondary"}>{p.match}%</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">{p.bays} Bay • {p.formFactor} • {persianNumber(p.usableTb)} TB usable</p>
            <div className="mt-3 flex gap-2">
              <Button size="xs" variant="outline" onClick={() => onProductSelect?.(p, state)}>جزئیات</Button>
              {compareHref && <a href={compareHref} className="inline-flex h-6 items-center justify-center rounded-md px-2 text-xs hover:bg-muted">مقایسه</a>}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
