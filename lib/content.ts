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
  videoUrl?: string | null;
  videoDuration?: string | null;
  videoMimeType?: string | null;
  videoFileSize?: string | null;
  gallery?: string[];
  tags: string[];
  author: { name: string; role?: string; job?: string; avatar?: string; username?: string };
  readingTime?: number;
  readingTimeLabel?: string;
  date: string; // ISO
  date_fa: string;
  time?: string;
  source?: string;
  likes: number;
  views: number;
  comments?: number;
  category?: string;
  seoTitle?: string | null;
  seoDescription?: string | null;
  brand?: string | null;
  model?: string | null;
  sku?: string | null;
  priceLabel?: string | null;
  availability?: string | null;
  warranty?: string | null;
  specs?: Record<string, unknown> | null;
  rating?: number | null;
  ratingCount?: number;
  fileName?: string | null;
  fileUrl?: string | null;
  fileSize?: string | null;
  downloadCount?: number;
  versions?: Array<Record<string, unknown>>;
};

import { moduleMap } from "@/config/modules.config";

const all: Record<ModuleSlug, ContentItem[]> = {
  blog: [],
  news: [],
  media: [],
  review: [],
  tools: [],
  download: [],
  shop: [],
  forum: [],
  timeline: [],
};

// Single source of truth for per-module presentation metadata. Derived from
// config/modules.config.ts (the canonical module registry) so there is exactly
// one place to define a module's title/color/route — not three.
const CONTENT_MODULE_SLUGS = Object.keys(all) as ModuleSlug[];

// The canonical content modules are the 9 module tiles defined in
// config/modules.config.ts. Derive presentation metadata from there.
const contentModuleDefs = Object.values(moduleMap).filter((m) =>
  CONTENT_MODULE_SLUGS.includes(m.slug as ModuleSlug)
);

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

// The real comment count is fetched live from the database by the stats
// provider (see app/api/stats). We intentionally return 0 here so the
// server-rendered initial never shows a fabricated number; the bulk
// /api/stats request replaces it with the real count on the client.
export function getCommentCount(_module: string, _slug: string): number {
  return 0;
}

export const moduleMeta: Record<
  ModuleSlug,
  { title: string; titleFa: string; color: string; href: string }
> = Object.fromEntries(
  contentModuleDefs.map((m) => [
    m.slug,
    { title: m.title, titleFa: m.titleFa, color: m.color, href: m.href },
  ])
) as Record<ModuleSlug, { title: string; titleFa: string; color: string; href: string }>;
