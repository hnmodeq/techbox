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

  it("keeps random solved and unresolved Forum selections strictly separate", () => {
    expect(data).toMatch(/export async function getCommunityTopics/);
    expect(data).toMatch(/solved: true,/);
    expect(data).toMatch(/acceptedComment: \{ is: \{ status: "approved"/);
    expect(data).toMatch(/where: \{ \.\.\.forumWhere, solved: false \}/);
    expect(data).toMatch(/seededIndex\(solvedPool\.length, 613\)/);
    expect(data).toMatch(/seededIndices\(openPool\.length, 4, 719\)/);
    expect(data).toMatch(/featured: featuredRaw \? toCard\(featuredRaw\) : null/);
    expect(data).toMatch(/topics: railTopics\.map\(toCard\)/);
    expect(data).toMatch(/const topicContributors = await prisma\.post\.groupBy/);
    expect(data).toMatch(/const replyContributors = await prisma\.comment\.groupBy/);
    expect(community).toMatch(/featuredTopic/);
    expect(community).toMatch(/const activeTopics = \(\(topics \?\? \[\]\) as WithForumActivity\[\]\)\.slice\(0, 4\)/);
    expect(community).toMatch(/<NewForumTopicModal open=\{questionOpen\}/);
    expect(community).not.toMatch(/<ForumQuestionPanel/);
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
    expect(community).toMatch(/اما هنوز کسی این مسئله را حل نکرده است/);
    expect(community).not.toMatch(/بار بازدید شده/);
    expect(community).toMatch(/ms-auto block shrink-0/);
    expect(community).toMatch(/whitespace-nowrap/);
    expect(community).not.toMatch(/تعداد پاسخ‌های ثبت‌شده/);
    expect(community).not.toMatch(/تعداد دفعات بازدید/);
    const topicRow = community.slice(community.indexOf("function TopicRow"), community.indexOf("function TopicActivity"));
    expect(topicRow).toMatch(/topic\.excerpt/);
    expect(topicRow).toMatch(/line-clamp-2 text-\[13px\]/);
    // Main feature is square-cornered/borderless. Its only solved treatment
    // is the accepted-answer marker — no duplicate «حل‌شده» label or accent bar.
    const feature = community.slice(community.indexOf("function FeaturedTopic"), community.indexOf("function EmptyCommunityFeature"));
    expect(feature).not.toMatch(/rounded-\[var\(--hp-r-md\)\]/);
    expect(feature).not.toMatch(/border border-\[color:var\(--hp-border\)\]/);
    expect(feature).not.toMatch(/shadow-\[var\(--hp-shadow-card\)\]/);
    expect(feature).toMatch(/bg-\[color:var\(--hp-surface\)\]/);
    expect(feature).not.toMatch(/color-mix\(in_oklch,var\(--community-accent\)/);
    expect(feature).not.toMatch(/absolute inset-x-0 bottom-0 h-1/);
    expect(feature).not.toMatch(/حل‌شده/);
    expect(feature).toMatch(/showSummary=\{false\}/);
    expect(feature).toMatch(/absolute inset-y-4 start-2 w-1/);
    expect(feature).toMatch(/bg-\[color:var\(--hp-solved\)\]/);
    expect(feature).not.toMatch(/border-s-\[3px\]/);
    expect(feature.indexOf("<TopicActivity")).toBeLessThan(feature.indexOf("<h3"));
  });

  it("shows real latest forum activity from one bulk server query", () => {
    expect(data).toMatch(/const latestComments = topicIds\.length > 0/);
    expect(data).toMatch(/const activityByPost = new Map/);
    expect(data).toMatch(/lastActivity/);
    expect(server).toMatch(/const community = enabledModules\.includes\("forum"\)/);
    expect(community).toMatch(/const activity = topic\.lastActivity/);
  });

  it("keeps topic deep links, restores the header question modal, and retains the question panel", () => {
    expect(community).not.toMatch(/<ForumQuestionPanel/);
    expect(community).toMatch(/<NewForumTopicModal/);
    expect(community).not.toMatch(/<ForumTopicModal/);
    expect(community).not.toMatch(/پاسخ دادن به این مسئله/);
    const headerActions = community.slice(community.indexOf("function CommunityActions"), community.indexOf("function FeaturedTopic"));
    expect(headerActions).toMatch(/طرح پرسش جدید/);
    expect(headerActions).toMatch(/onClick=\{onAsk\}/);
    expect(headerActions).toMatch(/text-\[color:var\(--community-accent\)\]/);
    expect(community).toMatch(/href=\{`\/\$\{topic\.module\}\/\$\{topic\.slug\}`\}/);
    expect(composer).toMatch(/Retained "question panel" component/);
    expect(composer).toMatch(/id="hp-forum-question"/);
    expect(composer).toMatch(/rounded-\[12px\] bg-white p-1\.5/);
    expect(composer).toMatch(/resize-none/);
    expect(composer).not.toMatch(/resize-y/);
    expect(composer).toMatch(/focus-visible:ring-0/);
    expect(composer).toMatch(/variant="ghost"/);
    expect(composer).toMatch(/مسئله فنی خودتون رو با جامعه فنی در میون بگذارید/);
    expect(composer).toMatch(/عنوان مسئله خودتون رو بنویسید/);
    expect(composer).toMatch(/جزئیاتی که ممکن هست کمک کننده باشه برای رسیدن به جواب رو بنویسید/);
    expect(composer).toMatch(/<Num>\{participantCount\}<\/Num>/);
    expect(composer.indexOf("ثبت پرسش")).toBeLessThan(composer.indexOf("عنوان مسئله خودتون رو بنویسید"));
    expect(composer.indexOf("تا به این لحظه")).toBeGreaterThan(composer.indexOf("جزئیاتی که ممکن هست کمک کننده"));
    expect(composer).toMatch(/window\.dispatchEvent\(new CustomEvent\("tb_open_auth"\)\)/);
  });

  it("still supports the Forum page query parameter as a direct route", () => {
    expect(forum).toMatch(/new URLSearchParams\(window\.location\.search\)\.get\("new"\) === "1"/);
    expect(forum).toMatch(/router\.replace\("\/forum", \{ scroll: false \}\)/);
  });
});
