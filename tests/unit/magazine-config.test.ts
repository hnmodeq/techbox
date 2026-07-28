import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { getDefaultModuleConfig } from "@/lib/module-config";

/**
 * Magazine section: admin-controlled copy and chrome.
 *
 * Owner rule 9 — "admins must be able to manage/change/edit/remove
 * anything from the admin panel." The section description and the category
 * chips were hardcoded; both are now per-module SiteSetting values.
 *
 * These tests guard the wiring, which spans five files and silently does
 * nothing if any one link is missed.
 */

const read = (p: string) => fs.readFileSync(path.resolve(__dirname, "../..", p), "utf8");

describe("module config carries the new fields", () => {
  it("defaults description to empty and tags to on", () => {
    // Defaults must preserve existing behaviour: every shipped row keeps
    // its chips and its built-in copy until an admin changes something.
    const cfg = getDefaultModuleConfig("blog");
    expect(cfg.homeDescription).toBe("");
    expect(cfg.showHomeTags).toBe(true);
  });

  it("persists both keys on save", () => {
    // saveModuleConfig writes a fixed list of SiteSetting rows. A field
    // absent from that list reads back as its default forever, which looks
    // exactly like "the admin panel does nothing".
    const src = read("lib/module-config.ts");
    expect(src).toMatch(/KEY_HOME_DESCRIPTIONS.*JSON\.stringify\(homeDescriptionsMap\)/);
    expect(src).toMatch(/KEY_HOME_SHOW_TAGS.*JSON\.stringify\(homeShowTagsMap\)/);
  });

  it("reads both keys back", () => {
    const src = read("lib/module-config.ts");
    // Present in the batched key fetch, or getRaw returns nothing.
    expect(src).toMatch(/KEY_HOME_DESCRIPTIONS,/);
    expect(src).toMatch(/KEY_HOME_SHOW_TAGS,/);
    expect(src).toMatch(/cfg\.homeDescription = homeDescriptionsMap\[slug\]/);
    expect(src).toMatch(/cfg\.showHomeTags = homeShowTagsMap\[slug\]/);
  });
});

describe("the admin panel exposes both controls", () => {
  const src = read("app/admin/modules/page.tsx");

  it("renders a description input and a tags switch", () => {
    expect(src).toMatch(/updateModule\(slug, \{ homeDescription: e\.target\.value \}\)/);
    expect(src).toMatch(/updateModule\(slug, \{ showHomeTags: checked \}\)/);
  });

  it("includes both in the save payload", () => {
    // The API persists module objects wholesale, so an omitted key here is
    // a setting that silently resets on every save.
    const payload = src.slice(src.indexOf("const moduleData"), src.indexOf("const payload"));
    expect(payload).toMatch(/homeDescription:/);
    expect(payload).toMatch(/showHomeTags:/);
  });
});

describe("page.tsx passes them to the section", () => {
  const src = read("app/page.tsx");

  it("threads description and showTags through textFor", () => {
    expect(src).toMatch(/description: cfg\?\.homeDescription/);
    expect(src).toMatch(/showTags: cfg\?\.showHomeTags \?\? true/);
  });
});

describe("MagazineSection visual contract", () => {
  const src = read("features/home/components/sections/MagazineSection.tsx");

  it("rounds and elevates the lead card, and nothing else", () => {
    // The lead now matches the Video section's comment card: one radius
    // token plus the shared card shadow. The compact list rows stay square,
    // so the Spiceworks density is preserved where it matters.
    expect(src).toMatch(/rounded-\[var\(--hp-r-md\)\]/);
    expect(src).toMatch(/shadow-\[var\(--hp-shadow-card\)\]/);
    expect(src).toMatch(/hover:shadow-\[var\(--hp-shadow-hover\)\]/);
    // Radius belongs to the lead <article> only.
    expect([...src.matchAll(/rounded-\[var\(--hp-r-md\)\]/g)].length).toBe(1);
  });

  it("uses the shadcn border token for list separators", () => {
    // Magazine text and rules stay on the regular shadcn palette. The only
    // homepage-specific aliases permitted are the lead card's radius and
    // shadow, which deliberately match the Video comment card.
    expect(src).toMatch(/bg-border/);
    const hpTokens = new Set([...src.matchAll(/--hp-[a-z-]+/g)].map((m) => m[0]));
    expect([...hpTokens].sort()).toEqual(["--hp-r-md", "--hp-shadow-card", "--hp-shadow-hover"]);
  });

  it("draws separators as real flex items, not a pinned pseudo-element", () => {
    // The rule used to be an ::after at bottom-0 on each row. Under
    // justify-between the rows stay content-height and all the slack lands
    // in the gaps, so a bottom-pinned line hugs the row above instead of
    // sitting between two — and CSS cannot centre it in a gap the flex
    // algorithm only sizes at layout time. As sibling <li> elements the
    // dividers are distributed by the same algorithm as the rows.
    expect(src).toMatch(/role="separator"/);
    expect(src).toMatch(/bg-border/);
    expect(src).not.toMatch(/after:absolute/);
    expect(src).not.toMatch(/last:after:hidden/);
  });

  it("renders separators only between rows", () => {
    // index > 0 — never before the first row or after the last, or the rail
    // stops sitting flush with the lead card.
    expect(src).toMatch(/\{index > 0 && \(/);
  });

  it("keeps separators out of the accessibility tree", () => {
    // They are <li> children of a <ul>, so without this they would be
    // announced as empty list items between every article.
    const sepBlock = src.slice(src.indexOf('role="separator"') - 200, src.indexOf('role="separator"') + 60);
    expect(sepBlock).toMatch(/aria-hidden="true"/);
  });

  it("insets the separator from the trailing edge", () => {
    // Logical me-*, not mr-*, so the shortening happens on the correct side
    // under RTL.
    expect(src).toMatch(/me-\d+/);
  });

  it("aligns row text to the top, not the vertical centre", () => {
    expect(src).toMatch(/flex-col items-start justify-start/);
    expect(src).not.toMatch(/flex-col items-start justify-center/);
  });

  it("uses an underline interaction for article titles, not a transform", () => {
    expect(src).not.toMatch(/group-hover:scale/);
    expect([...src.matchAll(/hover:underline/g)].length).toBeGreaterThanOrEqual(3);
  });

  it("renders database tags as clickable, unfilled links behind showTags", () => {
    const tags = [...src.matchAll(/<ArticleTags tags=\{item\.tags\}/g)];
    expect(tags.length).toBe(2); // lead + list row
    expect([...src.matchAll(/showTags && <ArticleTags tags=\{item\.tags\}/g)].length).toBe(2);
    expect(src).toMatch(/href=\{`\/blog\/tag\/\$\{encodeURIComponent\(primaryTag\)\}`\}/);
    expect(src).toMatch(/className="ps-5"/);
    expect(src).not.toMatch(/CategoryChip/);
  });

  it("uses the existing shadcn tooltip and the server-derived reading time", () => {
    expect(src).toMatch(/TooltipTrigger/);
    // Publish dates go through the shared RelativeDate component, which
    // renders the relative ladder and puts the real Jalali date in its
    // tooltip behind this label.
    expect(src).toMatch(/<RelativeDate date=\{item\.date\} label="تاریخ انتشار"/);
    // Reading time is still server-derived, but the badge shows the bare
    // duration and "زمان مطالعه" moved into the tooltip.
    expect(src).toMatch(/formatReadingTimeShort\(item\.readingTime\)/);
    expect(src).toMatch(/<TooltipContent>زمان مطالعه<\/TooltipContent>/);
    expect(src).not.toMatch(/دقیقه مطالعه/);
  });

  it("shows only the primary tag", () => {
    // A row of chips competes with the headline; the rail is dense by design.
    expect(src).toMatch(/const primaryTag =/);
    expect(src).not.toMatch(/uniqueTags\.map/);
  });

  it("opens the ArticleModal in place instead of navigating away", () => {
    expect(src).toMatch(/import \{ ArticleModal \}/);
    expect(src).toMatch(/<ArticleModal/);
    // Both the lead and every list row are buttons wired to the modal.
    expect([...src.matchAll(/onOpen=\{\(\) => setActiveIndex\(/g)].length).toBe(2);
    expect(src).toMatch(/^"use client";/);
  });

  it("falls back to default copy when the admin description is blank", () => {
    expect(src).toMatch(/description\?\.trim\(\) \|\| DEFAULT_DESCRIPTION/);
  });
});

describe("the new colour tokens are defined in both themes", () => {
  const css = read("design/globals.css");

  it("declares --hp-rule and --hp-accent-on-ink for light and dark", () => {
    expect([...css.matchAll(/--hp-rule:/g)].length).toBeGreaterThanOrEqual(2);
    expect([...css.matchAll(/--hp-accent-on-ink:/g)].length).toBeGreaterThanOrEqual(2);
  });

  it("maps them into @theme inline so Tailwind compiles the utilities", () => {
    expect(css).toMatch(/--color-hp-rule:\s*var\(--hp-rule\)/);
    expect(css).toMatch(/--color-hp-accent-on-ink:\s*var\(--hp-accent-on-ink\)/);
  });
});
