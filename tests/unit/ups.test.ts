import { describe, it, expect } from "vitest";
import {
  calculateUps,
  nearestUpsRating,
  totalLoadWatts,
  batteryBlocksFor,
  runtimeForBlocks,
  UPS_VA_LADDER,
  DEFAULT_POWER_FACTOR,
  DESIGN_HEADROOM,
  type UpsLoad,
} from "@/lib/ups";

const loads = (...specs: Array<[number, number]>): UpsLoad[] =>
  specs.map(([watts, quantity], i) => ({
    id: `l${i}`,
    label: `load ${i}`,
    watts,
    quantity,
  }));

describe("totalLoadWatts", () => {
  it("multiplies watts by quantity", () => {
    expect(totalLoadWatts(loads([100, 2], [50, 3]))).toBe(350);
  });

  it("ignores rows with zero, negative or non-finite values", () => {
    expect(totalLoadWatts(loads([100, 1], [0, 5], [-20, 2], [Number.NaN, 1]))).toBe(100);
  });

  it("is zero for an empty list", () => {
    expect(totalLoadWatts([])).toBe(0);
  });
});

describe("nearestUpsRating", () => {
  it("picks the first rating at or above the requirement", () => {
    expect(nearestUpsRating(900)).toBe(1000);
    expect(nearestUpsRating(1000)).toBe(1000);
    expect(nearestUpsRating(1001)).toBe(1500);
  });

  it("returns null when the need exceeds the largest rating", () => {
    expect(nearestUpsRating(UPS_VA_LADDER[UPS_VA_LADDER.length - 1] + 1)).toBeNull();
  });
});

describe("batteryBlocksFor / runtimeForBlocks", () => {
  it("needs no blocks when watts or minutes are zero", () => {
    expect(batteryBlocksFor(0, 10)).toBe(0);
    expect(batteryBlocksFor(500, 0)).toBe(0);
  });

  it("scales block count with runtime", () => {
    const short = batteryBlocksFor(500, 10);
    const long = batteryBlocksFor(500, 30);
    expect(long).toBeGreaterThan(short);
  });

  it("scales block count with load", () => {
    expect(batteryBlocksFor(1000, 15)).toBeGreaterThan(batteryBlocksFor(500, 15));
  });

  it("round-trips: the blocks it sizes sustain at least the target runtime", () => {
    const watts = 800;
    const target = 15;
    const blocks = batteryBlocksFor(watts, target);
    expect(runtimeForBlocks(watts, blocks)).toBeGreaterThanOrEqual(target);
  });
});

describe("calculateUps", () => {
  it("is invalid with no load, and says so rather than returning zeros silently", () => {
    const r = calculateUps({ loads: [], runtimeMinutes: 10 });
    expect(r.valid).toBe(false);
    expect(r.recommendedVa).toBeNull();
    expect(r.warnings.length).toBeGreaterThan(0);
  });

  it("converts watts to VA using the power factor", () => {
    const r = calculateUps({ loads: loads([900, 1]), runtimeMinutes: 10, powerFactor: 0.9 });
    expect(r.loadWatts).toBe(900);
    expect(r.designVa).toBe(1000); // 900 / 0.9
  });

  it("defaults the power factor when omitted", () => {
    const r = calculateUps({ loads: loads([900, 1]), runtimeMinutes: 10 });
    expect(r.designVa).toBe(Math.ceil(900 / DEFAULT_POWER_FACTOR));
  });

  it("clamps an out-of-range power factor instead of producing nonsense", () => {
    const high = calculateUps({ loads: loads([900, 1]), runtimeMinutes: 10, powerFactor: 5 });
    const low = calculateUps({ loads: loads([900, 1]), runtimeMinutes: 10, powerFactor: 0.1 });
    expect(high.designVa).toBe(900); // clamped to 1
    expect(low.designVa).toBe(1800); // clamped to 0.5
  });

  it("applies the growth allowance to design watts", () => {
    const r = calculateUps({ loads: loads([1000, 1]), runtimeMinutes: 10, growthPercent: 20 });
    expect(r.loadWatts).toBe(1000);
    expect(r.designWatts).toBe(1200);
  });

  it("never sizes the unit to 100% — the design ceiling is applied", () => {
    const r = calculateUps({ loads: loads([900, 1]), runtimeMinutes: 10, powerFactor: 0.9 });
    // 1000 VA of load must require more than a 1000 VA unit
    expect(r.requiredVa).toBeGreaterThan(r.designVa);
    expect(r.requiredVa).toBe(Math.ceil(1000 / DESIGN_HEADROOM));
  });

  it("recommends a real commercial rating", () => {
    const r = calculateUps({ loads: loads([450, 2], [120, 1]), runtimeMinutes: 15 });
    expect(r.recommendedVa).not.toBeNull();
    expect(UPS_VA_LADDER).toContain(r.recommendedVa as never);
  });

  it("keeps utilisation at or under the design ceiling for the recommended unit", () => {
    const r = calculateUps({ loads: loads([450, 2]), runtimeMinutes: 15 });
    expect(r.utilisation).toBeLessThanOrEqual(DESIGN_HEADROOM + 0.001);
  });

  it("warns when N+1 redundancy needs a second unit", () => {
    const r = calculateUps({ loads: loads([500, 1]), runtimeMinutes: 10, redundancy: "N+1" });
    expect(r.warnings.some((w) => w.includes("N+1"))).toBe(true);
  });

  it("warns when the requirement exceeds the largest standard model", () => {
    const r = calculateUps({ loads: loads([40000, 1]), runtimeMinutes: 10 });
    expect(r.recommendedVa).toBeNull();
    expect(r.warnings.some((w) => w.includes("ماژولار"))).toBe(true);
  });

  it("warns that a generator beats batteries beyond an hour", () => {
    const r = calculateUps({ loads: loads([500, 1]), runtimeMinutes: 90 });
    expect(r.warnings.some((w) => w.includes("ژنراتور"))).toBe(true);
  });

  it("flags a missing runtime instead of silently sizing zero batteries", () => {
    const r = calculateUps({ loads: loads([500, 1]), runtimeMinutes: 0 });
    expect(r.valid).toBe(true);
    expect(r.batteryBlocks).toBe(0);
    expect(r.warnings.some((w) => w.includes("زمان پشتیبانی"))).toBe(true);
  });

  it("reports heat and annual energy for cooling and cost planning", () => {
    const r = calculateUps({ loads: loads([1000, 1]), runtimeMinutes: 10 });
    expect(r.heatBtuPerHour).toBeGreaterThan(3000);
    expect(r.annualKwh).toBe(8760); // 1000 W for a year
  });

  it("always surfaces the assumptions it computed under", () => {
    const r = calculateUps({ loads: loads([500, 1]), runtimeMinutes: 10 });
    expect(r.assumptions.length).toBeGreaterThan(3);
    expect(r.assumptions.some((a) => a.includes("ضریب توان"))).toBe(true);
  });

  it("sizes a realistic small server room end to end", () => {
    const r = calculateUps({
      loads: loads([450, 2], [120, 1], [60, 2], [80, 1]),
      runtimeMinutes: 15,
      powerFactor: 0.9,
      growthPercent: 15,
    });
    expect(r.loadWatts).toBe(1220);
    expect(r.designWatts).toBe(1403);
    expect(r.valid).toBe(true);
    expect(r.recommendedVa).toBeGreaterThanOrEqual(2000);
    expect(r.batteryBlocks).toBeGreaterThan(0);
    expect(r.estimatedRuntimeMinutes).toBeGreaterThanOrEqual(15);
  });
});
