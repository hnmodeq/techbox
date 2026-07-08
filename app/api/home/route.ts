import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { cacheHeaders, PUBLIC_CONTENT_CACHE, PRIVATE_NO_STORE } from "@/lib/cache-headers";

const moduleTakes: Record<string, number> = {
  blog: 5,
  media: 7,
  shop: 5,
  forum: 6,
  review: 5,
  download: 8,
  news: 15,
};

function safeJsonArray(value: string | null | undefined): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

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

function firstGalleryImage(value: string | null | undefined) {
  return safeJsonArray(value).slice(0, 3);
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
    // Keep a tiny gallery preview only; full gallery is loaded on detail page.
    gallery: firstGalleryImage(p.gallery),
    // Keep tags for ticker/suggestions/search entry points but not heavy fields.
    tags: safeJsonArray(p.tags).slice(0, 8),
    date: p.date.toISOString(),
    date_fa: p.dateFa || new Intl.DateTimeFormat("fa-IR", { dateStyle: "long" }).format(p.date),
    dateFa: p.dateFa,
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
    where: { module, published: true, deletedAt: null },
    orderBy: { date: "desc" },
    take,
    select: cardSelect,
  });
  return posts.map(normalizeCard);
}

export async function GET() {
  try {
    const entries = await Promise.all(
      Object.entries(moduleTakes).map(async ([module, take]) => [module, await findPosts(module, take)] as const)
    );
    const modules = Object.fromEntries(entries);

    const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const tickerPosts = await prisma.post.findMany({
      where: {
        published: true,
        deletedAt: null,
        module: { not: "news" },
        date: { gte: cutoff },
      },
      orderBy: { date: "desc" },
      take: 30,
      select: cardSelect,
    });

    return NextResponse.json({
      modules,
      ticker: tickerPosts.map(normalizeCard),
      generatedAt: new Date().toISOString(),
    }, { headers: cacheHeaders(PUBLIC_CONTENT_CACHE) });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "home_failed", modules: {}, ticker: [] }, { status: 503, headers: cacheHeaders(PRIVATE_NO_STORE) });
  }
}

export const dynamic = "force-dynamic";
export const revalidate = 60;
