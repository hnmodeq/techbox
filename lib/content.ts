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
};

import blogData from "@/prisma/mock-data/blog.json";
import newsData from "@/prisma/mock-data/news.json";
import mediaData from "@/prisma/mock-data/media.json";
import reviewData from "@/prisma/mock-data/review.json";
import toolsData from "@/prisma/mock-data/tools.json";
import downloadData from "@/prisma/mock-data/download.json";
import shopData from "@/prisma/mock-data/shop.json";
import forumData from "@/prisma/mock-data/forum.json";
import commentsData from "@/prisma/mock-data/comments.json";
import { moduleColors } from "@/config/module-colors";

const all: Record<ModuleSlug, ContentItem[]> = {
  blog: blogData as unknown as ContentItem[],
  news: newsData as unknown as ContentItem[],
  media: mediaData as unknown as ContentItem[],
  review: reviewData as unknown as ContentItem[],
  tools: toolsData as unknown as ContentItem[],
  download: downloadData as unknown as ContentItem[],
  shop: shopData as unknown as ContentItem[],
  forum: forumData as unknown as ContentItem[],
  timeline: [],
};

export function getModuleItems(module: ModuleSlug): ContentItem[] {
  return [...(all[module] || [])].sort((a, b) => +new Date(b.date) - +new Date(a.date));
}

export function getLatest(module: ModuleSlug, n = 3) {
  return getModuleItems(module).slice(0, n);
}

export function getBySlug(module: ModuleSlug, slug: string) {
  return getModuleItems(module).find(i => i.slug === slug) || null;
}

export function getAllAcross(): ContentItem[] {
  return (Object.keys(all) as ModuleSlug[])
    .flatMap(m => getModuleItems(m))
    .sort((a, b) => +new Date(b.date) - +new Date(a.date));
}

export function getRelated(current: ContentItem, limit = 6): ContentItem[] {
  const tagSet = new Set(current.tags);
  const pool = getAllAcross().filter(
    c => c.slug !== current.slug && c.tags.some(t => tagSet.has(t))
  );
  // fallback: same category / module
  if (pool.length < limit) {
    const extra = getAllAcross().filter(
      c => c.slug !== current.slug && !pool.includes(c) && (c.category === current.category || c.module !== current.module)
    );
    pool.push(...extra);
  }
  // score
  return pool
    .map(c => ({
      c,
      score: c.tags.filter(t => tagSet.has(t)).length * 3 +
        (c.category === current.category ? 1 : 0) +
        (c.module !== current.module ? 0.5 : 0)
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(x => x.c);
}

export function searchAcross(q: string) {
  const s = q.trim().toLowerCase();
  if (!s) return [];
  return getAllAcross().filter(
    c =>
      c.title.toLowerCase().includes(s) ||
      c.excerpt.toLowerCase().includes(s) ||
      c.tags.some(t => t.toLowerCase().includes(s))
  );
}

export function getCommentCount(module: string, slug: string): number {
  const count = (commentsData as any[]).filter(c => c.content_type === module && c.content_slug === slug).length;
  return count > 0 ? count : 0;
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
