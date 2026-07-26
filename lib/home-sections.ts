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
import { publicPostDateWhere } from "@/lib/post-date";
import { gregorianToJalali } from "@/lib/jalali";
import { calculateFinalPriceForPost } from "@/lib/currency";
import type { ContentItem } from "@/lib/content";
import type {
  TopPickCard,
  TimelineCard,
  FamilyComment,
  AuthorCard,
  MoreToExplore,
} from "@/features/home/lib/home-types";

const PUBLISHED = { published: true, deletedAt: null } as const;

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

// ═════════════════════════════════════════════════════════════════════
// §3 Latest Insights — engagement-ranked news
// ═════════════════════════════════════════════════════════════════════

/**
 * The floating news sidebar already shows the most RECENT news. If this
 * section also sorted by recency the same headline would appear twice,
 * a couple of hundred pixels apart. So it ranks the last 180 days by
 * engagement and excludes whatever the sidebar is currently showing.
 *
 * @param excludeSlugs slugs already visible in the news sidebar
 */
export async function getInsights(
  excludeSlugs: string[],
  normalize: (p: any) => ContentItem,
  cardSelect: any,
): Promise<ContentItem[]> {
  const WINDOW_DAYS = 180;

  const fetchPool = async (days: number) =>
    prisma.post.findMany({
      where: {
        module: "news",
        ...PUBLISHED,
        date: { gte: new Date(Date.now() - days * 864e5), ...publicPostDateWhere() },
      },
      orderBy: [{ views: "desc" }, { likes: "desc" }, { date: "desc" }],
      take: 12,
      select: cardSelect,
    });

  let pool = await fetchPool(WINDOW_DAYS);
  // A quiet 6 months shouldn't hide the section — widen before giving up.
  if (pool.length === 0) pool = await fetchPool(365);
  if (pool.length === 0) return [];

  // Comment counts in one grouped query, not one per post.
  const counts = await prisma.comment.groupBy({
    by: ["postId"],
    _count: { _all: true },
    where: { postId: { in: pool.map((p: any) => p.id) }, status: "approved" },
  });
  const commentMap = new Map(counts.map((c) => [c.postId, c._count._all || 0]));

  const score = (p: any) =>
    (p.views || 0) + (p.likes || 0) * 8 + (commentMap.get(p.id) || 0) * 15;

  const excluded = new Set(excludeSlugs);
  const ranked = [...pool].sort((a: any, b: any) => score(b) - score(a));

  let picked = ranked.filter((p: any) => !excluded.has(p.slug)).slice(0, 2);
  // If dedupe starved us, a repeated headline still beats an empty band.
  if (picked.length < 2) picked = ranked.slice(0, 2);

  return picked.map((p: any) => {
    const item = normalize(p);
    item.comments = commentMap.get(p.id) || 0;
    return item;
  });
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

  const out: TopPickCard[] = [];
  for (const r of rows as any[]) {
    const p = r.reviewedProduct;
    if (!p) continue;

    // Price is resolved server-side through the existing currency pipeline.
    // The client never computes a price — that is an existing invariant.
    let finalPrice: number | null = p.priceAmount ?? null;
    try {
      const calc = await calculateFinalPriceForPost(p);
      if (typeof calc === "number" && Number.isFinite(calc)) finalPrice = calc;
    } catch {
      // Fall back to the stored amount rather than dropping the card.
    }

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
 * Every price is resolved through calculateFinalPriceForPost, because all
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

  const out: ContentItem[] = [];
  for (const r of rows) {
    const item = normalize(r);
    try {
      const final = await calculateFinalPriceForPost(r);
      if (typeof final === "number" && final > 0) item.priceAmount = final;
    } catch {
      // Keep the stored amount rather than dropping the card.
    }
    out.push(item);
  }
  return out;
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

/** Long enough to be a real opinion, short enough to fit the card. */
const MIN_LEN = 80;
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
    take: 60,
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

  // Rotate hourly through the eligible pool.
  const start = seededIndex(eligible.length, 11);
  return [0, 1, 2].map((i) => eligible[(start + i) % eligible.length]);
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

  // Cards: the OLDEST item per module — genuine rediscovery, not a
  // second helping of what is already above the fold.
  const oldest = async (module: string, extra: any = {}): Promise<any | null> =>
    prisma.post.findFirst({
      where: { module, ...PUBLISHED, date: publicPostDateWhere(), ...extra },
      orderBy: { date: "asc" },
      select: cardSelect,
    }) as Promise<any | null>;

  const cards: ContentItem[] = [];
  const heroSlug = hero?.slug;

  for (const [module, extra] of [
    ["media", { videoUrl: { not: null } }],
    ["blog", {}],
    ["forum", {}],
    ["shop", {}],
  ] as Array<[string, any]>) {
    const row = await oldest(module, extra);
    if (row && row.slug !== heroSlug) cards.push(normalize(row));
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
    role: u.roleFa || u.job || u.role || "",
    bio: u.bio || "",
    avatar: u.avatar ?? null,
    verifiedType: u.verifiedType ?? null,
    verifiedLabel: u.verifiedLabel ?? null,
    postCount: u._count.posts,
  }));
}
