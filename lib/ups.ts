/**
 * UPS / rack power sizing.
 *
 * Pure functions, no I/O — mirrors the shape of lib/raid.ts and
 * lib/subnet.ts so it unit-tests the same way.
 *
 * The model deliberately stays at the level an IT buyer actually reasons
 * about: how many watts am I protecting, for how long, and therefore what
 * VA rating and battery count do I need. It is a sizing aid, not an
 * electrical-engineering simulation — every result carries the assumption
 * it was derived under.
 *
 * Docs: docs/homepage-upgrade/04-PHASES.md (task D2)
 */

// ── Domain constants ──────────────────────────────────────────────────

/** Typical online/line-interactive UPS output power factor. */
export const DEFAULT_POWER_FACTOR = 0.9;

/**
 * Never size a UPS to 100% of its rating: runtime collapses, efficiency
 * drops and there is no room for a single added device. 80% is the
 * conventional design ceiling.
 */
export const DESIGN_HEADROOM = 0.8;

/** Nominal DC bus voltage per battery block, used for the runtime model. */
const BATTERY_BLOCK_VOLTS = 12;
/** Usable amp-hours per block after depth-of-discharge derating. */
const BATTERY_BLOCK_AH = 9;
/** Inverter efficiency when running on battery. */
const INVERTER_EFFICIENCY = 0.85;
/** Fraction of nameplate capacity we allow ourselves to discharge. */
const DEPTH_OF_DISCHARGE = 0.6;

/** Common commercial UPS VA ratings, ascending. */
export const UPS_VA_LADDER = [
  650, 850, 1000, 1500, 2000, 3000, 5000, 6000, 8000, 10000, 15000, 20000, 30000,
] as const;

export type Redundancy = "N" | "N+1";

export type UpsLoad = {
  id: string;
  label: string;
  /** Watts per unit. */
  watts: number;
  quantity: number;
};

export type UpsInput = {
  loads: UpsLoad[];
  /** Target runtime on battery, in minutes. */
  runtimeMinutes: number;
  /** UPS output power factor (0.5–1). */
  powerFactor?: number;
  /** N = single unit. N+1 = one spare unit's worth of capacity. */
  redundancy?: Redundancy;
  /** Extra headroom for planned growth, as a percentage (0–100). */
  growthPercent?: number;
};

export type UpsResult = {
  /** Sum of all loads, watts. */
  loadWatts: number;
  /** Load plus growth allowance, watts. */
  designWatts: number;
  /** Design watts expressed in VA at the given power factor. */
  designVa: number;
  /** VA including the 80% design ceiling and redundancy. */
  requiredVa: number;
  /** Nearest commercial rating at or above requiredVa. */
  recommendedVa: number | null;
  /** How loaded the recommended unit will be, 0–1. */
  utilisation: number;
  /** Battery blocks needed to hold designWatts for runtimeMinutes. */
  batteryBlocks: number;
  /** Estimated runtime at the recommended unit's internal battery, minutes. */
  estimatedRuntimeMinutes: number;
  /** Heat rejected into the room, for cooling sizing. */
  heatBtuPerHour: number;
  /** Rough annual energy use at the design load, kWh. */
  annualKwh: number;
  valid: boolean;
  warnings: string[];
  assumptions: string[];
};

// ── Helpers ───────────────────────────────────────────────────────────

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const isPos = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v) && v > 0;

/** Smallest ladder rating >= va, or null when the need exceeds the ladder. */
export function nearestUpsRating(va: number): number | null {
  for (const rating of UPS_VA_LADDER) if (rating >= va) return rating;
  return null;
}

/** Total connected load in watts. */
export function totalLoadWatts(loads: UpsLoad[]): number {
  return loads.reduce((sum, l) => {
    if (!isPos(l.watts) || !isPos(l.quantity)) return sum;
    return sum + l.watts * l.quantity;
  }, 0);
}

/**
 * Battery blocks required to sustain `watts` for `minutes`.
 *
 * Energy model: usable Wh per block = V × Ah × depth-of-discharge, then
 * derated by inverter efficiency. Deliberately conservative — undersizing
 * a UPS is a far worse failure than oversizing it.
 */
export function batteryBlocksFor(watts: number, minutes: number): number {
  if (!isPos(watts) || !isPos(minutes)) return 0;
  const requiredWh = (watts * minutes) / 60;
  const usableWhPerBlock =
    BATTERY_BLOCK_VOLTS * BATTERY_BLOCK_AH * DEPTH_OF_DISCHARGE * INVERTER_EFFICIENCY;
  return Math.ceil(requiredWh / usableWhPerBlock);
}

/** Inverse of the above: runtime a given block count sustains. */
export function runtimeForBlocks(watts: number, blocks: number): number {
  if (!isPos(watts) || !isPos(blocks)) return 0;
  const usableWh =
    blocks * BATTERY_BLOCK_VOLTS * BATTERY_BLOCK_AH * DEPTH_OF_DISCHARGE * INVERTER_EFFICIENCY;
  return Math.round((usableWh / watts) * 60);
}

// ── Main ──────────────────────────────────────────────────────────────

export function calculateUps(input: UpsInput): UpsResult {
  const warnings: string[] = [];
  const assumptions: string[] = [];

  const pf = clamp(input.powerFactor ?? DEFAULT_POWER_FACTOR, 0.5, 1);
  const growth = clamp(input.growthPercent ?? 0, 0, 100);
  const redundancy = input.redundancy ?? "N";
  const runtimeMinutes = isPos(input.runtimeMinutes) ? input.runtimeMinutes : 0;

  const loadWatts = totalLoadWatts(input.loads ?? []);

  if (loadWatts <= 0) {
    return {
      loadWatts: 0, designWatts: 0, designVa: 0, requiredVa: 0,
      recommendedVa: null, utilisation: 0, batteryBlocks: 0,
      estimatedRuntimeMinutes: 0, heatBtuPerHour: 0, annualKwh: 0,
      valid: false,
      warnings: ["حداقل یک تجهیز با توان مشخص وارد کنید."],
      assumptions: [],
    };
  }

  if (runtimeMinutes <= 0) {
    warnings.push("زمان پشتیبانی مشخص نشده است؛ محاسبه باتری انجام نشد.");
  }

  const designWatts = Math.round(loadWatts * (1 + growth / 100));
  const designVa = Math.ceil(designWatts / pf);

  // Design ceiling first, then redundancy: N+1 means a second unit can
  // carry the whole load, so each unit is sized for the full load.
  const withHeadroom = Math.ceil(designVa / DESIGN_HEADROOM);
  const requiredVa = redundancy === "N+1" ? withHeadroom : withHeadroom;

  const recommendedVa = nearestUpsRating(requiredVa);
  const utilisation = recommendedVa ? designVa / recommendedVa : 0;

  const batteryBlocks = batteryBlocksFor(designWatts, runtimeMinutes);
  const estimatedRuntimeMinutes = batteryBlocks
    ? runtimeForBlocks(designWatts, batteryBlocks)
    : 0;

  // 1 W dissipated ≈ 3.412 BTU/hr. UPS losses add roughly 5% at load.
  const heatBtuPerHour = Math.round(designWatts * 3.412 * 1.05);
  const annualKwh = Math.round((designWatts * 24 * 365) / 1000);

  if (!recommendedVa) {
    warnings.push(
      "توان موردنیاز از بزرگ‌ترین مدل استاندارد فراتر است؛ به راهکار ماژولار یا چند UPS موازی نیاز دارید.",
    );
  }
  if (redundancy === "N+1") {
    warnings.push("برای افزونگی N+1 به دو دستگاه با این مشخصات نیاز دارید.");
  }
  if (utilisation > DESIGN_HEADROOM) {
    warnings.push("بار طراحی به سقف ظرفیت نزدیک است؛ مدل بالاتر را در نظر بگیرید.");
  }
  if (runtimeMinutes > 60) {
    warnings.push(
      "برای زمان پشتیبانی بیش از یک ساعت، معمولاً ژنراتور اقتصادی‌تر از بانک باتری است.",
    );
  }

  assumptions.push(`ضریب توان ${pf}`);
  assumptions.push(`سقف بارگذاری ${Math.round(DESIGN_HEADROOM * 100)}٪ ظرفیت اسمی`);
  assumptions.push(`بلوک باتری ${BATTERY_BLOCK_VOLTS}V / ${BATTERY_BLOCK_AH}Ah`);
  assumptions.push(`بازده اینورتر ${Math.round(INVERTER_EFFICIENCY * 100)}٪`);
  assumptions.push(`عمق تخلیه ${Math.round(DEPTH_OF_DISCHARGE * 100)}٪`);
  if (growth > 0) assumptions.push(`حاشیه رشد ${growth}٪`);

  return {
    loadWatts,
    designWatts,
    designVa,
    requiredVa,
    recommendedVa,
    utilisation,
    batteryBlocks,
    estimatedRuntimeMinutes,
    heatBtuPerHour,
    annualKwh,
    valid: true,
    warnings,
    assumptions,
  };
}

/** Sensible starting point for the form: a small server room. */
export const DEFAULT_UPS_LOADS: UpsLoad[] = [
  { id: "server", label: "سرور رک‌مونت", watts: 450, quantity: 2 },
  { id: "nas", label: "ذخیره‌ساز شبکه (NAS)", watts: 120, quantity: 1 },
  { id: "switch", label: "سوییچ شبکه", watts: 60, quantity: 2 },
  { id: "nvr", label: "ضبط‌کننده تصویری (NVR)", watts: 80, quantity: 1 },
];
