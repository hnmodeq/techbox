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

  it("reduces tool cards to about two thirds height and strengthens their dark overlay", () => {
    const tools = read("features/home/components/sections/ToolsSection.tsx");
    expect(tools).toMatch(/min-h-\[90px\]/);
    expect(tools).toMatch(/sm:min-h-\[96px\]/);
    expect(tools).toMatch(/from-black\/95 via-black\/70 to-black\/55/);
  });
});
