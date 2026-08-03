import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { selectNewsDiscussionComments } from "@/lib/home-sections";

const read = (p: string) => fs.readFileSync(path.resolve(__dirname, "../..", p), "utf8");
const section = read("features/home/components/sections/InsightsSection.tsx");
const modal = read("features/news/components/NewsModal.tsx");
const newsletter = read("features/home/components/sections/NewsletterCard.tsx");
const editor = read("app/admin/posts/new/page.tsx");
const dialog = read("features/legal/components/TermsDialog.tsx");

/** The comment source is fresh-first, then fills from the latest-ten fallback. */
describe("news discussion selection", () => {
  it("prefers one comment from each recent story before using older fallback posts", () => {
    const rows = new Map([
      ["recent-a", [{ id: "a-1", postId: "recent-a" }, { id: "a-2", postId: "recent-a" }]],
      ["recent-b", [{ id: "b-1", postId: "recent-b" }]],
      ["older-c", [{ id: "c-1", postId: "older-c" }]],
      ["older-d", [{ id: "d-1", postId: "older-d" }]],
    ]);

    const selected = selectNewsDiscussionComments(
      ["recent-a", "recent-b"],
      ["older-c", "older-d"],
      rows,
      3,
    );

    const postIds = selected.map((row) => row.postId);
    expect(selected).toHaveLength(3);
    expect(new Set(postIds).size).toBe(3);
    expect(postIds).toContain("recent-a");
    expect(postIds).toContain("recent-b");
    expect(postIds.some((id) => id.startsWith("older-"))).toBe(true);
  });

  it("returns only the available real discussions", () => {
    const rows = new Map([["only", [{ id: "only-1", postId: "only" }]]]);
    expect(selectNewsDiscussionComments(["only"], ["missing"], rows, 4)).toEqual([
      { id: "only-1", postId: "only" },
    ]);
  });

  it("does not let the same person occupy multiple discussion slots", () => {
    const rows = new Map([
      ["a", [{ id: "a-1", postId: "a", authorKey: "same" }]],
      ["b", [{ id: "b-1", postId: "b", authorKey: "same" }]],
      ["c", [{ id: "c-1", postId: "c", authorKey: "other" }]],
    ]);
    const selected = selectNewsDiscussionComments(["a", "b", "c"], [], rows, 4);
    expect(selected.map((row) => row.authorKey)).toEqual(expect.arrayContaining(["same", "other"]));
    expect(selected.filter((row) => row.authorKey === "same")).toHaveLength(1);
  });

  it("queries the last seven days first, then the newest ten posts", () => {
    const data = read("lib/home-sections.ts");
    expect(data).toMatch(/const weekAgo = new Date\(Date\.now\(\) - 7 \* 864e5\)/);
    expect(data).toMatch(/take: 10,/);
    expect(data).toMatch(/parentId: null/);
    expect(data).toMatch(/take = 4,/);
    expect(data).toMatch(/authorKey: row\.authorId/);
    expect(data).toMatch(/selectNewsDiscussionComments\(/);
    // Homepage DB work stays serial to protect the small Neon pool.
    const latest = data.slice(data.indexOf("export async function getLatestInsights"));
    expect(latest).not.toMatch(/Promise\.all/);
  });

  it("keeps featured-story ties biased toward the newer database order", () => {
    const data = read("lib/home-sections.ts");
    expect(data).toMatch(/const featured = \[\.\.\.storyPool\]\.sort/);
    expect(data).toMatch(/countByPost\.get\(b\.id\)/);
  });
});

describe("interactive News discussion panel", () => {
  it("uses the requested section title and routes a selected comment to a new NewsModal", () => {
    expect(section).toMatch(/title = "بحث برانگیزترین خبرها"/);
    expect(section).toMatch(/import \{ NewsModal \}/);
    expect(section).toMatch(/<NewsModal/);
    expect(section).toMatch(/onOpenComment=\{setSelectedComment\}/);
  });

  it("cycles every five seconds but pauses for a reader, modal, hidden tab, or reduced motion", () => {
    expect(section).toMatch(/const CAROUSEL_MS = 15_000;/);
    expect(section).toMatch(/window\.setInterval/);
    expect(section).toMatch(/previewSlug \|\|/);
    expect(section).toMatch(/selectedComment \|\|/);
    expect(section).toMatch(/prefers-reduced-motion: reduce/);
    expect(section).toMatch(/visibilitychange/);
  });

  it("uses a smoother card swap and only shows the five-second timer in automatic mode", () => {
    const css = read("design/globals.css");
    expect(section).toMatch(/const showsCarouselProgress/);
    expect(section).toMatch(/!previewSlug/);
    expect(section).toMatch(/showCarouselProgress=\{showsCarouselProgress\}/);
    expect(section).toMatch(/hp-news-carousel-progress/);
    expect(section).toMatch(/hp-news-card-swap/);
    expect(css).toMatch(/animation: hp-news-card-swap 1100ms/);
    expect(css).toMatch(/animation: hp-news-carousel-progress 15s linear/);
    expect(css).toMatch(/transform-origin: right center/);
  });

  it("previews the matching news on hover and focus, then restores the rotating default", () => {
    expect(section).toMatch(/onMouseEnter=\{\(\) => onPreview\(comment\.newsSlug\)\}/);
    expect(section).toMatch(/onFocusCapture=\{\(\) => onPreview\(comment\.newsSlug\)\}/);
    expect(section).toMatch(/onMouseLeave=\{onLeavePreview\}/);
    expect(section).toMatch(/onBlurCapture=/);
    expect(section).toMatch(/const previewStory = previewSlug/);
  });

  it("visually connects the active comment with only an inset marker", () => {
    // The marker sits inside a padded row rather than colliding with
    // avatars/text on the RTL-leading edge. There is no tinted fill, ring,
    // or redundant parent-News label around the active item.
    expect(section).toMatch(/start-2 w-1/);
    expect(section).toMatch(/className="block w-full ps-5/);
    expect(section).not.toMatch(/ring-1 ring-\[color:color-mix/);
    expect(section).not.toMatch(/دربارهٔ: \{parentStory\.title\}/);
    expect(section).not.toMatch(/bg-\[color:color-mix\(in_oklch,var\(--insights-accent\)_16%/);
    expect(section).not.toMatch(/در حال نمایش گفتگوی این خبر/);
  });

  it("keeps a responsive News card and lets the discussion column stretch beside it", () => {
    // The current card uses a 16:9 media frame instead of forcing the whole
    // article square; both desktop columns still stretch through the grid.
    expect(section).toMatch(/aspect-video w-full/);
    expect(section).toMatch(/lg:h-full/);
    expect(section).toMatch(/lg:grid-cols-\[minmax\(0,1\.05fr\)_minmax\(360px,\.95fr\)\]/);
    // Header actions avoid adding a third strip beneath the card.
    expect(section).toMatch(/actions=\{<NewsActions header \/>\}/);
    expect(section).not.toMatch(/<NewsActions \/>/);
    const actions = section.slice(section.indexOf("function NewsActions"), section.indexOf("function LatestStory"));
    expect(actions).toMatch(/بایگانی خبرهای قدیمی‌تر/);
    expect(actions).toMatch(/text-\[color:var\(--insights-accent\)\]/);
    expect(section).not.toMatch(/h-200/);
    expect(section).not.toMatch(/bg-sky-50/);
  });

  it("keeps comment rows flat, separated, and free of redundant copy", () => {
    expect(section).toMatch(/role="separator"/);
    expect(section).toMatch(/index < comments\.length - 1/);
    expect(section).not.toMatch(/border-b border-\[color:var\(--hp-rule\)\]/);
    expect(section).not.toMatch(/ارسال‌شده/);
    expect(section).not.toMatch(/تاریخ دیدگاه/);
    expect(section).toMatch(/برخی از دیدگاه‌های شما/);
    expect(section).toMatch(/text-\[color:var\(--insights-accent\)\]/);
    // The old panel heading/counter is absent; the source-level description
    // may still refer to the historic feature name.
    const discussion = section.slice(section.indexOf("function NewsDiscussion"));
    expect(discussion).not.toMatch(/<h4[^>]*>\s*گفتگوهای داغ/);
  });

  it("does not mount a complete CommentSection on every homepage load", () => {
    // The modal alone owns the complete live thread. This avoids loading a
    // full comment list for a story the reader did not select.
    expect(section).not.toMatch(/import CommentSection/);
    expect(section).not.toMatch(/<CommentSection/);
    expect(modal).toMatch(/<CommentSection/);
  });
});

describe("NewsModal", () => {
  it("contains the full story, real comments, and the selected-comment focus", () => {
    expect(modal).toMatch(/export function NewsModal/);
    expect(modal).toMatch(/story\.content\?\.trim\(\) \|\| story\.excerpt/);
    expect(modal).toMatch(/module="news"/);
    expect(modal).toMatch(/scrollToCommentId=\{selectedCommentId\}/);
    expect(modal).toMatch(/صفحهٔ خبر/);
  });

  it("lets the live thread reveal and spotlight the selected comment", () => {
    const cs = read("features/comment/components/CommentSection.tsx");
    expect(cs).toMatch(/scrollToCommentId\?: string \| null/);
    expect(cs).toMatch(/scrollIntoView\(\{ behavior: "smooth", block: "center" \}\)/);
    expect(cs).toMatch(/ring-2 ring-primary\/45 bg-primary\/5/);
  });
});

describe("existing section exits and newsletter", () => {
  it("keeps explicit story exits", () => {
    expect(section).toMatch(/نمای تمام‌صفحه/);
    expect(section).toMatch(/<ShareButton url=\{fullScreenHref\}/);
  });

  it("keeps newsletter terms in a dialog without mounting the newsletter inside News", () => {
    expect(newsletter).toMatch(/accentColor \|\| "var\(--hp-brand-ink\)"/);
    // The latest layout intentionally removed the newsletter from this
    // discussion row; retaining an unused import would still ship its client
    // code, so guard both the JSX and import.
    expect(section).not.toMatch(/NewsletterCard/);
    expect(newsletter).toMatch(/<TermsDialog>/);
    expect(dialog).toMatch(/if \(!open \|\| loadedRef\.current\) return/);
  });
});

describe("news excerpt bounds", () => {
  it("constrains only News excerpts and keeps drafts saveable", () => {
    expect(editor).toMatch(/const NEWS_EXCERPT_MIN = 180;/);
    expect(editor).toMatch(/const NEWS_EXCERPT_MAX = 450;/);
    expect(editor).toMatch(/if \(values\.module !== "news"\) return;/);
    expect(editor).toMatch(/if \(length === 0\) return;/);
  });
});

describe("the homepage still degrades rather than throwing", () => {
  const server = read("lib/home-server.ts");

  it("does not enter the cache while the breaker is open", () => {
    expect(server).toMatch(/if \(circuitState\(\) === "open"\) \{/);
    expect(server).toMatch(/import \{ withCircuit, isCircuitOpenError, circuitState \}/);
  });

  it("has a complete empty discussion fallback", () => {
    expect(server).toMatch(/\{ story: null, stories: \[\], comments: \[\] \}/);
  });

  it("invalidates the preview cache after comment mutations", () => {
    const actions = read("features/comment/actions/comments.ts");
    const edit = read("app/api/comments/edit/route.ts");
    const remove = read("app/api/comments/delete/route.ts");
    expect(actions).toMatch(/revalidateTag\("home-data", "max"\)/);
    expect(edit).toMatch(/revalidateTag\("home-data", "max"\)/);
    expect(remove).toMatch(/revalidateTag\("home-data", "max"\)/);
  });
});
