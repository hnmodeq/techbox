import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const read = (p: string) => fs.readFileSync(path.resolve(__dirname, "../..", p), "utf8");
const section = read("features/home/components/sections/InsightsSection.tsx");
const newsletter = read("features/home/components/sections/NewsletterCard.tsx");
const shell = read("components/layout/LayoutShell.tsx");
const editor = read("app/admin/posts/new/page.tsx");
const dialog = read("features/legal/components/TermsDialog.tsx");

/** The selection rule, mirrored so the behaviour can be asserted directly. */
const MIN_COMMENTS_FOR_FEATURE = 4;
function pickFeatured(pool: Array<{ id: string }>, counts: Map<string, number>) {
  const qualifying = pool.filter((p) => (counts.get(p.id) || 0) >= MIN_COMMENTS_FOR_FEATURE);
  return (qualifying[0] ?? pool[0])?.id;
}

describe("story selection", () => {
  // `pool` arrives date-desc.
  const pool = [{ id: "newest" }, { id: "mid" }, { id: "old" }];

  it("prefers recency over popularity among qualifying stories", () => {
    // The old rule sorted by comment count, which pinned the section to
    // whatever went viral days ago — wrong under "آخرین خبر امروز".
    const counts = new Map([["newest", 0], ["mid", 9], ["old", 50]]);
    expect(pickFeatured(pool, counts)).toBe("mid");
  });

  it("takes the newest as soon as it clears the threshold", () => {
    const counts = new Map([["newest", 4], ["mid", 9], ["old", 50]]);
    expect(pickFeatured(pool, counts)).toBe("newest");
  });

  it("falls back to the newest when nothing qualifies", () => {
    // Common on a young site: the section must still render.
    expect(pickFeatured(pool, new Map([["newest", 0], ["mid", 1]]))).toBe("newest");
    expect(pickFeatured(pool, new Map())).toBe("newest");
  });
});

describe("the section never navigates away", () => {
  it("renders the title and image without wrapping them in a link", () => {
    expect(section).not.toMatch(/<Link[^>]*>\s*\{story\.title\}/);
    expect(section).toMatch(/<h3[^>]*>[\s\S]*?\{story\.title\}/);
  });

  it("offers explicit exits instead", () => {
    expect(section).toMatch(/نمای تمام‌صفحه/);
    expect(section).toMatch(/<ShareButton url=\{fullScreenHref\}/);
  });

  it("puts the discussion beside the story, not beneath it", () => {
    // Story on the right (first in RTL); discussion and newsletter stacked
    // in the left column so neither leaves a band of whitespace.
    expect(section).toMatch(/lg:grid-cols-\[minmax\(0,1\.25fr\)_minmax\(320px,\.75fr\)\]/);
    const left = section.slice(section.indexOf("<NewsDiscussion"), section.indexOf("</div>", section.indexOf("<NewsDiscussion")));
    expect(left).toMatch(/<NewsletterCard/);
  });

  it("puts the section actions under the story card", () => {
    const storyCol = section.slice(section.indexOf("<LatestStory"), section.indexOf("<div className=\"flex min-w-0"));
    expect(storyCol).toMatch(/<NewsActions \/>/);
  });

  it("shows the thread open and scrollable, with a composer", () => {
    // Same shape as the news sidebar: no toggle, because the comments are
    // the point of this column.
    expect(section).not.toMatch(/همه دیدگاه‌ها و ثبت دیدگاه/);
    expect(section).not.toMatch(/aria-expanded/);
    expect(section).toMatch(/listMaxHeight="360px"/);
  });

  it("keeps one source of truth for the thread", () => {
    // An earlier version paired a server-rendered rail with a hidden
    // CommentSection mounted only for its composer. Posting refetched the
    // hidden list while the visible rail came from an hour-cached server
    // payload, so a new comment appeared nowhere.
    const cs = read("features/comment/components/CommentSection.tsx");
    expect(section).not.toMatch(/hideList/);
    expect(cs).not.toMatch(/hideList/);
    expect(section).not.toMatch(/LatestCommentRow/);
    // CommentSection reloads its own list after a successful post.
    expect(cs).toMatch(/startTransition\(\(\) => \{ load\(\); \}\)/);
  });

  it("scrolls the list but leaves the composer reachable", () => {
    const cs = read("features/comment/components/CommentSection.tsx");
    expect(cs).toMatch(/listMaxHeight \? "overflow-y-auto overscroll-contain pe-1" : ""/);
    expect(cs).toMatch(/maxHeight: listMaxHeight/);
    // The form is rendered before the list and outside the scroll region.
    expect(cs.indexOf("handleTopSubmit}")).toBeLessThan(cs.indexOf("listMaxHeight ? { maxHeight"));
  });
});

describe("comment metadata", () => {
  const cs = read("features/comment/components/CommentSection.tsx");

  it("links comment authors to their profile", () => {
    // AuthorLink resolves a slug from the username, falling back to a
    // name map, so guests still render as a link rather than breaking.
    expect(cs).toMatch(/<AuthorLink/);
  });

  it("uses RelativeDate for comment timestamps", () => {
    // The old tooltip said "date of this comment", which the relative
    // label already implies. RelativeDate shows the real Jalali date.
    expect(cs).toMatch(/<RelativeDate\s+date=\{\(c as any\)\.createdAt\}/);
    expect(cs).toMatch(/label="تاریخ دیدگاه"/);
  });
});

describe("newsletter panel", () => {
  it("wears the news module colour", () => {
    expect(newsletter).toMatch(/accentColor \|\| "var\(--hp-brand-ink\)"/);
    expect(section).toMatch(/<NewsletterCard accentColor=\{accentColor\}/);
  });

  it("opens the terms in a dialog rather than navigating", () => {
    expect(newsletter).toMatch(/<TermsDialog>/);
    expect(newsletter).not.toMatch(/href="\/terms"/);
  });

  it("loads the terms only when the dialog is first opened", () => {
    // This renders on the homepage; a query per page load is how the
    // connection pool got exhausted before.
    expect(dialog).toMatch(/if \(!open \|\| loadedRef\.current\) return/);
  });
});

describe("news excerpt bounds", () => {
  it("constrains news only, not every module", () => {
    expect(editor).toMatch(/const NEWS_EXCERPT_MIN = 180;/);
    expect(editor).toMatch(/const NEWS_EXCERPT_MAX = 450;/);
    expect(editor).toMatch(/if \(values\.module !== "news"\) return;/);
  });

  it("still allows an empty draft to be saved", () => {
    // Authors must be able to save before the text is written.
    expect(editor).toMatch(/if \(length === 0\) return;/);
  });

  it("shows a live counter", () => {
    expect(editor).toMatch(/excerptWithinBounds/);
  });
});

describe("the homepage degrades instead of throwing", () => {
  const server = read("lib/home-server.ts");

  it("does not enter the cache while the breaker is open", () => {
    // Every query inside would fail and the deliberate "refuse to cache an
    // empty homepage" throw would fire inside unstable_cache, which Next
    // surfaces as a red dev overlay even though it is caught and handled.
    expect(server).toMatch(/if \(circuitState\(\) === "open"\) \{/);
    expect(server).toMatch(/import \{ withCircuit, isCircuitOpenError, circuitState \}/);
  });

  it("still catches the race where queries fail after entry", () => {
    expect(server).toMatch(/return \{ modules: \{\}, ticker: \[\], generatedAt: new Date\(\)\.toISOString\(\) \};/);
  });
});
