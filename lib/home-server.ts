import { prisma } from "@/lib/db";
import { unstable_cache } from "next/cache";
import type { HomeData } from "@/features/home/lib/home-data";
import { formatPostDateFa, publicPostDateWhere } from "@/lib/post-date";

const moduleTakes: Record<string, number> = {
  blog: 5,
  media: 7,
  shop: 5,
  forum: 6,
  review: 5,
  download: 8,
  news: 15,
};

const cardSelect = {
  id: true,
  slug: true,
  module: true,
  title: true,
  excerpt: true,
  image: true,
  videoUrl: true,
  videoDuration: true,
  videoMimeType: true,
  videoFileSize: true,
  gallery: true,
  tags: true,
  date: true,
  dateFa: true,
  likes: true,
  views: true,
  rating: true,
  ratingCount: true,
  solved: true,
  fileName: true,
  fileSize: true,
  downloadCount: true,
  category: true,
  brand: true,
  model: true,
  priceLabel: true,
  availability: true,
  authorName: true,
  author: { select: { name: true, username: true, role: true, roleFa: true, avatar: true } },
} as const;

function firstGalleryImage(value: unknown) {
  return Array.isArray(value) ? value.slice(0, 3) : [];
}

function normalizeCard(p: any) {
  return {
    id: p.id,
    slug: p.slug,
    module: p.module,
    title: p.title,
    excerpt: p.excerpt,
    image: p.image,
    videoUrl: p.videoUrl,
    videoDuration: p.videoDuration,
    videoMimeType: p.videoMimeType,
    videoFileSize: p.videoFileSize,
    gallery: firstGalleryImage(p.gallery),
    tags: Array.isArray(p.tags) ? p.tags.slice(0, 8) : [],
    date: p.date.toISOString(),
    date_fa: formatPostDateFa(p.date),
    dateFa: formatPostDateFa(p.date),
    likes: p.likes,
    views: p.views,
    rating: p.rating ?? null,
    ratingCount: p.ratingCount || 0,
    solved: p.solved ?? false,
    fileName: p.fileName,
    fileSize: p.fileSize,
    downloadCount: p.downloadCount || 0,
    published: true,
    category: p.category,
    brand: p.brand,
    model: p.model,
    priceLabel: p.priceLabel,
    availability: p.availability,
    author: {
      name: p.author?.name || p.authorName || "کاربر تکباکس",
      username: p.author?.username || "",
      role: p.author?.roleFa || p.author?.role || "عضو انجمن",
      avatar: p.author?.avatar || "",
    },
  };
}

async function findPosts(module: string, take: number) {
  const posts = await prisma.post.findMany({
    where: { module, published: true, deletedAt: null, date: publicPostDateWhere() },
    orderBy: { date: "desc" },
    take,
    select: cardSelect,
  });
  return posts.map(normalizeCard);
}

async function getHomeDataUncached(): Promise<HomeData> {
  const entries = await Promise.all(
    Object.entries(moduleTakes).map(async ([module, take]) => [module, await findPosts(module, take)] as const)
  );
  const modules = Object.fromEntries(entries) as HomeData["modules"];

  const tickerPosts = await prisma.post.findMany({
    where: { published: true, deletedAt: null, date: publicPostDateWhere() },
    orderBy: { date: "desc" },
    take: 30,
    select: cardSelect,
  });

  return {
    modules,
    ticker: tickerPosts.map(normalizeCard),
    generatedAt: new Date().toISOString(),
  };
}

// Cached for 60s so the layout can SSR real homepage data on every request
// without hitting the database on each navigation (kills the loading flash).
const cachedHomeData = unstable_cache(getHomeDataUncached, ["home-data-v1"], {
  revalidate: 60,
  tags: ["home-data"],
});

export async function getHomeData(): Promise<HomeData> {
  try {
    return await cachedHomeData();
  } catch {
    // Database unavailable → fall back to empty; the client provider simply
    // shows no rows instead of crashing the whole page.
    return { modules: {}, ticker: [], generatedAt: new Date().toISOString() };
  }
}
