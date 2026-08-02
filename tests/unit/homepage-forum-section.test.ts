import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const read = (file: string) => fs.readFileSync(path.resolve(__dirname, "../..", file), "utf8");

/** Hybrid community contract: one proven resolution plus current activity. */
describe("homepage Forum section", () => {
  const community = read("features/home/components/sections/CommunitySection.tsx");
  const server = read("lib/home-server.ts");
  const forum = read("features/forum/components/ForumList.tsx");

  it("pairs a solved-or-most-discussed feature with four active discussions", () => {
    expect(community).toMatch(/topic\.solved && topic\.acceptedAnswer\?\.text/);
    expect(community).toMatch(/\[\.\.\.list\]\.sort\(\(a, b\) => \(b\.comments \?\? 0\)/);
    expect(community).toMatch(/slice\(0, 4\)/);
    expect(community).toMatch(/پاسخ برتر/);
    expect(community).toMatch(/هنوز پاسخ برتری/);
  });

  it("offers ask-and-browse actions while topics retain full shareable routes", () => {
    expect(community).toMatch(/href="\/forum\?new=1"/);
    expect(community).toMatch(/طرح پرسش جدید/);
    expect(community).toMatch(/href=\{`\/\$\{topic\.module\}\/\$\{topic\.slug\}`\}/);
  });

  it("shows real latest forum activity from one bulk server query", () => {
    expect(server).toMatch(/if \(module === "forum" && posts\.length > 0\)/);
    expect(server).toMatch(/const latestComments = await prisma\.comment\.findMany/);
    expect(server).toMatch(/const activityByPost = new Map/);
    expect(server).toMatch(/lastActivity/);
    expect(community).toMatch(/const activity = topic\.lastActivity/);
  });

  it("opens the existing New Topic dialog from the homepage query parameter", () => {
    expect(forum).toMatch(/new URLSearchParams\(window\.location\.search\)\.get\("new"\) === "1"/);
    expect(forum).toMatch(/router\.replace\("\/forum", \{ scroll: false \}\)/);
  });
});
