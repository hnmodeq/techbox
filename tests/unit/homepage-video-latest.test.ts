import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { seededIndices } from "@/lib/home-sections";

const read = (file: string) => fs.readFileSync(path.resolve(__dirname, "../..", file), "utf8");

describe("homepage Video and Latest contracts", () => {
  const video = read("features/home/components/sections/VideoSection.tsx");
  const insights = read("features/home/components/sections/InsightsSection.tsx");
  const data = read("lib/home-sections.ts");

  it("opens the existing VideoModal and exposes real video duration/date data", () => {
    expect(video).toMatch(/import \{ VideoModal, useVideoModal \}/);
    expect(video).toMatch(/<VideoModal/);
    expect(video).toMatch(/<TooltipContent>مدت زمان ویدیو<\/TooltipContent>/);
    // Dates render through the shared RelativeDate component (relative
    // label + absolute Jalali tooltip), so the raw server string is gone.
    expect(video).toMatch(/<RelativeDate date=\{item\.date\}/);
    expect(video).not.toMatch(/item\.date_fa/);
    expect(video).not.toMatch(/hover:scale/);
  });

  it("makes the quick-takes rail a slider that works on touch", () => {
    // These are the only route to those videos, so the arrows must not be
    // desktop-hover-only, and must appear as soon as the rail overflows.
    expect(video).toMatch(/arrowsOnMobile/);
    expect(video).not.toMatch(/hideArrows=\{quickTakes\.length < 4\}/);
  });

  it("keeps the comment avatar small and softly rounded", () => {
    expect(video).toMatch(/block size-8 shrink-0 overflow-hidden rounded-\[var\(--hp-r-sm\)\]/);
    expect(video).not.toMatch(/size-11 shrink-0 overflow-hidden rounded-full/);
  });

  it("blockifies the avatar and its optional link wrapper", () => {
    // The avatar span is NOT always a flex item: when the author has a
    // username it is wrapped in a <Link>, and the Link becomes the flex
    // item instead. A default-inline span ignores width/height, so the
    // avatar rendered at the image's natural size and blew the card open.
    const block = video.slice(video.indexOf("const avatar = ("), video.indexOf("<article"));
    expect(block).toMatch(/className="block size-8/);
    expect(video).toMatch(/className="block shrink-0 rounded-\[var\(--hp-r-sm\)\]/);
  });

  it("shows two real, distinct comment cards beside the latest video", () => {
    expect(video).toMatch(/highlightComments\?: VideoHighlightComment\[\]/);
    expect(video).toMatch(/<VideoCommentCard\s/);
    expect(video).toMatch(/scrollToCommentId=\{commentToReveal\}/);
    expect(data).toMatch(/export async function getLatestVideoHighlightComments/);
    expect(data).toMatch(/videoSlug: latest\.slug/);
    // Two salted picks could collide and render the same comment twice;
    // seededIndices probes to the next free slot instead.
    expect(data).toMatch(/export function seededIndices/);
    expect(data).toMatch(/while \(picked\.includes\(candidate\)\)/);
    // Quotes must belong to the video actually on screen, and never pad
    // beyond what the database returned.
    expect(video).toMatch(/\.filter\(\(c\) => c\.videoSlug === latest\.slug\)\.slice\(0, 2\)/);
    expect(video).toMatch(/comments\.length > 0 &&/);
  });

  it("renders the comment cards as squares", () => {
    const card = video.slice(video.indexOf("function VideoCommentCard"));
    expect(card).toMatch(/aspectRatio: "1\/1"/);
    // A fixed ratio only holds if the quote block can shrink inside it.
    expect(card).toMatch(/min-h-0 min-w-0 flex-1 overflow-hidden/);
    expect(card).toMatch(/line-clamp-4/);
    expect(card).not.toMatch(/min-h-\[210px\]/);
  });

  it("closes the gap under the quick-takes rail", () => {
    // justify-between spreads the slack between the comments and the rail
    // so the column finishes level with the tall portrait video.
    expect(video).toMatch(/flex min-w-0 flex-col justify-between gap-5/);
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

describe("seededIndices picks distinct slots", () => {
  it("never repeats an index, at any pool size", () => {
    // Two independently salted seededIndex calls can collide, which would
    // render the same comment in both cards.
    for (let total = 1; total <= 40; total += 1) {
      for (let count = 1; count <= 5; count += 1) {
        const got = seededIndices(total, count);
        expect(new Set(got).size).toBe(got.length);
        expect(got.length).toBe(Math.min(count, total));
        for (const index of got) {
          expect(index).toBeGreaterThanOrEqual(0);
          expect(index).toBeLessThan(total);
        }
      }
    }
  });

  it("degrades rather than throwing on empty input", () => {
    expect(seededIndices(0, 2)).toEqual([]);
    expect(seededIndices(5, 0)).toEqual([]);
    // One comment must yield one card, not a duplicate pair.
    expect(seededIndices(1, 2)).toHaveLength(1);
  });
});
