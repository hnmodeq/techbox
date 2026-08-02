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
  const composer = read("features/forum/components/ForumQuestionPanel.tsx");

  it("uses a random hot seven-day feature and a four-topic real activity rail", () => {
    expect(data).toMatch(/export async function getCommunityTopics/);
    expect(data).toMatch(/module: "forum"/);
    expect(data).toMatch(/date: \{ gte: weekAgo/);
    expect(data).toMatch(/const hottest = \[\.\.\.featurePool\]/);
    expect(data).toMatch(/seededIndex\(featureChoices\.length, 613\)/);
    expect(data).toMatch(/const railFallback = await prisma\.post\.findMany/);
    expect(data).toMatch(/let railTopics = \[\.\.\.openTopics, \.\.\.solvedTopics\]\.slice\(0, 4\)/);
    expect(data).toMatch(/return \[toCard\(featured\), \.\.\.railTopics\.map\(toCard\)\]/);
    expect(community).toMatch(/const featured = list\[0\] \?\? null/);
    expect(community).toMatch(/const activeTopics = list\.slice\(1, 5\)/);
    expect(community).toMatch(/فعلاً پرسش بازی برای نمایش نیست/);
  });

  it("uses the requested professional card and activity-list presentation", () => {
    expect(community).toMatch(/پاسخ برتر/);
    expect(community).not.toMatch(/برخی از سوالات پرسیده شده در انجمن/);
    expect(community).not.toMatch(/Eyebrow/);
    expect(community).not.toMatch(/border-y border/);
    expect(community).toMatch(/text-\[var\(--warning\)\]/);
    expect(community).toMatch(/هنوز کسی این مسئله را حل نکرده/);
    expect(community).toMatch(/پاسخ ثبت شده/);
    expect(community).not.toMatch(/بار بازدید شده/);
    expect(community).toMatch(/ms-auto flex shrink-0/);
    expect(community).toMatch(/whitespace-nowrap/);
    expect(community).toMatch(/تعداد پاسخ‌های ثبت‌شده/);
    expect(community).not.toMatch(/تعداد دفعات بازدید/);
    // Main feature is square-cornered/borderless, with its state line below.
    const feature = community.slice(community.indexOf("function FeaturedTopic"), community.indexOf("function EmptyCommunityFeature"));
    expect(feature).not.toMatch(/rounded-\[var\(--hp-r-md\)\]/);
    expect(feature).not.toMatch(/border border-\[color:var\(--hp-border\)\]/);
    expect(feature).not.toMatch(/shadow-\[var\(--hp-shadow-card\)\]/);
    expect(feature).toMatch(/absolute inset-x-0 bottom-0 h-1/);
    expect(feature.indexOf("<TopicActivity")).toBeLessThan(feature.indexOf("<h3"));
  });

  it("shows real latest forum activity from one bulk server query", () => {
    expect(data).toMatch(/const latestComments = await prisma\.comment\.findMany/);
    expect(data).toMatch(/const activityByPost = new Map/);
    expect(data).toMatch(/lastActivity/);
    expect(server).toMatch(/communityTopics/);
    expect(community).toMatch(/const activity = topic\.lastActivity/);
  });

  it("keeps topic deep links, hides row replies, and gives the homepage a direct composer", () => {
    expect(community).toMatch(/<ForumQuestionPanel/);
    expect(community).not.toMatch(/<NewForumTopicModal/);
    expect(community).not.toMatch(/<ForumTopicModal/);
    expect(community).not.toMatch(/پاسخ دادن به این مسئله/);
    const headerActions = community.slice(community.indexOf("function CommunityActions"), community.indexOf("function FeaturedTopic"));
    expect(headerActions).not.toMatch(/طرح پرسش جدید/);
    expect(community).toMatch(/href=\{`\/\$\{topic\.module\}\/\$\{topic\.slug\}`\}/);
    expect(composer).toMatch(/id="hp-forum-question"/);
    expect(composer).toMatch(/rounded-\[12px\] bg-white p-1\.5/);
    expect(composer).toMatch(/resize-none/);
    expect(composer).not.toMatch(/resize-y/);
    expect(composer).toMatch(/window\.dispatchEvent\(new CustomEvent\("tb_open_auth"\)\)/);
  });

  it("still supports the Forum page query parameter as a direct route", () => {
    expect(forum).toMatch(/new URLSearchParams\(window\.location\.search\)\.get\("new"\) === "1"/);
    expect(forum).toMatch(/router\.replace\("\/forum", \{ scroll: false \}\)/);
  });
});
