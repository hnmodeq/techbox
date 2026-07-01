// TechBox · NAS Selector – data types & scoring
// RTL / Persian – no hard-coded UI colors, all via --tb-* tokens

export type NasPersona = "home" | "creator" | "office" | "business" | "enterprise";

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
  price?: number; // toman, optional – pulled from shop
};

export type SelectorState = {
  persona: NasPersona;
  workloads: NasWorkload[];
  users: number;
  usableTb: number;
  driveTb: number;
  raid: RaidType;
  cameras: number;
  networkGbE: number;
  nvme: boolean;
  rackmount: boolean;
  budgetTier: 1 | 2 | 3 | 4 | 5;
};

export const personaLabels: Record<NasPersona, { title: string; desc: string }> = {
  home: { title: "خانه و استفاده شخصی", desc: "بکاپ، عکس، فیلم و فایل‌های خانوادگی" },
  creator: { title: "تولیدکننده محتوا", desc: "آرشیو پروژه، تدوین، سرعت شبکه و کش SSD" },
  office: { title: "دفتر کوچک", desc: "فایل‌سرور، بکاپ کامپیوترها و دسترسی تیمی" },
  business: { title: "کسب‌وکار", desc: "کاربران بیشتر، افزونگی، سرویس‌های همزمان" },
  enterprise: { title: "سازمانی / دیتاسنتر", desc: "Rackmount، ظرفیت بالا، HA و عملکرد جدی" },
};

export const workloadLabels: Record<NasWorkload, { title: string; desc: string }> = {
  backup: { title: "بکاپ و بازیابی", desc: "بکاپ کامپیوتر، سرور و موبایل" },
  fileSharing: { title: "اشتراک فایل", desc: "دسترسی تیمی، پوشه مشترک و نسخه‌بندی" },
  media: { title: "مدیا سرور", desc: "استریم ویدئو، موسیقی و آرشیو خانگی" },
  surveillance: { title: "دوربین مداربسته", desc: "ضبط پیوسته و مدیریت دوربین‌ها" },
  virtualization: { title: "مجازی‌سازی", desc: "VM، iSCSI و محیط آزمایشگاهی" },
  database: { title: "دیتابیس / ERP", desc: "IO پایدار و RAM بیشتر" },
  docker: { title: "Docker و سرویس‌ها", desc: "کانتینر، اتوماسیون و سرویس‌های داخلی" },
  photo: { title: "عکس و آلبوم", desc: "تشخیص، دسته‌بندی و اشتراک عکس" },
  highAvailability: { title: "دسترس‌پذیری بالا", desc: "Redundancy قوی و سناریوهای حساس" },
};

export const raidLabels: Record<RaidType, { title: string; desc: string; minBays: number }> = {
  none: { title: "بدون RAID", desc: "بیشترین ظرفیت، بدون تحمل خرابی دیسک", minBays: 1 },
  raid1: { title: "RAID 1 / Mirror", desc: "امنیت ساده برای ۲ دیسک؛ ظرفیت نصف می‌شود", minBays: 2 },
  raid5: { title: "RAID 5", desc: "یک دیسک افزونگی؛ تعادل خوب ظرفیت/امنیت", minBays: 3 },
  raid6: { title: "RAID 6", desc: "دو دیسک افزونگی؛ مناسب داده‌های مهم", minBays: 4 },
  raid10: { title: "RAID 10", desc: "سرعت و تحمل خرابی عالی؛ نیازمند تعداد زوج دیسک", minBays: 4 },
};

export const defaultSelectorState: SelectorState = {
  persona: "office",
  workloads: ["backup", "fileSharing"],
  users: 12,
  usableTb: 12,
  driveTb: 8,
  raid: "raid5",
  cameras: 0,
  networkGbE: 1,
  nvme: false,
  rackmount: false,
  budgetTier: 3,
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
