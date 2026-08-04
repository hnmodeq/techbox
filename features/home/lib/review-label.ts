import type { ContentItem } from "@/lib/content";

export type ReviewProductLabel = "بررسی ذخیره‌ساز" | "بررسی درایو";

const DRIVE_PRODUCT_PATTERN = /(?:^|[\s/_-])(?:hdd|ssd|nvme|hard[\s-]?(?:disk|drive)|solid[\s-]?state(?:[\s-]?drive)?)(?=$|[\s/_-])|هارد(?:\s*دیسک)?|اس[\s‌-]*اس[\s‌-]*دی|(?:^|[\s،,:/_-])درایو(?=$|[\s،,:/_-])/iu;

/** HDD/SSD products are drives; NAS/SAN/storage appliances use the broader
 * storage-system label. Category, title, model and tags are deliberate here:
 * appliance specs often mention supported HDD/SSD media and must not turn a
 * NAS review into a drive review. */
export function reviewProductLabel(product: ContentItem): ReviewProductLabel {
  const identity = [product.category, product.title, product.model, ...(product.tags ?? [])]
    .filter((value): value is string => typeof value === "string" && Boolean(value.trim()))
    .join(" ")
    .normalize("NFKC")
    .toLowerCase();
  return DRIVE_PRODUCT_PATTERN.test(identity) ? "بررسی درایو" : "بررسی ذخیره‌ساز";
}
