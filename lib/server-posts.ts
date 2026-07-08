import { prisma } from "@/lib/db";
import type { ModuleSlug, ContentItem } from "@/lib/content";

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
            avatar: true,
          },
        },
      },
    });

    return posts.map((p) => ({
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
      gallery: safeJsonArray(p.gallery),
      tags: safeJsonArray(p.tags),
      author: {
        name: p.author?.name || p.authorName || "کاربر تکباکس",
        role: p.author?.roleFa || p.author?.role || "",
        avatar: p.author?.avatar || "",
      },
      date: p.date.toISOString(),
      date_fa: p.dateFa || new Intl.DateTimeFormat("fa-IR", { dateStyle: "long" }).format(p.date),
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
      specs: safeJsonObject(p.specs),
      rating: p.rating,
      ratingCount: p.ratingCount,
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
