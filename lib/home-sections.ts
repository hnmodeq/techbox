/**
 * Server-side queries for the homepage upgrade sections.
 *
 * Split out of lib/home-server.ts to keep that file readable; it imports
 * and calls these. Everything here runs inside the same `unstable_cache`
 * window, so no function may be called from a component directly.
 *
 * ── Two rules that must not be broken ─────────────────────────────────
 *
 * 1. SEQUENTIAL, NEVER Promise.all.
 *    lib/home-server.ts documents why: parallelising module fetches
 *    exhausted the Neon connection pool (Prisma P2024). Every block below
 *    awaits in series for the same reason.
 *
 * 2. NO FAKE DATA.
 *    Each function returns [] / null when there is nothing real to show.
 *    The section component then renders nothing at all.
 *
 * Docs: docs/homepage-upgrade/03-DATA-CONTRACTS.md
 */
import { prisma } from "@/lib/db";
import { formatPostDateFa, publicPostDateWhere } from "@/lib/post-date";
import { gregorianToJalali } from "@/lib/jalali";
import { getCurrencyRates, calculateFinalTomanPrice, type CurrencyRates } from "@/lib/currency";
import type { ContentItem } from "@/lib/content";
import type {
  FamilyProfile,
  PartnerCard,
  TopPickCard,
  TimelineCard,
  FamilyComment,
  AuthorCard,
  MoreToExplore,
  HighlightComment,
  LatestInsights,
  NewsHighlightComment,
  VideoHighlightComment,
  CommunityData,
} from "@/features/home/lib/home-types";

const PUBLISHED = { published: true, deletedAt: null } as const;

/** Warn once per process, not once per render — see getPartners(). */
let warnedMissingPartnerModel = false;

/**
 * Price a shop row from rates that were fetched ONCE by the caller.
 *
 * `calculateFinalPriceForPost` looks the rates up itself, which means a
 * DB round-trip per product. With `connection_limit=1` (the Neon default
 * in lib/db.ts) eight of those in a loop serialise behind one connection
 * and blow the 15s pool timeout. Rates are identical for every row in a
 * render, so they are read once and passed in.
 */
function priceFromRates(
  row: {
    sourcePriceAmount?: number | null;
    sourceCurrency?: string | null;
    priceAdjustmentPercent?: number | null;
    sellerBenefitPercent?: number | null;
    priceAmount?: number | null;
  },
  rates: CurrencyRates,
): number {
  if (!row.sourcePriceAmount || row.sourcePriceAmount <= 0) {
    return row.priceAmount ? Math.round(row.priceAmount) : 0;
  }
  return calculateFinalTomanPrice({
    sourcePrice: row.sourcePriceAmount,
    sourceCurrency: row.sourceCurrency,
    productAdjustmentPercent: row.priceAdjustmentPercent,
    sellerBenefitPercent: row.sellerBenefitPercent ?? 35,
    rates,
  });
}

/** Persian digits with NO thousands separator — for years. */
function faYear(n: number): string {
  return String(n).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]);
}

/**
 * Deterministic pseudo-random index, stable for one hour.
 *
 * Math.random() would desync the server render from the client hydration
 * and throw a mismatch. Date.now() has the same problem. This rotates in
 * lockstep with the 1h `revalidate` on the home cache, so the value is
 * constant for the life of any given cached payload.
 *
 * Knuth multiplicative hashing; `salt` keeps independent slots from
 * rotating together.
 */
export function seededIndex(total: number, salt = 0): number {
  if (total <= 0) return 0;
  const hour = Math.floor(Date.now() / 3_600_000);
  return Math.abs(((hour + salt) * 2654435761) % total);
}

/**
 * `count` DISTINCT indices from `total`, with the same hourly stability as
 * seededIndex.
 *
 * Calling seededIndex twice with different salts is not enough: nothing
 * stops the two results colliding, which would render the same comment
 * twice. This walks forward from each pick to the next free slot instead.
 */
export function seededIndices(total: number, count: number, salt = 0): number[] {
  if (total <= 0 || count <= 0) return [];
  const wanted = Math.min(count, total);
  const picked: number[] = [];
  for (let i = 0; i < wanted; i += 1) {
    let candidate = seededIndex(total, salt + i * 101);
    // Linear probe to the next unused index. Terminates because
    // `wanted <= total`.
    while (picked.includes(candidate)) candidate = (candidate + 1) % total;
    picked.push(candidate);
  }
  return picked;
}

// ═════════════════════════════════════════════════════════════════════
// §3 Latest Insights — the week's most-commented news
// ═════════════════════════════════════════════════════════════════════

function mapHighlightComment(row: any): HighlightComment | null {
  const name = row.author?.name || row.authorName || "";
  if (!name) return null;
  return {
    id: row.id,
    text: row.text,
    date: row.createdAt.toISOString(),
    dateFa: formatPostDateFa(row.createdAt),
    author: {
      name,
      username: row.author?.username ?? null,
      avatar: row.author?.avatar ?? null,
      verifiedType: row.author?.verifiedType ?? null,
    },
  };
}

/**
 * Pick distinct comment rows in an order that stays stable for the homepage
 * cache window. Recent News receives priority; older members of the latest
 * ten-post fallback only fill any remaining slots. Each post contributes at
 * most one row, so the panel represents several conversations rather than a
 * single busy article repeated five times.
 */
export function selectNewsDiscussionComments<T extends { postId: string; authorKey?: string }>(
  recentPostIds: readonly string[],
  fallbackPostIds: readonly string[],
  rowsByPost: ReadonlyMap<string, readonly T[]>,
  take = 4,
): T[] {
  const picked: T[] = [];
  const seenAuthors = new Set<string>();

  const pickUnusedAuthor = (rows: readonly T[], salt: number): T | null => {
    if (rows.length === 0) return null;
    const start = seededIndex(rows.length, salt);
    for (let offset = 0; offset < rows.length; offset += 1) {
      const row = rows[(start + offset) % rows.length];
      const authorKey = row.authorKey?.trim();
      if (!authorKey || !seenAuthors.has(authorKey)) return row;
    }
    return null;
  };

  const appendPostIds = (postIds: readonly string[], salt: number) => {
    const available = postIds.filter((postId) => (rowsByPost.get(postId)?.length ?? 0) > 0);
    // Walk the entire shuffled priority group. A first-choice row may belong
    // to an already displayed author, so stopping after `take` candidate
    // posts could leave empty slots even when another unique voice exists.
    const slots = seededIndices(available.length, available.length, salt);
    for (const index of slots) {
      if (picked.length >= take) return;
      const postId = available[index];
      const row = pickUnusedAuthor(rowsByPost.get(postId) ?? [], salt + index * 17);
      if (!row) continue;
      const authorKey = row.authorKey?.trim();
      if (authorKey) seenAuthors.add(authorKey);
      picked.push(row);
    }
  };

  appendPostIds(recentPostIds, 211);
  if (picked.length < take) appendPostIds(fallbackPostIds, 487);
  return picked;
}

/**
 * The Latest News discussion is comment-led:
 *
 * - use News published in the last seven days first;
 * - if that pool is quiet (or there was no News this week), extend to the
 *   remaining newest ten published posts;
 * - return one approved, top-level comment per represented News post.
 *
 * The first query supplies every News card the carousel/modal can display;
 * comments are fetched once in bulk and grouped in memory. This deliberately
 * replaces the old homepage-mounted CommentSection fetch, so the full live
 * thread is loaded only after a reader opens its NewsModal.
 */
export async function getLatestInsights(
  normalize: (p: any) => ContentItem,
  cardSelect: any,
): Promise<LatestInsights> {
  const weekAgo = new Date(Date.now() - 7 * 864e5);
  const latestPosts: any[] = await prisma.post.findMany({
    where: { module: "news", ...PUBLISHED, date: publicPostDateWhere() },
    orderBy: [{ date: "desc" }, { id: "desc" }],
    take: 10,
    select: cardSelect,
  });

  if (latestPosts.length === 0) return { story: null, stories: [], comments: [] };

  const postIds: string[] = latestPosts.map((post) => String(post.id));
  // Keep these reads sequential. Homepage sections share the small Neon pool;
  // two independent comment queries in parallel are enough to revive P2024
  // failures while a page is revalidating.
  const rawCounts = await prisma.comment.groupBy({
    by: ["postId"],
    _count: { _all: true },
    where: { postId: { in: postIds }, status: "approved", deletedAt: null },
  });
  const counts = rawCounts as any[];
  const rawCommentRows = await prisma.comment.findMany({
    where: {
      postId: { in: postIds },
      parentId: null,
      status: "approved",
      deletedAt: null,
      text: { not: "" },
    },
    // A bounded candidate pool keeps the homepage payload small. The final
    // display is random/server-stable, not "most liked".
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: 120,
    select: {
      id: true,
      postId: true,
      text: true,
      authorName: true,
      authorId: true,
      createdAt: true,
      author: {
        select: { name: true, username: true, avatar: true, verifiedType: true, status: true },
      },
    },
  });
  const commentRows = rawCommentRows as any[];

  const countByPost = new Map(counts.map((entry) => [entry.postId, entry._count._all || 0]));
  const rowsByPost = new Map<string, Array<(typeof commentRows)[number] & { authorKey: string }>>();
  for (const row of commentRows) {
    // Suspended accounts do not get a highlighted promotional slot. Guests
    // are still valid because they carry authorName and have no User record.
    if (row.author && row.author.status !== "active") continue;
    const rows = rowsByPost.get(row.postId) ?? [];
    rows.push({
      ...row,
      // One person should not dominate the four-slot discovery panel, even
      // when they commented on several different News posts.
      authorKey: row.authorId || row.author?.username || row.author?.name || row.authorName,
    });
    rowsByPost.set(row.postId, rows);
  }

  const recentPostIds = latestPosts
    .filter((post) => post.date >= weekAgo)
    .map((post) => post.id);
  const recentSet = new Set(recentPostIds);
  const fallbackPostIds = latestPosts
    .filter((post) => !recentSet.has(post.id))
    .map((post) => post.id);

  const sampledRows = selectNewsDiscussionComments(
    recentPostIds,
    fallbackPostIds,
    rowsByPost,
    4,
  );

  const postById = new Map(latestPosts.map((post) => [post.id, post]));
  const comments: NewsHighlightComment[] = [];
  for (const row of sampledRows) {
    const mapped = mapHighlightComment(row);
    const post = postById.get(row.postId);
    if (!mapped || !post) continue;
    comments.push({ ...mapped, newsSlug: post.slug });
  }

  const sampledPostIds = new Set(sampledRows.map((row) => row.postId));
  const sampledPosts = latestPosts.filter((post) => sampledPostIds.has(post.id));
  const storyPool = sampledPosts.length > 0 ? sampledPosts : latestPosts;
  const featured = [...storyPool].sort(
    (a, b) => (countByPost.get(b.id) || 0) - (countByPost.get(a.id) || 0),
  )[0];

  const stories = [...sampledPosts]
    .sort((a, b) => {
      if (a.id === featured.id) return -1;
      if (b.id === featured.id) return 1;
      return a.date.getTime() - b.date.getTime();
    })
    .map((post) => {
      const story = normalize(post);
      story.comments = countByPost.get(post.id) || 0;
      return story;
    });

  const story = normalize(featured);
  story.comments = countByPost.get(featured.id) || 0;
  return { story, stories, comments };
}

/**
 * Forum homepage data keeps the two desktop columns semantically separate:
 * the left feature is always one randomly rotated solved topic; the right
 * rail is a random set of unresolved topics. All counts and activity are
 * hydrated in one server payload, with no browser-side query fan-out.
 */
export async function getCommunityTopics(
  normalize: (p: any) => ContentItem,
  cardSelect: any,
): Promise<CommunityData> {
  const forumWhere = {
    module: "forum",
    ...PUBLISHED,
    date: publicPostDateWhere(),
  };

  // Keep candidate queries broad enough for visible rotation, then select the
  // actual rendered rows in memory. Solved and unresolved states are queried
  // independently so neither column can leak the other state.
  const solvedPool = await prisma.post.findMany({
    // A feature is only useful when the reader can immediately see its best
    // answer. Solved topics without an approved accepted reply stay out of
    // this main-card pool rather than producing an empty answer treatment.
    where: {
      ...forumWhere,
      solved: true,
      acceptedComment: { is: { status: "approved", deletedAt: null, text: { not: "" } } },
    },
    orderBy: [{ date: "desc" }, { id: "desc" }],
    take: 40,
    select: cardSelect,
  }) as any[];
  const openPool = await prisma.post.findMany({
    where: { ...forumWhere, solved: false },
    orderBy: [{ date: "desc" }, { id: "desc" }],
    take: 40,
    select: cardSelect,
  }) as any[];

  // This is server-stable for an hour (the home cache window), which gives
  // readers a genuinely rotating selection without a hydration mismatch.
  const featuredRaw = solvedPool[seededIndex(solvedPool.length, 613)] ?? null;
  const railTopics = seededIndices(openPool.length, 4, 719).map((index) => openPool[index]);
  const visibleTopics = featuredRaw ? [featuredRaw, ...railTopics] : railTopics;
  const topicIds: string[] = visibleTopics.map((topic) => topic.id);

  const rawCounts = topicIds.length > 0
    ? await prisma.comment.groupBy({
        by: ["postId"],
        _count: { _all: true },
        where: { postId: { in: topicIds }, status: "approved", deletedAt: null },
      })
    : [];
  const countByPost = new Map(rawCounts.map((entry) => [entry.postId, entry._count._all || 0]));

  const acceptedIds = visibleTopics
    .map((topic) => topic.acceptedCommentId)
    .filter((id): id is string => typeof id === "string" && id.length > 0);
  const acceptedRows = acceptedIds.length > 0
    ? await prisma.comment.findMany({
        where: { id: { in: acceptedIds }, status: "approved", deletedAt: null, text: { not: "" } },
        select: {
          id: true,
          text: true,
          authorName: true,
          author: { select: { name: true, username: true, avatar: true } },
        },
      })
    : [];
  const acceptedById = new Map(acceptedRows.map((comment) => [comment.id, comment]));

  const latestComments = topicIds.length > 0
    ? await prisma.comment.findMany({
        where: { postId: { in: topicIds }, status: "approved", deletedAt: null },
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        take: 200,
        select: {
          postId: true,
          createdAt: true,
          authorName: true,
          author: { select: { name: true, username: true, avatar: true, verifiedType: true, status: true } },
        },
      })
    : [];
  const activityByPost = new Map<string, (typeof latestComments)[number]>();
  for (const comment of latestComments) {
    if (activityByPost.has(comment.postId)) continue;
    if (comment.author && comment.author.status !== "active") continue;
    activityByPost.set(comment.postId, comment);
  }

  const toCard = (topic: any): ContentItem => {
    const card = normalize(topic);
    card.comments = countByPost.get(topic.id) || 0;
    const accepted = topic.acceptedCommentId ? acceptedById.get(topic.acceptedCommentId) : undefined;
    if (accepted) {
      (card as any).acceptedAnswer = {
        text: accepted.text,
        author: {
          name: accepted.author?.name || accepted.authorName || "کاربر",
          username: accepted.author?.username || "",
          avatar: accepted.author?.avatar || "",
        },
      };
    }
    const activity = activityByPost.get(topic.id);
    if (activity) {
      card.lastActivity = {
        date: activity.createdAt.toISOString(),
        author: {
          name: activity.author?.name || activity.authorName || "کاربر انجمن",
          username: activity.author?.username || "",
          avatar: activity.author?.avatar || "",
          verifiedType: activity.author?.verifiedType || null,
        },
      };
    }
    return card;
  };

  // Count distinct people across every public Forum topic and approved reply,
  // not just the five selected cards. A registered account is the strongest
  // identity; a named guest is used only when no account id exists.
  let participantCount = 0;
  try {
    const topicContributors = await prisma.post.groupBy({
      by: ["authorId", "authorName"],
      where: forumWhere,
    });
    const replyContributors = await prisma.comment.groupBy({
      by: ["authorId", "authorName"],
      where: {
        status: "approved",
        deletedAt: null,
        post: forumWhere,
      },
    });
    const people = new Set<string>();
    for (const contributor of [...topicContributors, ...replyContributors]) {
      if (contributor.authorId) {
        people.add(`user:${contributor.authorId}`);
        continue;
      }
      const name = contributor.authorName.trim();
      if (name) people.add(`guest:${name}`);
    }
    participantCount = people.size;
  } catch {
    // Content remains useful if the lightweight aggregate is temporarily
    // unavailable; zero is honest and avoids inventing a participation count.
  }

  return {
    featured: featuredRaw ? toCard(featuredRaw) : null,
    topics: railTopics.map(toCard),
    participantCount,
  };
}

/**
 * Real, rotating approved comments drawn from across ALL published videos,
 * not just the newest one. Each carries the slug of the video it belongs to
 * so the card can open that video's modal at that comment.
 *
 * Returns FEWER than `take` when there are not enough approved comments, and
 * an empty array when there are none — the section renders only what exists
 * rather than padding with placeholders.
 */
export async function getLatestVideoHighlightComments(take = 4): Promise<VideoHighlightComment[]> {
  const rows = await prisma.comment.findMany({
    where: {
      parentId: null,
      status: "approved",
      deletedAt: null,
      text: { not: "" },
      post: {
        module: "media",
        ...PUBLISHED,
        date: publicPostDateWhere(),
        videoUrl: { not: null },
      },
    },
    // Quality bias before sampling, exactly as getFamilyComments does.
    orderBy: [{ likes: "desc" }, { createdAt: "desc" }],
    take: 120,
    select: {
      id: true,
      text: true,
      authorName: true,
      createdAt: true,
      author: {
        select: { name: true, username: true, avatar: true, verifiedType: true, status: true },
      },
      post: { select: { slug: true } },
    },
  });

  const seenAuthors = new Set<string>();
  const candidates: VideoHighlightComment[] = [];

  for (const row of rows) {
    if (row.author && row.author.status !== "active") continue;
    const mapped = mapHighlightComment(row);
    if (!mapped || !row.post?.slug) continue;

    // One quote per person, so four cards means four different voices.
    const key = mapped.author.username || mapped.author.name;
    if (seenAuthors.has(key)) continue;
    seenAuthors.add(key);

    candidates.push({ ...mapped, videoSlug: row.post.slug });
  }

  if (candidates.length === 0) return [];

  return seededIndices(candidates.length, take, 37).map((index) => candidates[index]);
}

// ═════════════════════════════════════════════════════════════════════
// §5 Our Top Picks — reviews linked to a real, buyable product
// ═════════════════════════════════════════════════════════════════════

export async function getTopPicks(
  normalize: (p: any) => ContentItem,
  cardSelect: any,
): Promise<TopPickCard[]> {
  const rows = await prisma.post.findMany({
    where: {
      module: "review",
      ...PUBLISHED,
      date: publicPostDateWhere(),
      reviewedProductId: { not: null },
      // Never advertise something that cannot be bought.
      reviewedProduct: {
        published: true,
        deletedAt: null,
        NOT: { availability: "ناموجود" },
      },
    },
    orderBy: [{ rating: "desc" }, { date: "desc" }],
    take: 3,
    select: {
      ...cardSelect,
      reviewedProduct: {
        select: {
          slug: true,
          title: true,
          image: true,
          priceAmount: true,
          sourcePriceAmount: true,
          sourceCurrency: true,
          priceAdjustmentPercent: true,
          sellerBenefitPercent: true,
          discountPercent: true,
          discountEndsAt: true,
          warranty: true,
          availability: true,
          brand: true,
          model: true,
        },
      },
    },
  });

  if (!rows.length) return [];

  // One rates read for the whole section, not one per product.
  let rates: CurrencyRates | null = null;
  try {
    rates = await getCurrencyRates();
  } catch {
    // Fall back to stored prices rather than dropping every card.
  }

  const out: TopPickCard[] = [];
  for (const r of rows as any[]) {
    const p = r.reviewedProduct;
    if (!p) continue;

    // Price resolves server-side. The client never computes a price —
    // that is an existing security invariant of this codebase.
    const finalPrice: number | null = rates
      ? priceFromRates(p, rates)
      : (p.priceAmount ?? null);

    out.push({
      ...normalize(r),
      product: {
        slug: p.slug,
        title: p.title,
        image: p.image ?? null,
        priceAmount: finalPrice,
        discountPercent: p.discountPercent ?? null,
        discountEndsAt: p.discountEndsAt ? p.discountEndsAt.toISOString() : null,
        warranty: p.warranty ?? null,
        availability: p.availability ?? null,
        brand: p.brand ?? null,
        model: p.model ?? null,
      },
    });
  }
  return out;
}

// ═════════════════════════════════════════════════════════════════════
// §7 Deals
// ═════════════════════════════════════════════════════════════════════

/**
 * Shop products for the deals rail.
 *
 * Prefers genuinely discounted, in-stock items. If there are fewer than
 * `take` of those, it backfills with the newest products so the rail is
 * never half-empty — still 100% real rows, just not all on offer.
 *
 * Prices are resolved from ONE rates read (see priceFromRates), because all
 * shop rows store a source price in USD and the displayed Toman figure is
 * derived from live rates. Reading `priceAmount` directly would show a
 * stale number.
 */
export async function getDeals(
  normalize: (p: any) => ContentItem,
  cardSelect: any,
  take = 8,
): Promise<ContentItem[]> {
  const priceSelect = {
    ...cardSelect,
    sourcePriceAmount: true,
    sourceCurrency: true,
    priceAdjustmentPercent: true,
    sellerBenefitPercent: true,
  };

  const discounted = await prisma.post.findMany({
    where: {
      module: "shop",
      ...PUBLISHED,
      date: publicPostDateWhere(),
      discountPercent: { gt: 0 },
      // Never advertise a deal on something that cannot be bought.
      availability: "موجود",
    },
    // Postgres orders NULLs FIRST on DESC, so `discountPercent: "desc"`
    // alone would rank the 97 non-discounted rows above the 9 real deals.
    // The `gt: 0` filter above excludes nulls here, and the backfill query
    // below sorts by date only — so no NULL ever wins a discount sort.
    orderBy: [{ discountPercent: "desc" }, { date: "desc" }],
    take,
    select: priceSelect,
  });

  let rows: any[] = discounted;

  if (rows.length < take) {
    const fill = await prisma.post.findMany({
      where: {
        module: "shop",
        ...PUBLISHED,
        date: publicPostDateWhere(),
        availability: "موجود",
        id: { notIn: rows.map((r) => r.id) },
      },
      orderBy: { date: "desc" },
      take: take - rows.length,
      select: priceSelect,
    });
    rows = [...rows, ...fill];
  }

  if (!rows.length) return [];

  // One rates read for the whole rail, not one per product.
  let rates: CurrencyRates | null = null;
  try {
    rates = await getCurrencyRates();
  } catch {
    // Keep stored amounts rather than dropping the rail.
  }

  return rows.map((r) => {
    const item = normalize(r);
    if (rates) {
      const final = priceFromRates(r, rates);
      if (final > 0) item.priceAmount = final;
    }
    return item;
  });
}

// ═════════════════════════════════════════════════════════════════════
// §6 Timeline
// ═════════════════════════════════════════════════════════════════════

export async function getTimeline(): Promise<TimelineCard[]> {
  const rows = await prisma.timelineEvent.findMany({
    where: { published: true },
    orderBy: { dateGr: "asc" },
    // The full arc matters here: taking 12 of 20 chopped the timeline at
    // 1999 and lost AWS, Docker, Kubernetes and everything after.
    take: 24,
    select: {
      id: true,
      title: true,
      description: true,
      image: true,
      dateFa: true,
      year: true,
      yearFa: true,
      importance: true,
      tags: true,
      _count: { select: { likes: true } },
    },
  });

  return rows.map((e) => ({
    id: e.id,
    title: e.title,
    description: e.description,
    image: e.image ?? null,
    dateFa: e.dateFa,
    year: e.year,
    yearFa: e.yearFa,
    importance: e.importance,
    tags: Array.isArray(e.tags) ? (e.tags as string[]).slice(0, 4) : [],
    likes: e._count.likes,
  }));
}

// ═════════════════════════════════════════════════════════════════════
// §10 Family Comments
// ═════════════════════════════════════════════════════════════════════

const MODULE_LABEL: Record<string, string> = {
  blog: "از مجله",
  news: "از اخبار",
  media: "از ویدیوها",
  shop: "از فروشگاه",
  forum: "از انجمن",
  review: "از نقد و بررسی",
  download: "از مرکز دانلود",
};

/**
 * Long enough to be a real opinion, short enough to fit the card.
 *
 * 80 was too strict: only 19 of 148 approved comments cleared it, from
 * just 8 distinct authors. A 40-character Persian sentence is still a
 * genuine remark rather than an emoji, and 145 comments clear that.
 */
const MIN_LEN = 40;
const MAX_LEN = 400;

export async function getFamilyComments(blocklist: string[] = []): Promise<FamilyComment[]> {
  const rows = await prisma.comment.findMany({
    where: {
      status: "approved",
      deletedAt: null,
      authorId: { not: null },
      text: { not: "" },
      post: PUBLISHED,
    },
    orderBy: { likes: "desc" }, // quality bias before sampling
    take: 120,
    select: {
      id: true,
      text: true,
      likes: true,
      author: {
        select: {
          name: true,
          username: true,
          avatar: true,
          status: true,
          createdAt: true,
          verifiedType: true,
        },
      },
      post: { select: { module: true, slug: true } },
    },
  });

  const blocked = new Set(blocklist);
  const seenAuthors = new Set<string>();
  const eligible: FamilyComment[] = [];

  for (const c of rows) {
    if (blocked.has(c.id)) continue;
    if (!c.author) continue;
    // A banned or muted member should not be the face of the community.
    if (c.author.status !== "active") continue;

    const len = [...c.text].length;
    if (len < MIN_LEN || len > MAX_LEN) continue;

    // One quote per person, so three cards means three different voices.
    const key = c.author.username || c.author.name;
    if (seenAuthors.has(key)) continue;
    seenAuthors.add(key);

    // toFa() groups thousands, which turns a year into "۱٬۴۰۵". Years are
    // never grouped, so map the digits directly.
    const jy = c.author.createdAt ? gregorianToJalali(c.author.createdAt).year : null;

    eligible.push({
      id: c.id,
      text: c.text,
      memberSince: jy ? faYear(jy) : "",
      author: {
        name: c.author.name,
        username: c.author.username ?? null,
        avatar: c.author.avatar ?? null,
        verifiedType: c.author.verifiedType ?? null,
      },
      origin: {
        label: MODULE_LABEL[c.post.module] ?? "از تکباکس",
        href: `/${c.post.module}/${c.post.slug}#comment-${c.id}`,
      },
    });
  }

  if (eligible.length < 3) return []; // one lonely testimonial looks broken

  // Rotate hourly through the eligible pool. Six fills two rows of three
  // on desktop; fewer looks thin against the width of the section.
  const want = Math.min(6, eligible.length);
  const start = seededIndex(eligible.length, 11);
  return Array.from({ length: want }, (_, i) => eligible[(start + i) % eligible.length]);
}

// ═════════════════════════════════════════════════════════════════════
// §11 More to Explore
// ═════════════════════════════════════════════════════════════════════

export async function getMoreToExplore(
  normalize: (p: any) => ContentItem,
  cardSelect: any,
): Promise<MoreToExplore> {
  // Hero: a random news post from the WHOLE archive, not just recent ones.
  const total = await prisma.post.count({
    where: { module: "news", ...PUBLISHED },
  });

  let hero: ContentItem | null = null;
  if (total > 0) {
    const row = await prisma.post.findFirst({
      where: { module: "news", ...PUBLISHED, date: publicPostDateWhere() },
      orderBy: { date: "desc" },
      skip: seededIndex(total, 3) % total,
      select: cardSelect,
    });
    if (row) hero = normalize(row);
  }

  // Cards: the OLDEST item per module — genuine rediscovery, not a second
  // helping of what is already above the fold.
  //
  // This used to be four sequential findFirst calls. With
  // connection_limit=1 every extra round-trip serialises behind the last,
  // so they are collapsed into ONE query that fetches the oldest handful
  // across all four modules and picks the first per module in memory.
  const MODULES = ["media", "blog", "forum", "shop"] as const;
  const pool = (await prisma.post.findMany({
    where: {
      ...PUBLISHED,
      date: publicPostDateWhere(),
      OR: [
        { module: "media", videoUrl: { not: null } },
        { module: "blog" },
        { module: "forum" },
        { module: "shop" },
      ],
    },
    orderBy: { date: "asc" },
    take: 40, // enough to guarantee coverage of all four modules
    select: cardSelect,
  })) as any[];

  const cards: ContentItem[] = [];
  for (const m of MODULES) {
    const row = pool.find((r) => r.module === m && r.slug !== hero?.slug);
    if (row) cards.push(normalize(row));
  }

  return { hero, cards: cards.slice(0, 4) };
}

// ═════════════════════════════════════════════════════════════════════
// §12 Authors
// ═════════════════════════════════════════════════════════════════════

export async function getAuthors(): Promise<AuthorCard[]> {
  const rows = await prisma.user.findMany({
    where: {
      status: "active",
      // No ghost authors: a contributor card requires actual contributions.
      posts: { some: PUBLISHED },
    },
    orderBy: { posts: { _count: "desc" } },
    take: 12,
    select: {
      name: true,
      username: true,
      roleFa: true,
      role: true,
      job: true,
      bio: true,
      avatar: true,
      verifiedType: true,
      verifiedLabel: true,
      _count: { select: { posts: true } },
    },
  });

  return rows.map((u) => ({
    name: u.name,
    username: u.username,
    // The card is a professional profile, so show the person's real job
    // title ("مهندس ذخیره‌سازی"), not their site permission level
    // ("ادمین محتوا"). roleFa is a site role and only stands in when no
    // job title has been filled out.
    role: u.job?.trim() || u.roleFa?.trim() || "",
    bio: u.bio || "",
    avatar: u.avatar ?? null,
    verifiedType: u.verifiedType ?? null,
    verifiedLabel: u.verifiedLabel ?? null,
    postCount: u._count.posts,
  }));
}

// ═════════════════════════════════════════════════════════════════════
// §13 Family Profiles — community members, not staff
// ═════════════════════════════════════════════════════════════════════

/**
 * A random sample of ordinary registered members.
 *
 * Staff are deliberately excluded: they already have their own section
 * (§12 Authors), and the point here is to show the community rather than
 * the masthead a second time. Only members who have actually done
 * something — posted or commented — are eligible, so the row cannot fill
 * up with empty signups.
 */
export async function getFamilyProfiles(): Promise<FamilyProfile[]> {
  const STAFF = ["super_admin", "admin", "editor"];

  const rows = await prisma.user.findMany({
    where: {
      status: "active",
      role: { notIn: STAFF },
      OR: [{ posts: { some: PUBLISHED } }, { comments: { some: { status: "approved", deletedAt: null } } }],
    },
    select: {
      name: true,
      username: true,
      job: true,
      avatar: true,
      createdAt: true,
      verifiedType: true,
      _count: { select: { posts: true, comments: true } },
    },
    take: 40,
  });

  if (rows.length < 4) return []; // a row of two looks like a mistake

  const mapped: FamilyProfile[] = rows.map((u) => ({
    name: u.name,
    username: u.username,
    job: u.job?.trim() || "",
    avatar: u.avatar ?? null,
    memberSince: u.createdAt ? faYear(gregorianToJalali(u.createdAt).year) : "",
    verifiedType: u.verifiedType ?? null,
    postCount: u._count.posts,
    commentCount: u._count.comments,
  }));

  // Hourly rotation, distinct salt so this does not move in lockstep with
  // the other sampled sections.
  const want = Math.min(8, mapped.length);
  const start = seededIndex(mapped.length, 23);
  return Array.from({ length: want }, (_, i) => mapped[(start + i) % mapped.length]);
}

// ═════════════════════════════════════════════════════════════════════
// §14 Partners
// ═════════════════════════════════════════════════════════════════════

export async function getPartners(): Promise<PartnerCard[]> {
  // `prisma.partner` is undefined when the generated client predates the
  // Partner migration — i.e. someone pulled the code but has not run
  // `pnpm prisma:generate`. Detect that explicitly instead of letting a
  // "Cannot read properties of undefined" fire on every render.
  const model = (prisma as unknown as { partner?: { findMany: Function } }).partner;
  if (!model?.findMany) {
    if (!warnedMissingPartnerModel) {
      warnedMissingPartnerModel = true;
      console.warn(
        "[home-data] Prisma client has no `partner` model — run `pnpm prisma:generate`. " +
          "Skipping the partners section until then.",
      );
    }
    return [];
  }

  return (await model.findMany({
    where: { published: true },
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    take: 12,
    select: { id: true, name: true, logo: true, url: true, tagline: true },
  })) as PartnerCard[];
}
