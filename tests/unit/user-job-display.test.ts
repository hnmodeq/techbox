import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const read = (file: string) => fs.readFileSync(path.resolve(__dirname, "../..", file), "utf8");

describe("public user job titles", () => {
  it("makes AuthorLink prefer the real profile job over a legacy site role", () => {
    const author = read("components/ui/author-link.tsx");
    expect(author).toMatch(/const professionalTitle = job\?\.trim\(\) \|\| role\?\.trim\(\) \|\| ""/);
    expect(author).toMatch(/professionalTitle/);
  });

  it("delivers jobs with comment authors for public threads", () => {
    expect(read("features/comment/actions/comments.ts")).toMatch(/avatar: true, job: true/);
    expect(read("app/api/comments/route.ts")).toMatch(/avatar: true, job: true/);
    const comments = read("features/comment/components/CommentSection.tsx");
    expect(comments).toMatch(/job=\{\(c as any\)\.author\?\.job\}/);
  });

  it("shows jobs in homepage News, Video, Forum, and community cards", () => {
    expect(read("features/home/components/sections/InsightsSection.tsx")).toMatch(/job=\{comment\.author\.job/);
    expect(read("features/home/components/sections/VideoSection.tsx")).toMatch(/comment\.author\.job/);
    expect(read("features/home/components/sections/CommunitySection.tsx")).toMatch(/job=\{reply\.author\.job\}/);
    expect(read("features/home/components/sections/FamilyCommentsSection.tsx")).toMatch(/comment\.author\.job/);
  });
});
