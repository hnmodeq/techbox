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
  author: {
    name: string;
    role?: string;
    job?: string;
    avatar?: string;
    username?: string;
    verifiedType?: string | null;
    verifiedLabel?: string | null;
  };
  readingTime?: number;
  readingTimeLabel?: string;
  date: string;
  date_fa: string;
  time?: string;
  source?: string;
  likes: number;
  views: number;
  comments?: number;
  /** Forum-only latest real contribution, attached by the homepage query. */
  lastActivity?: {
    date: string;
    author: {
      name: string;
      username?: string;
      avatar?: string;
      job?: string;
      verifiedType?: string | null;
    };
  };
  category?: string;
  seoTitle?: string | null;
  seoDescription?: string | null;
  brand?: string | null;
  model?: string | null;
  sku?: string | null;
  priceLabel?: string | null;
  priceAmount?: number | null;
  discountPercent?: number | null;
  discountEndsAt?: string | null;
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

const CONTENT_MODULE_SLUGS: ModuleSlug[] = [
  "blog",
  "news",
  "media",
  "review",
  "tools",
  "download",
  "shop",
  "forum",
  "timeline",
];

// Module presentation metadata has one source of truth. Content itself is
// database-backed; the retired in-memory/static content fallback was removed.
const contentModuleDefs = Object.values(moduleMap).filter((module) =>
  CONTENT_MODULE_SLUGS.includes(module.slug as ModuleSlug)
);

export const moduleMeta: Record<
  ModuleSlug,
  { title: string; titleFa: string; color: string; href: string }
> = Object.fromEntries(
  contentModuleDefs.map((module) => [
    module.slug,
    {
      title: module.title,
      titleFa: module.titleFa,
      color: module.color,
      href: module.href,
    },
  ])
) as Record<ModuleSlug, { title: string; titleFa: string; color: string; href: string }>;
