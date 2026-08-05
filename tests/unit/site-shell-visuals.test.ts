import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(__dirname, "../..");
const read = (file: string) => fs.readFileSync(path.join(root, file), "utf8");

describe("site shell visual upgrade", () => {
  it("builds a Neon-inspired split admin login without fake providers", () => {
    const login = read("app/admin/login/page.tsx");
    expect(login).toMatch(/lg:grid-cols-\[36%_64%\]/);
    expect(login).toMatch(/مدیریت زیرساخت دانشی تکباکس/);
    expect(login).toMatch(/\/api\/auth\/login/);
    expect(login).not.toMatch(/Google|GitHub|Microsoft|Hasura/);
  });

  it("uses the branded loader across route, detail, admin and timeline surfaces", () => {
    const loader = read("components/ui/techbox-loader.tsx");
    const spinner = read("components/ui/spinner.tsx");
    const route = read("app/loading.tsx");
    const admin = read("components/admin/admin-states.tsx");
    const timeline = read("features/timeline/components/TimelineLoading.tsx");
    expect(loader).toMatch(/logo\.png/);
    expect(loader).toMatch(/animate-bounce/);
    for (const source of [spinner, route, admin, timeline]) expect(source).toMatch(/TechboxLoader|TechboxInlineLoader/);
  });

  it("uses the new infrastructure-consultation identity and decoration artwork", () => {
    const secondary = read("components/layout/techbox-nav-secondary.tsx");
    const consultation = read("features/home/components/sections/ToolsConsultationPanel.tsx");
    const website = read("features/home/components/sections/WebsiteInfoSection.tsx");
    expect(secondary).toMatch(/مشاوره زیرساخت/);
    expect(secondary).toMatch(/Handshake/);
    expect(consultation).toMatch(/consultation\.webp/);
    expect(website).toMatch(/website-info\.webp/);
  });

  it("keeps the uploaded animated top creative raw and offsets both sidebars", () => {
    const layout = read("components/layout/LayoutShell.tsx");
    const ads = read("components/layout/site-advertisements.tsx");
    const sidebar = read("components/layout/techbox-app-sidebar.tsx");
    expect(ads).toMatch(/<img/);
    expect(ads).toMatch(/h-\[50px\]/);
    expect(layout).toMatch(/--site-chrome-height/);
    expect(sidebar).toMatch(/top-\(--site-chrome-height\)/);
    expect(layout).toMatch(/sidebarPrimary/);
    expect(layout).toMatch(/sidebarSecondary/);
  });
});
