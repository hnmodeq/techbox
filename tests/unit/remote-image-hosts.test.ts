import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(__dirname, "../..");
const cmp = fs.readFileSync(path.join(root, "components/ui/remote-image.tsx"), "utf8");
const cfg = fs.readFileSync(path.join(root, "next.config.mjs"), "utf8");

/** The allow-list from remote-image.tsx, mirrored for direct testing. */
const OPTIMISED_HOSTS = [
  /\.supabase\.co$/,
  /\.public\.blob\.vercel-storage\.com$/,
  /^cdn\.zarinpal\.com$/,
  /^images\.unsplash\.com$/,
  /^github\.com$/,
  /\.githubusercontent\.com$/,
];

function canOptimise(src: string): boolean {
  if (src.startsWith("/")) return true;
  try {
    const { hostname, protocol } = new URL(src);
    if (protocol !== "https:") return false;
    return OPTIMISED_HOSTS.some((p) => p.test(hostname));
  } catch {
    return false;
  }
}

describe("RemoteImage host handling", () => {
  it("optimises the hosts that actually appear in the database", () => {
    // Both of these are present in techbox-public.dump.
    expect(canOptimise("https://nggwgcfkceuadvhxnczf.supabase.co/storage/v1/x.webp")).toBe(true);
    expect(
      canOptimise("https://gasy0aqpxehqiy8d.public.blob.vercel-storage.com/avatars/a.jpg"),
    ).toBe(true);
    expect(canOptimise("/logo.png")).toBe(true);
  });

  it("declines unknown or unsafe sources instead of throwing", () => {
    expect(canOptimise("https://evil.example.com/a.jpg")).toBe(false);
    expect(canOptimise("http://nggwgcfkceuadvhxnczf.supabase.co/a.jpg")).toBe(false);
    expect(canOptimise("not a url")).toBe(false);
    // Suffix matching must not be fooled by a lookalike domain.
    expect(canOptimise("https://supabase.co.evil.com/a.jpg")).toBe(false);
    expect(canOptimise("https://notgithub.com/a.jpg")).toBe(false);
  });

  it("falls back to a plain img rather than failing the route", () => {
    // next/image throws on an unconfigured host; one legacy row must not be
    // able to blank an entire page.
    expect(cmp).toMatch(/if \(!canOptimise\(src\)\)/);
    expect(cmp).toMatch(/no-img-element/);
  });

  it("keeps the allow-list in step with next.config.mjs", () => {
    for (const host of [
      "*.supabase.co",
      "*.public.blob.vercel-storage.com",
      "cdn.zarinpal.com",
      "images.unsplash.com",
    ]) {
      expect(cfg).toContain(`hostname: "${host}"`);
    }
  });
});
