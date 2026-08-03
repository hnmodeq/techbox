import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const read = (file: string) => fs.readFileSync(path.resolve(__dirname, "../..", file), "utf8");

describe("homepage tools and website-info requirements", () => {
  const tools = read("features/home/components/sections/ToolsSection.tsx");
  const registry = read("config/modules.config.ts");
  const websiteInfo = read("features/home/components/sections/WebsiteInfoSection.tsx");
  const profiles = read("features/home/components/sections/FamilyProfilesSection.tsx");
  const data = read("lib/home-sections.ts");

  it("uses absolute black bands and keeps the tools heading visual-only hidden", () => {
    expect(tools).toMatch(/className="w-full bg-black/);
    expect(websiteInfo).toMatch(/className="w-full bg-black/);
    expect(tools).toMatch(/<h2 id=\{HEADING_ID\} className="sr-only"/);
    expect(tools).not.toMatch(/<SectionHeader/);
  });

  it("colours both tool titles and icons with the module accent on hover", () => {
    expect(tools.match(/group-hover:text-\[color:var\(--tools-accent\)\]/g)?.length).toBeGreaterThanOrEqual(2);
    expect(tools).toMatch(/mt-0\.5 line-clamp-3/);
    expect(registry).toMatch(/محاسبه بازه IP، Subnet Mask، تعداد میزبان و CIDR شبکه/);
    expect(registry).toMatch(/باتری موردنیاز و زمان پشتیبانی تجهیزات رک/);
  });

  it("restores real contributors when the editorial-team mapping is empty", () => {
    expect(data).toMatch(/if \(rows\.length === 0\)/);
    expect(data).toMatch(/where: \{ status: "active", posts: \{ some: PUBLISHED \} \}/);
    expect(data).toMatch(/posts: \{ where: PUBLISHED \}/);
  });

  it("labels member activity as completed participation", () => {
    expect(profiles).toMatch(/مشارکت انجام شده/);
  });
});
