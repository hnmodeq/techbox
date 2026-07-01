"use client";

import * as React from "react";
import { Icon } from "@/design/icons";
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
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group relative flex min-h-[92px] w-full items-start gap-3 rounded-[var(--tb-radius-lg)] border p-4 text-right transition-all duration-[var(--tb-motion-md)] ease-[var(--tb-ease)]",
        selected
          ? "border-[color-mix(in_oklch,var(--tb-primary)_48%,var(--tb-border))] bg-[color-mix(in_oklch,var(--tb-primary)_10%,var(--tb-bg-secondary))] shadow-[var(--tb-shadow-sm)]"
          : "border-[var(--tb-border)] bg-[var(--tb-bg-secondary)] hover:-translate-y-0.5 hover:bg-[var(--tb-bg-muted)]",
      )}
      aria-pressed={selected}
    >
      <span
        className={cn(
          "mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--tb-radius-md)] border",
          selected
            ? "border-[color-mix(in_oklch,var(--tb-primary)_35%,transparent)] bg-[var(--tb-primary)] text-[var(--tb-on-accent)]"
            : "border-[var(--tb-border)] bg-[var(--tb-bg-muted)] text-[var(--tb-fg-muted)]",
        )}
      >
        <Icon name={icon} className="h-4 w-4" />
      </span>
      <span className="min-w-0">
        <span className="block text-[14px] font-black text-[var(--tb-fg-primary)]">{title}</span>
        {desc ? <span className="mt-1 block text-[12px] leading-6 text-[var(--tb-fg-muted)]">{desc}</span> : null}
      </span>
    </button>
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
  const percent = ((value - min) / (max - min)) * 100;
  return (
    <label className="block rounded-[var(--tb-radius-lg)] border border-[var(--tb-border)] bg-[var(--tb-bg-secondary)] p-4">
      <span className="flex items-center justify-between gap-3">
        <span className="text-[13px] font-extrabold text-[var(--tb-fg-primary)]">{label}</span>
        <span className="badge bg-[color-mix(in_oklch,var(--tb-primary)_10%,var(--tb-bg-muted))] text-[var(--tb-fg-primary)]">
          {persianNumber(value)} {suffix}
        </span>
      </span>
      <input
        className="mt-4 h-2 w-full cursor-pointer appearance-none rounded-full bg-[var(--tb-bg-muted)] accent-[var(--tb-primary)]"
        style={{ background: `linear-gradient(to left, var(--tb-primary) ${percent}%, var(--tb-bg-muted) ${percent}%)` }}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.currentTarget.value))}
      />
    </label>
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
    <div className="overflow-hidden rounded-[var(--tb-radius-lg)] border border-[var(--tb-border)] bg-[var(--tb-bg-secondary)]">
      <div className="flex items-center justify-between gap-3 border-b border-[var(--tb-border)] p-4">
        <div>
          <h3 className="text-[15px] font-black">جدول سریع ظرفیت قابل استفاده</h3>
          <p className="mt-1 text-[12px] leading-6 text-[var(--tb-fg-muted)]">بر اساس دیسک {persianNumber(state.driveTb)} ترابایت</p>
        </div>
        <Icon name="disk" className="h-5 w-5 text-[var(--tb-primary)]" />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] border-collapse text-center text-[12px]">
          <thead className="bg-[var(--tb-bg-muted)] text-[var(--tb-fg-muted)]">
            <tr>
              <th className="p-3 font-black">Bay</th>
              {raids.map((raid) => (
                <th key={raid} className="p-3 font-black">{raidLabels[raid].title}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((bays) => (
              <tr key={bays} className="border-t border-[var(--tb-border)]">
                <td className="p-3 font-black text-[var(--tb-fg-primary)]">{persianNumber(bays)}</td>
                {raids.map((raid) => {
                  const value = estimateUsableCapacity(bays, state.driveTb, raid);
                  const active = state.raid === raid && value >= state.usableTb;
                  return (
                    <td key={raid} className={cn("p-3", active && "bg-[color-mix(in_oklch,var(--tb-success)_16%,transparent)] font-black text-[var(--tb-fg-primary)]")}>
                      {value > 0 ? `${persianNumber(value)} TB` : "—"}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ProductCard({
  product,
  rank,
  selected,
  onToggleCompare,
  onSelect,
}: {
  product: ScoredProduct;
  rank: number;
  selected: boolean;
  onToggleCompare: () => void;
  onSelect?: () => void;
}) {
  return (
    <article className="relative overflow-hidden rounded-[var(--tb-radius-lg)] border border-[var(--tb-border)] bg-[var(--tb-bg-secondary)] p-4 shadow-[var(--tb-shadow-sm)] transition-all duration-[var(--tb-motion-md)] hover:-translate-y-1 hover:shadow-[var(--tb-shadow-md)]">
      {rank === 0 ? (
        <div className="absolute left-4 top-4 rounded-full bg-[linear-gradient(135deg,var(--tb-primary),var(--tb-vip))] px-3 py-1 text-[11px] font-black text-[var(--tb-on-accent)]">
          بهترین پیشنهاد
        </div>
      ) : null}

      <div className="flex items-start gap-4">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[var(--tb-radius-lg)] border border-[var(--tb-border)] bg-[radial-gradient(circle_at_30%_20%,color-mix(in_oklch,var(--tb-primary)_20%,transparent),transparent_45%),var(--tb-bg-muted)]">
          <Icon name={product.formFactor === "rackmount" ? "server" : "disk"} className="h-9 w-9 text-[var(--tb-primary)]" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-[16px] font-black text-[var(--tb-fg-primary)]">{product.title}</h3>
          <p className="mt-1 text-[12px] leading-6 text-[var(--tb-fg-muted)]">{product.subtitle}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {product.tags.map((tag) => <span key={tag} className="badge">{tag}</span>)}
          </div>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[
          ["Bay", persianNumber(product.bays)],
          ["ظرفیت RAID", `${persianNumber(product.usableTb)} TB`],
          ["RAM", `${persianNumber(product.maxRamGb)} GB`],
          ["شبکه", `${persianNumber(product.networkGbE)} GbE`],
        ].map(([label, value]) => (
          <div key={label as string} className="rounded-[var(--tb-radius-md)] bg-[var(--tb-bg-muted)] p-3 text-center">
            <div className="text-[11px] text-[var(--tb-fg-muted)]">{label}</div>
            <div className="mt-1 text-[13px] font-black text-[var(--tb-fg-primary)]">{value}</div>
          </div>
        ))}
      </div>

      <div className="mt-5 flex items-center gap-3">
        <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-[var(--tb-bg-muted)]">
          <div className="h-full rounded-full bg-[linear-gradient(90deg,var(--tb-success),var(--tb-primary))]" style={{ width: `${product.match}%` }} />
        </div>
        <span className="text-[13px] font-black text-[var(--tb-fg-primary)]">{persianNumber(product.match)}٪ تطابق</span>
      </div>

      <div className="mt-4 space-y-2">
        {product.reasons.map((reason) => (
          <div key={reason} className="flex items-start gap-2 text-[12px] leading-6 text-[var(--tb-fg-secondary)]">
            <Icon name="check" className="mt-1 h-4 w-4 shrink-0 text-[var(--tb-success)]" />
            <span>{reason}</span>
          </div>
        ))}
        {product.warnings.map((warning) => (
          <div key={warning} className="flex items-start gap-2 text-[12px] leading-6 text-[var(--tb-fg-muted)]">
            <Icon name="shield" className="mt-1 h-4 w-4 shrink-0 text-[var(--tb-warning)]" />
            <span>{warning}</span>
          </div>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {product.href ? (
          <a href={product.href} onClick={onSelect} className="btn btn-primary flex-1">مشاهده / خرید</a>
        ) : (
          <button type="button" onClick={onSelect} className="btn btn-primary flex-1">مشاهده / خرید</button>
        )}
        <button type="button" onClick={onToggleCompare} className={cn("btn btn-ghost", selected && "bg-[var(--tb-bg-muted)] text-[var(--tb-primary)]")}>
          {selected ? "حذف از مقایسه" : "افزودن به مقایسه"}
        </button>
      </div>

      {product.price ? (
        <div className="mt-3 text-left text-[12px] text-[var(--tb-fg-muted)]">
          {persianNumber(product.price.toLocaleString("fa-IR"))} تومان
        </div>
      ) : null}
    </article>
  );
}

export function NasSelector({
  products,
  initialState,
  onProductSelect,
  compareHref = "/shop/compare",
  consultationHref = "/consultation",
  className,
}: NasSelectorProps) {
  const [state, setState] = React.useState<SelectorState>({ ...defaultSelectorState, ...initialState });
  const [compareIds, setCompareIds] = React.useState<string[]>([]);

  const minBays = React.useMemo(() => minimumBaysForCapacity(state.usableTb, state.driveTb, state.raid), [state.usableTb, state.driveTb, state.raid]);
  const recommendations = React.useMemo(
    () => products.map((product) => scoreProduct(product, state)).sort((a, b) => b.match - a.match),
    [products, state],
  );
  const top = recommendations[0];

  const update = <K extends keyof SelectorState>(key: K, value: SelectorState[K]) => setState((prev) => ({ ...prev, [key]: value }));
  const toggleWorkload = (workload: NasWorkload) => {
    setState((prev) => {
      const exists = prev.workloads.includes(workload);
      const next = exists ? prev.workloads.filter((item) => item !== workload) : [...prev.workloads, workload];
      return { ...prev, workloads: next.length ? next : prev.workloads };
    });
  };
  const toggleCompare = (id: string) => {
    setCompareIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : prev.length >= 3 ? [...prev.slice(1), id] : [...prev, id]));
  };

  return (
    <section dir="rtl" className={cn("font-sans text-[var(--tb-fg-primary)]", className)}>
      <div className="relative overflow-hidden rounded-[calc(var(--tb-radius-lg)+8px)] border border-[var(--tb-border)] bg-[var(--tb-bg-secondary)] shadow-[var(--tb-shadow-md)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_10%,color-mix(in_oklch,var(--tb-primary)_18%,transparent),transparent_32%),radial-gradient(circle_at_85%_15%,color-mix(in_oklch,var(--tb-vip)_14%,transparent),transparent_30%)]" />
        <div className="relative grid gap-6 p-4 sm:p-6 lg:grid-cols-[minmax(0,1.05fr)_380px] lg:p-8">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="badge bg-[color-mix(in_oklch,var(--tb-tools)_16%,var(--tb-bg-muted))] text-[var(--tb-fg-primary)]">
                <Icon name="server" className="h-3.5 w-3.5" /> انتخاب‌گر NAS
              </span>
              <span className="badge">RTL / فارسی / TailwindCSS 4</span>
            </div>
            <h1 className="mt-4 tb-text-hero">NAS مناسب خود را در چند دقیقه پیدا کنید</h1>
            <p className="mt-3 max-w-2xl text-[14px] leading-8 text-[var(--tb-fg-muted)]">
              نیازها، ظرفیت، RAID، تعداد کاربران و سرویس‌ها را انتخاب کنید؛ ابزار به‌صورت زنده بهترین مدل‌ها را رتبه‌بندی و دلیل پیشنهاد را نمایش می‌دهد.
            </p>

            <div className="mt-6 grid gap-5">
              <section className="card">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h2 className="text-[16px] font-black">۱. نوع استفاده</h2>
                  <span className="text-[12px] text-[var(--tb-fg-muted)]">سناریوی اصلی را مشخص کنید</span>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {personas.map((persona) => (
                    <ToggleCard
                      key={persona}
                      selected={state.persona === persona}
                      title={personaLabels[persona].title}
                      desc={personaLabels[persona].desc}
                      icon={persona === "enterprise" ? "server" : "disk"}
                      onClick={() => update("persona", persona)}
                    />
                  ))}
                </div>
              </section>

              <section className="card">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h2 className="text-[16px] font-black">۲. سرویس‌ها و بار کاری</h2>
                  <span className="text-[12px] text-[var(--tb-fg-muted)]">چند گزینه قابل انتخاب است</span>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {workloads.map((workload) => (
                    <ToggleCard
                      key={workload}
                      selected={state.workloads.includes(workload)}
                      title={workloadLabels[workload].title}
                      desc={workloadLabels[workload].desc}
                      icon={workload === "surveillance" || workload === "highAvailability" ? "shield" : "check"}
                      onClick={() => toggleWorkload(workload)}
                    />
                  ))}
                </div>
              </section>

              <section className="card">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h2 className="text-[16px] font-black">۳. ظرفیت، RAID و عملکرد</h2>
                  <span className="badge">حداقل پیشنهادی: {persianNumber(minBays)} Bay</span>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <RangeField label="تعداد کاربران همزمان" value={state.users} min={1} max={120} suffix="کاربر" onChange={(v) => update("users", v)} />
                  <RangeField label="ظرفیت قابل استفاده موردنیاز" value={state.usableTb} min={2} max={160} step={2} suffix="TB" onChange={(v) => update("usableTb", v)} />
                  <RangeField label="تعداد دوربین‌ها" value={state.cameras} min={0} max={64} suffix="دوربین" onChange={(v) => update("cameras", v)} />
                  <RangeField label="بودجه هدف" value={state.budgetTier} min={1} max={5} suffix="از ۵" onChange={(v) => update("budgetTier", v as SelectorState["budgetTier"])} />
                </div>

                <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_1fr]">
                  <div>
                    <div className="mb-2 text-[13px] font-extrabold">ظرفیت هر هارد</div>
                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-6 lg:grid-cols-3">
                      {driveSizes.map((size) => (
                        <button key={size} type="button" onClick={() => update("driveTb", size)} className={cn("btn btn-ghost", state.driveTb === size && "border-[var(--tb-primary)] bg-[color-mix(in_oklch,var(--tb-primary)_10%,transparent)] text-[var(--tb-primary)]")}>{persianNumber(size)} TB</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="mb-2 text-[13px] font-extrabold">نوع RAID</div>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {raidTypes.map((raid) => (
                        <button key={raid} type="button" onClick={() => update("raid", raid)} className={cn("rounded-[var(--tb-radius-md)] border p-3 text-right transition", state.raid === raid ? "border-[var(--tb-primary)] bg-[color-mix(in_oklch,var(--tb-primary)_10%,transparent)]" : "border-[var(--tb-border)] bg-[var(--tb-bg-secondary)] hover:bg-[var(--tb-bg-muted)]")}>
                          <span className="block text-[12px] font-black">{raidLabels[raid].title}</span>
                          <span className="mt-1 block text-[11px] leading-5 text-[var(--tb-fg-muted)]">{raidLabels[raid].desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  <label className="rounded-[var(--tb-radius-lg)] border border-[var(--tb-border)] bg-[var(--tb-bg-secondary)] p-4">
                    <span className="text-[13px] font-extrabold">حداقل شبکه</span>
                    <select className="input mt-3" value={state.networkGbE} onChange={(e) => update("networkGbE", Number(e.currentTarget.value))}>
                      <option value={1}>1GbE</option>
                      <option value={2.5}>2.5GbE</option>
                      <option value={10}>10GbE</option>
                    </select>
                  </label>
                  <button type="button" onClick={() => update("nvme", !state.nvme)} className={cn("rounded-[var(--tb-radius-lg)] border p-4 text-right transition", state.nvme ? "border-[var(--tb-primary)] bg-[color-mix(in_oklch,var(--tb-primary)_10%,transparent)]" : "border-[var(--tb-border)] bg-[var(--tb-bg-secondary)] hover:bg-[var(--tb-bg-muted)]")}>
                    <span className="block text-[13px] font-extrabold">نیاز به NVMe / SSD Cache</span>
                    <span className="mt-2 block text-[12px] text-[var(--tb-fg-muted)]">برای دیتابیس، VM یا فایل‌های پرتکرار</span>
                  </button>
                  <button type="button" onClick={() => update("rackmount", !state.rackmount)} className={cn("rounded-[var(--tb-radius-lg)] border p-4 text-right transition", state.rackmount ? "border-[var(--tb-primary)] bg-[color-mix(in_oklch,var(--tb-primary)_10%,transparent)]" : "border-[var(--tb-border)] bg-[var(--tb-bg-secondary)] hover:bg-[var(--tb-bg-muted)]")}>
                    <span className="block text-[13px] font-extrabold">فرم‌فکتور Rackmount</span>
                    <span className="mt-2 block text-[12px] text-[var(--tb-fg-muted)]">برای رک، اتاق سرور و دیتاسنتر</span>
                  </button>
                </div>
              </section>

              <CapacityMatrix state={state} />
            </div>
          </div>

          <aside className="lg:sticky lg:top-6 lg:self-start">
            <div className="rounded-[calc(var(--tb-radius-lg)+6px)] border border-[var(--tb-border)] bg-[color-mix(in_oklch,var(--tb-bg-secondary)_88%,transparent)] p-4 shadow-[var(--tb-shadow-lg)] backdrop-blur-[var(--tb-blur-md)]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-[18px] font-black">نتایج پیشنهادی</h2>
                  <p className="mt-1 text-[12px] leading-6 text-[var(--tb-fg-muted)]">رتبه‌بندی زنده بر اساس امتیاز تطابق</p>
                </div>
                {top ? <span className="badge text-[var(--tb-primary)]">{persianNumber(top.match)}٪ بهترین</span> : null}
              </div>

              <div className="mt-4 space-y-4">
                {recommendations.slice(0, 4).map((product, index) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    rank={index}
                    selected={compareIds.includes(product.id)}
                    onToggleCompare={() => toggleCompare(product.id)}
                    onSelect={() => onProductSelect?.(product, state)}
                  />
                ))}
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <a href={`${compareHref}?ids=${compareIds.join(",")}`} className="btn btn-ghost">مقایسه محصولات {compareIds.length ? `(${persianNumber(compareIds.length)})` : ""}</a>
                <a href={consultationHref} className="btn btn-primary">درخواست مشاوره</a>
              </div>

              <p className="mt-4 rounded-[var(--tb-radius-md)] bg-[var(--tb-bg-muted)] p-3 text-[11px] leading-6 text-[var(--tb-fg-muted)]">
                نکته: ظرفیت RAID تقریبی است و باید با محدودیت فایل‌سیستم، رزرو Snapshot، Hot Spare و سیاست بکاپ شما نهایی‌سازی شود.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

export default NasSelector;
export type { ScoredProduct };
