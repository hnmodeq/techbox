import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const read = (file: string) => fs.readFileSync(path.resolve(__dirname, "../..", file), "utf8");

describe("homepage request series", () => {
  it("moves the full search experience into the topbar", () => {
    const header = read("components/layout/site-header.tsx");
    const search = read("components/layout/floating-search.tsx");
    const shell = read("components/layout/LayoutShell.tsx");
    expect(header.indexOf("<ThemeToggle />")).toBeLessThan(header.indexOf("<HeaderSearch />"));
    expect(header.indexOf("<HeaderSearch />")).toBeLessThan(header.indexOf("<TechboxBreadcrumb />"));
    expect(search).toMatch(/جستجوهای اخیر/);
    expect(search).toMatch(/menu === "category"/);
    expect(search).not.toMatch(/fixed bottom-20/);
    expect(shell).not.toMatch(/<FloatingSearch/);
  });

  it("slides the cart like the news rail and never dims the page", () => {
    const cart = read("providers/cart.provider.tsx");
    expect(cart).toMatch(/transition-transform duration-300 ease-in-out/);
    expect(cart).toMatch(/translate-x-0/);
    expect(cart).toMatch(/-translate-x-full/);
    expect(cart).not.toMatch(/fixed inset-0 bg-black\/50/);
    expect(cart).toMatch(/data-cart-toggle/);
  });

  it("switches the theme atomically and stabilises the topbar clock", () => {
    const theme = read("providers/theme.provider.tsx");
    const header = read("components/layout/site-header.tsx");
    expect(theme).toMatch(/disableTransitionOnChange/);
    expect(header).toMatch(/w-\[12\.125rem\]/);
    expect(header).toMatch(/justify-end/);
  });

  it("keeps footer hover surfaces transparent", () => {
    const footer = read("components/layout/Footer.tsx");
    expect(footer.match(/hover:bg-transparent/g)?.length).toBeGreaterThanOrEqual(2);
  });

  it("hides finder chips while preserving the search form", () => {
    const finder = read("features/home/components/sections/FinderSection.tsx");
    expect(finder).toMatch(/role="search"/);
    expect(finder).toMatch(/suggestion chips are intentionally hidden/);
    expect(finder).not.toMatch(/links\.map/);
  });

  it("gives article subject tags a tag-specific tooltip", () => {
    const magazine = read("features/home/components/sections/MagazineSection.tsx");
    expect(magazine).toMatch(/مشاهده محتواهایی با موضوع \$\{primaryTag\}/);
  });

  it("uses newest review as the feature and removes commerce from homepage reviews", () => {
    const section = read("features/home/components/sections/TopPicksSection.tsx");
    const data = read("lib/home-sections.ts");
    expect(section).toMatch(/const \[latest, \.\.\.archive\] = picks/);
    expect(section).toMatch(/<LatestReviewCard item=\{latest\}/);
    expect(section).toMatch(/archive\.slice\(0, 4\)/);
    for (const forbidden of ["faPrice", "ShieldCheck", "ratingCount", "ثبت سفارش"]) {
      expect(section).not.toContain(forbidden);
    }
    expect(data).toMatch(/seededIndices\(candidates\.length, 4, 941\)/);
  });

  it("mixes sold/discounted shop products with a six-rack/two-tower quota", () => {
    const data = read("lib/home-sections.ts");
    expect(data).toMatch(/prisma\.orderItem\.groupBy/);
    expect(data).toMatch(/chooseMixed\(rackCandidates, 6\)/);
    expect(data).toMatch(/chooseMixed\(towerCandidates, 2\)/);
    expect(data).toMatch(/discountPercent/);
  });

  it("starts the timeline at newest events and tightens its vertical rhythm", () => {
    const data = read("lib/home-sections.ts");
    const timeline = read("features/timeline/components/TimelineContainer.tsx");
    expect(data.slice(data.indexOf("export async function getTimeline"))).toMatch(/orderBy: \{ dateGr: "desc" \}/);
    expect(timeline).toMatch(/pb-2 pt-8/);
    expect(timeline).toMatch(/h-\[440px\]/);
    expect(timeline).toMatch(/pb-6 pt-1/);
  });

  it("lets wheel events over News discussions continue to the page", () => {
    const insights = read("features/home/components/sections/InsightsSection.tsx");
    const discussion = insights.slice(insights.indexOf("function NewsDiscussion"));
    expect(discussion).not.toMatch(/overflow-y-auto overscroll-contain/);
  });

  it("makes toast dismissal visibly identifiable", () => {
    const sonner = read("components/ui/sonner.tsx");
    expect(sonner).toMatch(/closeButton:.*\[&>svg\]:!block/);
  });

  it("ramps ticker playback rate instead of stopping abruptly", () => {
    const ticker = read("features/news/components/NewsTicker.tsx");
    const css = read("design/globals.css");
    expect(ticker).toMatch(/rampPlaybackRate/);
    expect(ticker).toMatch(/Smoothstep/);
    expect(ticker).toMatch(/animation\.playbackRate = rate/);
    expect(css).not.toMatch(/animation-play-state: paused/);
  });

  it("extracts and stores ten WebP storyboard frames for video hover", () => {
    const upload = read("components/admin/StorageUploadField.tsx");
    const extractor = read("components/admin/video-frame-extractor.ts");
    const api = read("app/api/admin/video-frames/route.ts");
    const video = read("features/home/components/sections/VideoSection.tsx");
    expect(upload).toMatch(/extractVideoFrames\(file, 10\)/);
    expect(extractor).toMatch(/canvas\.toBlob/);
    expect(extractor).toMatch(/"image\/webp"/);
    expect(api).toMatch(/MIN_FRAMES = 10/);
    expect(video).toMatch(/useVideoStoryboard\(item\.gallery\)/);
  });
});
