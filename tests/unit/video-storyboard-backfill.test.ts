import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const read = (file: string) => fs.readFileSync(path.resolve(__dirname, "../..", file), "utf8");

describe("legacy video storyboard backfill", () => {
  const extractor = read("components/admin/video-frame-extractor.ts");
  const backfill = read("components/admin/legacy-video-storyboard-backfill.tsx");
  const route = read("app/api/admin/video-frames/route.ts");
  const mediaAdmin = read("app/admin/media/page.tsx");

  it("streams an existing HTTPS video into an origin-clean browser canvas", () => {
    expect(extractor).toMatch(/extractVideoFramesFromUrl/);
    expect(extractor).toMatch(/video\.crossOrigin = "anonymous"/);
    expect(extractor).toMatch(/video\.preload = remote \? "auto" : "metadata"/);
    expect(extractor).toMatch(/5%–95%/);
  });

  it("offers one-click processing from the existing admin media library", () => {
    expect(mediaAdmin).toMatch(/<LegacyVideoStoryboardBackfill \/>/);
    expect(backfill).toMatch(/module=media&admin=1/);
    expect(backfill).toMatch(/extractVideoFramesFromUrl\(post\.videoUrl!, 10\)/);
    expect(backfill).toMatch(/خود ویدیو دوباره آپلود نمی‌شود/);
  });

  it("persists all ten URLs to the matching media post in the secure batch route", () => {
    expect(route).toMatch(/requirePermission\("blob:upload"\)/);
    expect(route).toMatch(/requireModulePermission\("media", "edit"\)/);
    expect(route).toMatch(/mediaSlug/);
    expect(route).toMatch(/gallery: urls/);
    expect(route).toMatch(/persisted: Boolean\(existingMedia\)/);
    expect(route).toMatch(/removeSupabaseObjects\(publicBucket, uploaded\)/);
  });
});
