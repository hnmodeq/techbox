/**
 * Homepage Upgrade — Task B1 Data Audit  (READ-ONLY)
 *
 * Reports whether each planned homepage section has enough real content to
 * render, and analyses how existing reviews would map onto shop products.
 *
 * Performs NO writes of any kind.
 *
 * Usage:  pnpm exec tsx scripts/checks/homepage-audit.ts
 * Docs:   docs/homepage-upgrade/04-PHASES.md  (Task B1)
 */
import { prisma } from './_shared';

// ── Thresholds from docs/homepage-upgrade/02-DESIGN-SPEC.md §4 ──────────────
const THRESHOLDS: Record<string, number> = {
  '§1 Magazine': 1,
  '§2 Video': 3,
  '§3 Insights': 1,
  '§5 Top Picks': 1,
  '§6 Timeline': 4,
  '§7 Deals': 4,
  '§9 Community': 3,
  '§10 Family Comments': 3,
  '§11 More to Explore': 3,
  '§12 Authors': 4,
};

const PUBLISHED = { published: true, deletedAt: null } as const;

function pad(s: string, n: number) {
  // Persian/emoji-safe-enough padding for console tables
  const len = [...s].length;
  return s + ' '.repeat(Math.max(0, n - len));
}

function verdict(actual: number, min: number) {
  if (actual >= min) return '✅ OK';
  if (actual > 0) return '⚠️  DEGRADED';
  return '❌ HIDDEN';
}

function norm(v: string | null | undefined) {
  return (v ?? '').trim().toLowerCase();
}

function titleTokens(t: string) {
  return new Set(
    t
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s]/gu, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 2),
  );
}

/** Scoring per docs/homepage-upgrade/03-DATA-CONTRACTS.md §3 Migration 2 */
function scoreMatch(
  review: { sku: string | null; brand: string | null; model: string | null; title: string },
  product: { sku: string | null; brand: string | null; model: string | null; title: string },
): number {
  if (review.sku && product.sku && norm(review.sku) === norm(product.sku)) return 100;

  const brandMatch = !!review.brand && !!product.brand && norm(review.brand) === norm(product.brand);
  const modelMatch = !!review.model && !!product.model && norm(review.model) === norm(product.model);
  if (brandMatch && modelMatch) return 80;

  const rt = titleTokens(review.title);
  const pt = titleTokens(product.title);
  let shared = 0;
  for (const t of rt) if (pt.has(t)) shared++;

  if (brandMatch && shared >= 2) return 50;
  if (shared >= 3) return 30; // proxy for trigram similarity when pg_trgm is absent
  return 0;
}

async function main() {
  const out: string[] = [];
  const log = (s = '') => {
    out.push(s);
    console.log(s);
  };

  log('');
  log('═══════════════════════════════════════════════════════════════════');
  log('  TECHBOX HOMEPAGE UPGRADE — B1 DATA AUDIT (read-only)');
  log(`  ${new Date().toISOString()}`);
  log('═══════════════════════════════════════════════════════════════════');

  // ── 1. Module inventory ────────────────────────────────────────────────
  log('');
  log('── 1. MODULE INVENTORY (published, not deleted) ───────────────────');
  const modules = ['blog', 'news', 'media', 'shop', 'forum', 'review', 'download'];
  const counts: Record<string, number> = {};
  for (const m of modules) {
    counts[m] = await prisma.post.count({ where: { module: m, ...PUBLISHED } });
  }
  const totalPosts = await prisma.post.count();
  const totalPublished = await prisma.post.count({ where: PUBLISHED });

  log(`  ${pad('module', 12)} ${pad('published', 10)}`);
  log(`  ${'─'.repeat(24)}`);
  for (const m of modules) log(`  ${pad(m, 12)} ${pad(String(counts[m]), 10)}`);
  log(`  ${'─'.repeat(24)}`);
  log(`  ${pad('TOTAL', 12)} ${pad(String(totalPublished), 10)} (${totalPosts} incl. drafts/deleted)`);

  // ── 2. Section-specific viability ──────────────────────────────────────
  log('');
  log('── 2. SECTION VIABILITY ───────────────────────────────────────────');

  const mediaWithVideo = await prisma.post.count({
    where: { module: 'media', ...PUBLISHED, videoUrl: { not: null } },
  });
  const shopDiscounted = await prisma.post.count({
    where: { module: 'shop', ...PUBLISHED, discountPercent: { gt: 0 } },
  });
  const shopDiscountLive = await prisma.post.count({
    where: {
      module: 'shop', ...PUBLISHED,
      discountPercent: { gt: 0 },
      discountEndsAt: { gt: new Date() },
    },
  });
  const forumSolved = await prisma.post.count({
    where: { module: 'forum', ...PUBLISHED, solved: true, acceptedCommentId: { not: null } },
  });
  const timelinePublished = await prisma.timelineEvent.count({ where: { published: true } });

  const since180 = new Date(Date.now() - 180 * 864e5);
  const news180 = await prisma.post.count({
    where: { module: 'news', ...PUBLISHED, date: { gte: since180 } },
  });

  const authorsWithPosts = await prisma.user.count({
    where: { status: 'active', posts: { some: PUBLISHED } },
  });

  // §10 Family Comments — apply the real filter chain
  const commentPool = await prisma.comment.findMany({
    where: {
      status: 'approved',
      deletedAt: null,
      authorId: { not: null },
      text: { not: '' },
      post: PUBLISHED,
    },
    select: {
      id: true, text: true,
      author: { select: { status: true, username: true } },
    },
    take: 500,
  });
  const familyEligible = commentPool.filter((c) => {
    const len = [...c.text].length;
    return len >= 80 && len <= 400 && c.author?.status === 'active';
  });
  const familyUniqueAuthors = new Set(familyEligible.map((c) => c.author?.username)).size;

  const timelineComments = await prisma.timelineComment.count({
    where: { status: 'approved', text: { not: '' } },
  });

  const rows: Array<[string, number, string]> = [
    ['§1 Magazine', counts.blog, 'blog posts'],
    ['§2 Video', mediaWithVideo, `media w/ videoUrl (of ${counts.media})`],
    ['§3 Insights', news180, `news in last 180d (of ${counts.news} total)`],
    ['§6 Timeline', timelinePublished, 'published events'],
    ['§7 Deals', counts.shop, `shop posts (${shopDiscounted} discounted, ${shopDiscountLive} live)`],
    ['§9 Community', counts.forum, `forum posts (${forumSolved} solved w/ answer)`],
    ['§10 Family Comments', familyUniqueAuthors, `eligible, unique authors (${familyEligible.length} comments, +${timelineComments} timeline)`],
    ['§12 Authors', authorsWithPosts, 'active users w/ ≥1 published post'],
  ];

  log(`  ${pad('section', 22)} ${pad('count', 7)} ${pad('min', 5)} ${pad('verdict', 13)} detail`);
  log(`  ${'─'.repeat(95)}`);
  for (const [name, actual, detail] of rows) {
    const min = THRESHOLDS[name] ?? 1;
    log(`  ${pad(name, 22)} ${pad(String(actual), 7)} ${pad(String(min), 5)} ${pad(verdict(actual, min), 13)} ${detail}`);
  }

  // ── 3. Review → product analysis (§5 Top Picks) ────────────────────────
  log('');
  log('── 3. REVIEW → PRODUCT MATCH ANALYSIS (§5 Top Picks) ──────────────');

  const reviews = await prisma.post.findMany({
    where: { module: 'review', deletedAt: null },
    select: { id: true, slug: true, title: true, brand: true, model: true, sku: true, published: true, rating: true },
  });
  const products = await prisma.post.findMany({
    where: { module: 'shop', ...PUBLISHED },
    select: { id: true, slug: true, title: true, brand: true, model: true, sku: true, availability: true, priceAmount: true },
  });

  log(`  reviews (incl. unpublished): ${reviews.length}`);
  log(`  shop products (published):   ${products.length}`);

  if (reviews.length === 0) {
    log('  → No reviews exist. §5 starts clean; no backfill needed.');
  } else if (products.length === 0) {
    log('  → ⚠️  No shop products. §5 cannot render until the catalogue exists.');
  } else {
    const buckets = { auto: [] as string[], triage: [] as string[], none: [] as string[] };
    const details: Array<{ review: string; best: string; score: number }> = [];

    for (const r of reviews) {
      let best = 0;
      let bestP: (typeof products)[number] | null = null;
      for (const p of products) {
        const s = scoreMatch(r, p);
        if (s > best) { best = s; bestP = p; }
      }
      details.push({ review: r.title, best: bestP?.title ?? '—', score: best });
      if (best >= 80) buckets.auto.push(r.slug);
      else if (best >= 30) buckets.triage.push(r.slug);
      else buckets.none.push(r.slug);
    }

    log('');
    log(`  ${pad('bucket', 34)} ${pad('count', 7)} action`);
    log(`  ${'─'.repeat(80)}`);
    log(`  ${pad('auto-link (score ≥ 80)', 34)} ${pad(String(buckets.auto.length), 7)} migration 2 links automatically`);
    log(`  ${pad('manual triage (30–79)', 34)} ${pad(String(buckets.triage.length), 7)} admin picks from suggestions`);
    log(`  ${pad('no candidate (< 30)', 34)} ${pad(String(buckets.none.length), 7)} create product OR convert to blog`);

    log('');
    log('  Per-review detail:');
    for (const d of details.sort((a, b) => b.score - a.score)) {
      const tag = d.score >= 80 ? 'AUTO  ' : d.score >= 30 ? 'TRIAGE' : 'NONE  ';
      log(`    [${tag}] ${String(d.score).padStart(3)}  ${d.review.slice(0, 46)}`);
      if (d.score > 0) log(`                  ↳ ${d.best.slice(0, 60)}`);
    }
  }

  // ── 4. pg_trgm availability ────────────────────────────────────────────
  log('');
  log('── 4. ENVIRONMENT ─────────────────────────────────────────────────');
  try {
    const ext = await prisma.$queryRawUnsafe<Array<{ extname: string }>>(
      `SELECT extname FROM pg_extension WHERE extname = 'pg_trgm'`,
    );
    log(`  pg_trgm extension: ${ext.length ? '✅ enabled (fuzzy matching available)' : '⚠️  not enabled (exact matching only — fine)'}`);
  } catch (e) {
    log(`  pg_trgm check failed: ${(e as Error).message}`);
  }

  const reviewSetting = await prisma.siteSetting.findUnique({ where: { key: 'modules.config' } });
  if (reviewSetting) {
    try {
      const cfg = JSON.parse(reviewSetting.value);
      log(`  review module enabled:   ${cfg?.review?.enabled === true ? '✅ yes' : '❌ no (migration 4 will enable)'}`);
      log(`  review showOnHome:       ${cfg?.review?.showOnHome === true ? '✅ yes' : '❌ no'}`);
    } catch {
      log('  modules.config present but unparseable');
    }
  } else {
    log('  modules.config: not set (defaults apply — review enabled by default)');
  }

  const userNoCreatedAt = await prisma.$queryRawUnsafe<Array<{ c: bigint }>>(
    `SELECT COUNT(*)::bigint AS c FROM information_schema.columns
     WHERE table_name = 'User' AND column_name = 'createdAt'`,
  );
  log(`  User.createdAt column:   ${Number(userNoCreatedAt[0]?.c) > 0 ? '✅ exists' : '❌ missing (migration 3 adds it)'}`);

  // ── 5. Summary ─────────────────────────────────────────────────────────
  log('');
  log('── 5. SUMMARY ─────────────────────────────────────────────────────');
  const blocked = rows.filter(([n, a]) => a < (THRESHOLDS[n] ?? 1) && a === 0);
  const degraded = rows.filter(([n, a]) => a > 0 && a < (THRESHOLDS[n] ?? 1));
  log(`  sections OK:       ${rows.length - blocked.length - degraded.length} / ${rows.length}`);
  log(`  sections degraded: ${degraded.length}${degraded.length ? ' → ' + degraded.map((r) => r[0]).join(', ') : ''}`);
  log(`  sections hidden:   ${blocked.length}${blocked.length ? ' → ' + blocked.map((r) => r[0]).join(', ') : ''}`);
  log('');
  log('  NOTE: no writes were performed. This is a read-only audit.');
  log('═══════════════════════════════════════════════════════════════════');
  log('');

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error('audit failed:', e);
  await prisma.$disconnect();
  process.exit(1);
});
