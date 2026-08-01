import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const read = (file: string) => fs.readFileSync(path.resolve(__dirname, "../..", file), "utf8");

/** Tooltips portal to document.body, so normal section CSS cannot colour them. */
describe("module-coloured tooltips", () => {
  const tooltip = read("components/ui/tooltip.tsx");
  const layout = read("components/layout/LayoutShell.tsx");
  const home = read("app/page.tsx");
  const news = read("features/home/components/sections/InsightsSection.tsx");
  const magazine = read("features/home/components/sections/MagazineSection.tsx");

  it("passes module colour through React context into portalled popups and arrows", () => {
    expect(tooltip).toMatch(/export function TooltipColorScope/);
    expect(tooltip).toMatch(/TooltipThemeContext/);
    expect(tooltip).toMatch(/--tooltip-background/);
    expect(tooltip).toMatch(/TooltipPrimitive\.Portal/);
    expect(tooltip).toMatch(/fill-\[color:var\(--tooltip-background/);
  });

  it("colours standalone module routes from their pathname", () => {
    expect(layout).toMatch(/function tooltipColorForPath/);
    expect(layout).toMatch(/var\(--module-\$\{match\}-color, var\(--primary\)\)/);
    expect(layout).toMatch(/<TooltipColorScope color=\{tooltipColorForPath\(pathname\)\}/);
  });

  it("colours each module-backed homepage section using its saved admin colour", () => {
    expect(home).toMatch(/const withModuleTooltip/);
    for (const slug of ["blog", "media", "news", "shop", "forum", "review", "tools", "timeline"]) {
      // Some multi-line section nodes put the module argument on the next
      // line, so allow whitespace between the helper call and its argument.
      expect(home).toMatch(new RegExp(`withModuleTooltip\\([\\s\\S]{0,80}"${slug}"`));
    }
    expect(news).toMatch(/<TooltipColorScope color=\{accentColor\}>/);
    expect(magazine).toMatch(/<TooltipColorScope color=\{accentColor\}>/);
  });
});
