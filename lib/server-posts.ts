import { prisma } from "@/lib/db";
import type { ModuleSlug, ContentItem } from "@/lib/content";
import { formatPostDateFa, publicPostDateWhere } from "@/lib/post-date";
import { estimateReadingMinutes, formatReadingTime } from "@/lib/reading-time";

export async function getDbModulePosts(
  module: ModuleSlug,
  take: number = 50
): Promise<ContentItem[]> {
  if (!process.env.DATABASE_URL) return [];

  try {
    const posts = await prisma.post.findMany({
      where: {
        module,
        published: true,
        deletedAt: null,
        date: publicPostDateWhere(),
      },
      orderBy: { date: "desc" },
      take,
      include: {
        author: {
          select: {
            name: true,
            username: true,
            role: true,
            roleFa: true,
            job: true,
            avatar: true,
            verifiedType: true,
            verifiedLabel: true,
          },
        },
      },
    });

    return posts.map((p: any) => ({
      slug: p.slug,
      module: p.module as ModuleSlug,
      title: p.title,
      excerpt: p.excerpt,
      content: p.content,
      image: p.image || undefined,
      videoUrl: p.videoUrl,
      videoDuration: p.videoDuration,
      videoMimeType: p.videoMimeType,
      videoFileSize: p.videoFileSize,
      gallery: Array.isArray(p.gallery) ? (p.gallery as string[]) : [],
      tags: Array.isArray(p.tags) ? (p.tags as string[]) : [],
      author: {
        name: p.author?.name || p.authorName || "کاربر تکباکس",
        role: p.author?.roleFa || p.author?.role || "",
        job: p.author?.job || "",
        username: p.author?.username || "",
        avatar: p.author?.avatar || "",
        verifiedType: p.author?.verifiedType || null,
        verifiedLabel: p.author?.verifiedLabel || null,
      },
      date: p.date.toISOString(),
      date_fa: formatPostDateFa(p.date),
      time: undefined,
      source: undefined,
      likes: p.likes,
      views: p.views,
      category: p.category || undefined,
      seoTitle: p.seoTitle,
      seoDescription: p.seoDescription,
      brand: p.brand,
      model: p.model,
      sku: p.sku,
      priceLabel: p.priceLabel,
      availability: p.availability,
      warranty: p.warranty,
      specs: (p.specs && typeof p.specs === "object" && !Array.isArray(p.specs)) ? p.specs : {},
      rating: p.rating,
      ratingCount: p.ratingCount,
      readingTime: estimateReadingMinutes(p.title, p.excerpt, p.content),
      readingTimeLabel: formatReadingTime(estimateReadingMinutes(p.title, p.excerpt, p.content)),
      fileName: p.fileName,
      fileUrl: p.fileUrl,
      fileSize: p.fileSize,
      downloadCount: p.downloadCount,
      solved: p.solved ?? undefined,
    }));
  } catch (error) {
    console.error(`[server-posts] Failed to fetch ${module}:`, error);
    return [];
  }
}

export async function getAllDbModulePosts(takePerModule = 30) {
  const modules: ModuleSlug[] = ["blog", "news", "media", "review", "download", "shop", "forum"];
  const results = await Promise.all(
    modules.map(async (m) => [m, await getDbModulePosts(m, takePerModule)] as const)
  );
  return Object.fromEntries(results);
}
