import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";
import { publicPostDateWhere } from "@/lib/post-date";

export const dynamic = "force-dynamic";
export const revalidate = 86400;

function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || "https://hnmodeq-techbox.vercel.app").replace(/\/$/, "");
}

function entry(url: string, lastModified?: Date | string, priority = 0.7, changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] = "weekly") {
  return {
    url,
    lastModified: lastModified ? new Date(lastModified) : new Date(),
    changeFrequency,
    priority,
  } satisfies MetadataRoute.Sitemap[number];
}

const staticRoutes = [
  { path: "/", priority: 1, changeFrequency: "daily" as const },
  { path: "/blog", priority: 0.9, changeFrequency: "daily" as const },
  { path: "/news", priority: 0.9, changeFrequency: "daily" as const },
  { path: "/media", priority: 0.85, changeFrequency: "daily" as const },
  { path: "/review", priority: 0.85, changeFrequency: "weekly" as const },
  { path: "/download", priority: 0.8, changeFrequency: "weekly" as const },
  { path: "/shop", priority: 0.8, changeFrequency: "weekly" as const },
  { path: "/forum", priority: 0.8, changeFrequency: "daily" as const },
  { path: "/timeline", priority: 0.75, changeFrequency: "weekly" as const },
  { path: "/tools", priority: 0.7, changeFrequency: "monthly" as const },
  { path: "/tools/nas-selector", priority: 0.65, changeFrequency: "monthly" as const },
  { path: "/tools/nvr-selector", priority: 0.65, changeFrequency: "monthly" as const },
  { path: "/tools/raid-calculator", priority: 0.65, changeFrequency: "monthly" as const },
  { path: "/tools/subnet-calculator", priority: 0.65, changeFrequency: "monthly" as const },
  { path: "/about", priority: 0.5, changeFrequency: "monthly" as const },
  { path: "/contact", priority: 0.5, changeFrequency: "monthly" as const },
  { path: "/terms", priority: 0.3, changeFrequency: "yearly" as const },
  { path: "/work-with-us", priority: 0.45, changeFrequency: "monthly" as const },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const routes: MetadataRoute.Sitemap = staticRoutes.map((route) =>
    entry(`${base}${route.path}`, undefined, route.priority, route.changeFrequency)
  );

  if (process.env.DATABASE_URL) {
    try {
      const [posts, timeline] = await Promise.all([
        prisma.post.findMany({
          where: { published: true, deletedAt: null, date: publicPostDateWhere() },
          select: { module: true, slug: true, date: true },
          orderBy: { date: "desc" },
          take: 5000,
        }),
        prisma.timelineEvent.findMany({
          where: { published: true },
          select: { updatedAt: true },
          orderBy: { dateGr: "desc" },
          take: 1,
        }).catch(() => []),
      ]);

      for (const post of posts) {
        routes.push(entry(`${base}/${post.module}/${post.slug}`, post.date, 0.72, post.module === "news" ? "daily" : "weekly"));
      }

      if (timeline[0]?.updatedAt) {
        routes.push(entry(`${base}/timeline`, timeline[0].updatedAt, 0.78, "weekly"));
      }

      return routes;
    } catch {
      // Fall back to bundled content if the database is temporarily unavailable.
    }
  }


  return routes;
}
