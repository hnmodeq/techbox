import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const moduleFa: Record<string, string> = { blog: "مقاله", review: "نقد", media: "ویدیو", shop: "محصول", forum: "تاپیک", download: "دانلود", news: "خبر" };

export async function GET() {
  try {
    const comments = await prisma.comment.findMany({
      take: 20,
      orderBy: { createdAt: "desc" },
      include: { author: { select: { name: true, username: true, avatar: true } }, post: { select: { module: true, slug: true, title: true } } },
    });
    const likes = await prisma.like.findMany({
      take: 20,
      orderBy: { createdAt: "desc" },
      where: { userId: { not: null } },
    });
    const likeUsers = await prisma.user.findMany({ where: { id: { in: likes.map(l => l.userId!).filter(Boolean) } }, select: { id: true, name: true, username: true, avatar: true } });
    const userMap = new Map(likeUsers.map(u => [u.id, u]));
    const likePosts = await prisma.post.findMany({ where: { OR: likes.map(l => ({ module: l.module, slug: l.slug })) }, select: { module: true, slug: true, title: true } });
    const postMap = new Map(likePosts.map(p => [`${p.module}:${p.slug}`, p]));
    const events = [
      ...comments.map(c => ({ id: `comment-${c.id}`, type: "comment", module: c.post.module, slug: c.post.slug, title: c.post.title, actor: c.author?.name || c.authorName, avatar: c.author?.avatar || null, text: c.text, createdAt: c.createdAt.toISOString(), label: `${moduleFa[c.post.module] || c.post.module} • ${c.author?.name || c.authorName} دیدگاه گذاشت` })),
      ...likes.map(l => { const u = userMap.get(l.userId || ""); const p = postMap.get(`${l.module}:${l.slug}`); return { id: `like-${l.id}`, type: "like", module: l.module, slug: l.slug, title: p?.title || l.slug, actor: u?.name || "کاربر", avatar: u?.avatar || null, text: "پسندید", createdAt: l.createdAt.toISOString(), label: `${moduleFa[l.module] || l.module} • ${u?.name || "کاربر"} پسندید` }; }),
    ].sort((a,b)=>+new Date(b.createdAt)-+new Date(a.createdAt)).slice(0,30);
    return NextResponse.json(events);
  } catch {
    return NextResponse.json([]);
  }
}
export const dynamic = "force-dynamic";
