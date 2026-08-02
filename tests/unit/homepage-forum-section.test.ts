import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const read = (file: string) => fs.readFileSync(path.resolve(__dirname, "../..", file), "utf8");

/** Hybrid community contract: one hot feature plus current open questions. */
describe("homepage Forum section", () => {
  const community = read("features/home/components/sections/CommunitySection.tsx");
  const data = read("lib/home-sections.ts");
  const server = read("lib/home-server.ts");
  const forum = read("features/forum/components/ForumList.tsx");
  const topicModal = read("features/forum/components/ForumTopicModal.tsx");
  const newTopicModal = read("features/forum/components/NewForumTopicModal.tsx");

  it("uses a random hot seven-day feature and only open topics in the list", () => {
    expect(data).toMatch(/export async function getCommunityTopics/);
    expect(data).toMatch(/module: "forum"/);
    expect(data).toMatch(/date: \{ gte: weekAgo/);
    expect(data).toMatch(/const hottest = \[\.\.\.topics\]/);
    expect(data).toMatch(/seededIndex\(hottest\.length, 613\)/);
    expect(data).toMatch(/!topic\.solved/);
    expect(community).toMatch(/const featured = list\[0\]/);
    expect(community).toMatch(/list\.slice\(1\)[\s\S]*?!topic\.solved/);
    expect(community).toMatch(/slice\(0, 4\)/);
    expect(community).toMatch(/const featured = list\[0\] \?\? null/);
    expect(community).toMatch(/هنوز موضوعی در انجمن ثبت نشده است/);
    expect(community).toMatch(/فعلاً پرسش بازی برای نمایش نیست/);
  });

  it("uses a professional answer feature and a separate open-question activity list", () => {
    expect(community).toMatch(/پاسخ برتر/);
    expect(community).toMatch(/هنوز پاسخ برتری/);
    expect(community).toMatch(/برخی از سوالات پرسیده شده در انجمن/);
    expect(community).not.toMatch(/Eyebrow/);
    expect(community).not.toMatch(/border-y border/);
    expect(community).toMatch(/text-\[var\(--warning\)\]/);
    expect(community).toMatch(/پاسخ ثبت شده/);
    expect(community).toMatch(/بار بازدید شده/);
  });

  it("shows real latest forum activity from one bulk server query", () => {
    expect(data).toMatch(/const latestComments = await prisma\.comment\.findMany/);
    expect(data).toMatch(/const activityByPost = new Map/);
    expect(data).toMatch(/lastActivity/);
    expect(server).toMatch(/communityTopics/);
    expect(community).toMatch(/const activity = topic\.lastActivity/);
  });

  it("keeps topic deep links but uses homepage modals for asking and replying", () => {
    expect(community).toMatch(/<NewForumTopicModal/);
    expect(community).toMatch(/<ForumTopicModal/);
    expect(community).toMatch(/پاسخ دادن به این پرسش/);
    expect(community).toMatch(/href=\{`\/\$\{topic\.module\}\/\$\{topic\.slug\}`\}/);
    expect(topicModal).toMatch(/باز کردن در صفحهٔ کامل/);
    expect(topicModal).toMatch(/<CommentSection module="forum"/);
    expect(newTopicModal).toMatch(/window\.dispatchEvent\(new CustomEvent\("tb_open_auth"\)\)/);
  });

  it("still supports the Forum page query parameter as a direct route", () => {
    expect(forum).toMatch(/new URLSearchParams\(window\.location\.search\)\.get\("new"\) === "1"/);
    expect(forum).toMatch(/router\.replace\("\/forum", \{ scroll: false \}\)/);
  });
});
