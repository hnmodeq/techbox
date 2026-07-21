import { prisma } from "@/lib/db";
import type { ModuleSlug, ContentItem } from "@/lib/content";
import { formatPostDateFa, publicPostDateWhere } from "@/lib/post-date";
import { estimateReadingMinutes, formatReadingTime } from "@/lib/reading-time";
import { getCurrencyRates, calculateFinalTomanPrice, type CurrencyCode } from "@/lib/currency";

export async function getDbModulePosts(
  module: ModuleSlug,
  take: number = 50
): Promise<ContentItem[]> {
  if (!process.env.DATABASE_URL) return [];

  try {
    const [posts, rates] = await Promise.all([
      prisma.post.findMany({
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
      }),
      module === "shop" ? getCurrencyRates() : Promise.resolve(null),
    ]);

    return posts.map((p: any) => {
      let finalPriceAmount = p.priceAmount ?? null;
      // If source price exists, calculate final Toman
      if (module === "shop" && p.sourcePriceAmount && p.sourcePriceAmount > 0 && rates) {
        finalPriceAmount = calculateFinalTomanPrice({
          sourcePrice: p.sourcePriceAmount,
          sourceCurrency: (p.sourceCurrency as CurrencyCode) || "USD",
          productAdjustmentPercent: p.priceAdjustmentPercent ?? 0,
          rates: rates as any,
        });
      }

      return {
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
        priceAmount: finalPriceAmount,
        sourcePriceAmount: p.sourcePriceAmount ?? null,
        sourceCurrency: p.sourceCurrency ?? null,
        priceAdjustmentPercent: p.priceAdjustmentPercent ?? null,
        discountPercent: p.discountPercent ?? null,
        discountEndsAt: p.discountEndsAt ? p.discountEndsAt.toISOString() : null,
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
      };
    });
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
