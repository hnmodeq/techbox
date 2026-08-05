import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const read = (file: string) => fs.readFileSync(path.resolve(__dirname, "../..", file), "utf8");

describe("homepage review, timeline and tools polish", () => {
  it("keeps timeline images saturated and moves hover emphasis to the module-coloured title", () => {
    const card = read("features/timeline/components/TimelineCard.tsx");
    expect(card).toMatch(/object-cover saturate-100 pointer-events-none/);
    expect(card).not.toMatch(/group-hover:saturate/);
    expect(card).not.toMatch(/group-hover:grayscale/);
    expect(card).toMatch(/group-hover:text-\[color:var\(--module-timeline-color,var\(--primary\)\)\]/);
  });

  it("uses transparent tool visuals with compact text-only labels", () => {
    const tools = read("features/home/components/sections/ToolsSection.tsx");
    expect(tools).toMatch(/lg:grid-cols-5/);
    expect(tools).toMatch(/object-contain/);
    expect(tools).not.toMatch(/bg-gradient-to-t|descriptionFa/);
  });
});
