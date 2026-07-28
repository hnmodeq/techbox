import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const read = (file: string) => fs.readFileSync(path.resolve(__dirname, "../..", file), "utf8");

describe("homepage Video and Latest contracts", () => {
  const video = read("features/home/components/sections/VideoSection.tsx");
  const insights = read("features/home/components/sections/InsightsSection.tsx");
  const data = read("lib/home-sections.ts");

  it("opens the existing VideoModal and exposes real video duration/date data", () => {
    expect(video).toMatch(/import \{ VideoModal, useVideoModal \}/);
    expect(video).toMatch(/<VideoModal/);
    expect(video).toMatch(/<TooltipContent>زمان ویدیو<\/TooltipContent>/);
    expect(video).toMatch(/item\.date_fa/);
    expect(video).not.toMatch(/hover:scale/);
  });

  it("uses exactly one real Spiceworks-style comment slot beside the latest video", () => {
    expect(video).toMatch(/highlightComment\?: VideoHighlightComment/);
    expect(video).toMatch(/<VideoCommentCard comment=\{videoComment\}/);
    expect(video).toMatch(/scrollToCommentId=\{commentToReveal\}/);
    expect(data).toMatch(/export async function getLatestVideoHighlightComment/);
    expect(data).toMatch(/videoSlug: latest\.slug/);
  });

  it("selects the weekly news lead by approved-comment count and keeps comments real", () => {
    expect(data).toMatch(/export async function getLatestInsights/);
    expect(data).toMatch(/const weekAgo = new Date\(Date\.now\(\) - 7 \* 864e5\)/);
    expect(data).toMatch(/status: "approved", deletedAt: null/);
    expect(data).toMatch(/countDifference/);
    expect(insights).toMatch(/data\?\.comments/);
    expect(insights).toMatch(/#comment-\$\{comment\.id\}/);
  });

  it("uses a full-width ghost page wash rather than an inset card for Latest", () => {
    expect(insights).toMatch(/SectionShell labelledBy=\{HEADING_ID\} className="bg-muted\/50"/);
    expect(insights).not.toMatch(/InsetBand/);
  });
});
