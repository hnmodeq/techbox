import { prisma } from "./db";
import { moduleColors } from "@/config/module-colors";

export type ModuleSlug =
  | "blog"
  | "news"
  | "media"
  | "review"
  | "tools"
  | "download"
  | "shop"
  | "forum"
  | "timeline";

export type ContentItem = {
  slug: string;
  module: ModuleSlug;
  title: string;
  excerpt: string;
  content?: string;
  image?: string;
  tags: string[];
  author: { name: string; role?: string; avatar?: string };
  date: string; // ISO
  date_fa: string;
  time?: string;
  source?: string;
  likes: number;
  views: number;
  category?: string;
  solved?: boolean;
  fileSize?: string;
};

function formatPost(p: any): ContentItem {
  return {
    slug: p.slug,
    module: p.module as ModuleSlug,
    title: p.title,
    excerpt: p.excerpt || "",
    content: p.content || "",
    image: p.image || null,
    tags: typeof p.tags === "string" ? JSON.parse(p.tags || "[]") : p.tags || [],
    author: {
      name: p.authorName || "تحریریه",
      role: p.author?.role || "تحریریه",
      avatar: p.author?.avatar || null,
    },
    date: p.date instanceof Date ? p.date.toISOString() : p.date,
    date_fa: p.dateFa || "",
    likes: p.likes || 0,
    views: p.views || 0,
    category: p.category || null,
    solved: p.solved ?? undefined,
    fileSize: p.fileSize || undefined,
  };
}

export async function getModuleItems(module: ModuleSlug): Promise<ContentItem[]> {
  try {
    const posts = await prisma.post.findMany({
      where: { module, published: true },
      orderBy: { date: "desc" },
    });
    return posts.map(formatPost);
  } catch {
    return [];
  }
}

export async function getLatest(module: ModuleSlug, n = 3): Promise<ContentItem[]> {
  const items = await getModuleItems(module);
  return items.slice(0, n);
}

export async function getBySlug(module: ModuleSlug, slug: string): Promise<ContentItem | null> {
  try {
    const post = await prisma.post.findUnique({
      where: { module_slug: { module, slug } },
    });
    return post ? formatPost(post) : null;
  } catch {
    return null;
  }
}

export async function getAllAcross(): Promise<ContentItem[]> {
  try {
    const posts = await prisma.post.findMany({
      where: { published: true },
      orderBy: { date: "desc" },
    });
    return posts.map(formatPost);
  } catch {
    return [];
  }
}

export async function getRelated(current: ContentItem, limit = 6): Promise<ContentItem[]> {
  const tagSet = new Set(current.tags);
  const pool = await getAllAcross();
  const filtered = pool.filter(c => c.slug !== current.slug);

  // Score by tag overlap + same category
  const scored = filtered
    .map(c => ({
      c,
      score:
        c.tags.filter(t => tagSet.has(t)).length * 3 +
        (c.category === current.category ? 1 : 0) +
        (c.module !== current.module ? 0.5 : 0),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(x => x.c);

  // Fallback: if not enough, add more from different modules
  if (scored.length < limit) {
    const extra = filtered
      .filter(c => !scored.includes(c))
      .slice(0, limit - scored.length);
    scored.push(...extra);
  }

  return scored;
}

export async function searchAcross(q: string): Promise<ContentItem[]> {
  const s = q.trim().toLowerCase();
  if (!s) return [];
  try {
    const posts = await prisma.post.findMany({
      where: {
        published: true,
        OR: [
          { title: { contains: s, mode: "insensitive" } },
          { excerpt: { contains: s, mode: "insensitive" } },
        ],
      },
      orderBy: { date: "desc" },
    });
    return posts.map(formatPost);
  } catch {
    return [];
  }
}

export async function getCommentCount(module: string, slug: string): Promise<number> {
  try {
    const post = await prisma.post.findUnique({
      where: { module_slug: { module: module as ModuleSlug, slug } },
      select: { id: true },
    });
    if (!post) return 0;
    const count = await prisma.comment.count({ where: { postId: post.id } });
    return count;
  } catch {
    return 0;
  }
}

export const moduleMeta: Record<ModuleSlug, { title: string; titleFa: string; color: string; href: string }> = {
  blog: { title: "blog", titleFa: "مجله", color: moduleColors.blog.active, href: "/blog" },
  news: { title: "news", titleFa: "اخبار", color: moduleColors.news.active, href: "/news" },
  media: { title: "media", titleFa: "رسانه", color: moduleColors.media.active, href: "/media" },
  review: { title: "review", titleFa: "نقد و بررسی", color: moduleColors.review.active, href: "/review" },
  tools: { title: "tools", titleFa: "ابزارها", color: moduleColors.tools.active, href: "/tools" },
  download: { title: "download", titleFa: "دانلود", color: moduleColors.download.active, href: "/download" },
  shop: { title: "shop", titleFa: "فروشگاه", color: moduleColors.shop.active, href: "/shop" },
  forum: { title: "forum", titleFa: "انجمن", color: moduleColors.forum.active, href: "/forum" },
  timeline: { title: "timeline", titleFa: "تایم‌لاین فناوری", color: moduleColors.timeline.active, href: "/timeline" },
};