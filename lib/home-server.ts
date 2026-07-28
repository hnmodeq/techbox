import { randomInt } from "node:crypto";
import { prisma } from "@/lib/db";
import { unstable_cache } from "next/cache";
import type { HomeData } from "@/features/home/lib/home-data";
import type { ContentItem } from "@/lib/content";
import { formatPostDateFa, publicPostDateWhere } from "@/lib/post-date";
import { estimateReadingMinutes, formatReadingTime } from "@/lib/reading-time";
import { getEnabledModules, getModuleConfig } from "@/lib/module-config";
import {
  getLatestInsights,
  getLatestVideoHighlightComment,
  getDeals,
  getTopPicks,
  getTimeline,
  getFamilyComments,
  getMoreToExplore,
  getAuthors,
  getFamilyProfiles,
  getPartners,
} from "@/lib/home-sections";
import { getSettings } from "@/lib/settings";
import { logDbFailure, noteDbSuccess, isDbUnreachable } from "@/lib/db-error";
import { withCircuit, isCircuitOpenError } from "@/lib/db-circuit";

/**
 * Run one homepage section, degrading to a fallback instead of taking the
 * page down.
 *
 * Logs the FIRST failure per section and then stays quiet. These run on
 * every uncached render, so an unconditional console.error turns one
 * broken section into hundreds of identical stack traces and hides
 * whatever else is wrong.
 */
async function section<T>(name: string, fallback: T, run: () => Promise<T>): Promise<T> {
  const scope = `home-data:${name}`;
  try {
    const value = await withCircuit(run);
    noteDbSuccess(scope); // recovered — report the next failure immediately
    return value;
  } catch (e) {
    // The breaker already logged why it opened. Repeating it once per
    // section per render is the log flood this was built to prevent.
    if (!isCircuitOpenError(e)) logDbFailure(scope, e);
    return fallback;
  }
}

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

/**
 * Fields a homepage card actually renders.
 *
 * Egress discipline: every column listed here is transferred from Neon on
 * every uncached render, and the free plan meters that at 5 GB/month. Three
 * columns were previously selected and then silently dropped by
 * normalizeCard() — `specs`, `warranty` and `reviewedProductId`. `specs` is
 * the expensive one: QNAP product rows carry JSON blobs up to 40 kB each,
 * which made it 296 kB of the 361 kB the ticker query returned.
 *
 * Before adding a field, confirm normalizeCard() emits it and a component
 * reads it. `content` stays because estimateReadingMinutes() needs it.
 */
const cardSelect = {
  id: true,
  slug: true,
  module: true,
  title: true,
  excerpt: true,
  content: true, // reading-time estimate
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
  authorName: true,
  author: { select: { name: true, username: true, role: true, roleFa: true, job: true, avatar: true, verifiedType: true, verifiedLabel: true } },
} as const;

/**
 * The news ticker renders module, slug, title and a relative date — nothing
 * else. It previously reused the full cardSelect for 30 rows, transferring
 * 361 kB per homepage render to display four fields, 82% of it `specs`
 * blobs belonging to shop products the ticker does not even style
 * differently. This select returns the same 30 rows in 4.6 kB.
 */
const tickerSelect = {
  id: true,
  slug: true,
  module: true,
  title: true,
  date: true,
} as const;

function firstGalleryImage(value: unknown) {
  return Array.isArray(value) ? value.slice(0, 3) : [];
}

/**
 * Shape a ticker row into the ContentItem fields NewsTicker reads.
 *
 * Deliberately not normalizeCard(): that would spread `undefined` across
 * ~30 keys the trimmed select never fetched, and consumers distinguish
 * "absent" from "empty". The defaults here match normalizeCard's so the
 * client-side merge in home-data.tsx cannot regress a richer row.
 */
function normalizeTickerCard(p: any) {
  return {
    id: p.id,
    slug: p.slug,
    module: p.module,
    title: p.title,
    date: p.date.toISOString(),
    date_fa: formatPostDateFa(p.date),
    dateFa: formatPostDateFa(p.date),
    excerpt: "",
    image: undefined,
    tags: [] as string[],
    likes: 0,
    views: 0,
    comments: 0,
    published: true,
    author: { name: "", username: "", role: "", job: "", avatar: "", verifiedType: null, verifiedLabel: null },
  };
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
        // Byline shows the author's real job title; roleFa (site role) is
        // only a fallback when no job is set.
        role: p.author?.job?.trim() || p.author?.roleFa?.trim() || "",
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

/**
 * Return a new random sample without touching the input array.
 *
 * `crypto.randomInt()` is deliberate: unlike Math.random(), this selection
 * only exists in the server-rendered RSC payload, so it cannot cause a
 * client hydration mismatch. It also lets the four compact magazine cards
 * genuinely change on each full homepage refresh.
 */
function randomSample<T>(items: readonly T[], take: number): T[] {
  const sampled = [...items];
  const count = Math.min(Math.max(take, 0), sampled.length);

  for (let index = 0; index < count; index++) {
    const swapIndex = index + randomInt(sampled.length - index);
    [sampled[index], sampled[swapIndex]] = [sampled[swapIndex], sampled[index]];
  }

  return sampled.slice(0, count);
}

/**
 * Homepage Magazine data is intentionally not part of the hour-long home
 * cache. The lead is always the newest published blog article; its compact
 * neighbours are a distinct, cryptographically sampled set of real blog
 * rows on each full page refresh.
 *
 * Candidate lookup selects IDs only, then hydrates only the four selected
 * cards. That avoids transferring every article body merely to randomise a
 * small rail; `content` is transferred only for rendered cards because the
 * reading-time formatter needs it.
 */
export async function getMagazinePosts(): Promise<ContentItem[]> {
  return section<ContentItem[]>("magazine", [], async (): Promise<ContentItem[]> => {
    const where = {
      module: "blog",
      published: true,
      deletedAt: null,
      date: publicPostDateWhere(),
    };

    const latest = await prisma.post.findFirst({
      where,
      orderBy: [{ date: "desc" }, { id: "desc" }],
      select: cardSelect,
    });
    if (!latest) return [];

    const candidateIds = await prisma.post.findMany({
      where: { ...where, id: { not: latest.id } },
      select: { id: true },
    });
    const selectedIds = randomSample(candidateIds.map((post) => post.id), 4);

    if (selectedIds.length === 0) return [normalizeCard(latest) as ContentItem];

    const selected = await prisma.post.findMany({
      where: { id: { in: selectedIds } },
      select: cardSelect,
    });
    const selectedById = new Map<string, ContentItem>(
      selected.map((post) => [post.id, normalizeCard(post) as ContentItem]),
    );

    // findMany does not preserve `in` ordering. Restore the random ID order
    // so the compact rail does not quietly become deterministic by primary
    // key, and keep the newest article in the lead position.
    const compactPosts: ContentItem[] = [];
    for (const id of selectedIds) {
      const post = selectedById.get(id);
      if (post) compactPosts.push(post);
    }
    return [normalizeCard(latest) as ContentItem, ...compactPosts];
  });
}

async function getLayoutHomeDataUncached(): Promise<HomeData> {
  const enabledModules = await getEnabledModules();
  // Admin-controlled (SiteSetting `ticker.visible`). Defaults to true, so
  // nothing changes until an admin turns it off.
  let tickerVisible = true;
  try {
    tickerVisible = (await getModuleConfig()).tickerVisible !== false;
  } catch {
    // Config unreadable: keep the ticker rather than silently removing UI.
  }
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
    // Skip the query entirely when the ticker is off. Hiding it in the
    // client would still pay the transfer cost on every route, which is
    // the whole point of the toggle.
    if (tickerVisible) {
      ticker = await prisma.post.findMany({
        where: { published: true, deletedAt: null, module: { in: enabledModules }, date: publicPostDateWhere() },
        orderBy: { date: "desc" },
        take: 30,
        select: tickerSelect,
      });
    }
  } catch (error) {
    if (!isCircuitOpenError(error)) logDbFailure("layout-data:news", error);
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
      logDbFailure("layout-data:comment-counts", error);
    }
  }

  return {
    modules: { news: normalizedNews },
    ticker: ticker.map(normalizeTickerCard),
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
    if (!isCircuitOpenError(error)) logDbFailure("layout-data", error);
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
      modules[module] = await withCircuit(() => findPosts(module, take as number));
    } catch (e) {
      moduleFailures++;
      modules[module] = [];
      if (!isCircuitOpenError(e)) logDbFailure(`home-data:module:${module}`, e);
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
    // Deliberate: unstable_cache does not store a rejected promise, so
    // throwing here means the next request retries instead of serving a
    // blank homepage for the full revalidate window.
    //
    // Tagged with the circuit code because the caller catches this and
    // degrades. Without the tag it is reported a second time as a fresh
    // failure, which is how one blip produced four separate red overlays.
    const err = new Error(
      "home-data: all module queries failed — refusing to cache an empty homepage",
    ) as Error & { code?: string };
    err.code = "DB_CIRCUIT_OPEN";
    throw err;
  }

  // Ticker: only include posts from enabled modules
  let tickerPosts: any[] = [];
  try {
    tickerPosts = await prisma.post.findMany({
      where: { published: true, deletedAt: null, module: { in: enabledModules }, date: publicPostDateWhere() },
      orderBy: { date: "desc" },
      take: 30,
      select: tickerSelect,
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

  const latestInsights = await section("latestInsights", { story: null, comments: [] } as any, () =>
    getLatestInsights(normalizeCard, cardSelect));

  const videoHighlightComment = await section("videoHighlightComment", null as any, () =>
    getLatestVideoHighlightComment());

  const topPicks = await section("topPicks", [] as any[], () =>
    getTopPicks(normalizeCard, cardSelect));

  // §7 Deals replaces the raw shop slice: prices must be resolved through
  // the currency pipeline, which the generic findPosts() does not do.
  const deals = await section("deals", [] as any[], () =>
    getDeals(normalizeCard, cardSelect, moduleTakes.shop ?? 8));
  if (deals.length) modules.shop = deals;

  const timeline = await section("timeline", [] as any[], () => getTimeline());

  // Homepage SiteSetting keys, read as one batch.
  let homeSettings: Record<string, string> = {};
  try {
    homeSettings = await getSettings([
      "home.familyComments.blocklist",
      "home.finder.chips",
      "home.tools.featured",
      "home.announcement",
    ]);
  } catch (e) {
    logDbFailure("home-data:settings", e);
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

  // §0 Announcement. Absent or malformed setting = disabled, which is the
  // intended default (D7): the bar exists for campaigns, not permanently.
  let announcement: any = null;
  try {
    const raw = homeSettings["home.announcement"];
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object" && parsed.enabled === true) {
        announcement = {
          enabled: true,
          version: Number(parsed.version) || 1,
          textFa: String(parsed.textFa ?? ""),
          boldLeadFa: parsed.boldLeadFa ? String(parsed.boldLeadFa) : undefined,
          ctaLabelFa: parsed.ctaLabelFa ? String(parsed.ctaLabelFa) : undefined,
          href: parsed.href ? String(parsed.href) : undefined,
          startsAt: parsed.startsAt ?? null,
          endsAt: parsed.endsAt ?? null,
          tone: ["brand", "accent", "deal"].includes(parsed.tone) ? parsed.tone : "brand",
        };
      }
    }
  } catch {
    announcement = null;
  }

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
    logDbFailure("home-data:familyComments", e);
  }

  const moreToExplore = await section("moreToExplore", { hero: null, cards: [] } as any, () =>
    getMoreToExplore(normalizeCard, cardSelect));

  const authors = await section("authors", [] as any[], () => getAuthors());

  const familyProfiles = await section("familyProfiles", [] as any[], () => getFamilyProfiles());

  const partners = await section("partners", [] as any[], () => getPartners());

  return {
    modules: modules as HomeData["modules"],
    ticker: tickerPosts.map(normalizeTickerCard),
    generatedAt: new Date().toISOString(),
    latestInsights,
    videoHighlightComment,
    topPicks,
    timeline,
    familyComments,
    moreToExplore,
    authors,
    finderChips,
    toolsFeatured,
    announcement,
    familyProfiles,
    partners,
  };
}

// Cache key bumped v6 -> v7: Latest Insights is now the weekly
// most-commented news story with real comment cards, plus a video comment.
// Window shortened 24h -> 1h so hourly-seeded comment slots rotate.
const cachedHomeData = unstable_cache(getHomeDataUncached, ["home-data-v7"], {
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
    // warn, not error: this path is the graceful fallback, not a crash.
    if (!isCircuitOpenError(e) && logDbFailure("home-data", e) && isDbUnreachable(e)) {
      console.warn("[home-data] serving an empty homepage until the database responds");
    }
    return { modules: {}, ticker: [], generatedAt: new Date().toISOString() };
  }
}
