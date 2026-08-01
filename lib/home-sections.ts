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
  VideoHighlightComment,
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
 * The right-hand lead of the Latest section is the published news item with
 * the most approved comments in the current seven-day window. Ties favour
 * the newer post. When a quiet week has no news, the newest published item
 * is a real-content fallback rather than an invented empty card.
 */
export async function getLatestInsights(
  normalize: (p: any) => ContentItem,
  cardSelect: any,
): Promise<LatestInsights> {
  const weekAgo = new Date(Date.now() - 7 * 864e5);
  const weekly = await prisma.post.findMany({
    where: {
      module: "news",
      ...PUBLISHED,
      date: { gte: weekAgo, ...publicPostDateWhere() },
    },
    orderBy: { date: "desc" },
    take: 30,
    select: cardSelect,
  });

  let pool: any[] = weekly as any[];
  if (pool.length === 0) {
    pool = await prisma.post.findMany({
      where: { module: "news", ...PUBLISHED, date: publicPostDateWhere() },
      orderBy: { date: "desc" },
      take: 1,
      select: cardSelect,
    });
  }
  if (pool.length === 0) return { story: null, comments: [] };

  const counts = await prisma.comment.groupBy({
    by: ["postId"],
    _count: { _all: true },
    where: { postId: { in: pool.map((post: any) => post.id) }, status: "approved", deletedAt: null },
  });
  const countByPost = new Map(counts.map((entry) => [entry.postId, entry._count._all || 0]));

  // The lead is the recent story people are actually discussing: the one
  // with the most approved comments in the window, breaking ties toward the
  // newest. A strictly-newest rule would surface an empty story almost every
  // time, and the section carries a comment rail, an inline reply box and a
  // count — all dead space on something nobody has replied to.
  //
  // `pool` is already ordered date-desc, and Array.prototype.sort is stable,
  // so stories with equal comment counts keep their newest-first order.
  const featured = [...pool].sort(
    (a: any, b: any) =>
      (countByPost.get(b.id) || 0) - (countByPost.get(a.id) || 0),
  )[0];

  // No comment rows are fetched here any more.
  //
  // The section used to render a server-side rail beside a hidden
  // CommentSection. That combination silently broke posting — the visible
  // rail came from this hour-cached payload and could not update — so the
  // live CommentSection now owns the thread and fetches it client-side.
  // Keeping this query would cost one extra round trip per homepage render
  // to build a list nobody renders.

  const story = normalize(featured);
  story.comments = countByPost.get(featured.id) || 0;
  return { story, comments: [] };
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
