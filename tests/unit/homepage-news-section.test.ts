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

  it("says something when the story has no comments yet", () => {
    // The story can fall below the feature threshold; the column must not
    // sit empty next to the card.
    expect(section).toMatch(/هنوز دیدگاهی برای این خبر ثبت نشده/);
    expect(section).toMatch(/comments\.length > 0 \?/);
  });

  it("shows the comments open and scrollable, with a composer", () => {
    // Same mechanism as the news sidebar: no toggle, the comments ARE the
    // point of the column.
    expect(section).not.toMatch(/همه دیدگاه‌ها و ثبت دیدگاه/);
    expect(section).not.toMatch(/aria-expanded/);
    expect(section).toMatch(/overflow-y-auto/);
    expect(section).toMatch(/<CommentSection/);
  });

  it("does not render the thread twice", () => {
    // The rail already lists the server-rendered comments, so
    // CommentSection is mounted for its composer only.
    expect(section).toMatch(/hideList/);
    const cs = read("features/comment/components/CommentSection.tsx");
    expect(cs).toMatch(/\{!hideList && \(/);
  });

  it("hides the header action", () => {
    const header = section.slice(section.indexOf("<SectionHeader"), section.indexOf("<NewsActions"));
    expect(header).not.toMatch(/href=/);
    expect(section).toMatch(/title = "آخرین خبر امروز"/);
  });
});

describe("section actions", () => {
  it("opens the sidebar by event, with no network cost", () => {
    expect(section).toMatch(/new CustomEvent\("tb_open_news_sidebar"\)/);
    expect(shell).toMatch(/addEventListener\("tb_open_news_sidebar", open\)/);
    expect(shell).toMatch(/removeEventListener\("tb_open_news_sidebar", open\)/);
  });

  it("links the archive", () => {
    expect(section).toMatch(/href="\/news"/);
    expect(section).toMatch(/بایگانی خبرهای قدیمی‌تر/);
  });
});

describe("comment rows", () => {
  it("links avatars and names to the author profile", () => {
    expect(section).toMatch(/\/author\/\$\{author\.username\}/);
    expect(section).toMatch(/بازدید از حساب کاربری \$\{author\.name\}/);
  });

  it("degrades to plain text for guests with no username", () => {
    // author.username is nullable; a dead link would be worse than none.
    expect(section).toMatch(/author\.username \? `\/author\/\$\{author\.username\}` : null/);
    expect(section).toMatch(/profileHref \?/);
  });

  it("uses RelativeDate everywhere, so tooltips come free", () => {
    expect(section).toMatch(/<RelativeDate date=\{story\.date\} label="تاریخ انتشار"/);
    expect(section).toMatch(/<RelativeDate date=\{comment\.date\} label="تاریخ دیدگاه"/);
    expect(section).not.toMatch(/\{story\.date_fa\}/);
    expect(section).not.toMatch(/\{comment\.dateFa\}/);
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
