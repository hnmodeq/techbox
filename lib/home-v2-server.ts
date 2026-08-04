import { unstable_cache } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { getHomeData, getMagazinePosts } from "@/lib/home-server";
import { calculateFinalTomanPrice, getCurrencyRates } from "@/lib/currency";
import { publicPostDateWhere } from "@/lib/post-date";
import type { HomeV2Data, HomeV2Metrics, HomeV2Product } from "@/features/home-v2/lib/home-v2-types";

const PRODUCT_SELECT = {
  id: true,
  slug: true,
  title: true,
  image: true,
  model: true,
  date: true,
  priceAmount: true,
  sourcePriceAmount: true,
  sourceCurrency: true,
  priceAdjustmentPercent: true,
  sellerBenefitPercent: true,
  discountPercent: true,
  availability: true,
} as const;

type ProductRow = Prisma.PostGetPayload<{ select: typeof PRODUCT_SELECT }>;

const rackSignals: Prisma.PostWhereInput[] = [
  { model: { contains: "XU", mode: "insensitive" } },
  { model: { contains: "U-", mode: "insensitive" } },
  { title: { contains: "رک", mode: "insensitive" } },
  { title: { contains: "rack", mode: "insensitive" } },
];

function chooseMixed(pool: ProductRow[], quota: number, sales: Map<string | null, number>) {
  const sold = [...pool].sort((a, b) =>
    (sales.get(b.id) ?? 0) - (sales.get(a.id) ?? 0) || b.date.getTime() - a.date.getTime());
  const discounted = [...pool]
    .filter((row) => (row.discountPercent ?? 0) > 0)
    .sort((a, b) =>
      (b.discountPercent ?? 0) - (a.discountPercent ?? 0) || b.date.getTime() - a.date.getTime());
  const newest = [...pool].sort((a, b) => b.date.getTime() - a.date.getTime());
  const picked: ProductRow[] = [];
  const add = (row?: ProductRow) => {
    if (row && !picked.some((item) => item.id === row.id) && picked.length < quota) picked.push(row);
  };
  for (let index = 0; picked.length < quota && index < Math.max(sold.length, discounted.length); index += 1) {
    add(sold[index]);
    add(discounted[index]);
  }
  newest.forEach(add);
  return picked.slice(0, quota);
}

async function loadHomeV2Supplement(): Promise<{ products: HomeV2Product[]; metrics: HomeV2Metrics }> {
  const baseWhere: Prisma.PostWhereInput = {
    module: "shop",
    published: true,
    deletedAt: null,
    date: publicPostDateWhere(),
    availability: "موجود",
  };

  // Keep production reads sequential; runtime pooling intentionally uses one
  // connection per serverless instance.
  const rack = await prisma.post.findMany({
    where: { ...baseWhere, OR: rackSignals },
    orderBy: [{ date: "desc" }, { id: "desc" }],
    take: 80,
    select: PRODUCT_SELECT,
  });
  const tower = await prisma.post.findMany({
    where: { ...baseWhere, NOT: { OR: rackSignals } },
    orderBy: [{ date: "desc" }, { id: "desc" }],
    take: 80,
    select: PRODUCT_SELECT,
  });
  const candidateIds = [...rack, ...tower].map((row) => row.id);
  const saleRows = candidateIds.length > 0
    ? await prisma.orderItem.groupBy({
        by: ["postId"],
        where: {
          module: "shop",
          postId: { in: candidateIds },
          order: { status: { in: ["paid", "processing", "shipped", "delivered", "completed"] } },
        },
        _sum: { quantity: true },
      })
    : [];
  const sales = new Map(saleRows.map((row) => [row.postId, row._sum.quantity ?? 0]));
  const selected = [
    ...chooseMixed(rack, 6, sales).map((row) => ({ row, formFactor: "rackmount" as const })),
    ...chooseMixed(tower, 2, sales).map((row) => ({ row, formFactor: "tower" as const })),
  ];
  const rates = await getCurrencyRates();
  const products: HomeV2Product[] = selected.map(({ row, formFactor }) => ({
    id: row.id,
    slug: row.slug,
    title: row.title,
    image: row.image,
    model: row.model,
    priceAmount: row.sourcePriceAmount
      ? calculateFinalTomanPrice({
          sourcePrice: row.sourcePriceAmount,
          sourceCurrency: row.sourceCurrency,
          productAdjustmentPercent: row.priceAdjustmentPercent,
          sellerBenefitPercent: row.sellerBenefitPercent,
          rates,
        })
      : row.priceAmount,
    discountPercent: row.discountPercent,
    availability: row.availability,
    formFactor,
    salesCount: sales.get(row.id) ?? 0,
  }));

  const solvedTopics = await prisma.post.count({
    where: { module: "forum", published: true, deletedAt: null, solved: true, date: publicPostDateWhere() },
  });
  const approvedForumAnswers = await prisma.comment.count({
    where: { status: "approved", deletedAt: null, post: { module: "forum", published: true, deletedAt: null } },
  });
  const activeMembers = await prisma.user.count({ where: { status: "active" } });
  const publishedReviews = await prisma.post.count({
    where: { module: "review", published: true, deletedAt: null, date: publicPostDateWhere() },
  });

  return {
    products,
    metrics: { solvedTopics, approvedForumAnswers, activeMembers, publishedReviews },
  };
}

const getSupplement = unstable_cache(loadHomeV2Supplement, ["home-v2-supplement-v1"], {
  revalidate: 900,
  tags: ["home-data", "home-v2"],
});

export async function getHomeV2Data(): Promise<HomeV2Data> {
  const base = await getHomeData();
  const articles = await getMagazinePosts();
  let supplement: { products: HomeV2Product[]; metrics: HomeV2Metrics };
  try {
    supplement = await getSupplement();
  } catch {
    supplement = {
      products: [],
      metrics: { solvedTopics: 0, approvedForumAnswers: 0, activeMembers: 0, publishedReviews: 0 },
    };
  }
  const news = base.latestInsights?.stories?.length
    ? base.latestInsights.stories
    : (base.modules.news ?? []).slice(0, 5);

  return {
    lead: articles[0] ?? base.modules.blog?.[0] ?? null,
    articles: articles.slice(0, 5),
    news: news.slice(0, 5),
    videos: (base.modules.media ?? []).slice(0, 6),
    reviews: (base.topPicks ?? []).slice(0, 5),
    community: base.community ?? { featured: null, topics: [], participantCount: 0 },
    timeline: (base.timeline ?? []).slice(0, 3),
    products: supplement.products,
    authors: (base.authors ?? []).slice(0, 6),
    profiles: (base.familyProfiles ?? []).slice(0, 6),
    advertisements: (base.advertisements ?? []).filter((ad) => ad.enabled).slice(0, 2),
    metrics: supplement.metrics,
    generatedAt: new Date().toISOString(),
  };
}
