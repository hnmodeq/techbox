import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import {
  LISTING_SPEC_KEYS,
  pickListingSpecs,
  isListingSpecKey,
} from "@/lib/listing-specs";

/**
 * Product listings must not ship the full spec sheet.
 *
 * QNAP rows average 123 spec entries (largest: 212). Loading /shop with
 * Prisma's `include` transferred 1218 kB, of which 978 kB was `specs`,
 * against a 5 GB/month free-tier egress cap. ShopGrid reads 21 keys.
 */

describe("pickListingSpecs", () => {
  it("keeps the keys ShopGrid filters on", () => {
    const input = {
      "Drive Bay": "4",
      CPU: "Intel Celeron N5105",
      "System Memory": "8 GB",
      "10 Gigabit Ethernet Port": "2",
    };
    expect(pickListingSpecs(input)).toEqual(input);
  });

  it("drops everything else", () => {
    const result = pickListingSpecs({
      "Drive Bay": "4",
      "RAID Group": "x".repeat(5000),
      "Supported Languages": "y".repeat(3000),
      "QVR Pro": "z".repeat(2000),
    });
    expect(result).toEqual({ "Drive Bay": "4" });
    expect(JSON.stringify(result).length).toBeLessThan(60);
  });

  it("keeps Persian spec keys, which are the ones a Persian site relies on", () => {
    const input = {
      "تعداد جایگاه دیسک": "۴",
      پردازنده: "Intel",
      "حافظه رم": "۸ گیگابایت",
      "نرم‌افزار: QVR Pro": "long".repeat(500),
    };
    const out = pickListingSpecs(input);
    expect(Object.keys(out).sort()).toEqual(
      ["پردازنده", "تعداد جایگاه دیسک", "حافظه رم"].sort()
    );
  });

  it("skips empty values rather than shipping empty strings", () => {
    // A present-but-empty key costs bytes and reads as falsy anyway.
    expect(pickListingSpecs({ CPU: "", "Drive Bay": "4" })).toEqual({ "Drive Bay": "4" });
    expect(pickListingSpecs({ CPU: null, "Drive Bay": "4" })).toEqual({ "Drive Bay": "4" });
  });

  it("returns {} for non-object input, matching the previous behaviour", () => {
    // getDbModulePosts used to emit {} for these; consumers index into the
    // result without guarding, so this must not become null or undefined.
    for (const bad of [null, undefined, "string", 42, ["a"], true]) {
      expect(pickListingSpecs(bad)).toEqual({});
    }
  });

  it("never mutates its input", () => {
    const input = { CPU: "Intel", "RAID Group": "big" };
    const copy = { ...input };
    pickListingSpecs(input);
    expect(input).toEqual(copy);
  });

  it("produces a dramatically smaller payload on a realistic row", () => {
    // 120 junk keys plus the four a card needs — the real shape of a QNAP row.
    const row: Record<string, string> = {
      "Drive Bay": "8",
      CPU: "AMD Ryzen",
      "System Memory": "32 GB",
      "Power Supply Unit": "2 x 550W redundant",
    };
    for (let i = 0; i < 120; i++) row[`Irrelevant Spec ${i}`] = "value ".repeat(20);

    const before = JSON.stringify(row).length;
    const after = JSON.stringify(pickListingSpecs(row)).length;
    expect(after).toBeLessThan(before * 0.05); // >95% smaller
  });
});

describe("the whitelist matches what ShopGrid actually reads", () => {
  const shopGrid = fs.readFileSync(
    path.resolve(__dirname, "../../features/shop/components/ShopGrid.tsx"),
    "utf8"
  );

  it("covers every spec key ShopGrid indexes", () => {
    // Scrape specs["..."] / s["..."] out of the component. If someone adds
    // a filter without extending the whitelist, the filter silently finds
    // nothing on the listing while working on the detail page — a bug that
    // is very hard to attribute later.
    const used = new Set(
      [...shopGrid.matchAll(/\b(?:specs|s)\[\s*"([^"]+)"\s*\]/g)].map((m) => m[1])
    );
    expect(used.size).toBeGreaterThan(10); // sanity: the scrape found things

    const missing = [...used].filter((key) => !isListingSpecKey(key));
    expect(
      missing,
      `ShopGrid reads these keys but lib/listing-specs.ts omits them: ${missing.join(", ")}`
    ).toEqual([]);
  });

  it("has no duplicate entries", () => {
    expect(new Set(LISTING_SPEC_KEYS).size).toBe(LISTING_SPEC_KEYS.length);
  });
});

describe("server-posts wires the filter in", () => {
  const serverPosts = fs.readFileSync(
    path.resolve(__dirname, "../../lib/server-posts.ts"),
    "utf8"
  );

  it("uses pickListingSpecs, not the raw specs column", () => {
    expect(serverPosts).toMatch(/specs:\s*pickListingSpecs\(p\.specs\)/);
  });

  it("does not pass the raw specs object through", () => {
    expect(serverPosts).not.toMatch(/specs:\s*\(p\.specs\s*&&/);
  });
});

describe("product detail pages keep the full spec sheet", () => {
  const serverPost = fs.readFileSync(
    path.resolve(__dirname, "../../lib/server-post.ts"),
    "utf8"
  );

  it("server-post.ts does not filter specs", () => {
    // Detail pages render SpecsTableCategorized over all ~123 rows.
    // Applying the listing whitelist here would silently gut them.
    expect(serverPost).not.toMatch(/pickListingSpecs/);
  });
});
