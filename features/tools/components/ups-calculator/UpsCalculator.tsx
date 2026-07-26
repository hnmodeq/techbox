"use client";

/**
 * UPS / rack power calculator.
 *
 * Sizing logic lives in lib/ups.ts (pure + unit-tested); this file is only
 * the form and the result presentation.
 *
 * Two deliberate choices:
 *  - Every result shows the assumption it was derived under. A sizing tool
 *    that hides its model invites people to over-trust it.
 *  - Results link into the real shop catalogue by VA range, so the tool
 *    ends somewhere useful rather than at a number.
 *
 * Docs: docs/homepage-upgrade/04-PHASES.md (task D2)
 */
import * as React from "react";
import Link from "next/link";
import {
  calculateUps,
  DEFAULT_UPS_LOADS,
  DEFAULT_POWER_FACTOR,
  type UpsLoad,
  type Redundancy,
} from "@/lib/ups";
import { Num } from "@/components/ui/num";
import { toFa } from "@/lib/date-format";

let uid = 0;
const nextId = () => `row-${++uid}`;

export function UpsCalculator() {
  const [rows, setRows] = React.useState<UpsLoad[]>(DEFAULT_UPS_LOADS);
  const [runtime, setRuntime] = React.useState(15);
  const [pf, setPf] = React.useState(DEFAULT_POWER_FACTOR);
  const [growth, setGrowth] = React.useState(15);
  const [redundancy, setRedundancy] = React.useState<Redundancy>("N");

  const result = React.useMemo(
    () =>
      calculateUps({
        loads: rows,
        runtimeMinutes: runtime,
        powerFactor: pf,
        growthPercent: growth,
        redundancy,
      }),
    [rows, runtime, pf, growth, redundancy],
  );

  const update = (id: string, patch: Partial<UpsLoad>) =>
    setRows((r) => r.map((x) => (x.id === id ? { ...x, ...patch } : x)));

  const addRow = () =>
    setRows((r) => [...r, { id: nextId(), label: "تجهیز جدید", watts: 100, quantity: 1 }]);

  const removeRow = (id: string) => setRows((r) => r.filter((x) => x.id !== id));

  return (
    <div dir="rtl" className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
      {/* ── Inputs ─────────────────────────────────────────────── */}
      <section className="rounded-lg border border-border bg-card p-5 shadow-sm">
        <h2 className="mb-4 text-lg font-bold text-foreground">تجهیزات متصل</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-start text-xs text-muted-foreground">
                <th scope="col" className="pb-2 text-start font-medium">نام تجهیز</th>
                <th scope="col" className="pb-2 text-start font-medium">توان (وات)</th>
                <th scope="col" className="pb-2 text-start font-medium">تعداد</th>
                <th scope="col" className="pb-2 text-start font-medium">جمع</th>
                <th scope="col" className="pb-2"><span className="sr-only">حذف</span></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b border-border/60 last:border-0">
                  <td className="py-2 pe-2">
                    <input
                      aria-label="نام تجهیز"
                      value={row.label}
                      onChange={(e) => update(row.id, { label: e.target.value })}
                      className="w-full min-w-[8rem] rounded-md border border-border bg-background px-2 py-1.5 text-foreground focus:border-primary focus:outline-none"
                    />
                  </td>
                  <td className="py-2 pe-2">
                    <input
                      aria-label={`توان ${row.label} به وات`}
                      type="number"
                      min={0}
                      inputMode="numeric"
                      value={row.watts}
                      onChange={(e) => update(row.id, { watts: Number(e.target.value) })}
                      className="w-24 rounded-md border border-border bg-background px-2 py-1.5 text-foreground focus:border-primary focus:outline-none"
                    />
                  </td>
                  <td className="py-2 pe-2">
                    <input
                      aria-label={`تعداد ${row.label}`}
                      type="number"
                      min={0}
                      inputMode="numeric"
                      value={row.quantity}
                      onChange={(e) => update(row.id, { quantity: Number(e.target.value) })}
                      className="w-20 rounded-md border border-border bg-background px-2 py-1.5 text-foreground focus:border-primary focus:outline-none"
                    />
                  </td>
                  <td className="py-2 pe-2 whitespace-nowrap text-muted-foreground">
                    <Num>{(row.watts || 0) * (row.quantity || 0)}</Num> وات
                  </td>
                  <td className="py-2 text-end">
                    <button
                      type="button"
                      onClick={() => removeRow(row.id)}
                      aria-label={`حذف ${row.label}`}
                      className="rounded-md px-2 py-1 text-muted-foreground transition-colors hover:bg-muted hover:text-destructive"
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button
          type="button"
          onClick={addRow}
          className="mt-3 rounded-md border border-border px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
        >
          + افزودن تجهیز
        </button>

        {/* ── Parameters ── */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Field
            id="ups-runtime"
            label="زمان پشتیبانی موردنیاز"
            hint="دقیقه"
            value={runtime}
            min={0}
            max={240}
            onChange={setRuntime}
          />
          <Field
            id="ups-growth"
            label="حاشیه رشد آینده"
            hint="درصد"
            value={growth}
            min={0}
            max={100}
            onChange={setGrowth}
          />

          <div>
            <label htmlFor="ups-pf" className="mb-1.5 block text-sm font-medium text-foreground">
              ضریب توان (PF)
            </label>
            <input
              id="ups-pf"
              type="number"
              step={0.05}
              min={0.5}
              max={1}
              value={pf}
              onChange={(e) => setPf(Number(e.target.value))}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              معمولاً بین <span lang="en" dir="ltr">0.8</span> تا <span lang="en" dir="ltr">1.0</span>
            </p>
          </div>

          <fieldset>
            <legend className="mb-1.5 block text-sm font-medium text-foreground">افزونگی</legend>
            <div className="flex gap-2">
              {(["N", "N+1"] as Redundancy[]).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setRedundancy(mode)}
                  aria-pressed={redundancy === mode}
                  className={`flex-1 rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                    redundancy === mode
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-foreground hover:bg-muted"
                  }`}
                >
                  <span lang="en" dir="ltr">{mode}</span>
                </button>
              ))}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              N+1 یعنی یک دستگاه یدکی هم‌ظرفیت
            </p>
          </fieldset>
        </div>
      </section>

      {/* ── Results ────────────────────────────────────────────── */}
      <aside className="space-y-4">
        <div
          className="rounded-lg border border-border bg-card p-5 shadow-sm"
          aria-live="polite"
        >
          <h2 className="mb-4 text-lg font-bold text-foreground">نتیجه محاسبه</h2>

          {!result.valid ? (
            <p className="text-sm text-muted-foreground">{result.warnings[0]}</p>
          ) : (
            <>
              <div className="rounded-md bg-primary/10 p-4 text-center">
                <p className="text-xs text-muted-foreground">ظرفیت پیشنهادی UPS</p>
                <p className="mt-1 text-3xl font-extrabold text-primary">
                  {result.recommendedVa ? (
                    <>
                      <Num>{result.recommendedVa}</Num>{" "}
                      <span lang="en" dir="ltr" className="text-xl">VA</span>
                    </>
                  ) : (
                    "—"
                  )}
                </p>
                {result.recommendedVa && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    بارگذاری حدود <Num>{Math.round(result.utilisation * 100)}</Num>٪ ظرفیت
                  </p>
                )}
              </div>

              <dl className="mt-4 space-y-2 text-sm">
                <Row label="بار متصل" value={`${toFa(result.loadWatts)} وات`} />
                <Row label="بار طراحی (با رشد)" value={`${toFa(result.designWatts)} وات`} />
                <Row label="معادل توان ظاهری" value={`${toFa(result.designVa)} VA`} latin />
                {result.batteryBlocks > 0 && (
                  <>
                    <Row label="بلوک باتری موردنیاز" value={`${toFa(result.batteryBlocks)} عدد`} />
                    <Row
                      label="زمان پشتیبانی تخمینی"
                      value={`${toFa(result.estimatedRuntimeMinutes)} دقیقه`}
                    />
                  </>
                )}
                <Row label="گرمای تولیدی" value={`${toFa(result.heatBtuPerHour)} BTU/hr`} latin />
                <Row label="مصرف سالانه" value={`${toFa(result.annualKwh)} kWh`} latin />
              </dl>
            </>
          )}
        </div>

        {result.warnings.length > 0 && result.valid && (
          <ul className="space-y-2 rounded-lg border border-warning/40 bg-warning/10 p-4 text-sm text-foreground">
            {result.warnings.map((w, i) => (
              <li key={i} className="flex gap-2">
                <span aria-hidden="true">⚠</span>
                <span>{w}</span>
              </li>
            ))}
          </ul>
        )}

        {/* The tool should end somewhere useful, not at a number. */}
        {result.valid && result.recommendedVa && (
          <Link
            href={`/search?q=${encodeURIComponent(`UPS ${result.recommendedVa}VA`)}`}
            className="block rounded-lg bg-primary px-4 py-3 text-center text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90"
          >
            جست‌وجوی UPS متناسب در فروشگاه <span aria-hidden="true">←</span>
          </Link>
        )}

        {result.assumptions.length > 0 && (
          <details className="rounded-lg border border-border bg-card p-4 text-sm">
            <summary className="cursor-pointer font-medium text-foreground">
              مفروضات محاسبه
            </summary>
            <ul className="mt-2 space-y-1 text-muted-foreground">
              {result.assumptions.map((a, i) => (
                <li key={i}>• {a}</li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-muted-foreground">
              این ابزار برای برآورد اولیه است. برای طراحی نهایی اتاق سرور، محاسبات را با
              مشخصات دقیق تجهیزات و شرایط محیطی بازبینی کنید.
            </p>
          </details>
        )}
      </aside>
    </div>
  );
}

function Field({
  id, label, hint, value, min, max, onChange,
}: {
  id: string; label: string; hint: string;
  value: number; min: number; max: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-foreground">
        {label}
      </label>
      <input
        id={id}
        type="number"
        min={min}
        max={max}
        inputMode="numeric"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full rounded-md border border-border bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none"
      />
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}

function Row({ label, value, latin }: { label: string; value: string; latin?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-border/50 pb-2 last:border-0">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={`font-bold text-foreground ${latin ? "" : ""}`}>
        {latin ? <span dir="ltr">{value}</span> : value}
      </dd>
    </div>
  );
}

export default UpsCalculator;
