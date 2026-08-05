import { describe, expect, it, vi } from "vitest";
import { buildNotificationsForUser } from "@/lib/notifications";

function makeMockClient(overrides: Record<string, any> = {}) {
  return {
    follow: { findMany: vi.fn().mockResolvedValue([]) },
    comment: { findMany: vi.fn().mockResolvedValue([]) },
    commentVote: { findMany: vi.fn().mockResolvedValue([]) },
    post: { findMany: vi.fn().mockResolvedValue([]) },
    ...overrides,
  } as any;
}

const actor = { name: "کاربر دنبال‌شده", username: "followed", avatar: null };
const post = { module: "blog", slug: "article", title: "مقاله", authorName: actor.name, author: actor };

describe("approved top-bar notification contract", () => {
  it("emits exactly the seven approved notification types", async () => {
    const client = makeMockClient({
      follow: {
        findMany: vi.fn().mockImplementation((args: any) => {
          if (args.where.followerId) return Promise.resolve([{ followingId: "followed-id" }]);
          return Promise.resolve([{ id: "follow-1", createdAt: new Date("2026-08-05T07:00:00Z"), follower: { name: "دنبال‌کننده", username: "fan", avatar: null } }]);
        }),
      },
      comment: {
        findMany: vi.fn().mockImplementation((args: any) => {
          if (args.where.authorId === "me") return Promise.resolve([{ id: "my-comment" }]);
          if (args.where.parentId?.in) return Promise.resolve([{
            id: "reply", authorName: "پاسخ‌دهنده", text: "پاسخ", createdAt: new Date("2026-08-05T06:00:00Z"),
            author: { name: "پاسخ‌دهنده", username: "reply-user", avatar: null }, post: { module: "blog", slug: "article", title: "مقاله" },
          }]);
          if (args.where.authorId?.in) return Promise.resolve([{
            id: "following-comment", authorName: actor.name, text: "دیدگاه", createdAt: new Date("2026-08-05T05:00:00Z"),
            author: actor, post: { module: "media", slug: "video", title: "ویدیو" },
          }]);
          return Promise.resolve([]);
        }),
      },
      commentVote: {
        findMany: vi.fn().mockResolvedValue([{
          id: "vote", createdAt: new Date("2026-08-05T04:00:00Z"), user: { name: "پسندکننده", username: "liker", avatar: null },
          comment: { id: "my-comment", text: "دیدگاه من", post: { module: "blog", slug: "article", title: "مقاله" } },
        }]),
      },
      post: {
        findMany: vi.fn().mockResolvedValue([
          { ...post, id: "topic", module: "forum", slug: "topic", title: "موضوع", excerpt: "", date: new Date("2026-08-05T03:00:00Z") },
          { ...post, id: "review", module: "review", slug: "review", title: "بررسی", excerpt: "", date: new Date("2026-08-05T02:00:00Z") },
          { ...post, id: "blog", module: "blog", slug: "blog", title: "مقاله", excerpt: "", date: new Date("2026-08-05T01:00:00Z") },
        ]),
      },
    });

    const items = await buildNotificationsForUser("me", client);
    expect(new Set(items.map((item) => item.type))).toEqual(new Set([
      "comment_like",
      "comment_reply",
      "following_comment",
      "following_topic",
      "following_review",
      "following_article",
      "new_follower",
    ]));
  });

  it("attributes comment likes through CommentVote user identity", async () => {
    const voteSpy = vi.fn().mockResolvedValue([]);
    const client = makeMockClient({
      comment: { findMany: vi.fn().mockResolvedValueOnce([{ id: "mine" }]).mockResolvedValueOnce([]) },
      commentVote: { findMany: voteSpy },
    });
    await buildNotificationsForUser("me", client);
    const where = voteSpy.mock.calls[0][0].where;
    expect(where.commentId).toEqual({ in: ["mine"] });
    expect(where.userId).toEqual({ not: "me" });
    expect(where.vote).toBe(1);
  });

  it("queries only comments and forum/review/blog posts from followed accounts", async () => {
    const postSpy = vi.fn().mockResolvedValue([]);
    const commentSpy = vi.fn().mockResolvedValue([]);
    const client = makeMockClient({
      follow: { findMany: vi.fn().mockResolvedValueOnce([{ followingId: "u2" }]).mockResolvedValueOnce([]) },
      comment: { findMany: commentSpy },
      post: { findMany: postSpy },
    });
    await buildNotificationsForUser("me", client);
    expect(postSpy.mock.calls[0][0].where.authorId).toEqual({ in: ["u2"] });
    expect(postSpy.mock.calls[0][0].where.module).toEqual({ in: ["forum", "review", "blog"] });
    const followingCommentCall = commentSpy.mock.calls.find((call) => call[0].where.authorId?.in);
    expect(followingCommentCall?.[0].where.parentId).toBeNull();
  });

  it("returns no system or verification events for a quiet user", async () => {
    const items = await buildNotificationsForUser("nobody", makeMockClient());
    expect(items).toEqual([]);
  });
});
