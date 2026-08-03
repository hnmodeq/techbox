import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const read = (p: string) => fs.readFileSync(path.resolve(__dirname, "../..", p), "utf8");

describe("alternating section bands", () => {
  const page = read("app/page.tsx");
  const css = read("design/globals.css");

  it("stripes from the RENDERED index, not from each section", () => {
    // Computing this per section would break the rhythm the moment an admin
    // reorders or hides one.
    expect(page).toMatch(/index % 2 === 0 \? "var\(--hp-band-a\)" : "var\(--hp-band-b\)"/);
    expect(page).toMatch(/visible\.map\(\(s, index\)/);
  });

  it("defines both bands in light and dark", () => {
    expect([...css.matchAll(/--hp-band-a:/g)].length).toBeGreaterThanOrEqual(2);
    expect([...css.matchAll(/--hp-band-b:/g)].length).toBeGreaterThanOrEqual(2);
    expect(css).toMatch(/--color-hp-band-a:\s*var\(--hp-band-a\)/);
  });

  it("leaves no section painting its own competing background", () => {
    // A hardcoded wash would sit on top of the band and break the stripe.
    for (const file of [
      "features/home/components/sections/VideoSection.tsx",
      "features/home/components/sections/InsightsSection.tsx",
      "features/home/components/sections/FamilyCommentsSection.tsx",
      "features/home/components/sections/DealsSection.tsx",
      "features/home/components/sections/MoreToExploreSection.tsx",
    ]) {
      const src = read(file);
      expect(src).not.toMatch(/InsetBand/);
      expect(src).not.toMatch(/SectionShell[^>]*className="bg-/);
    }
  });
});

describe("homepage ticker", () => {
  const ticker = read("features/news/components/NewsTicker.tsx");
  const css = read("design/globals.css");

  it("moves at a calmer pace and colours each announcement by its module", () => {
    expect(css).toMatch(/animation: techbox-ticker-scroll 82s linear infinite/);
    expect(ticker).toMatch(/--ticker-accent/);
    expect(ticker).toMatch(/var\(--module-\$\{itemModule\}-color, var\(--primary\)\)/);
    expect(ticker).toMatch(/text-\[color:var\(--ticker-accent\)\]/);
  });
});

describe("homepage images go through next/image", () => {
  it("routes every full-bleed card image through RemoteImage", () => {
    // Raw <img src={supabaseUrl}> skips AVIF/WebP negotiation and resizing,
    // shipping a full-resolution original into a small slot.
    for (const file of [
      "features/home/components/sections/MagazineSection.tsx",
      "features/home/components/sections/VideoSection.tsx",
      "features/home/components/sections/TopPicksSection.tsx",
      "features/home/components/sections/MoreToExploreSection.tsx",
      "features/home/components/sections/TimelineSection.tsx",
      "features/home/components/primitives/CardShell.tsx",
    ]) {
      const src = read(file);
      expect(src).toMatch(/<RemoteImage/);
      expect(src).toMatch(/from "@\/components\/ui\/remote-image"/);
    }
  });

  it("lets composing sections delegate to a card that owns the image", () => {
    // DealsSection deliberately renders no image of its own: it defers to
    // ShopProductCard so homepage commerce and /shop cannot drift apart.
    // The constraint that matters is "no raw <img>", not "contains the
    // literal string <RemoteImage" — asserting the latter made a safe
    // refactor look like a regression.
    const deals = read("features/home/components/sections/DealsSection.tsx");
    expect(deals).toMatch(/<ShopProductCard/);
    expect(deals).not.toMatch(/<img[\s>]/);

    // ...and the card it delegates to optimises through next/image.
    const card = read("features/shop/components/ShopProductCard.tsx");
    expect(card).toMatch(/from "next\/image"/);
    expect(card).not.toMatch(/<img[\s>]/);
  });

  it("always passes sizes, so Next never assumes 100vw", () => {
    const cmp = read("components/ui/remote-image.tsx");
    // Required, not optional, in the public type.
    expect(cmp).toMatch(/sizes: string;/);
    expect(cmp).toMatch(/fill/);
    expect(read("features/home/components/primitives/CardShell.tsx")).toMatch(/sizes=\{sizes \?\? "/);
  });

  it("ships the legacy local fallbacks used by old content rows", () => {
    expect(fs.existsSync(path.resolve(__dirname, "../..", "public/assets/hooman.png"))).toBe(true);
    expect(fs.existsSync(path.resolve(__dirname, "../..", "public/assets/blog-1.jpg"))).toBe(true);
  });
});
