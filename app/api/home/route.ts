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

function safeJsonObject(value: string | null | undefined): Record<string, unknown> {
  if (!value) return {};
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function normalizePost(p: any) {
  return {
    id: p.id,
    slug: p.slug,
    module: p.module,
    title: p.title,
    excerpt: p.excerpt,
    content: p.content,
    image: p.image,
    videoUrl: p.videoUrl,
    videoDuration: p.videoDuration,
    videoMimeType: p.videoMimeType,
    videoFileSize: p.videoFileSize,
    gallery: safeJsonArray(p.gallery),
    tags: safeJsonArray(p.tags),
    date: p.date.toISOString(),
    date_fa: p.dateFa || new Intl.DateTimeFormat("fa-IR", { dateStyle: "long" }).format(p.date),
    dateFa: p.dateFa,
    likes: p.likes,
    views: p.views,
    rating: p.rating ?? null,
    ratingCount: p.ratingCount || 0,
    solved: p.solved ?? false,
    fileName: p.fileName,
    fileUrl: p.fileUrl,
    fileSize: p.fileSize,
    downloadCount: p.downloadCount || 0,
    published: p.published,
    category: p.category,
    seoTitle: p.seoTitle,
    seoDescription: p.seoDescription,
    brand: p.brand,
    model: p.model,
    sku: p.sku,
    priceLabel: p.priceLabel,
    availability: p.availability,
    warranty: p.warranty,
    specs: safeJsonObject(p.specs),
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
    where: { module, published: true },
    orderBy: { date: "desc" },
    take,
    include: {
      author: { select: { name: true, username: true, role: true, roleFa: true, avatar: true } },
    },
  });
  return posts.map(normalizePost);
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
        module: { not: "news" },
        date: { gte: cutoff },
      },
      orderBy: { date: "desc" },
      take: 30,
      include: {
        author: { select: { name: true, username: true, role: true, roleFa: true, avatar: true } },
      },
    });

    return NextResponse.json({
      modules,
      ticker: tickerPosts.map(normalizePost),
      generatedAt: new Date().toISOString(),
    }, { headers: cacheHeaders(PUBLIC_CONTENT_CACHE) });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "home_failed", modules: {}, ticker: [] }, { status: 503, headers: cacheHeaders(PRIVATE_NO_STORE) });
  }
}

export const dynamic = "force-dynamic";
export const revalidate = 60;
