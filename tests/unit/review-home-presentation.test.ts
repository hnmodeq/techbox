import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import type { ContentItem } from "@/lib/content";
import { reviewProductLabel } from "@/features/home/lib/review-label";

const read = (file: string) => fs.readFileSync(path.resolve(__dirname, "../..", file), "utf8");

function product(overrides: Partial<ContentItem>): ContentItem {
  return {
    slug: "product",
    module: "shop",
    title: "TS-464-8G-US",
    excerpt: "",
    tags: [],
    author: { name: "تکباکس" },
    date: "2026-01-01T00:00:00.000Z",
    date_fa: "",
    likes: 0,
    views: 0,
    ...overrides,
  };
}

describe("homepage review presentation", () => {
  const section = read("features/home/components/sections/TopPicksSection.tsx");

  it("labels appliances as storage systems and HDD/SSD products as drives", () => {
    expect(reviewProductLabel(product({ model: "TBS-h574TX-i5U-16G-US", category: "NAS" }))).toBe("بررسی ذخیره‌ساز");
    expect(reviewProductLabel(product({ title: "Samsung 990 PRO 2TB NVMe SSD" }))).toBe("بررسی درایو");
    expect(reviewProductLabel(product({ title: "Western Digital Red", category: "هارد دیسک" }))).toBe("بررسی درایو");
    expect(reviewProductLabel(product({ title: "ذخیره‌ساز رک‌مونت", specs: { "Drive Type": "HDD" } }))).toBe("بررسی ذخیره‌ساز");
  });

  it("keeps product images contained with padding instead of cropping", () => {
    expect(section).toMatch(/className="object-contain p-8 sm:p-12"/);
    expect(section).toMatch(/className="object-contain p-5"/);
    expect(section).not.toMatch(/group-hover:scale/);
  });

  it("uses review-coloured labels and a review-first two-action hierarchy", () => {
    expect(section).toMatch(/--module-review-color/);
    expect(section).toMatch(/reviewProductLabel\(item\.product\)/);
    expect(section).toMatch(/text-\[color:var\(--top-picks-accent\)\]/);
    expect(section).toMatch(/مطالعه بررسی/);
    expect(section).toMatch(/variant="ghost"/);
    expect(section).toMatch(/مشاهده این محصول در فروشگاه/);
  });

  it("shows the author job and publication date on one bottom-aligned row", () => {
    expect(section).toMatch(/flex flex-wrap items-end justify-between/);
    expect(section).toMatch(/author\.job\?\.trim\(\)/);
    expect(section).not.toMatch(/author=\{item\.author\} date=\{item\.date_fa\}/);
    expect(section).toMatch(/<RelativeDate date=\{item\.date\} className="pb-0\.5/);
  });

  it("removes comment borders, adds user tooltips and colours only the product title on hover", () => {
    expect(section).toMatch(/<div className="p-4 sm:p-5">/);
    expect(section).toMatch(/className="group grid min-h-32 grid-cols-\[4\.5rem_1fr\] gap-3 p-3"/);
    expect(section).toMatch(/group-hover:text-\[color:var\(--top-picks-accent\)\]/);
    expect(section).toMatch(/<TooltipContent dir="rtl">\{comment\.author\.name\} — \{job\}<\/TooltipContent>/);
    expect(section).not.toMatch(/group-hover:underline/);
  });
});
