import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { sanitizeAdminHtml } from "../../lib/sanitize-html";

const read = (p: string) => fs.readFileSync(path.resolve(__dirname, "../..", p), "utf8");

describe("sanitizeAdminHtml", () => {
  it("strips <script> entirely", () => {
    const out = sanitizeAdminHtml('<p>سلام</p><script>alert(1)</script>');
    expect(out).not.toMatch(/<script/i);
    expect(out).not.toMatch(/alert\(1\)/);
    expect(out).toMatch(/سلام/);
  });

  it("strips inline event handlers", () => {
    const out = sanitizeAdminHtml('<img src="x" onerror="alert(1)">');
    expect(out).not.toMatch(/onerror/i);
    expect(out).not.toMatch(/alert/);
  });

  it("strips javascript: URLs", () => {
    const out = sanitizeAdminHtml('<a href="javascript:alert(1)">کلیک</a>');
    expect(out).not.toMatch(/javascript:/i);
  });

  it("strips style attributes, which enable overlay/clickjacking tricks", () => {
    const out = sanitizeAdminHtml('<div style="position:fixed;inset:0">x</div>');
    expect(out).not.toMatch(/style=/i);
  });

  it("strips iframes and objects", () => {
    const out = sanitizeAdminHtml('<iframe src="https://evil.test"></iframe><object data="x"></object>');
    expect(out).not.toMatch(/<iframe/i);
    expect(out).not.toMatch(/<object/i);
  });

  it("keeps legitimate editorial formatting", () => {
    const out = sanitizeAdminHtml(
      '<h2>عنوان</h2><p><strong>مهم</strong> و <em>مورب</em></p><ul><li>یک</li></ul><a href="https://techbox.test">لینک</a>',
    );
    expect(out).toMatch(/<h2>/);
    expect(out).toMatch(/<strong>/);
    expect(out).toMatch(/<em>/);
    expect(out).toMatch(/<li>/);
    expect(out).toMatch(/href="https:\/\/techbox\.test"/);
  });

  it("keeps className so prose/Tailwind markup survives", () => {
    const out = sanitizeAdminHtml('<p class="text-lg">متن</p>');
    expect(out).toMatch(/class="text-lg"/);
  });

  it("degrades to empty string, never to passthrough, on empty input", () => {
    expect(sanitizeAdminHtml("")).toBe("");
  });
});

describe("admin HTML sinks are sanitised", () => {
  // Regression guard: these four render SiteSetting-sourced HTML with
  // dangerouslySetInnerHTML. Any new sink must route through the sanitiser.
  it("about, terms, the terms API, and the jobs page all sanitise", () => {
    expect(read("app/about/page.tsx")).toMatch(/sanitizeAdminHtml\(description\)/);
    expect(read("app/terms/page.tsx")).toMatch(/sanitizeAdminHtml\(content\)/);
    expect(read("app/api/terms/route.ts")).toMatch(/sanitizeAdminHtml\(row\?\.value/);
    expect(read("app/work-with-us/[slug]/page.tsx")).toMatch(/sanitizeAdminHtml\(row\.value\)/);
  });
});
