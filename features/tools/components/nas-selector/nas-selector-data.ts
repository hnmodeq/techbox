// TechBox · NAS Selector – inspired by Synology NAS Selector
// RTL / Persian – simple two-segment selector

export type NasUserType = "home" | "business";

export type NasWorkload =
  | "backup"
  | "fileSharing"
  | "media"
  | "surveillance"
  | "virtualization"
  | "database"
  | "docker"
  | "photo"
  | "highAvailability";

export type RaidType = "none" | "raid1" | "raid5" | "raid6" | "raid10";

export type NasProduct = {
  id: string;
  title: string;
  subtitle: string;
  brand?: string;
  imageUrl?: string;
  href?: string;
  shopSlug?: string;
  sku?: string;
  bays: number;
  maxRawTb: number;
  maxRamGb: number;
  cpuTier: 1 | 2 | 3 | 4 | 5;
  networkGbE: number;
  nvme: boolean;
  expansion: boolean;
  formFactor: "desktop" | "rackmount";
  priceTier: 1 | 2 | 3 | 4 | 5;
  tags: string[];
  bestFor: NasWorkload[];
  inStock?: boolean;
  price?: number | string;
};

export type SelectorState = {
  userType: NasUserType;
  workloads: NasWorkload[];
  usableTb: number;
  driveTb: number;
  raid: RaidType;
  racksize: boolean;
};

export const userTypeLabels: Record<NasUserType, { title: string; desc: string; emoji: string }> = {
  home: { title: "خانه یا دفتر کوچک", desc: "مناسب مصارف شخصی، خانواده و تیم‌های کوچک", emoji: "🏠" },
  business: { title: "کسب‌وکار یا سازمان", desc: "مناسب شرکت‌ها، دیتاسنتر و محیط‌های حرفه‌ای", emoji: "🏢" },
};

export const workloadLabels: Record<NasWorkload, { title: string; desc: string }> = {
  backup: { title: "بکاپ و بازیابی", desc: "بکاپ کامپیوتر، سرور و موبایل" },
  fileSharing: { title: "اشتراک فایل", desc: "دسترسی تیمی، پوشه مشترک" },
  media: { title: "مدیا سرور", desc: "استریم ویدئو و موسیقی" },
  surveillance: { title: "دوربین مداربسته", desc: "ضبط و مدیریت دوربین‌ها" },
  virtualization: { title: "مجازی‌سازی", desc: "VM، iSCSI" },
  database: { title: "دیتابیس / ERP", desc: "IO پایدار و RAM بیشتر" },
  docker: { title: "Docker و سرویس‌ها", desc: "کانتینر و اتوماسیون" },
  photo: { title: "عکس و آلبوم", desc: "اشتراک و مدیریت عکس" },
  highAvailability: { title: "دسترس‌پذیری بالا", desc: "Redundancy قوی" },
};

export const raidLabels: Record<RaidType, { title: string; desc: string; minBays: number }> = {
  none: { title: "بدون RAID", desc: "بیشترین ظرفیت", minBays: 1 },
  raid1: { title: "RAID 1", desc: "آینه‌سازی", minBays: 2 },
  raid5: { title: "RAID 5", desc: "1 دیسک افزونگی", minBays: 3 },
  raid6: { title: "RAID 6", desc: "2 دیسک افزونگی", minBays: 4 },
  raid10: { title: "RAID 10", desc: "سرعت + افزونگی", minBays: 4 },
};

export const defaultSelectorState: SelectorState = {
  userType: "home",
  workloads: [],
  usableTb: 8,
  driveTb: 8,
  raid: "raid5",
  racksize: false,
};

export function estimateUsableCapacity(bays: number, driveTb: number, raid: RaidType) {
  if (bays <= 0 || driveTb <= 0) return 0;
  switch (raid) {
    case "none": return bays * driveTb;
    case "raid1": return bays >= 2 ? driveTb : 0;
    case "raid5": return bays >= 3 ? (bays - 1) * driveTb : 0;
    case "raid6": return bays >= 4 ? (bays - 2) * driveTb : 0;
    case "raid10": return bays >= 4 && bays % 2 === 0 ? (bays / 2) * driveTb : 0;
    default: return 0;
  }
}

export function minimumBaysForCapacity(usableTb: number, driveTb: number, raid: RaidType) {
  const min = raidLabels[raid].minBays;
  for (let bays = min; bays <= 24; bays += 1) {
    if (raid === "raid10" && bays % 2 !== 0) continue;
    if (estimateUsableCapacity(bays, driveTb, raid) >= usableTb) return bays;
  }
  return 24;
}
