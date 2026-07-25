import { describe, expect, it } from "vitest";
import { calculateRaid, calculateShr, type RaidKey } from "@/lib/raid";

const drives = (...sizes: number[]) => sizes.map((sizeTb) => ({ sizeTb }));

describe("standard RAID capacity", () => {
  const cases: Array<{
    raid: RaidKey;
    sizes: number[];
    usable: number;
    protection: number;
    unused?: number;
  }> = [
    { raid: "basic", sizes: [4, 8], usable: 12, protection: 0 },
    { raid: "jbod", sizes: [4, 8], usable: 12, protection: 0 },
    { raid: "raid0", sizes: [4, 4], usable: 8, protection: 0 },
    { raid: "raid1", sizes: [4, 4, 4], usable: 4, protection: 8 },
    { raid: "raid5", sizes: [4, 4, 4, 4], usable: 12, protection: 4 },
    { raid: "raid6", sizes: [4, 4, 4, 4, 4, 4], usable: 16, protection: 8 },
    { raid: "raid10", sizes: [4, 4, 4, 4], usable: 8, protection: 8 },
    { raid: "raid5", sizes: [4, 8, 8], usable: 8, protection: 4, unused: 8 },
  ];

  for (const testCase of cases) {
    it(`${testCase.raid} calculates ${testCase.sizes.join("+")} TB`, () => {
      const result = calculateRaid(testCase.raid, drives(...testCase.sizes));
      expect(result.valid).toBe(true);
      expect(result.rawTb).toBe(testCase.sizes.reduce((sum, value) => sum + value, 0));
      expect(result.usableTb).toBe(testCase.usable);
      expect(result.protectionTb).toBe(testCase.protection);
      expect(result.unusedTb).toBe(testCase.unused ?? 0);
    });
  }

  it("rejects too few disks and odd RAID 10 arrays", () => {
    expect(calculateRaid("raid5", drives(4, 4))).toMatchObject({ valid: false, usableTb: 0 });
    const oddRaid10 = calculateRaid("raid10", drives(4, 4, 4, 4, 4));
    expect(oddRaid10.valid).toBe(false);
    expect(oddRaid10.warnings.join(" ")).toContain("زوج");
  });

  it("removes hot-spare capacity from the active array", () => {
    const result = calculateRaid("raid5", drives(4, 4, 4, 4), 1);
    expect(result).toMatchObject({ rawTb: 16, activeRawTb: 12, spareTb: 4, usableTb: 8, protectionTb: 4 });
  });

  it("ignores invalid and non-positive drive sizes", () => {
    const result = calculateRaid("raid1", drives(4, 4, 0, -1, Number.NaN));
    expect(result).toMatchObject({ valid: true, rawTb: 8, usableTb: 4, protectionTb: 4 });
  });
});

describe("Synology Hybrid RAID", () => {
  it("uses additional slices from mixed-size disks in SHR-1", () => {
    expect(calculateShr([2, 4, 8], 1)).toEqual({ usable: 6, protection: 4, unused: 4 });
    expect(calculateRaid("shr1", drives(2, 4, 8))).toMatchObject({
      valid: true,
      rawTb: 14,
      usableTb: 6,
      protectionTb: 4,
      unusedTb: 4,
    });
  });

  it("accounts for two-disk protection in SHR-2", () => {
    expect(calculateShr([2, 4, 8, 8], 2)).toEqual({ usable: 6, protection: 8, unused: 8 });
    expect(calculateRaid("shr2", drives(2, 4, 8, 8))).toMatchObject({
      valid: true,
      usableTb: 6,
      protectionTb: 8,
      unusedTb: 8,
    });
  });
});
