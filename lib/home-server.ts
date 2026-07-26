import { prisma } from "@/lib/db";
import { unstable_cache } from "next/cache";
import type { HomeData } from "@/features/home/lib/home-data";
import { formatPostDateFa, publicPostDateWhere } from "@/lib/post-date";
import { estimateReadingMinutes, formatReadingTime } from "@/lib/reading-time";
import { getEnabledModules } from "@/lib/module-config";
import {
  getInsights,
  getDeals,
  getTopPicks,
  getTimeline,
  getFamilyComments,
  getMoreToExplore,
  getAuthors,
} from "@/lib/home-sections";
import { getSettings } from "@/lib/settings";

const moduleTakes: Record<string, number> = {
  blog: 5,   // §1 lead + 4-item list (Spiceworks Articles)
  media: 10, // §2 video rail
  shop: 8,   // §7 deals grid (4-up x 2 rows)
  forum: 6,  // §9 featured + 5-row list
  review: 3, // §5 top picks
  download: 8,
  news: 15,
};

const layoutCardSelect = {
  id: true,
  slug: true,
  module: true,
  title: true,
  excerpt: true,
  image: true,
  date: true,
  likes: true,
  views: true,
  authorName: true,
  author: { select: { name: true, username: true, role: true, roleFa: true, job: true, avatar: true, verifiedType: true, verifiedLabel: true } },
} as const;

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
  priceAmount: true,
  discountPercent: true,
  discountEndsAt: true,
  availability: true,
  warranty: true,
  specs: true,
  reviewedProductId: true,
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
    priceAmount: (p as any).priceAmount ?? null,
    discountPercent: (p as any).discountPercent ?? null,
    discountEndsAt: (p as any).discountEndsAt ? (p as any).discountEndsAt.toISOString() : null,
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

async function getLayoutHomeDataUncached(): Promise<HomeData> {
  const enabledModules = await getEnabledModules();
  let news: any[] = [];
  let ticker: any[] = [];
  try {
    if (enabledModules.includes("news" as any)) {
      news = await prisma.post.findMany({
        where: { module: "news", published: true, deletedAt: null, date: publicPostDateWhere() },
        orderBy: { date: "desc" },
        take: moduleTakes.news,
        select: layoutCardSelect,
      });
    }
    ticker = await prisma.post.findMany({
      where: { published: true, deletedAt: null, module: { in: enabledModules }, date: publicPostDateWhere() },
      orderBy: { date: "desc" },
      take: 30,
      select: layoutCardSelect,
    });
  } catch (error) {
    console.error("[layout-data] Failed to load news/ticker data:", error);
  }

  const normalizedNews = news.map(normalizeCard);
  if (news.length > 0) {
    try {
      const counts = await prisma.comment.groupBy({
        by: ["postId"],
        _count: { _all: true },
        where: { postId: { in: news.map((post) => post.id) }, status: "approved" },
      });
      const countMap = new Map(counts.map((entry) => [entry.postId, entry._count._all || 0]));
      normalizedNews.forEach((item, index) => { item.comments = countMap.get(news[index].id) || 0; });
    } catch (error) {
      console.error("[layout-data] Failed to count news comments:", error);
    }
  }

  return {
    modules: { news: normalizedNews },
    ticker: ticker.map(normalizeCard),
    generatedAt: new Date().toISOString(),
  };
}

const cachedLayoutHomeData = unstable_cache(getLayoutHomeDataUncached, ["layout-home-data-v1"], {
  revalidate: 86400,
  tags: ["home-data"],
});

export async function getLayoutHomeData(): Promise<HomeData> {
  try {
    return await cachedLayoutHomeData();
  } catch (error) {
    console.error("[layout-data] Falling back to empty layout data:", error);
    return { modules: {}, ticker: [], generatedAt: new Date().toISOString() };
  }
}

/** Exported for scripts/tests: unstable_cache needs a Next request context,
 *  so verification harnesses call this directly. */
export async function getHomeDataUncached(): Promise<HomeData> {
  // Get enabled modules from DB config
  const enabledModules = await getEnabledModules();

  // Filter moduleTakes to only include enabled modules
  const activeModuleTakes = Object.fromEntries(
    Object.entries(moduleTakes).filter(([module]) => enabledModules.includes(module as any))
  );

  // Sequential to avoid P2024 pool exhaustion – was Promise.all of 7 modules each doing 2-3 queries = up to 21 concurrent
  const modules: Record<string, any> = {};
  let moduleFailures = 0;
  for (const [module, take] of Object.entries(activeModuleTakes)) {
    try {
      modules[module] = await findPosts(module, take as number);
    } catch (e) {
      moduleFailures++;
      modules[module] = [];
      console.error(`[home-data] module "${module}" failed:`, e);
    }
  }

  // If EVERY module query failed, the database is unreachable or the pool
  // is exhausted — this is not a genuinely empty site. Throwing here is
  // deliberate: unstable_cache does not store a rejected promise, so the
  // next request retries instead of serving a blank homepage for the full
  // revalidate window. Caching a transient failure is how a one-off pool
  // timeout turns into an hour of empty page.
  const moduleCount = Object.keys(activeModuleTakes).length;
  if (moduleCount > 0 && moduleFailures === moduleCount) {
    throw new Error("home-data: all module queries failed — refusing to cache an empty homepage");
  }

  // Ticker: only include posts from enabled modules
  let tickerPosts: any[] = [];
  try {
    tickerPosts = await prisma.post.findMany({
      where: { published: true, deletedAt: null, module: { in: enabledModules }, date: publicPostDateWhere() },
      orderBy: { date: "desc" },
      take: 30,
      select: cardSelect,
    });
  } catch {
    tickerPosts = [];
  }

  // ── Homepage upgrade sections ───────────────────────────────────────
  // Sequential for the same reason as the module loop above: parallelising
  // these would put ~12 more concurrent queries on the Neon pool and
  // reproduce the P2024 exhaustion this file was already fixed for.
  //
  // Every block is individually try/caught. One failing section must
  // degrade to "section hidden", never take down the whole homepage.

  const sidebarNewsSlugs = (modules.news ?? []).slice(0, 5).map((n: any) => n.slug);

  let insights: any[] = [];
  try {
    insights = await getInsights(sidebarNewsSlugs, normalizeCard, cardSelect);
  } catch (e) {
    console.error("[home-data] insights failed:", e);
  }

  let topPicks: any[] = [];
  try {
    topPicks = await getTopPicks(normalizeCard, cardSelect);
  } catch (e) {
    console.error("[home-data] topPicks failed:", e);
  }

  // §7 Deals replaces the raw shop slice: prices must be resolved through
  // the currency pipeline, which the generic findPosts() does not do.
  try {
    const deals = await getDeals(normalizeCard, cardSelect, moduleTakes.shop ?? 8);
    if (deals.length) modules.shop = deals;
  } catch (e) {
    console.error("[home-data] deals failed:", e);
  }

  let timeline: any[] = [];
  try {
    timeline = await getTimeline();
  } catch (e) {
    console.error("[home-data] timeline failed:", e);
  }

  // Homepage SiteSetting keys, read as one batch.
  let homeSettings: Record<string, string> = {};
  try {
    homeSettings = await getSettings([
      "home.familyComments.blocklist",
      "home.finder.chips",
      "home.tools.featured",
    ]);
  } catch (e) {
    console.error("[home-data] settings failed:", e);
  }

  const parseJsonArray = (raw: string | undefined): any[] => {
    if (!raw) return [];
    try {
      const v = JSON.parse(raw);
      return Array.isArray(v) ? v : [];
    } catch {
      return []; // malformed setting must not hide a section
    }
  };

  const finderChips = parseJsonArray(homeSettings["home.finder.chips"])
    .filter((c) => c && typeof c.labelFa === "string" && typeof c.href === "string");
  const toolsFeatured = parseJsonArray(homeSettings["home.tools.featured"])
    .filter((x) => typeof x === "string");

  let familyComments: any[] = [];
  try {
    const raw = homeSettings["home.familyComments.blocklist"];
    let blocklist: string[] = [];
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) blocklist = parsed.filter((x) => typeof x === "string");
      } catch {
        // Malformed setting: ignore the blocklist rather than hide the section.
      }
    }
    familyComments = await getFamilyComments(blocklist);
  } catch (e) {
    console.error("[home-data] familyComments failed:", e);
  }

  let moreToExplore: any = { hero: null, cards: [] };
  try {
    moreToExplore = await getMoreToExplore(normalizeCard, cardSelect);
  } catch (e) {
    console.error("[home-data] moreToExplore failed:", e);
  }

  let authors: any[] = [];
  try {
    authors = await getAuthors();
  } catch (e) {
    console.error("[home-data] authors failed:", e);
  }

  return {
    modules: modules as HomeData["modules"],
    ticker: tickerPosts.map(normalizeCard),
    generatedAt: new Date().toISOString(),
    insights,
    topPicks,
    timeline,
    familyComments,
    moreToExplore,
    authors,
    finderChips,
    toolsFeatured,
  };
}

// Cache key bumped v5 -> v6: the payload shape changed.
// Window shortened 24h -> 1h so the hourly-seeded random slots in §10 and
// §11 actually rotate; seededIndex() is keyed to the same hour boundary.
const cachedHomeData = unstable_cache(getHomeDataUncached, ["home-data-v6"], {
  revalidate: 3600,
  tags: ["home-data"],
});

export async function getHomeData(): Promise<HomeData> {
  try {
    return await cachedHomeData();
  } catch (e) {
    // Database unreachable → render an empty page rather than a 500. This
    // result is NOT cached (the throw above prevents that), so the next
    // request retries. Logged loudly because a silently blank homepage is
    // very hard to diagnose from the outside.
    console.error("[home-data] unavailable, serving empty homepage:", e);
    return { modules: {}, ticker: [], generatedAt: new Date().toISOString() };
  }
}
