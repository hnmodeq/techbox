import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { parseFooterSocials } from "@/features/footer/footer-socials";

const read = (file: string) => fs.readFileSync(path.resolve(__dirname, "../..", file), "utf8");

describe("footer and consultation navigation", () => {
  it("moves Suggestions out of the sidebar and into the five-control footer", () => {
    const secondary = read("components/layout/techbox-nav-secondary.tsx");
    const footer = read("components/layout/Footer.tsx");
    expect(secondary).not.toContain("پیشنهادات");
    expect(footer).toContain("پیشنهادات");
    expect(footer).toMatch(/tb_open_feedback/);
    expect(footer).toMatch(/links\.map/);
  });

  it("uses one balanced four-column row on desktop", () => {
    const footer = read("components/layout/Footer.tsx");
    expect(footer).toMatch(/lg:grid-cols-\[auto_minmax\(280px,1fr\)_auto_minmax\(320px,1\.35fr\)\]/);
    expect(footer).toMatch(/lg:col-start-4 lg:row-start-1/); // copyright, physical right
    expect(footer).toMatch(/lg:col-start-3 lg:row-start-1/); // designer
    expect(footer).toMatch(/lg:col-start-2 lg:row-start-1/); // buttons
    expect(footer).toMatch(/lg:col-start-1 lg:row-start-1/); // socials, physical left
    expect(footer).not.toMatch(/MessageSquarePlus/);
  });

  it("removes X and uses platform-colour Instagram, YouTube and Telegram icons", () => {
    const footer = read("components/layout/Footer.tsx");
    expect(footer).not.toMatch(/x\.com|name: "X"/);
    expect(footer).toMatch(/#FF0000/);
    expect(footer).toMatch(/#229ED9/);
    expect(footer).toMatch(/footer-instagram-gradient/);
    expect(footer).toMatch(/group-hover\/social:grayscale-0/);
    expect(footer).toMatch(/hover:bg-transparent/);
  });

  it("makes all three social URLs and visibility flags admin controlled", () => {
    const admin = read("app/admin/settings/page.tsx");
    const api = read("app/api/admin/settings/route.ts");
    const publicApi = read("app/api/settings/route.ts");
    for (const network of ["instagram", "youtube", "telegram"]) expect(admin).toContain(network);
    expect(api).toMatch(/"footer\.socials"/);
    expect(publicApi).toMatch(/"footer\.socials"/);
    const config = parseFooterSocials(JSON.stringify({ telegram: { enabled: false, url: "https://t.me/custom" } }));
    expect(config.telegram.enabled).toBe(false);
    expect(config.telegram.url).toBe("https://t.me/custom");
    expect(config.instagram.enabled).toBe(true);
  });

  it("renames the threaded ticket product to red Consultation while retaining its mechanism", () => {
    const secondary = read("components/layout/techbox-nav-secondary.tsx");
    const modal = read("components/layout/help-modals.tsx");
    const tools = read("features/home/components/sections/ToolsConsultationPanel.tsx");
    expect(secondary).toMatch(/title: "مشاوره زیرساخت"/);
    expect(secondary).toMatch(/icon: Handshake/);
    expect(secondary).toMatch(/text-red-600/);
    expect(secondary).toMatch(/tb_open_support/);
    expect(modal).toMatch(/درخواست مشاوره جدید/);
    expect(modal).toMatch(/\/api\/support\/tickets/);
    expect(tools).toMatch(/tb_open_support/);
  });
});
