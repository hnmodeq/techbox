import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const read = (file: string) => fs.readFileSync(path.resolve(__dirname, "../..", file), "utf8");

describe("isolated homepage V2 beta", () => {
  const page = read("app/makinghomepageversiontwo/page.tsx");
  const current = read("app/page.tsx");
  const server = read("lib/home-v2-server.ts");

  it("lives on its own noindex route and never replaces the current homepage", () => {
    expect(page).toMatch(/نسخه آزمایشی خانه تکباکس V2/);
    expect(page).toMatch(/robots: \{ index: false, follow: false \}/);
    expect(page).toMatch(/href="\/"/);
    expect(current).not.toMatch(/home-v2-server|OperationsDesk|SolutionComposer|KnowledgeGraph/);
  });

  it("implements the operations-desk hierarchy and only two ad placements", () => {
    expect(page).toMatch(/<OperationsDesk/);
    expect(page).toMatch(/<SolutionComposer/);
    expect(page).toMatch(/<RoleDesk/);
    expect(page).toMatch(/<CommunityPulse/);
    expect(page).toMatch(/<EditorialTabs/);
    expect(page).toMatch(/<ProductDecision/);
    expect(page).toMatch(/<KnowledgeGraph/);
    expect(page).toMatch(/<CompactTimeline/);
    expect(server).toMatch(/advertisements: .*\.slice\(0, 2\)/);
  });

  it("uses real database aggregates and a six-rack/two-tower product mix", () => {
    expect(server).toMatch(/prisma\.post\.count/);
    expect(server).toMatch(/prisma\.comment\.count/);
    expect(server).toMatch(/prisma\.user\.count/);
    expect(server).toMatch(/chooseMixed\(rack, 6, sales\)/);
    expect(server).toMatch(/chooseMixed\(tower, 2, sales\)/);
  });

  it("connects role personalization, saved content and problem-first discovery", () => {
    const role = read("features/home-v2/components/RoleDesk.tsx");
    const solution = read("features/home-v2/components/SolutionComposer.tsx");
    const graph = read("features/home-v2/components/KnowledgeGraph.tsx");
    expect(role).toMatch(/techbox-home-v2-role/);
    expect(role).toMatch(/\/api\/saved-content/);
    expect(solution).toMatch(/چه مسئله‌ای داری/);
    expect(solution).toMatch(/پرسیدن از جامعه/);
    expect(graph).toMatch(/نقشهٔ زیرساخت تکباکس/);
  });
});
