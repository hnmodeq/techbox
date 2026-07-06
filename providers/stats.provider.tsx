"use client";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type StatEntry = {
  views: number;
  likes: number;
  comments: number;
  solved?: boolean;
  fileSize?: string;
};

type StatsMap = Record<string, StatEntry>;

const StatsContext = createContext<StatsMap>({});

/**
 * Fetches stats for ALL posts in a single request (using the existing bulk
 * mode of /api/stats) instead of every card/badge on the page firing its
 * own request. This turns e.g. 20 separate DB round-trips into 1.
 *
 * Individual components still get live updates (likes/views changing after
 * a user action) via the existing `tb_stats_update` window event, which is
 * now handled centrally here and merged into the shared map.
 */
export function StatsProvider({ children }: { children: ReactNode }) {
  const [stats, setStats] = useState<StatsMap>({});

  useEffect(() => {
    let mounted = true;

    fetch("/api/stats", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        if (mounted && data && typeof data === "object") {
          setStats((prev) => ({ ...data, ...prev }));
        }
      })
      .catch(() => {});

    const handleUpdate = (e: any) => {
      const { module, slug, views, likes, comments, solved, fileSize } = e.detail || {};
      if (!module || !slug) return;
      const key = `${module}:${slug}`;
      setStats((prev) => {
        const existing: StatEntry = prev[key] ?? { views: 0, likes: 0, comments: 0 };
        return {
          ...prev,
          [key]: {
            ...existing,
            ...(typeof views === "number" ? { views } : {}),
            ...(typeof likes === "number" ? { likes } : {}),
            ...(typeof comments === "number" ? { comments } : {}),
            ...(typeof solved === "boolean" ? { solved } : {}),
            ...(typeof fileSize === "string" ? { fileSize } : {})
          }
        };
      });
    };

    window.addEventListener("tb_stats_update", handleUpdate);
    return () => {
      mounted = false;
      window.removeEventListener("tb_stats_update", handleUpdate);
    };
  }, []);

  return <StatsContext.Provider value={stats}>{children}</StatsContext.Provider>;
}

export function useStatEntry(module: string, slug: string): StatEntry | undefined {
  const stats = useContext(StatsContext);
  return stats[`${module}:${slug}`];
}
