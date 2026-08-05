import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import {
  DEFAULT_HOME_ADVERTISEMENTS,
  isSafeAdvertisementHref,
  isSafeAdvertisementImage,
  parseHomeAdvertisements,
} from "@/features/home/lib/home-advertisements";

const root = path.resolve(__dirname, "../..");
const read = (file: string) => fs.readFileSync(path.join(root, file), "utf8");

describe("site advertisements", () => {
  it("ships eight homepage campaigns plus top and two sidebar defaults", () => {
    expect(DEFAULT_HOME_ADVERTISEMENTS).toHaveLength(11);
    expect(new Set(DEFAULT_HOME_ADVERTISEMENTS.map((item) => item.id)).size).toBe(11);
    expect(DEFAULT_HOME_ADVERTISEMENTS.map((item) => item.section)).toEqual(expect.arrayContaining([
      "siteTop", "sidebarPrimary", "sidebarSecondary",
    ]));
    for (const advertisement of DEFAULT_HOME_ADVERTISEMENTS) {
      expect(isSafeAdvertisementImage(advertisement.image)).toBe(true);
      expect(advertisement.alt.trim().length).toBeGreaterThan(0);
      expect(advertisement.enabled).toBe(true);
    }
  });

  it("accepts only internal or HTTPS campaign links and WebP/GIF images", () => {
    expect(isSafeAdvertisementHref("/shop/campaign")).toBe(true);
    expect(isSafeAdvertisementHref("https://example.com/campaign")).toBe(true);
    expect(isSafeAdvertisementHref("javascript:alert(1)")).toBe(false);
    expect(isSafeAdvertisementImage("/assets/banner.gif")).toBe(true);
    expect(isSafeAdvertisementImage("https://cdn.example/banner.webp")).toBe(true);
    expect(isSafeAdvertisementImage("https://cdn.example/banner.jpg")).toBe(false);
    expect(isSafeAdvertisementImage("http://cdn.example/banner.gif")).toBe(false);
  });

  it("drops malformed rows without breaking valid advertisements", () => {
    const valid = DEFAULT_HOME_ADVERTISEMENTS[0];
    const parsed = parseHomeAdvertisements(JSON.stringify([
      valid,
      { ...valid, id: "javascript-row", href: "javascript:alert(1)" },
      { ...valid, id: "jpeg-row", image: "https://example.com/banner.jpg" },
      { ...valid },
    ]));
    expect(parsed).toEqual([valid]);
  });

  it("migrates the first-release afterSection field", () => {
    const current = DEFAULT_HOME_ADVERTISEMENTS[0];
    const legacy: Record<string, unknown> = { ...current, afterSection: "video" };
    delete legacy.section;
    const [parsed] = parseHomeAdvertisements([legacy]);
    expect(parsed.section).toBe("video");
    expect(parsed).not.toHaveProperty("afterSection");
  });

  it("serves homepage WebP/GIF raw and places site ads in shared chrome", () => {
    const component = read("features/home/components/sections/HomeAdvertisement.tsx");
    const layout = read("components/layout/LayoutShell.tsx");
    const sidebar = read("components/layout/techbox-app-sidebar.tsx");
    const upload = read("app/api/admin/home-advertisements/upload/route.ts");
    expect(component).toMatch(/<img/);
    expect(component).toMatch(/animated GIF/);
    expect(layout).toMatch(/SiteTopAdvertisement/);
    expect(sidebar).toMatch(/SidebarAdvertisementRail/);
    expect(upload).toMatch(/GIF87a/);
    expect(upload).toMatch(/GIF89a/);
  });

  it("respects an explicitly saved empty campaign list", () => {
    expect(parseHomeAdvertisements("[]")).toEqual([]);
  });
});
