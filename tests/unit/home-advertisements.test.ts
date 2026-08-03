import { describe, expect, it } from "vitest";
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

  it("respects an explicitly saved empty campaign list", () => {
    expect(parseHomeAdvertisements("[]")).toEqual([]);
  });
});
