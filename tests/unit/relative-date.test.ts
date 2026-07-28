import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { formatRelativeFa, formatAbsoluteFa } from "@/lib/date-format";

const ago = (ms: number) => new Date(Date.now() - ms).toISOString();
const S = 1000, M = 60 * S, H = 60 * M, D = 24 * H;

describe("the RelativeDate ladder", () => {
  it("matches the specified scale at every boundary", () => {
    expect(formatRelativeFa(ago(10 * S))).toBe("لحظاتی پیش");
    expect(formatRelativeFa(ago(1 * M))).toBe("۱ دقیقه پیش");
    expect(formatRelativeFa(ago(59 * M))).toBe("۵۹ دقیقه پیش");
    expect(formatRelativeFa(ago(1 * H))).toBe("۱ ساعت پیش");
    expect(formatRelativeFa(ago(23 * H))).toBe("۲۳ ساعت پیش");
    expect(formatRelativeFa(ago(1 * D))).toBe("۱ روز پیش");
    expect(formatRelativeFa(ago(6 * D))).toBe("۶ روز پیش");
    expect(formatRelativeFa(ago(7 * D))).toBe("۱ هفته پیش");
    expect(formatRelativeFa(ago(29 * D))).toBe("۴ هفته پیش");
    expect(formatRelativeFa(ago(30 * D))).toBe("۱ ماه پیش");
    expect(formatRelativeFa(ago(364 * D))).toBe("۱۲ ماه پیش");
    expect(formatRelativeFa(ago(365 * D))).toBe("۱ سال پیش");
  });

  it("renders nothing rather than inventing a date", () => {
    // A card with no date must show no date. Falling back to "now" would
    // silently label every undated row "لحظاتی پیش".
    expect(formatRelativeFa(null)).toBe("");
    expect(formatRelativeFa(undefined)).toBe("");
    expect(formatRelativeFa("")).toBe("");
    expect(formatRelativeFa("not-a-date")).toBe("");
    expect(formatAbsoluteFa(null)).toBe("");
    expect(formatAbsoluteFa("not-a-date")).toBe("");
  });

  it("puts a real Jalali date in the tooltip", () => {
    expect(formatAbsoluteFa("2026-06-22T00:00:00.000Z")).toMatch(/^۱ تیر/);
  });
});

describe("dates come from the database, never from the clock", () => {
  const read = (p: string) => fs.readFileSync(path.resolve(__dirname, "../..", p), "utf8");

  it("never substitutes now() for a missing post or comment date", () => {
    // Every displayed date must trace to a stored column: Post.date for
    // cards, Comment.createdAt for comments.
    const server = read("lib/home-server.ts");
    const sections = read("lib/home-sections.ts");
    expect(server).toMatch(/date: p\.date\.toISOString\(\)/);
    expect(sections).toMatch(/date: row\.createdAt\.toISOString\(\)/);
    for (const src of [server, sections]) {
      expect(src).not.toMatch(/date:\s*[^,\n]*\?\?\s*new Date\(\)/);
      expect(src).not.toMatch(/date:\s*[^,\n]*\|\|\s*new Date\(\)/);
    }
  });

  it("renders no <time> element at all when the date is missing", () => {
    const cmp = read("components/ui/relative-date.tsx");
    expect(cmp).toMatch(/if \(!iso \|\| !text\) return null;/);
  });
});
