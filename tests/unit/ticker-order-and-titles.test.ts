import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const ticker = fs.readFileSync(
  path.resolve(__dirname, "../../features/news/components/NewsTicker.tsx"),
  "utf8",
);

describe("ticker editorial order and module names", () => {
  it("uses the same admin-managed module title source as the main sidebar", () => {
    expect(ticker).toMatch(/useModuleTitles/);
    expect(ticker).toMatch(/moduleTitles\[itemModule\]/);
    expect(ticker).not.toMatch(/const moduleCopy/);
  });

  it("renders dot, module, title, then publication date in RTL source order", () => {
    const item = ticker.slice(ticker.indexOf("RTL reading order"), ticker.indexOf("</Link>", ticker.indexOf("RTL reading order")));
    expect(item.indexOf("aria-hidden")).toBeLessThan(item.indexOf("{moduleTitle}"));
    expect(item.indexOf("{moduleTitle}")).toBeLessThan(item.indexOf("{item.title}"));
    expect(item.indexOf("{item.title}")).toBeLessThan(item.indexOf("{relativeDate}"));
  });
});
