import { prisma } from "@/lib/db";
import type { ModuleSlug } from "@/lib/content";
import { formatPostDateFa, isPublicPostDate } from "@/lib/post-date";

export async function getDbPost(module: ModuleSlug, slug: string) {
  if (!process.env.DATABASE_URL) return null;
  try {
    const p = await prisma.post.findUnique({
      where: { module_slug: { module, slug } },
      include: { author: { select: { name: true, role: true, roleFa: true, avatar: true, username: true } } },
    });
    if (!p || !p.published || p.deletedAt !== null || !isPublicPostDate(p.date)) return null;
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
      gallery: Array.isArray(p.gallery) ? p.gallery.filter((g: unknown): g is string => typeof g === "string") : [],
      tags: Array.isArray(p.tags) ? p.tags.filter((t: unknown): t is string => typeof t === "string") : [],
      author: { name: p.author?.name || p.authorName, role: p.author?.roleFa || p.author?.role || "", avatar: p.author?.avatar || "", username: p.author?.username || "" },
      date: p.date.toISOString(),
      date_fa: formatPostDateFa(p.date),
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
