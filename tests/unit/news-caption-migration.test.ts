import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const migration = fs.readFileSync(
  path.resolve(__dirname, "../..", "prisma/migrations/20260801000018_enrich_news_captions/migration.sql"),
  "utf8",
);

describe("News caption content migration", () => {
  it("replaces all generic News captions without overwriting editor-written copy", () => {
    expect(migration).toMatch(/UPDATE "Post"/);
    expect(migration).toMatch(/WHERE "module" = 'news'/);
    expect(migration).toMatch(/AND "excerpt" = 'خلاصه خبر/);
    for (let i = 1; i <= 11; i += 1) {
      expect(migration).toContain(`WHEN 'news-${String(i).padStart(2, "0")}' THEN`);
    }
  });

  it("provides editorial captions long enough to occupy the News card", () => {
    const captions = [...migration.matchAll(/WHEN 'news-\d+' THEN '([^']+)'/g)].map((match) => match[1]);
    const insights = fs.readFileSync(
      path.resolve(__dirname, "../..", "features/home/components/sections/InsightsSection.tsx"),
      "utf8",
    );
    expect(insights).toMatch(/line-clamp-5 text-\[14px\]/);
    expect(captions).toHaveLength(11);
    for (const caption of captions) {
      // At the card's 14px copy size this range is roughly 3–5 Persian lines;
      // it remains below the editor's 450-character News ceiling.
      expect(caption.length).toBeGreaterThanOrEqual(180);
      expect(caption.length).toBeLessThanOrEqual(450);
    }
  });
});
