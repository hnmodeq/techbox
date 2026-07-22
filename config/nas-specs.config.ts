export type SpecCategory = {
  id: string;
  titleFa: string;
  icon?: string;
};

export type SpecField = {
  key: string;
  titleFa: string;
  category: string;
  important?: boolean;
  isMajor?: boolean;
};

export const SPEC_CATEGORIES: SpecCategory[] = [
  { id: "cpu", titleFa: "پردازنده" },
  { id: "memory", titleFa: "حافظه" },
  { id: "storage", titleFa: "فضای ذخیره‌سازی" },
  { id: "network", titleFa: "شبکه" },
  { id: "power", titleFa: "برق و محیطی" },
  { id: "software", titleFa: "نرم‌افزار و قابلیت‌ها" },
];

// The 18 required spec fields — all products must have these
export const SPEC_FIELDS: SpecField[] = [
  // CPU
  { key: "پردازنده", titleFa: "پردازنده", category: "cpu", important: true, isMajor: true },

  // Memory
  { key: "حافظه رم", titleFa: "حافظه رم", category: "memory", important: true, isMajor: true },
  { key: "حداکثر حافظه", titleFa: "حداکثر حافظه", category: "memory", important: true },

  // Storage
  { key: "تعداد جایگاه دیسک", titleFa: "تعداد جایگاه دیسک", category: "storage", important: true, isMajor: true },
  { key: "سازگاری درایو", titleFa: "سازگاری درایو", category: "storage" },
  { key: "اسلات M.2", titleFa: "اسلات M.2", category: "storage" },

  // Network
  { key: "پورت 2.5 گیگ", titleFa: "پورت 2.5 گیگابیت", category: "network", isMajor: true },
  { key: "اسلات توسعه PCIe", titleFa: "اسلات توسعه PCIe", category: "network", important: true },

  // Power & environment
  { key: "فرم فاکتور", titleFa: "فرم فاکتور", category: "power" },
  { key: "منبع تغذیه", titleFa: "منبع تغذیه", category: "power", important: true },
  { key: "مصرف برق معمولی", titleFa: "مصرف برق معمولی", category: "power" },
  { key: "گارانتی استاندارد", titleFa: "گارانتی استاندارد", category: "power", important: true },
  { key: "فن", titleFa: "فن", category: "power" },

  // Software
  { key: "سیستم عامل", titleFa: "سیستم عامل", category: "software" },
  { key: "انواع RAID پشتیبانی شده", titleFa: "انواع RAID پشتیبانی شده", category: "software", important: true },
  { key: "حداکثر ظرفیت Pool", titleFa: "حداکثر ظرفیت Pool", category: "software" },
  { key: "نوع Volume", titleFa: "نوع Volume", category: "software" },
  { key: "حداکثر اتصالات همزمان", titleFa: "حداکثر اتصالات همزمان", category: "software" },
  { key: "حداکثر ظرفیت Volume", titleFa: "حداکثر ظرفیت Volume", category: "software" },
];

export const MAJOR_SPECS_KEYS = ["پردازنده", "حافظه رم", "تعداد جایگاه دیسک", "پورت 2.5 گیگ"];

export const MAJOR_SPECS_MAP: Record<string, { titleFa: string; icon: string }> = {
  "پردازنده": { titleFa: "پردازنده", icon: "Cpu" },
  "حافظه رم": { titleFa: "رم", icon: "MemoryStick" },
  "تعداد جایگاه دیسک": { titleFa: "جایگاه", icon: "HardDrive" },
  "پورت 2.5 گیگ": { titleFa: "شبکه", icon: "Network" },
};

// All 18 keys that must be present
export const CURATED_25_KEYS = SPEC_FIELDS.map((f) => f.key);
