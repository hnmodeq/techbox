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

  it("stores every catalogue visual as a genuine transparent WebP", async () => {
    const sharp = (await import("sharp")).default;
    for (const image of new Set(DRIVE_CATALOG.map((item) => item.imageFile))) {
      const bytes = fs.readFileSync(path.join(root, "public/assets/shop/drives", image));
      expect(bytes.subarray(0, 4).toString("ascii")).toBe("RIFF");
      expect(bytes.subarray(8, 12).toString("ascii")).toBe("WEBP");
      expect(bytes.length).toBeGreaterThan(20_000);
      expect((await sharp(bytes).metadata()).hasAlpha).toBe(true);
    }
  });

  it("provides canonical storage and drive listings using the shared grid", () => {
    const rootRoute = read("app/shop/page.tsx");
    const storage = read("app/shop/storage/page.tsx");
    const drive = read("app/shop/drive/page.tsx");
    const legacy = read("app/landing/storage/shop/page.tsx");
    const nextConfig = read("next.config.mjs");
    expect(rootRoute).toMatch(/redirect\("\/shop\/storage"\)/);
    expect(storage).toMatch(/<ShopGrid serverItems=\{storageSystems\} kind="storage"/);
    expect(drive).toMatch(/<ShopGrid serverItems=\{drives\} kind="drive"/);
    expect(legacy).toMatch(/redirect\("\/shop\/storage"\)/);
    expect(nextConfig).toMatch(/source: '\/shop', destination: '\/shop\/storage', permanent: true/);
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

  it("groups 8 rack, 4 tower, 2 HDD and 2 SSD under one shop header", () => {
    const section = read("features/home/components/sections/DealsSection.tsx");
    const server = read("lib/home-server.ts");
    const data = read("lib/home-sections.ts");
    expect(section).toContain("پر فروش‌ترین محصولات دیتاسنتری");
    expect(section).toContain("ذخیره‌سازهای سازمانی");
    expect(section).toContain("ذخیره‌سازهای خانگی");
    expect(section).toContain("پر استفاده ترین درایو های SSD و HDD");
    expect(section).toMatch(/products\.slice\(0, 8\)/);
    expect(section).toMatch(/products\.slice\(8, 12\)/);
    expect(section).toMatch(/driveProducts\.slice\(0, 4\)/);
    expect(data).toMatch(/chooseMixed\(rackCandidates, 8\)/);
    expect(data).toMatch(/chooseMixed\(towerCandidates, 4\)/);
    expect(server).toMatch(/getDriveDeals\(normalizeCard, cardSelect, 4\)/);
  });
});
