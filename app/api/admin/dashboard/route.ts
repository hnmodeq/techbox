import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUserPublic } from "@/lib/auth-server";
import { cacheHeaders, PRIVATE_NO_STORE } from "@/lib/cache-headers";

const CONTENT_MODULES = [
  "blog",
  "news",
  "media",
  "forum",
  "download",
  "tools",
  "review",
  "timeline",
  "shop",
] as const;

type ContentModule = typeof CONTENT_MODULES[number];
type DashboardPostGroup = { module: string; count: number; views: number };
type LatestPost = { module: ContentModule; post: { date: Date; dateFa: string } | null };

function parseModules(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw.filter((item): item is string => typeof item === "string");
  if (typeof raw !== "string") return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.filter((item): item is string => typeof item === "string");
  } catch {}
  return raw.split(",").map((item) => item.trim()).filter(Boolean);
}

function getAllowedModules(user: { role: string; modules?: string | string[] | null }): ContentModule[] {
  if (user.role === "super_admin") return [...CONTENT_MODULES];
  const allowed = new Set(parseModules(user.modules));
  return CONTENT_MODULES.filter((module) => allowed.has(module));
}

export async function GET() {
  const user = await getSessionUserPublic();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401, headers: cacheHeaders(PRIVATE_NO_STORE) });
  }

  const allowedModules = getAllowedModules(user as any);
  if (allowedModules.length === 0) {
    return NextResponse.json({ modules: [], totals: { count: 0, views: 0 } }, { headers: cacheHeaders(PRIVATE_NO_STORE) });
  }

  try {
    const postModules = allowedModules.filter((module) => module !== "timeline");

    let postGroups: DashboardPostGroup[] = [];
    if (postModules.length) {
      const groups = await prisma.post.groupBy({
        by: ["module"],
        where: { module: { in: postModules }, deletedAt: null },
        _count: { _all: true },
        _sum: { views: true },
      });
      postGroups = groups.map((group: any) => ({
        module: group.module,
        count: group._count._all,
        views: group._sum.views ?? 0,
      }));
    }

    const latestPosts: LatestPost[] = postModules.length
      ? await Promise.all(
          postModules.map(async (module) => ({
            module,
            post: await prisma.post.findFirst({
              where: { module, deletedAt: null },
              orderBy: { date: "desc" },
              select: { date: true, dateFa: true },
            }),
          }))
        )
      : [];

    const [timelineCount, latestTimeline] = await Promise.all([
      allowedModules.includes("timeline") ? prisma.timelineEvent.count() : Promise.resolve(0),
      allowedModules.includes("timeline")
        ? prisma.timelineEvent.findFirst({ orderBy: { dateGr: "desc" }, select: { dateFa: true, dateGr: true } })
        : Promise.resolve(null),
    ]);

    const postGroupMap = new Map(
      postGroups.map((group) => [
        group.module,
        {
          count: group.count,
          views: group.views,
        },
      ])
    );
    const latestMap = new Map(
      latestPosts.map(({ module, post }) => [
        module,
        post?.dateFa || (post?.date ? new Intl.DateTimeFormat("fa-IR", { dateStyle: "long" }).format(post.date) : ""),
      ])
    );

    const modules = allowedModules.map((module) => {
      if (module === "timeline") {
        return {
          module,
          count: timelineCount,
          views: 0,
          latest:
            latestTimeline?.dateFa ||
            (latestTimeline?.dateGr
              ? new Intl.DateTimeFormat("fa-IR", { dateStyle: "long" }).format(latestTimeline.dateGr)
              : ""),
        };
      }

      const group = postGroupMap.get(module) || { count: 0, views: 0 };
      return {
        module,
        count: group.count,
        views: group.views,
        latest: latestMap.get(module) || "",
      };
    });

    const totals = modules.reduce(
      (acc, module) => ({ count: acc.count + module.count, views: acc.views + module.views }),
      { count: 0, views: 0 }
    );

    return NextResponse.json({ modules, totals }, { headers: cacheHeaders(PRIVATE_NO_STORE) });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "dashboard_unavailable" },
      { status: 500, headers: cacheHeaders(PRIVATE_NO_STORE) }
    );
  }
}

export const dynamic = "force-dynamic";
