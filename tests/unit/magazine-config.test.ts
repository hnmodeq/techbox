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

  it("has no rounded corners", () => {
    // Spiceworks squares every corner in this block. A stray radius on one
    // element reads as a mistake rather than a style.
    expect(src).not.toMatch(/rounded-(t-|b-|s-|e-)?\[/);
  });

  it("separates list rows with the dedicated rule token", () => {
    // --hp-border is ~1.26:1 against the page: correct for a card edge,
    // invisible as a standalone divider. --hp-rule exists for this.
    expect(src).toMatch(/border-\[color:var\(--hp-rule\)\]/);
    expect(src).not.toMatch(/border-b border-\[color:var\(--hp-border\)\]/);
  });

  it("puts the separator on the <li>, not on the <a> inside it", () => {
    // Regression guard. The border first shipped on the row's <a>, which is
    // always the only child of its <li>, so `last:border-b-0` (compiled to
    // `&:last-child`) matched EVERY row and removed EVERY separator. The
    // earlier version of the test above passed throughout, because it only
    // checked that the token was referenced somewhere in the file.
    // NB: the JSX has a comment between `<li` and `className`, so this
    // cannot use a [^>]* character class.
    const liTag = src.match(/<li\b[\s\S]*?className="([^"]*)"/);
    expect(liTag, "the list <li> should carry a className").not.toBeNull();
    expect(liTag![1]).toMatch(/border-b/);
    expect(liTag![1]).toMatch(/last:border-b-0/);

    // And the row anchor must not carry a bottom border at all.
    const rowClass = src.match(/className="hp-card group flex gap-4([^"]*)"/);
    expect(rowClass, "ListRow anchor className not found").not.toBeNull();
    expect(rowClass![1]).not.toMatch(/border-b/);
  });

  it("hovers the lead by colour, not by transform", () => {
    expect(src).not.toMatch(/group-hover:scale/);
    expect(src).toMatch(/group-hover:text-\[color:var\(--hp-accent-on-ink\)\]/);
  });

  it("gates both chips behind showTags", () => {
    const chips = [...src.matchAll(/<CategoryChip/g)];
    expect(chips.length).toBe(2); // lead + list row
    expect([...src.matchAll(/showTags && item\.category && <CategoryChip/g)].length).toBe(2);
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
