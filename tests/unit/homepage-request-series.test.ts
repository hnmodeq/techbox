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

  it("uses product-led review cards with shared shop commerce and real comments", () => {
    const section = read("features/home/components/sections/TopPicksSection.tsx");
    const data = read("lib/home-sections.ts");
    expect(section).toMatch(/const \[latest, \.\.\.archive\] = picks/);
    expect(section).toMatch(/<LatestReviewCard item=\{latest\}/);
    expect(section).toMatch(/ShopCardCommerce/);
    expect(section).toMatch(/ShopInlinePrice/);
    expect(section).toMatch(/مشاهده این محصول در فروشگاه/);
    expect(section).toMatch(/دیدگاه خوانندگان درباره بررسی‌ها/);
    expect(section).toMatch(/pickDistinctComments\(picks, 3\)/);
    expect(data).toMatch(/seededIndices\(archive\.length, 4, 941\)/);
    expect(data).toMatch(/highlightComments/);
    expect(data).toMatch(/reviewedProduct/);
  });

  it("mixes sold/discounted shop products with a six-rack/two-tower quota", () => {
    const data = read("lib/home-sections.ts");
    expect(data).toMatch(/prisma\.orderItem\.groupBy/);
    expect(data).toMatch(/chooseMixed\(rackCandidates, 6\)/);
    expect(data).toMatch(/chooseMixed\(towerCandidates, 2\)/);
    expect(data).toMatch(/rackExclusionSignals/);
    expect(data).toMatch(/specs: true/);
    expect(data).toMatch(/warranty: true/);
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

  it("keeps the solved-question green background away from its answers", () => {
    const forum = read("features/home/components/sections/CommunitySection.tsx");
    const feature = forum.slice(forum.indexOf("function FeaturedTopic"), forum.indexOf("function EmptyCommunityFeature"));
    expect(feature).toMatch(/QUESTION only/);
    expect(feature).toMatch(/<div className="bg-emerald-50 p-6/);
    expect(feature).toMatch(/<div className="relative mx-6 mt-5/);
  });

  it("uses equal compact tool heights, no transform hover and module-coloured titles", () => {
    const tools = read("features/home/components/sections/ToolsSection.tsx");
    expect(tools).toMatch(/min-h-\[135px\]/);
    expect(tools).not.toMatch(/group-hover:scale/);
    expect(tools).toMatch(/text-\[color:var\(--tools-accent\)\]/);
  });

  it("adds membership and authenticated author-request flows", () => {
    const website = read("features/home/components/sections/WebsiteInfoSection.tsx");
    const actions = read("features/home/components/sections/CommunityJoinActions.tsx");
    const auth = read("features/auth/components/auth-modal.tsx");
    expect(website).toMatch(/عضو خانواده IT ایران باشید تا با هم رشد کنیم/);
    expect(actions).toMatch(/عضویت/);
    expect(actions).toMatch(/درخواست نویسندگی/);
    expect(actions).toMatch(/لطفا ابتدا ثبت نام کنید و دوباره برگردید/);
    expect(actions).toMatch(/type: "content"/);
    expect(auth).toMatch(/detail\?\.mode/);
  });

  it("keeps footer seamless and chat tab surfaces transparent", () => {
    const footer = read("components/layout/Footer.tsx");
    const chat = read("features/chat/components/Chatbot.tsx");
    expect(footer).toMatch(/bg-white dark:bg-black/);
    expect(footer).not.toMatch(/<footer className="border-t/);
    expect(chat).toMatch(/variant="line"/);
    expect(chat.match(/data-active:bg-transparent/g)?.length).toBeGreaterThanOrEqual(2);
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
