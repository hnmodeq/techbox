import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import {
  DEFAULT_HOME_ADVERTISEMENTS,
  isSafeAdvertisementHref,
  parseHomeAdvertisements,
} from "@/features/home/lib/home-advertisements";

describe("homepage advertisements", () => {
  it("ships the eight owner-provided creatives as verified WebP defaults", () => {
    expect(DEFAULT_HOME_ADVERTISEMENTS).toHaveLength(8);
    expect(new Set(DEFAULT_HOME_ADVERTISEMENTS.map((item) => item.id)).size).toBe(8);
    for (const advertisement of DEFAULT_HOME_ADVERTISEMENTS) {
      expect(advertisement.image).toMatch(/^https:\/\/.*\.webp$/);
      expect(advertisement.alt.trim().length).toBeGreaterThan(0);
      expect(advertisement.enabled).toBe(true);
    }
  });

  it("accepts only internal or HTTPS campaign links", () => {
    expect(isSafeAdvertisementHref("/shop/campaign")).toBe(true);
    expect(isSafeAdvertisementHref("https://example.com/campaign")).toBe(true);
    expect(isSafeAdvertisementHref("")).toBe(true);
    expect(isSafeAdvertisementHref("javascript:alert(1)")).toBe(false);
    expect(isSafeAdvertisementHref("//evil.example/path")).toBe(false);
    expect(isSafeAdvertisementHref("http://example.com/insecure")).toBe(false);
  });

  it("drops malformed rows without breaking valid advertisements", () => {
    const valid = DEFAULT_HOME_ADVERTISEMENTS[0];
    const parsed = parseHomeAdvertisements(JSON.stringify([
      valid,
      { ...valid, id: "javascript-row", href: "javascript:alert(1)" },
      { ...valid, id: "jpeg-row", image: "https://example.com/banner.jpg" },
      { ...valid }, // duplicate id
    ]));
    expect(parsed).toEqual([valid]);
  });

  it("migrates the first-release afterSection field without hiding saved ads", () => {
    const current = DEFAULT_HOME_ADVERTISEMENTS[0];
    const legacy: Record<string, unknown> = { ...current, afterSection: "video" };
    delete legacy.section;
    const [parsed] = parseHomeAdvertisements([legacy]);
    expect(parsed.section).toBe("video");
    expect(parsed).not.toHaveProperty("afterSection");
  });

  it("renders creatives inside/above their band at section width and without recompression", () => {
    const root = path.resolve(__dirname, "../..");
    const component = fs.readFileSync(
      path.join(root, "features/home/components/sections/HomeAdvertisement.tsx"),
      "utf8",
    );
    const page = fs.readFileSync(path.join(root, "app/page.tsx"), "utf8");
    expect(component).toMatch(/max-w-\[1280px\]/);
    expect(component).not.toMatch(/max-w-\[1440px\]/);
    expect(component).toMatch(/unoptimized/);
    expect(component).not.toMatch(/bg-black/);
    expect(page).toMatch(/inverted=\{s\.key === "tools" \|\| s\.key === "websiteInfo"\}/);
    expect(component).toMatch(/بستن این تبلیغ/);
    expect(component).toMatch(/تبلیغات/);
    expect(component.indexOf("<X ")).toBeLessThan(component.indexOf("تبلیغات</span>"));
    const band = page.slice(page.indexOf("visible.map"));
    expect(band.indexOf("<HomeAdvertisementBanner")).toBeLessThan(band.indexOf("{s.node}"));
  });

  it("respects an explicitly saved empty campaign list", () => {
    expect(parseHomeAdvertisements("[]")).toEqual([]);
  });
});
