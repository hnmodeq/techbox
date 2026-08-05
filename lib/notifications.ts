import type { PrismaClient } from "@prisma/client";
import { prisma } from "./db";

const moduleFa: Record<string, string> = {
  blog: "مقاله",
  review: "بررسی",
  media: "ویدیو",
  shop: "محصول",
  forum: "موضوع انجمن",
  download: "دانلود",
  news: "خبر",
};

export type NotificationType =
  | "comment_like"
  | "comment_reply"
  | "following_comment"
  | "following_topic"
  | "following_review"
  | "following_article"
  | "new_follower";

export interface NotificationItem {
  id: string;
  type: NotificationType;
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

/** Build only the seven user-facing social events approved for the top-bar
 * notification panel. No moderation, verification, post-like, system, order,
 * or generic "someone commented on your post" events may enter this feed. */
export async function buildNotificationsForUser(
  userId: string,
  client: PrismaClient = prisma,
): Promise<NotificationItem[]> {
  const followingRows = await client.follow.findMany({
    where: { followerId: userId },
    select: { followingId: true },
  });
  const followingIds = followingRows.map((row) => row.followingId);

  const ownedComments = await client.comment.findMany({
    where: { authorId: userId, deletedAt: null },
    select: { id: true },
  });
  const ownedCommentIds = ownedComments.map((comment) => comment.id);

  const commentLikes = ownedCommentIds.length
    ? await client.commentVote.findMany({
        where: {
          commentId: { in: ownedCommentIds },
          userId: { not: userId },
          vote: 1,
        },
        orderBy: { createdAt: "desc" },
        take: 30,
        include: {
          user: { select: { name: true, username: true, avatar: true } },
          comment: { include: { post: { select: { module: true, slug: true, title: true } } } },
        },
      })
    : [];

  const replies = ownedCommentIds.length
    ? await client.comment.findMany({
        where: {
          parentId: { in: ownedCommentIds },
          authorId: { not: userId },
          status: "approved",
          deletedAt: null,
        },
        orderBy: { createdAt: "desc" },
        take: 30,
        include: {
          author: { select: { name: true, username: true, avatar: true } },
          post: { select: { module: true, slug: true, title: true } },
        },
      })
    : [];

  const followingComments = followingIds.length
    ? await client.comment.findMany({
        where: {
          authorId: { in: followingIds },
          parentId: null,
          status: "approved",
          deletedAt: null,
        },
        orderBy: { createdAt: "desc" },
        take: 30,
        include: {
          author: { select: { name: true, username: true, avatar: true } },
          post: { select: { module: true, slug: true, title: true } },
        },
      })
    : [];

  const followingPosts = followingIds.length
    ? await client.post.findMany({
        where: {
          authorId: { in: followingIds },
          module: { in: ["forum", "review", "blog"] },
          published: true,
          deletedAt: null,
        },
        orderBy: { date: "desc" },
        take: 30,
        include: { author: { select: { name: true, username: true, avatar: true } } },
      })
    : [];

  const newFollowers = await client.follow.findMany({
    where: { followingId: userId },
    orderBy: { createdAt: "desc" },
    take: 30,
    include: { follower: { select: { name: true, username: true, avatar: true } } },
  });

  const events: NotificationItem[] = [];

  for (const vote of commentLikes) {
    if (!vote.user) continue;
    events.push({
      id: `comment-like-${vote.id}`,
      type: "comment_like",
      module: vote.comment.post.module,
      slug: vote.comment.post.slug,
      title: vote.comment.post.title,
      actor: vote.user.name,
      username: vote.user.username,
      avatar: vote.user.avatar,
      text: vote.comment.text,
      createdAt: vote.createdAt.toISOString(),
      label: `${vote.user.name} دیدگاه شما را پسندید`,
    });
  }

  for (const reply of replies) {
    const actor = reply.author?.name || reply.authorName;
    events.push({
      id: `comment-reply-${reply.id}`,
      type: "comment_reply",
      module: reply.post.module,
      slug: reply.post.slug,
      title: reply.post.title,
      actor,
      username: reply.author?.username || "",
      avatar: reply.author?.avatar || null,
      text: reply.text,
      createdAt: reply.createdAt.toISOString(),
      label: `${actor} به دیدگاه شما پاسخ داد`,
    });
  }

  for (const comment of followingComments) {
    const actor = comment.author?.name || comment.authorName;
    events.push({
      id: `following-comment-${comment.id}`,
      type: "following_comment",
      module: comment.post.module,
      slug: comment.post.slug,
      title: comment.post.title,
      actor,
      username: comment.author?.username || "",
      avatar: comment.author?.avatar || null,
      text: comment.text,
      createdAt: comment.createdAt.toISOString(),
      label: `${actor} روی یک ${moduleFa[comment.post.module] || "محتوا"} دیدگاه گذاشت`,
    });
  }

  for (const post of followingPosts) {
    const actor = post.author?.name || post.authorName;
    const type: NotificationType = post.module === "forum"
      ? "following_topic"
      : post.module === "review"
        ? "following_review"
        : "following_article";
    const action = post.module === "forum"
      ? "یک موضوع جدید در انجمن ساخت"
      : post.module === "review"
        ? "یک بررسی جدید منتشر کرد"
        : "یک مقاله جدید منتشر کرد";
    events.push({
      id: `${type}-${post.id}`,
      type,
      module: post.module,
      slug: post.slug,
      title: post.title,
      actor,
      username: post.author?.username || "",
      avatar: post.author?.avatar || null,
      text: post.excerpt || post.title,
      createdAt: post.date.toISOString(),
      label: `${actor} ${action}`,
    });
  }

  for (const follow of newFollowers) {
    events.push({
      id: `new-follower-${follow.id}`,
      type: "new_follower",
      module: "author",
      slug: follow.follower.username,
      title: follow.follower.name,
      actor: follow.follower.name,
      username: follow.follower.username,
      avatar: follow.follower.avatar,
      text: "حساب کاربری شما را دنبال کرد",
      createdAt: follow.createdAt.toISOString(),
      label: `${follow.follower.name} شما را دنبال کرد`,
    });
  }

  return Array.from(new Map(events.map((event) => [event.id, event])).values())
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
    .slice(0, 30);
}
