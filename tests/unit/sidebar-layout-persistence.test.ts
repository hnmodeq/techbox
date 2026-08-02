import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const read = (file: string) => fs.readFileSync(path.resolve(__dirname, "../..", file), "utf8");

/** The public main navigation is a persistent layout column, not a modal rail. */
describe("main sidebar layout and persistence", () => {
  const sidebar = read("components/ui/sidebar.tsx");
  const appSidebar = read("components/layout/techbox-app-sidebar.tsx");
  const shell = read("components/layout/LayoutShell.tsx");
  const root = read("app/layout.tsx");

  it("uses desktop push mode for the right-side application navigation", () => {
    const app = appSidebar.slice(appSidebar.indexOf("<Sidebar"), appSidebar.indexOf("<SidebarHeader"));
    expect(app).toMatch(/side="right"/);
    expect(app).not.toMatch(/\boverlay\b/);
    // Push mode preserves the normal sidebar gap instead of collapsing it.
    expect(sidebar).toMatch(/overlay\s*\?\s*"w-0"/);
  });

  it("opens on a first visit and restores the latest saved choice later", () => {
    expect(root).toMatch(/const defaultSidebarOpen = sidebarCookie !== "false"/);
    expect(root).toMatch(/defaultSidebarOpen=\{defaultSidebarOpen\}/);
    expect(shell).toMatch(/defaultOpen=\{defaultSidebarOpen\}/);
    expect(sidebar).toMatch(/document\.cookie = `\$\{SIDEBAR_COOKIE_NAME\}/);
    expect(sidebar).toMatch(/localStorage\.setItem\(SIDEBAR_STORAGE_KEY/);
  });

  it("lets the homepage News action toggle its sidebar open and closed", () => {
    const insights = read("features/home/components/sections/InsightsSection.tsx");
    expect(insights).toMatch(/tb_toggle_news_sidebar/);
    expect(insights).toMatch(/data-news-toggle/);
    expect(shell).toMatch(/window\.addEventListener\("tb_toggle_news_sidebar", toggle\)/);
  });
});
