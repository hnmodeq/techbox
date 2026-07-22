import { describe, it, expect, vi } from "vitest";
import { buildNotificationsForUser } from "@/lib/notifications";

/**
 * Regression test for the notifications ownership query (security review TB-04).
 *
 * The original query matched likes by a fragile (module, slug) OR-chain. The
 * fix scopes likes by the Like.postId FK to posts authored by the user. This
 * test proves that likes on ANOTHER author's post never appear in a user's
 * notification feed — even if the other author's post happens to share a slug
 * shape. We inject a mock Prisma client so we control exactly which rows the
 * query "sees".
 */

function makeMockClient(overrides: Record<string, any>) {
  return {
    post: { findMany: vi.fn().mockResolvedValue([]) },
    comment: { findMany: vi.fn().mockResolvedValue([]) },
    like: { findMany: vi.fn().mockResolvedValue([]) },
    user: { findMany: vi.fn().mockResolvedValue([]) },
    siteSetting: { findMany: vi.fn().mockResolvedValue([]) },
    ...overrides,
  } as any;
}

describe("notifications ownership (TB-04)", () => {
  it("only returns likes on posts authored by the requesting user", async () => {
    // Alice authored post pA. Bob authored post pB. Carol likes BOTH.
    const alicePosts = [{ id: "pA", module: "blog", slug: "alice-post", title: "Alice's post" }];
    // Alice's own likes (on Bob's post) must NOT surface as "someone liked your post".
    const aliceOwnLikeOnBobsPost = { id: "lkA", userId: "alice", postId: "pB", module: "blog", slug: "bob-post", createdAt: new Date("2026-07-18T10:00:00Z") };
    // Carol's like on Alice's post — this SHOULD appear.
    const carolLikeOnAlicePost = { id: "lkC", userId: "carol", postId: "pA", module: "blog", slug: "alice-post", createdAt: new Date("2026-07-18T11:00:00Z") };
    // Carol's like on Bob's post — must NOT appear for Alice.
    const carolLikeOnBobsPost = { id: "lkC2", userId: "carol", postId: "pB", module: "blog", slug: "bob-post", createdAt: new Date("2026-07-18T12:00:00Z") };

    const client = makeMockClient({
      post: { findMany: vi.fn().mockResolvedValue(alicePosts) },
      comment: { findMany: vi.fn().mockResolvedValue([]) },
      like: {
        findMany: vi.fn().mockImplementation((args: any) => {
          // Emulate the real query: scope likes by postId ∈ Alice's post ids.
          const allowedPostIds = args.where?.postId?.in ?? [];
          return Promise.resolve(
            [aliceOwnLikeOnBobsPost, carolLikeOnAlicePost, carolLikeOnBobsPost].filter(
              (l) => allowedPostIds.includes(l.postId) && l.userId !== "alice"
            )
          );
        }),
      },
      user: { findMany: vi.fn().mockResolvedValue([{ id: "carol", name: "Carol", username: "carol", avatar: null }]) },
    });

    const items = await buildNotificationsForUser("alice", client);

    // The only like notification must be Carol liking Alice's post.
    const likeItems = items.filter((i) => i.type === "like");
    expect(likeItems).toHaveLength(1);
    expect(likeItems[0].id).toBe("like-lkC");
    expect(likeItems[0].slug).toBe("alice-post");
    expect(likeItems[0].actor).toBe("Carol");

    // Bob's post must never leak in.
    expect(items.some((i) => i.slug === "bob-post")).toBe(false);
  });

  it("passes only the user's own post ids into the like query (FK scoping)", async () => {
    const likeSpy = vi.fn().mockResolvedValue([]);
    const client = makeMockClient({
      post: { findMany: vi.fn().mockResolvedValue([{ id: "pA", module: "blog", slug: "a", title: "A" }]) },
      like: { findMany: likeSpy },
    });

    await buildNotificationsForUser("alice", client);

    expect(likeSpy).toHaveBeenCalledTimes(1);
    const where = likeSpy.mock.calls[0][0].where;
    expect(where.postId).toEqual({ in: ["pA"] });
    // No OR / module-slug text matching remains.
    expect(where.OR ?? where.or).toBeUndefined();
  });

  it("returns nothing for a user with no posts", async () => {
    const client = makeMockClient({ post: { findMany: vi.fn().mockResolvedValue([]) } });
    const items = await buildNotificationsForUser("nobody", client);
    expect(items).toEqual([]);
  });
});
