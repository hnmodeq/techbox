import type { ContentItem } from "@/lib/content";

export type ShopProductKind = "storage" | "drive";
export type ShopProductLike = Pick<ContentItem, "title" | "category" | "model" | "tags" | "specs">;

const DRIVE_IDENTITY = /(?:^|[\s/_-])(?:hdd|ssd|nvme|hard[\s-]?(?:disk|drive)|solid[\s-]?state(?:[\s-]?drive)?)(?=$|[\s/_-])|هارد(?:\s*دیسک)?|اس[\s‌-]*اس[\s‌-]*دی|(?:^|[\s،,:/_-])درایو(?=$|[\s،,:/_-])/iu;
const DRIVE_TYPE_VALUES = new Set(["drive", "hdd", "ssd", "enterprise hdd", "enterprise ssd", "درایو", "هارد", "هارد دیسک"]);
const STORAGE_SYSTEM_IDENTITY = /ذخیره[‌\s-]*ساز|(?:^|[\s/_-])(?:nas|san|storage[\s-]*system|rackmount)(?=$|[\s/_-])|رک[‌\s-]*مونت/iu;

export function specsRecord(specs: unknown): Record<string, unknown> {
  return specs && typeof specs === "object" && !Array.isArray(specs)
    ? specs as Record<string, unknown>
    : {};
}

export function shopSpec(item: Pick<ShopProductLike, "specs">, keys: readonly string[]): string {
  const specs = specsRecord(item.specs);
  for (const key of keys) {
    const value = specs[key];
    if (value !== undefined && value !== null && String(value).trim()) return String(value).trim();
  }
  return "";
}

/** Product type is explicit for the new drive catalogue. Legacy/future rows
 * retain a conservative identity fallback, while NAS rows with CPU/bay specs
 * cannot be mistaken for SSD drives merely because their title says NVMe. */
export function isDriveProduct(item: ShopProductLike): boolean {
  const explicitProduct = shopSpec(item, ["Product Type", "نوع محصول"]).toLowerCase();
  if (DRIVE_TYPE_VALUES.has(explicitProduct) || explicitProduct.includes("drive")) return true;

  const specs = specsRecord(item.specs);
  if (specs["Drive Bay"] || specs["Bay"] || specs["CPU"] || specs["پردازنده"]) return false;

  const category = (item.category || "").normalize("NFKC").toLowerCase();
  if (DRIVE_IDENTITY.test(category)) return true;

  const identity = [item.title, item.model, ...(item.tags ?? [])]
    .filter((value): value is string => typeof value === "string" && Boolean(value.trim()))
    .join(" ")
    .normalize("NFKC")
    .toLowerCase();
  if (STORAGE_SYSTEM_IDENTITY.test(identity)) return false;

  const explicitDriveType = shopSpec(item, ["Drive Type", "نوع درایو"]).toLowerCase();
  if (DRIVE_TYPE_VALUES.has(explicitDriveType) || explicitDriveType.includes("hdd") || explicitDriveType.includes("ssd")) return true;
  return DRIVE_IDENTITY.test(identity);
}

export function shopProductKind(item: ShopProductLike): ShopProductKind {
  return isDriveProduct(item) ? "drive" : "storage";
}

export function driveType(item: ShopProductLike): "HDD" | "SSD" | "" {
  const value = shopSpec(item, ["Drive Type", "نوع درایو"]).toUpperCase();
  if (value.includes("SSD") || value.includes("NVME")) return "SSD";
  if (value.includes("HDD") || value.includes("HARD")) return "HDD";
  const identity = [item.category, item.title, item.model].filter(Boolean).join(" ");
  if (/SSD|NVMe|اس[\s‌-]*اس[\s‌-]*دی/iu.test(identity)) return "SSD";
  if (/HDD|Hard[\s-]?(?:Disk|Drive)|هارد/iu.test(identity)) return "HDD";
  return "";
}

export function hasEnoughShopSpecs(item: ShopProductLike): boolean {
  const specs = specsRecord(item.specs);
  const nonEmpty = Object.values(specs).filter((value) => {
    const normalized = String(value ?? "").trim().toLowerCase();
    return normalized && !["n/a", "na", "-"].includes(normalized);
  }).length;

  if (isDriveProduct(item)) {
    const capacity = shopSpec(item, ["Capacity", "ظرفیت"]);
    const speed = shopSpec(item, ["Sequential Read", "سرعت خواندن ترتیبی", "Rotational Speed", "سرعت چرخش"]);
    const connection = shopSpec(item, ["Interface", "رابط"]);
    const formFactor = shopSpec(item, ["Form Factor", "فرم فاکتور"]);
    return [capacity, speed, connection, formFactor].filter(Boolean).length >= 3 && nonEmpty >= 5;
  }

  const bay = shopSpec(item, ["Drive Bay", "Bay", "تعداد جایگاه دیسک"]);
  const cpu = shopSpec(item, ["CPU", "پردازنده"]);
  const memory = shopSpec(item, ["System Memory", "RAM", "حافظه رم"]);
  const network = shopSpec(item, [
    "10 Gigabit Ethernet Port",
    "2.5 Gigabit Ethernet Port (2.5G/1G/100M)",
    "2.5 Gigabit Ethernet Port",
    "Network Card",
  ]);
  return [bay, cpu, memory, network].filter(Boolean).length >= 2 && nonEmpty >= 3;
}
