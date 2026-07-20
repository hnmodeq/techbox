import { prisma } from "@/lib/db";
import { unstable_cache } from "next/cache";
import type { HomeData } from "@/features/home/lib/home-data";
import { formatPostDateFa, publicPostDateWhere } from "@/lib/post-date";
import { estimateReadingMinutes, formatReadingTime } from "@/lib/reading-time";
import { getEnabledModules } from "@/lib/module-config";

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
  content: true,
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
  acceptedCommentId: true,
  fileName: true,
  fileSize: true,
  downloadCount: true,
  category: true,
  brand: true,
  model: true,
  priceLabel: true,
  availability: true,
  authorName: true,
  author: { select: { name: true, username: true, role: true, roleFa: true, job: true, avatar: true, verifiedType: true, verifiedLabel: true } },
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
    content: p.content,
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
    comments: 0, // filled in after by findPosts
    rating: p.rating ?? null,
    ratingCount: p.ratingCount || 0,
    readingTime: estimateReadingMinutes(p.title, p.excerpt, p.content),
    readingTimeLabel: formatReadingTime(estimateReadingMinutes(p.title, p.excerpt, p.content)),
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
        job: p.author?.job || "",
        avatar: p.author?.avatar || "",
        verifiedType: (p.author as any)?.verifiedType || null,
        verifiedLabel: (p.author as any)?.verifiedLabel || null,
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
  const normalized = posts.map(normalizeCard);

  // Fetch comment counts in bulk for this module's posts
  try {
    const postIds = posts.map(p => p.id);
    const commentCounts = await prisma.comment.groupBy({
      by: ["postId"],
      _count: { _all: true },
      where: { postId: { in: postIds }, status: "approved" },
    });
    const commentMap = new Map(
      commentCounts.map(c => [c.postId, c._count._all || 0])
    );
    for (const item of normalized) {
      const post = posts.find(p => p.slug === item.slug);
      if (post) (item as any).comments = commentMap.get(post.id) || 0;
    }
  } catch {
    // If comment count fetch fails, just leave it at 0
  }

  // For forum topics, enrich with the accepted (best) answer snippet so the
  // home row can preview it. Only posts with an acceptedCommentId resolve.
  try {
    const acceptedIds = posts
      .map(p => p.acceptedCommentId)
      .filter((id): id is string => typeof id === "string" && id.length > 0);
    if (acceptedIds.length > 0) {
      const acceptedComments = await prisma.comment.findMany({
        where: { id: { in: acceptedIds }, deletedAt: null },
        select: {
          id: true,
          text: true,
          authorId: true,
          authorName: true,
          author: { select: { name: true, username: true, avatar: true } },
        },
      });
      const acceptedMap = new Map(acceptedComments.map(c => [c.id, c]));
      for (const item of normalized) {
        const post = posts.find(p => p.slug === item.slug);
        const accId = post?.acceptedCommentId;
        if (accId && acceptedMap.has(accId)) {
          const c = acceptedMap.get(accId)!;
          (item as any).acceptedAnswer = {
            text: c.text,
            author: {
              name: c.author?.name || c.authorName || "کاربر",
              username: c.author?.username || "",
              avatar: c.author?.avatar || "",
            },
          };
        }
      }
    }
  } catch {
    // Non-fatal: best-answer preview just won't render.
  }

  return normalized;
}

async function getHomeDataUncached(): Promise<HomeData> {
  // Get enabled modules from DB config
  const enabledModules = await getEnabledModules();

  // Filter moduleTakes to only include enabled modules
  const activeModuleTakes = Object.fromEntries(
    Object.entries(moduleTakes).filter(([module]) => enabledModules.includes(module as any))
  );

  const entries = await Promise.all(
    Object.entries(activeModuleTakes).map(async ([module, take]) => [module, await findPosts(module, take)] as const)
  );
  const modules = Object.fromEntries(entries) as HomeData["modules"];

  // Ticker: only include posts from enabled modules
  const tickerPosts = await prisma.post.findMany({
    where: { published: true, deletedAt: null, module: { in: enabledModules }, date: publicPostDateWhere() },
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

// Cached for 1 day so the layout can SSR real homepage data on every request
// without hitting the database on each navigation (kills the loading flash).
const cachedHomeData = unstable_cache(getHomeDataUncached, ["home-data-v4"], {
  revalidate: 86400,
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
