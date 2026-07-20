import type { PrismaClient } from "@prisma/client";
import { prisma } from "./db";

const moduleFa: Record<string, string> = {
  blog: "مقاله",
  review: "نقد",
  media: "ویدیو",
  shop: "محصول",
  forum: "تاپیک",
  download: "دانلود",
  news: "خبر",
};

export interface NotificationItem {
  id: string;
  type: "comment" | "reply" | "like";
  module: string;
  slug: string;
  title: string;
  actor: string;
  username: string;
  avatar: string | null;
  text: string;
  createdAt: string;
  label: string;
}

/**
 * Build the activity feed for a user: comments + replies on their posts, replies
 * to their comments, and likes on their posts.
 *
 * Ownership / privacy is enforced via the `Like.postId` FK and `Comment.post`
 * relation — we only ever query rows whose post is authored by `userId`. This
 * used to match likes by a fragile (module, slug) text OR-chain; the FK makes
 * the scoping self-evidently correct and referentially enforced.
 *
 * The Prisma client is injected so this can be unit-tested with a mock.
 */
export async function buildNotificationsForUser(
  userId: string,
  client: PrismaClient = prisma
): Promise<NotificationItem[]> {
  // All posts authored by this user — the scope of everything below.
  const userPosts = await client.post.findMany({
    where: { authorId: userId, deletedAt: null },
    select: { id: true, module: true, slug: true, title: true },
  });

  const postIds = userPosts.map((p) => p.id);
  const userPostMap = new Map(userPosts.map((p) => [p.id, p]));

  if (postIds.length === 0) return [];

  // Comments on the user's posts (excluding the user's own comments).
  const comments = await client.comment.findMany({
    where: {
      postId: { in: postIds },
      authorId: { not: userId },
      status: "approved",
      deletedAt: null,
    },
    take: 30,
    orderBy: { createdAt: "desc" },
    include: {
      author: { select: { name: true, username: true, avatar: true } },
      post: { select: { module: true, slug: true, title: true } },
    },
  });

  // Likes on the user's posts, from OTHER users. Scoped by postId FK — only
  // likes whose post belongs to this user can match. Anonymous likes (null
  // userId) are excluded since we want a named actor.
  const likes = await client.like.findMany({
    take: 30,
    orderBy: { createdAt: "desc" },
    where: {
      postId: { in: postIds },
      userId: { not: userId },
      deletedAt: null,
    },
    select: { id: true, userId: true, postId: true, module: true, slug: true, createdAt: true },
  });

  const likeUserIds = [...new Set(likes.map((l) => l.userId).filter(Boolean))] as string[];
  const likeUsers: { id: string; name: string; username: string; avatar: string | null }[] =
    likeUserIds.length
      ? await client.user.findMany({
          where: { id: { in: likeUserIds } },
          select: { id: true, name: true, username: true, avatar: true },
        })
      : [];
  const userMap = new Map(likeUsers.map((u) => [u.id, u]));

  // Replies to comments written by this user (interactions on other people's
  // posts too — these are genuine notifications directed at this user).
  const userComments = await client.comment.findMany({
    where: { authorId: userId, deletedAt: null },
    select: { id: true },
  });
  const userCommentIds = userComments.map((c) => c.id);
  const replies = userCommentIds.length
    ? await client.comment.findMany({
        where: {
          parentId: { in: userCommentIds },
          authorId: { not: userId },
          status: "approved",
          deletedAt: null,
        },
        take: 30,
        orderBy: { createdAt: "desc" },
        include: {
          author: { select: { name: true, username: true, avatar: true } },
          post: { select: { module: true, slug: true, title: true } },
        },
      })
    : [];

  const events: NotificationItem[] = [
    ...comments.map((c: any) => ({
      id: `comment-${c.id}`,
      type: "comment" as const,
      module: c.post.module,
      slug: c.post.slug,
      title: c.post.title,
      actor: c.author?.name || c.authorName,
      username: c.author?.username || "",
      avatar: c.author?.avatar || null,
      text: c.text,
      createdAt: c.createdAt.toISOString(),
      label: `${moduleFa[c.post.module] || c.post.module} • ${c.author?.name || c.authorName} دیدگاه گذاشت`,
    })),
    ...replies.map((c: any) => ({
      id: `reply-${c.id}`,
      type: "reply" as const,
      module: c.post.module,
      slug: c.post.slug,
      title: c.post.title,
      actor: c.author?.name || c.authorName,
      username: c.author?.username || "",
      avatar: c.author?.avatar || null,
      text: c.text,
      createdAt: c.createdAt.toISOString(),
      label: `${moduleFa[c.post.module] || c.post.module} • ${c.author?.name || c.authorName} پاسخ داد`,
    })),
    ...likes.map((l: any) => {
      const u = userMap.get(l.userId || "");
      // The liked post is one of the user's own posts (scoped by postId). Fall
      // back to the denormalized module/slug on the like row if somehow missing.
      const p = userPostMap.get(l.postId || "");
      return {
        id: `like-${l.id}`,
        type: "like" as const,
        module: p?.module || l.module,
        slug: p?.slug || l.slug,
        title: p?.title || l.slug,
        actor: u?.name || "کاربر",
        username: u?.username || "",
        avatar: u?.avatar || null,
        text: "پسندید",
        createdAt: l.createdAt.toISOString(),
        label: `${moduleFa[p?.module || l.module] || p?.module || l.module} • ${u?.name || "کاربر"} پسندید`,
      };
    }),
  ];

  // Verification result notifications (stored in SiteSetting by admin)
  const verifNotifPrefix = `verif_notif_${userId}_`;
  const verifSettings = await client.siteSetting.findMany({
    where: { key: { startsWith: verifNotifPrefix } },
  }).catch(() => []);

  const verifTypeLabel: Record<string, string> = {
    content: "تولید کننده محتوای تایید شده",
    org: "کاربر سازمانی تایید شده",
    user: "کاربر تایید شده",
  };

  const verifEvents: NotificationItem[] = verifSettings.map((s) => {
    try {
      const data = JSON.parse(s.value);
      const requestId = s.key.replace(verifNotifPrefix, "");
      const approved = data.decision === "approved";
      const typeLabel = verifTypeLabel[data.type] || "تایید هویت";
      return {
        id: `verif-${requestId}`,
        type: "comment" as const,
        module: "account",
        slug: "",
        title: approved ? `درخواست ${typeLabel} تایید شد` : `درخواست ${typeLabel} رد شد`,
        actor: "تکباکس",
        username: "",
        avatar: null,
        text: approved
          ? `تبریک! درخواست ${typeLabel} شما تایید شد.`
          : `درخواست شما رد شد${data.adminNote ? `: ${data.adminNote}` : "."}`,
        createdAt: data.reviewedAt || new Date().toISOString(),
        label: approved ? `✅ درخواست ${typeLabel} تایید شد` : `❌ درخواست ${typeLabel} رد شد`,
      };
    } catch {
      return null;
    }
  }).filter(Boolean) as NotificationItem[];

  const allEvents = [...events, ...verifEvents];

  return Array.from(new Map(allEvents.map((e) => [e.id, e])).values())
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
    .slice(0, 30);
}
