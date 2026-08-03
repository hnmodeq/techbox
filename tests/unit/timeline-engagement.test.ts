import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const read = (file: string) => fs.readFileSync(path.resolve(__dirname, "../..", file), "utf8");

describe("timeline engagement integrity", () => {
  it("counts only approved comments on both homepage and timeline APIs", () => {
    const home = read("lib/home-sections.ts");
    const events = read("app/api/timeline/events/route.ts");
    expect(home).toMatch(/comments: \{ where: \{ status: "approved" \} \}/);
    expect(events).toMatch(/comments: \{ where: \{ status: 'approved' \} \}/);
  });

  it("loads real comment rows when a card is opened instead of showing an empty local list", () => {
    const card = read("features/timeline/components/TimelineCard.tsx");
    expect(card).toMatch(/\/api\/timeline\/comments\?eventId=/);
    expect(card).toMatch(/if \(next\) void loadComments\(\)/);
    expect(card).toMatch(/setCommentsCount\(loaded\.length\)/);
  });

  it("stores authenticated identity for new comments and likes", () => {
    const comments = read("app/api/timeline/comments/route.ts");
    const likes = read("app/api/timeline/like/route.ts");
    const schema = read("prisma/schema.prisma");
    expect(comments).toMatch(/userId: user\.id/);
    expect(likes).toMatch(/data: \{ \.\.\.key, userId: user\.id \}/);
    expect(schema).toMatch(/author\s+User\?\s+@relation\(fields: \[userId\]/);
    expect(schema).toMatch(/user\s+User\?\s+@relation\(fields: \[userId\]/);
  });

  it("places one grid texture inside the horizontally scrolling track", () => {
    const section = read("features/home/components/sections/TimelineSection.tsx");
    const container = read("features/timeline/components/TimelineContainer.tsx");
    expect(section).not.toMatch(/hp-grid-texture/);
    expect(container.match(/hp-grid-texture/g)).toHaveLength(1);
    expect(container.indexOf("hp-grid-texture")).toBeGreaterThan(container.indexOf("ref={scrollRef}"));
  });

  it("lets the suggestion API—not an optional provider tree—decide authentication", () => {
    const suggestions = read("features/timeline/components/TimelineSuggestions.tsx");
    expect(suggestions).not.toMatch(/useAuth/);
    expect(suggestions).toMatch(/res\.status === 401/);
    expect(suggestions).toMatch(/tb_open_auth/);
  });
});
