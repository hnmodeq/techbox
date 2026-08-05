import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireStaff } from "@/lib/api-permissions";
import { deriveModulesFromPermissions } from "@/lib/user-permissions";
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
type DashboardPostGroup = { module: string; count: number; views: number; latest: Date | null };

export async function GET() {
  const user = await requireStaff();
  if (user instanceof NextResponse) return user;

  const allowed = new Set(deriveModulesFromPermissions(user.role, user.permissions));
  const allowedModules = CONTENT_MODULES.filter((module) => allowed.has(module));
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
        _max: { date: true },
      });
      postGroups = groups.map((group: any) => ({
        module: group.module,
        count: group._count._all,
        views: group._sum.views ?? 0,
        latest: group._max.date,
      }));
    }

    // The group query above also returns each module's latest date. The old
    // implementation launched one findFirst per module in Promise.all.

    let timelineCount = 0;
    let latestTimeline: { dateFa: string; dateGr: Date } | null = null;
    if (allowedModules.includes("timeline")) {
      timelineCount = await prisma.timelineEvent.count();
      latestTimeline = await prisma.timelineEvent.findFirst({
        orderBy: { dateGr: "desc" },
        select: { dateFa: true, dateGr: true },
      });
    }

    const postGroupMap = new Map(
      postGroups.map((group) => [
        group.module,
        {
          count: group.count,
          views: group.views,
          latest: group.latest,
        },
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

      const group = postGroupMap.get(module) || { count: 0, views: 0, latest: null };
      return {
        module,
        count: group.count,
        views: group.views,
        latest: group.latest
          ? new Intl.DateTimeFormat("fa-IR", { dateStyle: "long" }).format(group.latest)
          : "",
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
