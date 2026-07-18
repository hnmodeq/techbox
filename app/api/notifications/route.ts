import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUserPublic } from "@/lib/auth-server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const moduleFa: Record<string, string> = { blog: "مقاله", review: "نقد", media: "ویدیو", shop: "محصول", forum: "تاپیک", download: "دانلود", news: "خبر" };

interface NotificationItem {
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

async function buildNotificationsForUser(userId: string): Promise<NotificationItem[]> {
  // Find all posts authored by this user
  const userPosts = await prisma.post.findMany({
    where: { authorId: userId, deletedAt: null },
    select: { id: true, module: true, slug: true, title: true },
  });

  const postIds = userPosts.map((p: { id: string }) => p.id);

  if (postIds.length === 0) return [];

  // Comments on the user's posts (excluding the user's own comments)
  const comments = await prisma.comment.findMany({
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

  // Likes on the user's posts (excluding the user's own likes)
  const postModuleSlugs = userPosts.map((p: { module: string; slug: string }) => ({ module: p.module, slug: p.slug }));
  const likes = postModuleSlugs.length > 0
    ? await prisma.like.findMany({
        take: 30,
        orderBy: { createdAt: "desc" },
        where: {
          OR: postModuleSlugs,
          userId: { not: null },
          deletedAt: null,
        },
      })
    : [];

  // Filter out the user's own likes
  const otherLikes = likes.filter((l: { userId: string | null }) => l.userId !== userId);

  const likeUserIds = [...new Set(otherLikes.map((l: { userId: string | null }) => l.userId).filter(Boolean))] as string[];
  const likeUsers: { id: string; name: string; username: string; avatar: string | null }[] = likeUserIds.length
    ? await prisma.user.findMany({
        where: { id: { in: likeUserIds } },
        select: { id: true, name: true, username: true, avatar: true },
      })
    : [];
  const userMap = new Map(likeUsers.map((u) => [u.id, u]));

  const likePosts: { module: string; slug: string; title: string }[] = otherLikes.length
    ? await prisma.post.findMany({
        where: { OR: otherLikes.map((l: { module: string; slug: string }) => ({ module: l.module, slug: l.slug })) },
        select: { module: true, slug: true, title: true },
      })
    : [];
  const likePostMap = new Map(likePosts.map((p) => [`${p.module}:${p.slug}`, p]));

  // Replies to comments written by this user, even when the parent post belongs
  // to someone else. This is an interaction with the user and should create a
  // real notification.
  const userComments = await prisma.comment.findMany({
    where: { authorId: userId, deletedAt: null },
    select: { id: true },
  });
  const userCommentIds = userComments.map((comment) => comment.id);
  const replies = userCommentIds.length
    ? await prisma.comment.findMany({
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

  const events = [
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
    ...otherLikes.map((l: any) => {
      const u = userMap.get(l.userId || "");
      const p = likePostMap.get(`${l.module}:${l.slug}`);
      return {
        id: `like-${l.id}`,
        type: "like" as const,
        module: l.module,
        slug: l.slug,
        title: p?.title || l.slug,
        actor: u?.name || "کاربر",
        username: u?.username || "",
        avatar: u?.avatar || null,
        text: "پسندید",
        createdAt: l.createdAt.toISOString(),
        label: `${moduleFa[l.module] || l.module} • ${u?.name || "کاربر"} پسندید`,
      };
    }),
  ];

  return Array.from(new Map(events.map((event) => [event.id, event])).values())
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
    .slice(0, 30);
}

export async function GET() {
  try {
    const user = await getSessionUserPublic();

    if (!user) {
      return NextResponse.json({ items: [], unreadCount: 0, isLoggedIn: false });
    }

    const events = await buildNotificationsForUser(user.id);
    let lastReadAt = new Date(0);

    const state = await prisma.userNotificationState.findUnique({ where: { userId: user.id } });
    lastReadAt = state?.lastReadAt || new Date(0);

    const items = events.map((event) => ({ ...event, read: new Date(event.createdAt) <= lastReadAt }));
    const unreadCount = items.filter((event) => !event.read).length;
    return NextResponse.json({ items, unreadCount, lastReadAt: lastReadAt.toISOString(), isLoggedIn: true });
  } catch {
    return NextResponse.json({ items: [], unreadCount: 0, isLoggedIn: false });
  }
}

export async function POST(req: NextRequest) {
  const user = await getSessionUserPublic();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const ip = getClientIp(req);
  const rateLimit = await checkRateLimit(`${user.id}:${ip}`, "views");
  if (!rateLimit.success) {
    return NextResponse.json({ error: "too_many_requests" }, { status: 429 });
  }
  try {
    const body = await req.json().catch(() => ({}));
    const lastReadAt = body?.lastReadAt ? new Date(body.lastReadAt) : new Date();
    const state = await prisma.userNotificationState.upsert({
      where: { userId: user.id },
      update: { lastReadAt },
      create: { userId: user.id, lastReadAt },
    });
    return NextResponse.json({ ok: true, lastReadAt: state.lastReadAt.toISOString() });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "mark_read_failed" }, { status: 400 });
  }
}

export const dynamic = "force-dynamic";
