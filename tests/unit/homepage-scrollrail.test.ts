import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const rail = fs.readFileSync(
  path.resolve(__dirname, "../..", "features/home/components/primitives/ScrollRail.tsx"),
  "utf8",
);

/**
 * The video quick-takes rail shipped looking like it had no controls at
 * all. Three separate causes, each independently sufficient — hence three
 * separate tests.
 */
describe("ScrollRail arrow affordance", () => {
  it("puts prev on the logical start edge, which is the RIGHT in RTL", () => {
    // These were inverted against the comment sitting directly above them:
    // the disabled prev arrow landed over the left-hand cut-off card, and
    // the live next arrow sat past the right edge where the rail had
    // already run out.
    expect(rail).toMatch(/dir === "prev" \? "start-1" : "end-1"/);
    expect(rail).toMatch(/dir === "prev" \? "start-0 sm:-start-4" : "end-0 sm:-end-4"/);
    expect(rail).not.toMatch(/dir === "prev" \? "end-0 sm:-end-4"/);
  });

  it("dims disabled arrows instead of hiding them", () => {
    // opacity-0 at each end means the rail looks controlless in exactly
    // the state every visitor sees first: scrolled to the start.
    expect(rail).toMatch(/disabled \? "pointer-events-none opacity-25"/);
    expect(rail).not.toMatch(/disabled \? "pointer-events-none opacity-0"/);
  });

  it("gives bare arrows a backdrop so they survive dark artwork", () => {
    // Bare arrows are drawn over video thumbnails; bare currentColor
    // vanished against them.
    expect(rail).toMatch(/bg-background\/90 text-foreground shadow-\[var\(--hp-shadow-card\)\] backdrop-blur-sm/);
  });

  it("can show arrows below the md breakpoint", () => {
    // Touch has no hover affordance, and for the video quick takes these
    // cards are the only route to those videos.
    expect(rail).toMatch(/onMobile \? "flex" : "hidden md:flex"/);
  });
});
