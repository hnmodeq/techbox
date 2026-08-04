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
      job: row.author?.job ?? null,
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
        select: { name: true, username: true, avatar: true, job: true, verifiedType: true, status: true },
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
          createdAt: true,
          authorName: true,
          author: { select: { name: true, username: true, avatar: true, job: true } },
        },
      })
    : [];
  const acceptedById = new Map(acceptedRows.map((comment) => [comment.id, comment]));

  // The resolved feature may show two additional real voices beneath its
  // accepted answer. Keep them bounded and exclude the accepted answer so the
  // card never repeats the same contribution.
  const featureReplies = featuredRaw
    ? await prisma.comment.findMany({
        where: {
          postId: featuredRaw.id,
          parentId: null,
          status: "approved",
          deletedAt: null,
          text: { not: "" },
          ...(featuredRaw.acceptedCommentId ? { id: { not: featuredRaw.acceptedCommentId } } : {}),
        },
        orderBy: [{ likes: "desc" }, { createdAt: "desc" }, { id: "desc" }],
        take: 2,
        select: {
          id: true,
          text: true,
          createdAt: true,
          authorName: true,
          author: { select: { name: true, username: true, avatar: true, job: true, verifiedType: true, status: true } },
        },
      })
    : [];

  const latestComments = topicIds.length > 0
    ? await prisma.comment.findMany({
        where: { postId: { in: topicIds }, status: "approved", deletedAt: null },
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        take: 200,
        select: {
          postId: true,
          createdAt: true,
          authorName: true,
          author: { select: { name: true, username: true, avatar: true, job: true, verifiedType: true, status: true } },
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
        date: accepted.createdAt.toISOString(),
        author: {
          name: accepted.author?.name || accepted.authorName || "کاربر",
          username: accepted.author?.username || "",
          avatar: accepted.author?.avatar || "",
          job: accepted.author?.job || "",
        },
      };
    }
    if (featuredRaw && topic.id === featuredRaw.id && featureReplies.length > 0) {
      (card as any).followUpReplies = featureReplies
        .filter((reply) => !reply.author || reply.author.status === "active")
        .map((reply) => ({
          id: reply.id,
          text: reply.text,
          date: reply.createdAt.toISOString(),
          author: {
            name: reply.author?.name || reply.authorName || "کاربر انجمن",
            username: reply.author?.username || "",
            avatar: reply.author?.avatar || "",
            job: reply.author?.job || "",
            verifiedType: reply.author?.verifiedType || null,
          },
        }));
    }
    const activity = activityByPost.get(topic.id);
    if (activity) {
      card.lastActivity = {
        date: activity.createdAt.toISOString(),
        author: {
          name: activity.author?.name || activity.authorName || "کاربر انجمن",
          username: activity.author?.username || "",
          avatar: activity.author?.avatar || "",
          job: activity.author?.job || "",
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
        select: { name: true, username: true, avatar: true, job: true, verifiedType: true, status: true },
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
// §5 Reviews — newest feature plus rotating archive
// ═════════════════════════════════════════════════════════════════════

export async function getTopPicks(
  normalize: (p: any) => ContentItem,
  cardSelect: any,
): Promise<ContentItem[]> {
  const where = {
    module: "review",
    ...PUBLISHED,
    date: publicPostDateWhere(),
  };

  const latest: any = await prisma.post.findFirst({
    where,
    orderBy: [{ date: "desc" }, { id: "desc" }],
    select: cardSelect,
  });
  if (!latest) return [];

  // IDs only keeps the random archive selection cheap even as reviews grow.
  const candidates = await prisma.post.findMany({
    where: { ...where, id: { not: latest.id } },
    orderBy: [{ date: "desc" }, { id: "desc" }],
    select: { id: true },
  });
  const selectedIds = seededIndices(candidates.length, 4, 941)
    .map((index) => candidates[index].id);
  if (selectedIds.length === 0) return [normalize(latest)];

  const selected: any[] = await prisma.post.findMany({
    where: { id: { in: selectedIds } },
    select: cardSelect,
  });
  const byId = new Map<string, ContentItem>(selected.map((review) => [review.id, normalize(review)]));
  return [normalize(latest), ...selectedIds.flatMap((id) => {
    const review = byId.get(id);
    return review ? [review] : [];
  })];
}

// ═════════════════════════════════════════════════════════════════════
// §7 Deals
// ═════════════════════════════════════════════════════════════════════

/**
 * Homepage shop mix: alternating best-selling and highest-discount products,
 * constrained to six rackmount systems and two tower/desktop systems.
 * Prices still resolve from one shared currency-rate read.
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
  const baseWhere = {
    module: "shop",
    ...PUBLISHED,
    date: publicPostDateWhere(),
    availability: "موجود",
  };
  // QNAP exposes form factor in Persian specs; model fallbacks cover older
  // imported rows whose specs predate that field.
  const rackSignals: any[] = [
    { specs: { path: ["فرم فاکتور"], string_contains: "Rackmount" } },
    { specs: { path: ["formFactor"], equals: "rackmount" } },
    { model: { contains: "XU", mode: "insensitive" } },
    { model: { contains: "U-", mode: "insensitive" } },
    { title: { contains: "رک", mode: "insensitive" } },
    { title: { contains: "rack", mode: "insensitive" } },
  ];
  const metaSelect = { id: true, discountPercent: true, date: true } as const;

  // Keep these sequential for the single-connection production pool.
  const rackCandidates = await prisma.post.findMany({
    where: { ...baseWhere, OR: rackSignals },
    orderBy: [{ date: "desc" }, { id: "desc" }],
    take: 80,
    select: metaSelect,
  });
  const towerCandidates = await prisma.post.findMany({
    where: { ...baseWhere, NOT: { OR: rackSignals } },
    orderBy: [{ date: "desc" }, { id: "desc" }],
    take: 80,
    select: metaSelect,
  });
  const candidateIds = [...rackCandidates, ...towerCandidates].map((row) => row.id);
  if (candidateIds.length === 0) return [];

  const salesGroups = await prisma.orderItem.groupBy({
    by: ["postId"],
    where: {
      module: "shop",
      postId: { in: candidateIds },
      order: { status: { in: ["paid", "processing", "shipped", "delivered", "completed"] } },
    },
    _sum: { quantity: true },
  });
  const sales = new Map(salesGroups.map((row) => [row.postId, row._sum.quantity ?? 0]));

  type Candidate = (typeof rackCandidates)[number];
  const chooseMixed = (pool: Candidate[], quota: number) => {
    const sold = [...pool].sort((a, b) =>
      (sales.get(b.id) ?? 0) - (sales.get(a.id) ?? 0) || b.date.getTime() - a.date.getTime());
    const discounted = [...pool]
      .filter((row) => (row.discountPercent ?? 0) > 0)
      .sort((a, b) =>
        (b.discountPercent ?? 0) - (a.discountPercent ?? 0) || b.date.getTime() - a.date.getTime());
    const fallback = [...pool].sort((a, b) => b.date.getTime() - a.date.getTime());
    const picked: Candidate[] = [];
    const add = (row: Candidate | undefined) => {
      if (row && !picked.some((item) => item.id === row.id) && picked.length < quota) picked.push(row);
    };
    for (let index = 0; picked.length < quota && index < Math.max(sold.length, discounted.length); index++) {
      add(sold[index]);
      add(discounted[index]);
    }
    for (const row of fallback) add(row);
    return picked.slice(0, quota);
  };

  // Editorial quota: six rackmount storage systems and two tower/desktop NAS.
  const selectedMeta = [
    ...chooseMixed(rackCandidates, 6),
    ...chooseMixed(towerCandidates, 2),
  ].slice(0, take);
  const selectedIds = selectedMeta.map((row) => row.id);
  if (selectedIds.length === 0) return [];

  const selectedRows: any[] = await prisma.post.findMany({
    where: { id: { in: selectedIds } },
    select: priceSelect,
  });
  const rowById = new Map<string, any>(selectedRows.map((row) => [row.id, row]));

  let rates: CurrencyRates | null = null;
  try {
    rates = await getCurrencyRates();
  } catch {
    // Keep stored prices rather than dropping the section.
  }

  return selectedIds.flatMap((id) => {
    const row = rowById.get(id);
    if (!row) return [];
    const item = normalize(row);
    if (rates) {
      const final = priceFromRates(row, rates);
      if (final > 0) item.priceAmount = final;
    }
    return [item];
  });
}

// ═════════════════════════════════════════════════════════════════════
// §6 Timeline
// ═════════════════════════════════════════════════════════════════════

export async function getTimeline(): Promise<TimelineCard[]> {
  const rows = await prisma.timelineEvent.findMany({
    where: { published: true },
    orderBy: { dateGr: "desc" },
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
      dateGr: true,
      // Comment count matters as much as likes now that the homepage cards
      // show both. Without it every card rendered "0 comments" regardless of
      // the real figure, which is the bug behind "likes and comments are not
      // true or don't work".
      _count: {
        select: {
          likes: true,
          comments: { where: { status: "approved" } },
        },
      },
    },
  });

  return rows.map((e) => ({
    id: e.id,
    title: e.title,
    description: e.description,
    image: e.image ?? null,
    dateFa: e.dateFa,
    dateGr: e.dateGr,
    year: e.year,
    yearFa: e.yearFa,
    importance: e.importance,
    tags: Array.isArray(e.tags) ? (e.tags as string[]).slice(0, 4) : [],
    likes: e._count.likes,
    // Named to match what the shared TimelineCard reads, so the homepage and
    // /timeline can render from the same shape.
    likesCount: e._count.likes,
    commentsCount: e._count.comments,
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
          job: true,
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
        job: c.author.job?.trim() || null,
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

/** The About-page section whose members are the editorial team. */
const EDITORIAL_SECTION = "تیم تحریریه";

export async function getAuthors(): Promise<AuthorCard[]> {
  // Who counts as an "author" is an editorial decision, not a permission
  // level. It lives in the About page's تیم تحریریه section, so read the
  // linked accounts from there rather than inferring it from an RBAC role —
  // content_writer is a set of permissions, and plenty of people hold it
  // without being on the masthead.
  //
  // TeamMember.userId is nullable (not every listed person has an account),
  // so only linked members can appear here.
  const editorial = await prisma.teamMember.findMany({
    where: {
      userId: { not: null },
      section: { title: EDITORIAL_SECTION, enabled: true },
    },
    select: { userId: true },
  });
  const editorialIds = editorial
    .map((m) => m.userId)
    .filter((id): id is string => Boolean(id));

  const authorSelect = {
    name: true,
    username: true,
    roleFa: true,
    role: true,
    job: true,
    bio: true,
    avatar: true,
    verifiedType: true,
    verifiedLabel: true,
    _count: { select: { posts: { where: PUBLISHED } } },
  } as const;

  // If the editorial section has linked accounts, it is authoritative. When
  // it is empty (the current production state after the new userId migration),
  // first retain the legacy editorial-role match and then fall back to actual
  // published contributors. The final fallback is what prevents the entire
  // author rail from silently disappearing while an admin links the team.
  let rows = await prisma.user.findMany({
    where: {
      status: "active",
      posts: { some: PUBLISHED },
      ...(editorialIds.length > 0
        ? { id: { in: editorialIds } }
        : {
            OR: [
              { roleFa: { contains: "تحریریه" } },
              { job: { contains: "تحریریه" } },
              { role: "editor" },
              { username: "atiyehatami" },
            ],
          }),
    },
    orderBy: { posts: { _count: "desc" } },
    take: 12,
    select: authorSelect,
  });

  if (rows.length === 0) {
    rows = await prisma.user.findMany({
      where: { status: "active", posts: { some: PUBLISHED } },
      orderBy: { posts: { _count: "desc" } },
      take: 12,
      select: authorSelect,
    });
  }

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
  // Every staff role, not just the three the first version listed.
  // "خانوادهٔ تکباکس" is meant to show the community — ordinary members and
  // verified members and organisations. Anyone who works on the site belongs
  // in the authors/team surfaces instead, so the whole RBAC staff set is
  // excluded here. `admin` and `editor` are legacy values kept for rows
  // created before seed-roles.ts settled on the current names.
  const STAFF = [
    "super_admin",
    "admin",
    "editor",
    "content_writer",
    "product_manager",
    "price_manager",
    "order_manager",
    "support_agent",
    "moderator",
    "analyst",
    "designer",
    "social_manager",
    "sales_specialist",
    "تیم تحریریه",
    "تیم محتوای چند رسانه ای",
    "تیم طراحی گرافیک",
    "کارشناس فنی",
    "کارشناس فروش",
    "تیم مارکتینگ",
    "تیم پشتیبانی",
    "تیم مدیریت",
  ];

  const rows = await prisma.user.findMany({
    where: {
      status: "active",
      role: { notIn: STAFF },
      OR: [{ posts: { some: PUBLISHED } }, { comments: { some: { status: "approved", deletedAt: null } } }],
    },
    select: {
      id: true,
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

  // Likes are part of "مشارکت" but `Like` carries a bare `userId` with no
  // Prisma relation, so `_count` cannot reach them. One grouped query over
  // the users on screen is cheaper than N per-user counts, and
  // `like_user_created_idx` covers it.
  //
  // Forum topic creations and replies need no special handling: a topic is
  // a Post and a reply is a Comment, so both are already in `_count`.
  const userIds = rows.map((u) => u.id);
  const likeGroups = userIds.length
    ? await prisma.like.groupBy({
        by: ["userId"],
        where: { userId: { in: userIds }, deletedAt: null },
        _count: { _all: true },
      })
    : [];
  const likesByUser = new Map(
    likeGroups.map((g) => [g.userId, g._count._all] as const),
  );

  const mapped: FamilyProfile[] = rows.map((u) => ({
    name: u.name,
    username: u.username,
    job: u.job?.trim() || "",
    avatar: u.avatar ?? null,
    memberSince: u.createdAt ? faYear(gregorianToJalali(u.createdAt).year) : "",
    verifiedType: u.verifiedType ?? null,
    postCount: u._count.posts,
    // Comments + likes given. The card sums postCount + commentCount into
    // one "مشارکت" figure, so folding likes in here keeps that total honest
    // without widening the FamilyProfile type.
    commentCount: u._count.comments + (likesByUser.get(u.id) ?? 0),
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
