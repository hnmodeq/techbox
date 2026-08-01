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

  it("keeps the comment avatar softly rounded, and big enough to identify", () => {
    // 32px was too small to tell who was speaking; 44px on the small radius
    // token. Still not a circle.
    expect(video).toMatch(/block size-11 shrink-0 overflow-hidden rounded-\[var\(--hp-r-sm\)\]/);
    // Scoped to the avatar: PlayAffordance is legitimately a circle.
    const avatarBlock = video.slice(video.indexOf("const avatar = ("), video.indexOf("<article"));
    expect(avatarBlock).not.toMatch(/rounded-full/);
  });

  it("labels the avatar link with the commenter's real name", () => {
    // Name is interpolated, never hardcoded.
    expect(video).toMatch(/بازدید از حساب کاربری \$\{comment\.author\.name\}/);
    expect(video).not.toMatch(/بازدید از حساب کاربری پارسا/);
  });

  it("blockifies the avatar and its optional link wrapper", () => {
    // The avatar span is NOT always a flex item: when the author has a
    // username it is wrapped in a <Link>, and the Link becomes the flex
    // item instead. A default-inline span ignores width/height, so the
    // avatar rendered at the image's natural size and blew the card open.
    const block = video.slice(video.indexOf("const avatar = ("), video.indexOf("<article"));
    expect(block).toMatch(/className="block size-11/);
    expect(video).toMatch(/className="block shrink-0 rounded-\[var\(--hp-r-sm\)\]/);
  });

  it("shows four real, distinct comment cards drawn from across all videos", () => {
    expect(video).toMatch(/highlightComments\?: VideoHighlightComment\[\]/);
    expect(video).toMatch(/<VideoCommentCard\s/);
    expect(video).toMatch(/scrollToCommentId=\{commentToReveal\}/);
    expect(data).toMatch(/export async function getLatestVideoHighlightComments/);
    expect(data).toMatch(/videoSlug: row\.post\.slug/);
    // Not scoped to the newest video any more.
    expect(data).not.toMatch(/videoSlug: latest\.slug/);
    // Two salted picks could collide and render the same comment twice;
    // seededIndices probes to the next free slot instead.
    expect(data).toMatch(/export function seededIndices/);
    expect(data).toMatch(/while \(picked\.includes\(candidate\)\)/);
    // Quotes must belong to the video actually on screen, and never pad
    // beyond what the database returned.
    // Quotes come from ANY published video, so each card resolves the index
    // of its own video and opens that one — never the newest by default.
    expect(video).toMatch(/items\.findIndex\(\(v\) => v\.slug === comment\.videoSlug\)/);
    expect(video).toMatch(/\.slice\(0, 4\)/);
    expect(video).toMatch(/openVideo\(index, comment\.id\)/);
    expect(video).toMatch(/comments\.length > 0 &&/);
    // 2 x 2 grid.
    expect(video).toMatch(/grid gap-4 sm:grid-cols-2/);
    // One quote per person, so four cards are four different voices.
    expect(data).toMatch(/seenAuthors\.has\(key\)/);
  });

  it("renders the comment cards at a fixed aspect ratio", () => {
    // The exact ratio is a design choice and has already been retuned
    // (1/1 -> 2/1). What must not regress is that the card is ratio-driven
    // at all, and that the quote can shrink inside it — without min-h-0 and
    // a line clamp, a long comment forces the box taller and the ratio
    // silently stops holding.
    const card = video.slice(video.indexOf("function VideoCommentCard"));
    expect(card).toMatch(/aspectRatio: "\d+\/\d+"/);
    expect(card).toMatch(/min-h-0 min-w-0 flex-1 overflow-hidden/);
    expect(card).toMatch(/line-clamp-4/);
    expect(card).not.toMatch(/min-h-\[210px\]/);
  });

  it("closes the gap under the quick-takes rail", () => {
    // justify-between spreads the slack between the comments and the rail
    // so the column finishes level with the tall portrait video.
    expect(video).toMatch(/flex min-w-0 flex-col justify-between gap-5/);
  });

  it("builds a diverse, comment-led rotation from recent News", () => {
    // Recent News has priority, then the latest-ten fallback fills any empty
    // slots. One sampled top-level comment per post makes every carousel
    // change represent a different discussion.
    expect(data).toMatch(/export async function getLatestInsights/);
    expect(data).toMatch(/export function selectNewsDiscussionComments/);
    expect(data).toMatch(/take: 10,/);
    expect(data).toMatch(/parentId: null/);
    expect(data).toMatch(/status: "approved"/);
    expect(data).toMatch(/const featured = \[\.\.\.storyPool\]\.sort/);
    expect(data).not.toMatch(/MIN_COMMENTS_FOR_FEATURE/);
  });

  it("keeps the news card in place and opens the selected discussion in a modal", () => {
    // The lead remains an in-place preview; a comment explicitly opens the
    // dedicated NewsModal, where the full live thread is loaded.
    expect(insights).toMatch(/نمای تمام‌صفحه/);
    expect(insights).toMatch(/<ShareButton url=\{fullScreenHref\}/);
    expect(insights).toMatch(/<NewsModal/);
    expect(insights).toMatch(/onOpenComment/);
    expect(insights).not.toMatch(/<CommentSection/);
  });

  it("lets the page own the section background, not the section", () => {
    // Backgrounds now alternate per RENDERED index in app/page.tsx, so a
    // section painting its own wash would break the stripe wherever an
    // admin reorders or hides something.
    expect(insights).not.toMatch(/InsetBand/);
    expect(insights).not.toMatch(/className="bg-muted\/50"/);
    expect(video).not.toMatch(/className="bg-muted\/35"/);
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
