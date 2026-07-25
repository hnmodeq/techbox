export type RaidKey = "basic" | "jbod" | "raid0" | "raid1" | "raid5" | "raid6" | "raid10" | "shr1" | "shr2";

export type Drive = {
  id: string;
  sizeTb: number;
  label: string;
  type: "HDD" | "SSD";
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

export type RaidOption = {
  key: RaidKey;
  label: string;
  short: string;
  minDisks: number;
  protected: boolean;
  description: string;
  faultTolerance: string;
};

export const RAID_OPTIONS: RaidOption[] = [
  { key: "basic", label: "Basic", short: "Basic", minDisks: 1, protected: false, description: "هر دیسک مستقل – بیشترین ظرفیت، بدون تحمل خرابی.", faultTolerance: "ندارد" },
  { key: "jbod", label: "JBOD", short: "JBOD", minDisks: 1, protected: false, description: "ترکیب ظرفیت دیسک‌ها در یک Volume پیوسته.", faultTolerance: "ندارد" },
  { key: "raid0", label: "RAID 0", short: "RAID 0", minDisks: 2, protected: false, description: "Striping برای کارایی بالا، بدون تحمل خرابی.", faultTolerance: "ندارد" },
  { key: "raid1", label: "RAID 1", short: "RAID 1", minDisks: 2, protected: true, description: "Mirror کامل – امنیت بالا، تحمل خرابی تا n-1 دیسک.", faultTolerance: "تحمل خرابی n-1 دیسک" },
  { key: "raid5", label: "RAID 5", short: "RAID 5", minDisks: 3, protected: true, description: "یک دیسک Parity – تعادل ظرفیت و امنیت.", faultTolerance: "تحمل خرابی ۱ دیسک" },
  { key: "raid6", label: "RAID 6", short: "RAID 6", minDisks: 4, protected: true, description: "دو Parity – مناسب آرایه‌های بزرگ و حساس.", faultTolerance: "تحمل خرابی ۲ دیسک" },
  { key: "raid10", label: "RAID 10", short: "RAID 10", minDisks: 4, protected: true, description: "Mirror + Stripe – کارایی و امنیت.", faultTolerance: "حداقل ۱ دیسک" },
  { key: "shr1", label: "SHR", short: "SHR", minDisks: 2, protected: true, description: "Synology Hybrid RAID – بهینه برای دیسک‌های نامساوی.", faultTolerance: "تحمل خرابی ۱ دیسک" },
  { key: "shr2", label: "SHR-2", short: "SHR-2", minDisks: 4, protected: true, description: "SHR با تحمل ۲ دیسک – مناسب آرایه‌های بزرگ.", faultTolerance: "تحمل خرابی ۲ دیسک" },
];

function sum(values: number[]) {
  return values.reduce((total, value) => total + value, 0);
}

export function calculateShr(sizes: number[], parity: 1 | 2) {
  const sorted = [...sizes].filter((size) => Number.isFinite(size) && size > 0).sort((a, b) => a - b);
  const raw = sum(sorted);
  let usable = 0;
  let protection = 0;
  let unused = 0;
  let previous = 0;

  for (const boundary of sorted) {
    const slice = boundary - previous;
    if (slice <= 0) continue;
    const members = sorted.filter((size) => size >= boundary).length;
    if (parity === 1) {
      if (members >= 2) {
        usable += (members - 1) * slice;
        protection += slice;
      } else {
        unused += members * slice;
      }
    } else if (members >= 3) {
      usable += (members - 2) * slice;
      protection += 2 * slice;
    } else {
      unused += members * slice;
    }
    previous = boundary;
  }

  const roundingGap = raw - usable - protection - unused;
  if (Math.abs(roundingGap) > 0.00001) unused += roundingGap;
  return { usable, protection, unused };
}

export function calculateRaid(raidKey: RaidKey, drives: ReadonlyArray<Pick<Drive, "sizeTb">>, spareCount = 0): RaidResult {
  const option = RAID_OPTIONS.find((item) => item.key === raidKey);
  if (!option) {
    return {
      usableTb: 0, protectionTb: 0, unusedTb: 0, rawTb: 0,
      activeRawTb: 0, spareTb: 0, valid: false, minDisks: 0,
      warnings: [], description: "", faultTolerance: "", efficiency: 0,
    };
  }

  const allSizes = drives
    .map((drive) => Number(drive.sizeTb))
    .filter((size) => Number.isFinite(size) && size > 0);
  const rawTb = sum(allSizes);
  const sortedDesc = [...allSizes].sort((a, b) => b - a);
  const normalizedSpareCount = Math.min(
    Math.max(0, Math.trunc(spareCount)),
    Math.max(0, sortedDesc.length - 1)
  );
  const spare = sortedDesc.slice(0, normalizedSpareCount);
  const active = sortedDesc.slice(normalizedSpareCount);
  const activeRawTb = sum(active);
  const spareTb = sum(spare);
  const diskCount = active.length;
  const smallest = diskCount ? Math.min(...active) : 0;
  const warnings: string[] = [];
  let usableTb = 0;
  let protectionTb = 0;
  let unusedTb = 0;

  if (diskCount < option.minDisks) {
    warnings.push(`برای ${option.label} حداقل ${option.minDisks.toLocaleString("fa-IR")} دیسک لازم است.`);
  }
  if (raidKey === "raid10" && diskCount % 2 !== 0) {
    warnings.push("RAID 10 نیاز به تعداد دیسک زوج دارد.");
  }

  switch (raidKey) {
    case "basic":
    case "jbod":
      usableTb = activeRawTb;
      break;
    case "raid0":
      usableTb = diskCount >= 2 ? smallest * diskCount : 0;
      unusedTb = Math.max(0, activeRawTb - usableTb);
      break;
    case "raid1":
      usableTb = diskCount >= 2 ? smallest : 0;
      protectionTb = diskCount >= 2 ? smallest * (diskCount - 1) : 0;
      unusedTb = Math.max(0, activeRawTb - usableTb - protectionTb);
      break;
    case "raid5":
      usableTb = diskCount >= 3 ? smallest * (diskCount - 1) : 0;
      protectionTb = diskCount >= 3 ? smallest : 0;
      unusedTb = Math.max(0, activeRawTb - usableTb - protectionTb);
      break;
    case "raid6":
      usableTb = diskCount >= 4 ? smallest * (diskCount - 2) : 0;
      protectionTb = diskCount >= 4 ? smallest * 2 : 0;
      unusedTb = Math.max(0, activeRawTb - usableTb - protectionTb);
      break;
    case "raid10":
      usableTb = diskCount >= 4 && diskCount % 2 === 0 ? smallest * (diskCount / 2) : 0;
      protectionTb = usableTb;
      unusedTb = Math.max(0, activeRawTb - usableTb - protectionTb);
      break;
    case "shr1":
      if (diskCount >= 2) {
        const result = calculateShr(active, 1);
        usableTb = result.usable;
        protectionTb = result.protection;
        unusedTb = result.unused;
      }
      break;
    case "shr2":
      if (diskCount >= 4) {
        const result = calculateShr(active, 2);
        usableTb = result.usable;
        protectionTb = result.protection;
        unusedTb = result.unused;
      }
      break;
  }

  const valid = diskCount >= option.minDisks && !(raidKey === "raid10" && diskCount % 2 !== 0);
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
