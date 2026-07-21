export type SpecCategory = {
  id: string;
  titleFa: string;
  icon?: string;
};

export type SpecField = {
  key: string; // raw key from QNAP specs
  titleFa: string;
  category: string;
  important?: boolean; // for filtering
  isMajor?: boolean; // show on card
};

export const SPEC_CATEGORIES: SpecCategory[] = [
  { id: "cpu", titleFa: "پردازنده" },
  { id: "memory", titleFa: "حافظه" },
  { id: "storage", titleFa: "فضای ذخیره‌سازی" },
  { id: "network", titleFa: "شبکه" },
  { id: "ports", titleFa: "پورت‌ها و اتصالات" },
  { id: "power", titleFa: "برق و محیطی" },
  { id: "software", titleFa: "نرم‌افزار و قابلیت‌ها" },
];

// Mapping of raw QNAP spec keys (English) to Persian store titles + category
// This covers 200+ possible keys, but we only display 25 curated
export const SPEC_FIELDS: SpecField[] = [
  // CPU
  { key: "CPU", titleFa: "پردازنده", category: "cpu", important: true, isMajor: true },
  { key: "CPU Architecture", titleFa: "معماری پردازنده", category: "cpu" },
  { key: "Graphic Processors", titleFa: "پردازشگر گرافیکی", category: "cpu" },
  { key: "Encryption Engine", titleFa: "موتور رمزنگاری", category: "cpu" },
  { key: "Hardware-accelerated Transcoding", titleFa: "شتاب‌دهنده ترنسکد", category: "cpu" },

  // Memory
  { key: "System Memory", titleFa: "حافظه رم", category: "memory", important: true, isMajor: true },
  { key: "Maximum Memory", titleFa: "حداکثر حافظه", category: "memory" },
  { key: "Memory Slot", titleFa: "اسلات حافظه", category: "memory" },
  { key: "Flash Memory", titleFa: "حافظه فلش", category: "memory" },

  // Storage
  { key: "Drive Bay", titleFa: "تعداد جایگاه دیسک (Bay)", category: "storage", important: true, isMajor: true },
  { key: "Drive Compatibility", titleFa: "سازگاری درایو", category: "storage" },
  { key: "Hot-swappable", titleFa: "قابلیت تعویض گرم", category: "storage" },
  { key: "M.2 Slot", titleFa: "اسلات M.2 / E1.S", category: "storage" },
  { key: "SSD Cache Acceleration Support", titleFa: "پشتیبانی کش SSD", category: "storage" },
  { key: "2.5 Gigabit Ethernet Port (2.5G/1G/100M)", titleFa: "پورت 2.5 گیگابیت", category: "network", isMajor: true },
  { key: "5 Gigabit Ethernet Port (5G/2.5G/1G/100M)", titleFa: "پورت 5 گیگابیت", category: "network" },
  { key: "10 Gigabit Ethernet Port", titleFa: "پورت 10 گیگابیت", category: "network", isMajor: true },
  { key: "25 Gigabit Ethernet Port", titleFa: "پورت 25 گیگابیت", category: "network" },
  { key: "Gigabit Ethernet Port (10M/100M/1G)", titleFa: "پورت گیگابیت", category: "network" },
  { key: "2.5 Gigabit Ethernet Port", titleFa: "پورت 2.5 گیگابیت", category: "network" },

  // Network general
  { key: "PCIe Slot", titleFa: "اسلات توسعه PCIe", category: "network", important: true },
  { key: "Jumbo Frame", titleFa: "جامبو فریم", category: "network" },
  { key: "Wake on LAN (WOL)", titleFa: "Wake on LAN", category: "network" },

  // Ports
  { key: "USB 2.0 port", titleFa: "پورت USB 2.0", category: "ports" },
  { key: "USB 3.2 Gen 1 Port", titleFa: "پورت USB 3.2 Gen1", category: "ports" },
  { key: "USB 3.2 Gen 2 (10Gbps) Port", titleFa: "پورت USB 3.2 Gen2 10Gbps", category: "ports" },

  // Power & environment – important for company
  { key: "Form Factor", titleFa: "فرم فاکتور", category: "power" },
  { key: "Power Supply Unit", titleFa: "منبع تغذیه", category: "power", important: true },
  { key: "Power Consumption: Operating Mode, Typical", titleFa: "مصرف برق معمولی", category: "power" },
  { key: "Power Consumption: Disk Standby Mode", titleFa: "مصرف برق در حالت آماده‌باش", category: "power" },
  { key: "Operating Temperature", titleFa: "دمای کاری", category: "power" },
  { key: "Fan", titleFa: "فن", category: "power" },
  { key: "Standard Warranty", titleFa: "گارانتی استاندارد", category: "power", important: true },

  // Software – keep only critical
  { key: "Operating System", titleFa: "سیستم عامل", category: "software" },
  { key: "RAID Type", titleFa: "انواع RAID پشتیبانی شده", category: "software", important: true },
  { key: "Maximum Pool size", titleFa: "حداکثر ظرفیت Pool", category: "software" },
  { key: "Maximum volume size", titleFa: "حداکثر ظرفیت Volume", category: "software" },
  { key: "Volume Type", titleFa: "نوع Volume", category: "software" },
  { key: "iSCSI Service", titleFa: "سرویس iSCSI", category: "software" },
  { key: "Maximum Number of Concurrent Connections (CIFS) - with Max. Memory", titleFa: "حداکثر اتصالات همزمان", category: "software" },
  { key: "Max. Number of Concurrent Connections (CIFS) - with Max. Memory", titleFa: "حداکثر اتصالات همزمان", category: "software" },
];

// The 4 major specs that must appear on product cards – per user request: CPU / Network Card / RAM / Bay
export const MAJOR_SPECS_KEYS = ["CPU", "System Memory", "Drive Bay", "10 Gigabit Ethernet Port"];

// For backward compatibility, also support Persian keys and legacy English keys
export const MAJOR_SPECS_MAP: Record<string, { titleFa: string; icon: string }> = {
  CPU: { titleFa: "پردازنده", icon: "Cpu" },
  "System Memory": { titleFa: "رم", icon: "MemoryStick" },
  RAM: { titleFa: "رم", icon: "MemoryStick" },
  Bay: { titleFa: "جایگاه", icon: "HardDrive" },
  "Drive Bay": { titleFa: "جایگاه", icon: "HardDrive" },
  "10 Gigabit Ethernet Port": { titleFa: "شبکه", icon: "Network" },
  "Network Card": { titleFa: "شبکه", icon: "Network" },
  "2.5 Gigabit Ethernet Port (2.5G/1G/100M)": { titleFa: "شبکه", icon: "Network" },
};

// Curated 25 for store display – the most important for IT buyer
export const CURATED_25_KEYS = [
  "CPU",
  "System Memory",
  "Maximum Memory",
  "Drive Bay",
  "Drive Compatibility",
  "M.2 Slot",
  "10 Gigabit Ethernet Port",
  "2.5 Gigabit Ethernet Port (2.5G/1G/100M)",
  "PCIe Slot",
  "USB 3.2 Gen 2 (10Gbps) Port",
  "Form Factor",
  "Power Supply Unit",
  "Power Consumption: Operating Mode, Typical",
  "Standard Warranty",
  "Operating System",
  "RAID Type",
  "Maximum Pool size",
  "Volume Type",
  "iSCSI Service",
  "Max. Number of Concurrent Connections (CIFS) - with Max. Memory",
  "Hot-swappable",
  "SSD Cache Acceleration Support",
  "Jumbo Frame",
  "Fan",
  "Maximum volume size",
];
