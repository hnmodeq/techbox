# 03 — DATA CONTRACTS

> Every query, type, migration, and data rule for the homepage upgrade.
> **Rule 1 governs this entire file: no fake data, ever.** If a query returns nothing, the section disappears.

---

## 1. The single-fetch architecture

**All homepage data comes from ONE cached server call.** Do not add per-section fetches. Do not fetch on the client during first paint.

```
app/layout.tsx  → getLayoutHomeData()  → news + ticker (for global chrome)
app/page.tsx    → getHomeData()        → everything the homepage sections need
                                          ↓
                                  <HomeDataProvider>
                                          ↓
                          each section reads its slice via props
```

### File to extend: `lib/home-server.ts`

It already implements the pattern. Key existing pieces you must reuse:

| Export / internal | What it does | Reuse how |
|---|---|---|
| `cardSelect` | Prisma `select` with all card fields | Extend, don't replace |
| `layoutCardSelect` | Lighter select for ticker/news | Leave alone |
| `normalizeCard(p)` | Maps a Post row → `HomeCard` (dates, reading time, author fallbacks) | **Always** run rows through this |
| `findPosts(module, take)` | Fetch + comment counts + accepted-answer enrichment | Reuse for §1, §2, §7, §9 |
| `getHomeData()` | Cached public entry point | Extend its uncached inner fn |
| `publicPostDateWhere()` | From `lib/post-date.ts` — hides future-dated posts | **Never omit this in a public query** |

### ⚠️ Critical constraint: sequential, not parallel

`getHomeDataUncached()` deliberately loops modules **sequentially**:

```ts
for (const [module, take] of Object.entries(activeModuleTakes)) {
  modules[module] = await findPosts(module, take);
}
```

There is a comment in the source explaining why: *"Sequential to avoid P2024 pool exhaustion – was Promise.all of 7 modules each doing 2-3 queries = up to 21 concurrent"*.

**Do not "optimise" this into `Promise.all`.** Neon's connection pool will exhaust and the homepage will 500 under load. New data blocks you add must also be sequential.

### Cache configuration changes

```ts
// BEFORE
const cachedHomeData = unstable_cache(getHomeDataUncached, ["home-data-v5"], {
  revalidate: 86400, tags: ["home-data"],
});

// AFTER — bump key (schema of the payload changed), shorten window
const cachedHomeData = unstable_cache(getHomeDataUncached, ["home-data-v6"], {
  revalidate: 3600,          // 1h: hourly-seeded random slots in §10/§11 must rotate
  tags: ["home-data"],
});
```
Existing `revalidateTag("home-data")` calls on publish/edit keep working. Do not remove them.

### New payload shape

```ts
// features/home/lib/home-data.tsx — extend HomeData
export type HomeData = {
  modules: Partial<Record<ModuleSlug, HomeCard[]>>;   // existing
  ticker: HomeCard[];                                  // existing
  generatedAt: string;                                 // existing

  // ── NEW ──
  insights?: HomeCard[];              // §3  — 2 items, engagement-ranked
  topPicks?: TopPickCard[];           // §5  — ≤3 reviews w/ linked product
  timeline?: TimelineCard[];          // §6  — ≤12 events
  familyComments?: FamilyComment[];   // §10 — 3 sampled comments
  moreToExplore?: {                   // §11
    hero: HomeCard | null;
    cards: HomeCard[];                // ≤4
  };
  authors?: AuthorCard[];             // §12 — ≤12
};
```

---

## 2. Per-section queries

Each entry gives: the query, the guard, and the failure mode.

### §1 Magazine — `module: "blog"`
```ts
const blog = await findPosts("blog", 5);   // reuses existing helper
// [0] = lead card, [1..4] = compact list
```
- **Guard:** `blog.length >= 1`
- **Ordering:** `date desc` (already inside `findPosts`)
- **Failure:** empty array → section returns `null`

---

### §2 Video — `module: "media"`
```ts
const media = await prisma.post.findMany({
  where: {
    module: "media", published: true, deletedAt: null,
    videoUrl: { not: null },              // ← REQUIRED. A "video" with no video is not a card.
    date: publicPostDateWhere(),
  },
  orderBy: { date: "desc" },
  take: 10,
  select: cardSelect,
});
```
- **Guard:** `>= 3`
- Uses `videoDuration` for the duration pill. If null, hide the pill — do not invent a duration.

---

### §3 Insights — `module: "news"`, engagement-ranked (D5)
The floating news sidebar shows *recent* news. Insights must not duplicate it, so it ranks by **engagement over a 180-day window**.

```ts
const WINDOW_DAYS = 180;
const since = new Date(Date.now() - WINDOW_DAYS * 864e5);

const pool = await prisma.post.findMany({
  where: {
    module: "news", published: true, deletedAt: null,
    date: { gte: since, ...publicPostDateWhere() },
  },
  orderBy: [{ views: "desc" }, { likes: "desc" }, { date: "desc" }],
  take: 12,
  select: cardSelect,
});

// comment counts for the pool (bulk, one query)
const counts = await prisma.comment.groupBy({
  by: ["postId"], _count: { _all: true },
  where: { postId: { in: pool.map(p => p.id) }, status: "approved" },
});

// weighted score — engagement, not recency
const score = (p) => p.views + p.likes * 8 + (commentMap.get(p.id) ?? 0) * 15;

// exclude whatever the news sidebar is already showing (free — already fetched)
const sidebarSlugs = new Set(layoutNews.slice(0, 5).map(n => n.slug));
let picked = pool.filter(p => !sidebarSlugs.has(p.slug))
                 .sort((a,b) => score(b) - score(a))
                 .slice(0, 2);

// If exclusion starved us, allow overlap rather than hide the section.
if (picked.length < 2) picked = pool.sort((a,b) => score(b) - score(a)).slice(0, 2);
```
- **Guard:** `>= 1`
- **Fallback:** if the 180-day window yields nothing, widen to 365 before giving up.
- **Newsletter card** in this section needs no data — it always renders.

---

### §4 Finder — no content query
Submits `GET /search?q=...` to the **existing** `app/search/page.tsx`. Every submit writes a `SearchLog` row via existing `lib/search-log.ts`.

Chips read from `SiteSetting` key `home.finder.chips`:
```jsonc
[
  { "labelFa": "سرورهای آماده‌به‌کار",   "href": "/search?q=%D8%B3%D8%B1%D9%88%D8%B1&module=shop" },
  { "labelFa": "بهترین برای مجازی‌سازی", "href": "/search?q=..." },
  { "labelFa": "دارای گارانتی رسمی",     "href": "/search?q=...&module=shop" }
]
```
If the key is missing, fall back to 3 hardcoded chips pointing at **real** category searches. Never render a chip whose query returns nothing — validate the fallback set once in Phase D.

---

### §5 Top Picks — reviews linked to products ⚠️ needs migration
```ts
const topPicks = await prisma.post.findMany({
  where: {
    module: "review", published: true, deletedAt: null,
    reviewedProductId: { not: null },
    date: publicPostDateWhere(),
    reviewedProduct: {              // product must be live and buyable
      published: true, deletedAt: null,
      NOT: { availability: "ناموجود" },
    },
  },
  orderBy: [{ rating: "desc" }, { date: "desc" }],
  take: 3,
  select: {
    ...cardSelect,
    reviewedProduct: {
      select: {
        id: true, slug: true, title: true, image: true,
        priceAmount: true, sourcePriceAmount: true, sourceCurrency: true,
        priceAdjustmentPercent: true, sellerBenefitPercent: true,
        discountPercent: true, discountEndsAt: true,
        warranty: true, availability: true, brand: true, model: true,
      },
    },
  },
});
```
- **Guard:** `>= 1`
- **Price:** run each `reviewedProduct` through `calculateFinalPriceForPost()` from `lib/currency.ts`. **Server-side only.** Never compute a price on the client; that is an existing security invariant of this codebase.
- **Rating:** `Post.rating` (Float 0–5) + `Post.ratingCount`. If `rating` is null, hide the stars — do not default to 5.

---

### §6 Timeline
```ts
const timeline = await prisma.timelineEvent.findMany({
  where: { published: true },
  orderBy: { dateGr: "asc" },
  take: 12,
  select: {
    id: true, title: true, description: true, image: true,
    dateFa: true, year: true, yearFa: true, importance: true, tags: true,
    _count: { select: { likes: true } },
  },
});
```
- **Guard:** `>= 4`
- `importance >= 8` gets the accent border treatment.

---

### §7 Deals — `module: "shop"`
```ts
// Prefer genuinely discounted products…
let deals = await prisma.post.findMany({
  where: {
    module: "shop", published: true, deletedAt: null,
    discountPercent: { gt: 0 },
    date: publicPostDateWhere(),
  },
  orderBy: [{ discountPercent: "desc" }, { date: "desc" }],
  take: 8,
  select: cardSelect,
});

// …then backfill with newest shop posts so the rail isn't half-empty.
// Still 100% real rows — just not discounted ones.
if (deals.length < 8) {
  const fill = await prisma.post.findMany({
    where: {
      module: "shop", published: true, deletedAt: null,
      id: { notIn: deals.map(d => d.id) },
      date: publicPostDateWhere(),
    },
    orderBy: { date: "desc" },
    take: 8 - deals.length,
    select: cardSelect,
  });
  deals = [...deals, ...fill];
}
```
- **Guard:** `>= 4`
- **Countdown** renders only when `discountEndsAt > now`. Expired → no countdown, no badge.
- **Prices** via `calculateFinalPriceForPost()`. Server-side.

---

### §8 Tools — registry, not DB
```ts
import { toolRoutes } from "@/config/modules.config";
```
Already typed: `{ slug, key, titleFa, title, href, descriptionFa, icon, color, version?, new? }`.
Phase D appends the `ups-calculator` entry. Optional ordering override via `SiteSetting` `home.tools.featured` (array of slugs).
- **Guard:** `>= 1` (always true in practice)

---

### §9 Community — `module: "forum"`
```ts
const forum = await findPosts("forum", 6);
// findPosts already attaches: comment counts + acceptedAnswer preview
```
- **Featured slot:** first post where `solved === true && acceptedAnswer` exists.
  **Fallback:** if no solved posts, use the highest `comments` count and hide the green best-answer strip.
- **List:** remaining 5.
- **Guard:** `>= 3`

---

### §10 Family Comments — random, real, safe ⚠️ needs `User.createdAt`
Pulls from **two** tables (`Comment` and `TimelineComment`) and merges.

```ts
const comments = await prisma.comment.findMany({
  where: {
    status: "approved",
    deletedAt: null,
    authorId: { not: null },            // registered users only
    text: { not: "" },
    post: { published: true, deletedAt: null },
  },
  orderBy: { likes: "desc" },           // quality bias
  take: 60,
  select: {
    id: true, text: true, createdAt: true, likes: true,
    author: { select: { name: true, username: true, avatar: true, createdAt: true, verifiedType: true, status: true } },
    post: { select: { module: true, slug: true, title: true } },
  },
});

const timelineComments = await prisma.timelineComment.findMany({
  where: { status: "approved", text: { not: "" } },
  orderBy: { likes: "desc" }, take: 20,
  select: { id: true, text: true, createdAt: true, likes: true, authorName: true,
            event: { select: { id: true, title: true } } },
});
```

**Filters applied in memory:**
1. `80 <= text.length <= 400` — excludes "👍" and excludes walls of text.
2. `author.status === "active"` — no banned/suspended users quoted.
3. Not in `SiteSetting` `home.familyComments.blocklist` (array of comment IDs — admin kill-switch).
4. Deduplicate by author: max 1 quote per person.

**Selection:** hourly-seeded deterministic sample (see §4 below) → 3 items.
- **Guard:** `>= 3`
- **"عضو از ۱۳۹۸"** derives from `author.createdAt` → **requires Migration 3.**
- **Link target:** `/{module}/{slug}#comment-{id}`

---

### §11 More to Explore
| Slot | Query |
|---|---|
| Hero | random `module:"news"` from the **whole archive** (seeded offset) |
| Card 1 | oldest `module:"media"` with `videoUrl` — `orderBy date asc` |
| Card 2 | oldest `module:"blog"` — `orderBy date asc` |
| Card 3 | oldest `module:"forum"` — `orderBy date asc` |
| Card 4 | oldest `TimelineEvent` — `orderBy dateGr asc` |

```ts
const total = await prisma.post.count({
  where: { module: "news", published: true, deletedAt: null },
});
const skip = total ? seededIndex(total) : 0;
const hero = total
  ? await prisma.post.findFirst({
      where: { module: "news", published: true, deletedAt: null, date: publicPostDateWhere() },
      orderBy: { date: "desc" }, skip, select: cardSelect,
    })
  : null;
```
- **Guard:** hero present AND `>= 2` cards

---

### §12 Authors ⚠️ needs `User.createdAt` for nothing here, but included in same migration
```ts
const authors = await prisma.user.findMany({
  where: {
    status: "active",
    posts: { some: { published: true, deletedAt: null } },   // no ghost authors
  },
  orderBy: { posts: { _count: "desc" } },
  take: 12,
  select: {
    name: true, username: true, roleFa: true, role: true, job: true, bio: true,
    avatar: true, verifiedType: true, verifiedLabel: true,
    _count: { select: { posts: true } },
  },
});
```
- **Guard:** `>= 4`
- Verified tick colours: `content` = blue, `org` = purple, `user` = gold. Tooltip = `verifiedLabel`.
- Links to `/author/{username}` — route already exists.

---

## 3. Migrations

Run in this order. Each is additive and reversible except where noted.

### Migration 1 — `review_product_link` (Phase B)
```prisma
model Post {
  // ... existing fields ...
  reviewedProductId String?
  reviewedProduct   Post?  @relation("ProductReviews", fields: [reviewedProductId], references: [id], onDelete: SetNull)
  productReviews    Post[] @relation("ProductReviews")

  @@index([reviewedProductId], name: "post_reviewed_product_idx")
}
```
Nullable → zero downtime, nothing breaks. `onDelete: SetNull` means deleting a product does not delete its review.

### Migration 2 — `review_product_backfill` (Phase E, data-only)
Scored auto-match. **Only writes at score ≥ 80.**

| Signal | Score |
|---|---|
| `review.sku === product.sku` (both non-null) | 100 |
| `brand` AND `model` both match (case-insensitive) | 80 |
| `brand` matches AND ≥2 shared title tokens | 50 |
| `pg_trgm` title similarity ≥ 0.45 | 30 |

Scores 30–79 → **manual triage queue**, never auto-linked. A wrong link puts a wrong live price on a review card, which is worse than an empty section.

> ⚠️ `pg_trgm` may not be enabled on Neon. Check with `SELECT * FROM pg_extension WHERE extname='pg_trgm';`. If absent, the ≥80 tier still works (exact matches only) and fuzzy suggestions are simply unavailable. Do not block on it.

### Migration 3 — `user_created_at` (Phase B)
```prisma
model User {
  // ... existing fields ...
  createdAt DateTime @default(now())
  @@index([createdAt], name: "user_created_idx")
}
```
Backfill so existing users don't all show today's date:
```sql
UPDATE "User" u
SET "createdAt" = COALESCE(
  (SELECT MIN(p."date") FROM "Post" p WHERE p."authorId" = u.id),
  u."createdAt"
);
```

### Migration 4 — `enable_review_module` (Phase E, data-only)
`SiteSetting` key `modules.config` → set `review.enabled = true`, `review.showOnHome = true`. Reversible from the admin UI.

### Migration 5 — `review_product_required` (Phase E) 🚦 GATED
```prisma
reviewedProductId String   // NOT NULL
```
**Only run when every `module:"review"` row is either linked or moved out of the module.** Verify first:
```sql
SELECT COUNT(*) FROM "Post" WHERE module='review' AND "reviewedProductId" IS NULL AND "deletedAt" IS NULL;
-- must return 0
```
If it returns anything > 0, **skip this migration** and leave the column nullable. A failed deploy is not worth the schema purity.

---

## 4. Deterministic randomness (§10, §11)

Random content must be **stable within a cache window**, or SSR and hydration disagree and React throws a mismatch.

```ts
/** Rotates hourly; identical on server and client within the same hour. */
export function seededIndex(total: number, salt = 0): number {
  if (total <= 0) return 0;
  const hour = Math.floor(Date.now() / 3_600_000);
  return Math.abs(((hour + salt) * 2654435761) % total);   // Knuth multiplicative
}
```
- Matches `revalidate: 3600` exactly — content changes when the cache regenerates, never mid-render.
- Use a different `salt` per slot so the hero and the comment sample don't rotate in lockstep.
- **Never** use `Math.random()` or `Date.now()` directly in a component.

---

## 5. Review policy — the invariant (D2)

**A review may only exist for a product TechBox sells.** Enforced at four layers:

| Layer | Enforcement | Phase |
|---|---|---|
| Schema | `reviewedProductId` nullable → `NOT NULL` once clean | B / E |
| API | Review create/update rejects missing or non-shop `reviewedProductId` → **422** | E |
| Admin UI | Required async product picker; Save disabled until a published `module:"shop"` post is chosen | E |
| Read path | §5 additionally skips unpublished / soft-deleted / `ناموجود` products | E |

**Client-side validation alone is not acceptable.** The API guard is mandatory.

### Migrating existing reviews — four outcomes
The owner confirmed reviews exist and may not match the catalogue. Per review:

1. **Auto-link** (score ≥ 80) — done by Migration 2.
2. **Manual triage** (30–79) — admin picks from top-3 suggestions.
3. **Product missing but should exist** — "create product from review" action pre-fills `brand`/`model`/`sku`/`image`. Turns a content gap into a catalogue entry.
4. **Genuinely off-catalogue** — owner picks per item:
   - **(a) Convert to `module:"blog"`** ← recommended default. The writing keeps its value; `SlugRedirect` preserves the URL and SEO.
   - (b) Keep as an unlinked review, excluded from §5.
   - (c) Unpublish.

**Nothing is ever deleted.** Comments, likes, and revisions survive every path.

---

## 6. Content seeding rules

The owner authorised creating content where thin. Constraints:

- **Audit before seeding.** Task B1 produces real row counts. Seed only proven gaps.
- **Real editorial Persian content only.** No lorem. No placeholder products. No invented prices, ratings, or comments.
- **Never seed:** `Comment`, `Rating`, `Like`, `Order`, `User`. Fabricated social proof is a lie to visitors — if §10 lacks comments, it stays hidden.
- **Safe to seed:** `TimelineEvent` (real IT-history milestones are factual), `Post module:"blog"` / `"news"` (genuine articles), shop products **only** with real prices the owner supplies.
- Everything seeded goes through the admin panel or a reviewed `prisma/seed-*.ts` script, never a raw SQL insert.

---

## 7. New `SiteSetting` keys

| Key | Shape | Used by | Default if missing |
|---|---|---|---|
| `home.announcement` | JSON — see `02-DESIGN-SPEC.md` §0 | §0 | `{ enabled: false }` → renders null |
| `home.finder.chips` | JSON array of `{ labelFa, href }` | §4 | 3 hardcoded real category searches |
| `home.tools.featured` | JSON array of tool slugs | §8 | full `toolRoutes` order |
| `home.familyComments.blocklist` | JSON array of comment IDs | §10 | `[]` |

Read via existing `getSetting(key)` / `getSettings(keys)` from `lib/settings.ts`. **Batch them into one query** — that file already exists to prevent P2024 pool exhaustion from N individual lookups.
