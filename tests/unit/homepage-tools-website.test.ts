import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const read = (file: string) => fs.readFileSync(path.resolve(__dirname, "../..", file), "utf8");

describe("homepage tools and website-info requirements", () => {
  const tools = read("features/home/components/sections/ToolsSection.tsx");
  const registry = read("config/modules.config.ts");
  const websiteInfo = read("features/home/components/sections/WebsiteInfoSection.tsx");
  const profiles = read("features/home/components/sections/FamilyProfilesSection.tsx");
  const footer = read("components/layout/Footer.tsx");
  const data = read("lib/home-sections.ts");

  it("uses absolute theme bands and keeps the original section heading visually hidden", () => {
    expect(tools).toMatch(/bg-white[^"]*dark:bg-black/);
    expect(websiteInfo).toMatch(/bg-white[^"]*dark:bg-black/);
    expect(tools).toMatch(/<h2 id=\{HEADING_ID\} className="sr-only"/);
    expect(tools).not.toMatch(/<SectionHeader/);
  });

  it("uses five transparent image shortcuts with small titles", () => {
    expect(tools).not.toMatch(/ToolIcon|descriptionFa/);
    expect(tools).toMatch(/lg:grid-cols-5/);
    expect(tools).toMatch(/object-contain/);
    expect(tools).toMatch(/group-hover:text-\[color:var\(--tools-accent\)\]/);
    expect(tools).toMatch(/ابزارهایی که کار شما رو شاید راحت‌تر کنه/);
    expect(registry.match(/tools-transparent\/.*\.webp/g)).toHaveLength(5);
    expect(websiteInfo).toMatch(/website-info\.webp/);
  });

  it("restores real contributors when the editorial-team mapping is empty", () => {
    expect(data).toMatch(/if \(rows\.length === 0\)/);
    expect(data).toMatch(/where: \{ status: "active", posts: \{ some: PUBLISHED \} \}/);
    expect(data).toMatch(/posts: \{ where: PUBLISHED \}/);
  });

  it("labels member activity as completed participation", () => {
    expect(profiles).toMatch(/مشارکت انجام شده/);
  });

  it("restores the colourful tooltip sub-footer for رستاک and بومیم", () => {
    expect(footer).toMatch(/هونامیک ارتباط رستاک/);
    expect(footer).toMatch(/text-sky-500/);
    expect(footer).toMatch(/بومیم/);
    expect(footer).toMatch(/text-\[#f5b301\]/);
    expect(footer.match(/<TooltipContent>در دست طراحی<\/TooltipContent>/g)).toHaveLength(2);
  });
});
