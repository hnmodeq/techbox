import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { DRIVE_CATALOG } from "@/scripts/content/drive-catalog";
import { driveType, hasEnoughShopSpecs, isDriveProduct } from "@/lib/shop-product-kind";

const root = path.resolve(__dirname, "../..");
const read = (file: string) => fs.readFileSync(path.join(root, file), "utf8");

describe("enterprise drive shop", () => {
  it("ships at least twenty real-spec HDD and twenty SSD rows", () => {
    const hdds = DRIVE_CATALOG.filter((item) => item.category === "Enterprise HDD");
    const ssds = DRIVE_CATALOG.filter((item) => item.category === "Enterprise SSD");
    expect(hdds.length).toBeGreaterThanOrEqual(20);
    expect(ssds.length).toBeGreaterThanOrEqual(20);
    expect(new Set(DRIVE_CATALOG.map((item) => item.slug)).size).toBe(DRIVE_CATALOG.length);
    for (const item of DRIVE_CATALOG) {
      expect(isDriveProduct(item as any)).toBe(true);
      expect(hasEnoughShopSpecs(item as any)).toBe(true);
      expect(["HDD", "SSD"]).toContain(driveType(item as any));
      expect(item.sourcePriceAmount).toBeGreaterThan(0);
      expect(item.specs["Specification Source"]).toMatch(/^https:\/\//);
      expect(item.specs.Capacity).toBeTruthy();
      expect(item.specs.Interface).toBeTruthy();
      expect(item.specs["Form Factor"]).toBeTruthy();
    }
  });

  it("stores every catalogue visual as a genuine high-quality WebP", () => {
    for (const image of new Set(DRIVE_CATALOG.map((item) => item.imageFile))) {
      const bytes = fs.readFileSync(path.join(root, "public/assets/shop/drives", image));
      expect(bytes.subarray(0, 4).toString("ascii")).toBe("RIFF");
      expect(bytes.subarray(8, 12).toString("ascii")).toBe("WEBP");
      expect(bytes.length).toBeGreaterThan(20_000);
    }
  });

  it("provides canonical storage and drive listings using the shared grid", () => {
    const rootRoute = read("app/shop/page.tsx");
    const storage = read("app/shop/storage/page.tsx");
    const drive = read("app/shop/drive/page.tsx");
    const legacy = read("app/landing/storage/shop/page.tsx");
    expect(rootRoute).toMatch(/redirect\("\/shop\/storage"\)/);
    expect(storage).toMatch(/<ShopGrid serverItems=\{storageSystems\} kind="storage"/);
    expect(drive).toMatch(/<ShopGrid serverItems=\{drives\} kind="drive"/);
    expect(legacy).toMatch(/redirect\("\/shop\/storage"\)/);
  });

  it("uses drive-aware cards and useful drive filters without cloning the shop design", () => {
    const card = read("features/shop/components/ShopProductCard.tsx");
    const grid = read("features/shop/components/ShopGrid.tsx");
    expect(card).toMatch(/DRIVE_MAJOR_SPECS/);
    for (const label of ["ظرفیت", "سرعت", "نوع رابط", "فرم فاکتور"]) expect(card).toContain(label);
    for (const label of ["نوع درایو", "ظرفیت", "رابط اتصال", "فرم فاکتور", "سرعت خواندن \/ چرخش", "دوام و نرخ بار کاری"]) expect(grid).toContain(label);
    expect(grid).toMatch(/kind === "drive" \? isDriveProduct/);
  });

  it("adds both shop children to the main sidebar", () => {
    const sidebar = read("config/sidebar.config.ts");
    expect(sidebar).toMatch(/ذخیره‌ساز[^\n]+\/shop\/storage/);
    expect(sidebar).toMatch(/درایو HDD و SSD[^\n]+\/shop\/drive/);
  });

  it("adds a distinct real drive feed inside—not beside—the homepage shop section", () => {
    const section = read("features/home/components/sections/DealsSection.tsx");
    const server = read("lib/home-server.ts");
    const data = read("lib/home-sections.ts");
    expect(section).toContain("پراستفاده‌ترین درایوها");
    expect(section).toMatch(/driveProducts\.map/);
    expect(server).toMatch(/getDriveDeals/);
    expect(data).toMatch(/category: \{ in: \["Enterprise HDD", "Enterprise SSD"\] \}/);
  });
});
