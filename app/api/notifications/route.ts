import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth-server";

const moduleFa: Record<string, string> = { blog: "مقاله", review: "نقد", media: "ویدیو", shop: "محصول", forum: "تاپیک", download: "دانلود", news: "خبر" };

async function buildNotifications() {
  const comments = await prisma.comment.findMany({
    take: 30,
    orderBy: { createdAt: "desc" },
    include: { author: { select: { name: true, username: true, avatar: true } }, post: { select: { module: true, slug: true, title: true } } },
  });
  const likes = await prisma.like.findMany({
    take: 30,
    orderBy: { createdAt: "desc" },
    where: { userId: { not: null } },
  });
  const likeUsers = await prisma.user.findMany({ where: { id: { in: likes.map((l: any) => l.userId!).filter(Boolean) } }, select: { id: true, name: true, username: true, avatar: true } });
  const userMap = new Map(likeUsers.map((u: any) => [u.id, u]));
  const likePosts = likes.length
    ? await prisma.post.findMany({ where: { OR: likes.map((l: any) => ({ module: l.module, slug: l.slug })) }, select: { module: true, slug: true, title: true } })
    : [];
  const postMap = new Map(likePosts.map((p: any) => [`${p.module}:${p.slug}`, p]));

  return [
    ...comments.map(c => ({
      id: `comment-${c.id}`,
      type: "comment",
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
    ...likes.map(l => {
      const u = userMap.get(l.userId || "");
      const p = postMap.get(`${l.module}:${l.slug}`);
      return {
        id: `like-${l.id}`,
        type: "like",
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
  ].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)).slice(0, 30);
}

export async function GET() {
  try {
    const user = await getSessionUser();
    const events = await buildNotifications();
    let lastReadAt = new Date(0);

    if (user) {
      const state = await prisma.userNotificationState.findUnique({ where: { userId: user.id } });
      lastReadAt = state?.lastReadAt || new Date(0);
    }

    const items = events.map((event) => ({ ...event, read: !user || new Date(event.createdAt) <= lastReadAt }));
    const unreadCount = user ? items.filter((event) => !event.read).length : 0;
    return NextResponse.json({ items, unreadCount, lastReadAt: lastReadAt.toISOString(), isLoggedIn: Boolean(user) });
  } catch {
    return NextResponse.json({ items: [], unreadCount: 0, isLoggedIn: false });
  }
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
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
