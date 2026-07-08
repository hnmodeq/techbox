import { prisma } from "@/lib/db";
import type { ModuleSlug } from "@/lib/content";

function safeJsonArray(value: string | null | undefined): string[] {
  if (!value) return [];
  try { const parsed = JSON.parse(value); return Array.isArray(parsed) ? parsed : []; } catch { return []; }
}

function safeJsonObject(value: string | null | undefined): Record<string, unknown> {
  if (!value) return {};
  try { const parsed = JSON.parse(value); return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {}; } catch { return {}; }
}

export async function getDbPost(module: ModuleSlug, slug: string) {
  if (!process.env.DATABASE_URL) return null;
  try {
    const p = await prisma.post.findUnique({
      where: { module_slug: { module, slug } },
      include: { author: { select: { name: true, role: true, roleFa: true, avatar: true, username: true } } },
    });
    if (!p || !p.published || p.deletedAt !== null) return null;
    return {
      id: p.id,
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
      author: { name: p.author?.name || p.authorName, role: p.author?.roleFa || p.author?.role || "", avatar: p.author?.avatar || "", username: p.author?.username || "" },
      date: p.date.toISOString(),
      date_fa: p.dateFa,
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
      solved: p.solved,
    };
  } catch {
    return null;
  }
}
