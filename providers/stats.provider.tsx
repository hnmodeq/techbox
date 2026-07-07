"use client";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type StatEntry = {
  views: number;
  likes: number;
  comments: number;
  solved?: boolean;
  rating?: number | null;
  ratingCount?: number;
  fileName?: string | null;
  fileSize?: string | null;
  downloadCount?: number;
};

type StatsMap = Record<string, StatEntry>;
type StatsStatus = "loading" | "ready" | "error";

const StatsContext = createContext<{ stats: StatsMap; status: StatsStatus }>({
  stats: {},
  status: "loading"
});

/**
 * Fetches stats for ALL posts in a single request (using the existing bulk
 * mode of /api/stats) instead of every card/badge on the page firing its
 * own request. This turns e.g. 20 separate DB round-trips into 1.
 *
 * Consumers (useStatEntry) get both the data AND a `status` flag so they
 * can tell the difference between "still loading" and "loaded, but this
 * item genuinely isn't in the result" - this avoids racing the bulk fetch
 * with a guessed timeout, which previously caused every card to fire its
 * own redundant request whenever the bulk fetch was a bit slow.
 */
export function StatsProvider({ children }: { children: ReactNode }) {
  const [stats, setStats] = useState<StatsMap>({});
  const [status, setStatus] = useState<StatsStatus>("loading");

  useEffect(() => {
    let mounted = true;

    fetch("/api/stats", { cache: "no-store" })
      .then((r) => {
        // A 503 ("db_unavailable") is an expected, non-fatal case: the client
        // simply keeps the server-rendered initial values instead of inventing
        // fake numbers like 340 views / 14 likes / 4 comments.
        if (!r.ok) throw new Error("stats_unavailable");
        return r.json();
      })
      .then((data) => {
        if (!mounted) return;
        if (data && typeof data === "object" && !("error" in data)) {
          setStats((prev) => ({ ...data, ...prev }));
          setStatus("ready");
        } else {
          setStatus("error");
        }
      })
      .catch(() => {
        if (mounted) setStatus("error");
      });

    const handleUpdate = (e: any) => {
      const { module, slug, views, likes, comments, solved, rating, ratingCount, fileName, fileSize, downloadCount } = e.detail || {};
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
            ...(typeof rating === "number" ? { rating } : {}),
            ...(typeof ratingCount === "number" ? { ratingCount } : {}),
            ...(typeof fileName === "string" ? { fileName } : {}),
            ...(typeof fileSize === "string" ? { fileSize } : {}),
            ...(typeof downloadCount === "number" ? { downloadCount } : {}),
          },
        };
      });
    };

    window.addEventListener("tb_stats_update", handleUpdate);
    return () => {
      mounted = false;
      window.removeEventListener("tb_stats_update", handleUpdate);
    };
  }, []);

  return <StatsContext.Provider value={{ stats, status }}>{children}</StatsContext.Provider>;
}

/**
 * Returns the shared stat entry for a given module/slug plus the loading
 * status of the bulk fetch. Consumers should only fall back to their own
 * per-item fetch once `status !== "loading"` and `entry` is still missing -
 * never on a fixed timer, since that races against real network latency.
 */
export function useStatEntry(module: string, slug: string): { entry?: StatEntry; status: StatsStatus } {
  const { stats, status } = useContext(StatsContext);
  return { entry: stats[`${module}:${slug}`], status };
}

/** Returns the whole stats map + status (handy for list views). */
export function useStats(): { stats: StatsMap; status: StatsStatus } {
  return useContext(StatsContext);
}
