import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { userAvatarColors, userAvatarInitial } from "@/components/ui/user-avatar";

const read = (file: string) => fs.readFileSync(path.resolve(__dirname, "../..", file), "utf8");

describe("stable user-avatar fallback", () => {
  it("uses the first visible character and a deterministic palette", () => {
    expect(userAvatarInitial("  مهسا نادری")).toBe("م");
    expect(userAvatarInitial("Arash")).toBe("A");
    expect(userAvatarInitial("")).toBe("؟");
    expect(userAvatarColors("community_mahsa")).toEqual(userAvatarColors("community_mahsa"));
    expect(userAvatarColors("community_arash")).not.toBeUndefined();
  });

  it("uses the shared fallback in the common author and Forum surfaces", () => {
    expect(read("components/ui/author-link.tsx")).toMatch(/<UserAvatar/);
    expect(read("features/forum/components/ForumList.tsx")).toMatch(/<UserAvatar/);
    expect(read("features/home/components/primitives/Byline.tsx")).toMatch(/<UserAvatar/);
    expect(read("components/ui/avatar.tsx")).toMatch(/colorKey/);
  });
});
