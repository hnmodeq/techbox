import type { ContentItem } from "@/lib/content";
import { isDriveProduct } from "@/lib/shop-product-kind";

export type ReviewProductLabel = "بررسی ذخیره‌ساز" | "بررسی درایو";

/** Shop classification is shared with the two shop listings and card specs,
 * so adding a future HDD/SSD cannot disagree with the homepage review label. */
export function reviewProductLabel(product: ContentItem): ReviewProductLabel {
  return isDriveProduct(product) ? "بررسی درایو" : "بررسی ذخیره‌ساز";
}
