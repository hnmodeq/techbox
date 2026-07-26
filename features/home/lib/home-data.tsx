"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { ContentItem, ModuleSlug } from "@/lib/content";
import type {
  TopPickCard,
  TimelineCard,
  FamilyComment,
  AuthorCard,
  MoreToExplore,
} from "./home-types";

export type HomeData = {
  modules: Partial<Record<ModuleSlug, ContentItem[]>>;
  ticker: ContentItem[];
  generatedAt?: string;

  // ── Homepage upgrade sections ──
  // All optional: the layout fetch (getLayoutHomeData) only populates
  // `modules.news` + `ticker`, so these are absent there by design. Every
  // consumer must treat an empty slice as "hide the section".
  /** §3 — 2 news posts ranked by engagement, deduped against the sidebar. */
  insights?: ContentItem[];
  /** §5 — up to 3 reviews joined to their shop product. */
  topPicks?: TopPickCard[];
  /** §6 — up to 12 IT milestones. */
  timeline?: TimelineCard[];
  /** §10 — 3 sampled comments from across all modules. */
  familyComments?: FamilyComment[];
  /** §11 — random hero + oldest-per-module cards. */
  moreToExplore?: MoreToExplore;
  /** §12 — contributors with at least one published post. */
  authors?: AuthorCard[];
  /** §4 — admin-configured finder chips (SiteSetting). */
  finderChips?: Array<{ labelFa: string; href: string }>;
  /** §8 — admin-configured tool order/allow-list (SiteSetting). */
  toolsFeatured?: string[];
};

const emptyData: HomeData = { modules: {}, ticker: [] };
const HomeDataContext = createContext<{ data: HomeData; loading: boolean; error: string }>({ data: emptyData, loading: true, error: "" });

export function HomeDataProvider({
  children,
  initialData,
}: {
  children: ReactNode;
  initialData?: HomeData;
}) {
  const [data, setData] = useState<HomeData>(initialData ?? emptyData);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const apply = (body: any) => {
      if (!mounted) return;
      // Merge the incoming author fields with any existing ones so that a
      // stale cached API response (missing verifiedType etc.) never replaces
      // richer data that was already in state from the server render.
      const mergeModules = (
        incoming: Record<string, any[]>,
        existing: Record<string, any[]>
      ): Record<string, any[]> => {
        const result: Record<string, any[]> = {};
        for (const mod of new Set([...Object.keys(incoming), ...Object.keys(existing)])) {
          const inc = incoming[mod] ?? [];
          const ext = existing[mod] ?? [];
          if (inc.length === 0) { result[mod] = ext; continue; }
          // Merge per-slug: keep all fields from existing, overlay non-null from incoming
          const extMap = new Map(ext.map((i: any) => [i.slug, i]));
          result[mod] = inc.map((item: any) => {
            const existingItem = extMap.get(item.slug);
            if (!existingItem) return item;
            return {
              ...existingItem,
              ...item,
              author: {
                ...existingItem.author,
                ...item.author,
                // Never overwrite verifiedType/verifiedLabel with null if existing has a value
                verifiedType: item.author?.verifiedType ?? existingItem.author?.verifiedType ?? null,
                verifiedLabel: item.author?.verifiedLabel ?? existingItem.author?.verifiedLabel ?? null,
              },
            };
          });
        }
        return result;
      };

      setData((prev) => ({
        ...prev,
        modules: mergeModules(body.modules || {}, prev.modules as Record<string, any[]>),
        ticker: body.ticker || prev.ticker,
        generatedAt: body.generatedAt,
        // Upgrade slices: keep the server-rendered value unless the API
        // actually supplies a replacement. Spreading `prev` above is not
        // enough — an explicit undefined in the body would clobber it.
        insights: body.insights ?? prev.insights,
        topPicks: body.topPicks ?? prev.topPicks,
        timeline: body.timeline ?? prev.timeline,
        familyComments: body.familyComments ?? prev.familyComments,
        moreToExplore: body.moreToExplore ?? prev.moreToExplore,
        authors: body.authors ?? prev.authors,
        finderChips: body.finderChips ?? prev.finderChips,
        toolsFeatured: body.toolsFeatured ?? prev.toolsFeatured,
      }));
    };

    if (initialData) {
      // Server data is tag-invalidated when content changes; do not duplicate
      // the root-layout request with another client fetch on every page load.
      return () => {
        mounted = false;
      };
    }

    setLoading(true);
    setError("");
    fetch("/api/home")
      .then((r) => {
        if (!r.ok) throw new Error("home_data_unavailable");
        return r.json();
      })
      .then(apply)
      .catch((e) => {
        if (!mounted) return;
        setError(e?.message || "home_data_unavailable");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
    // Run once on mount. `initialData` is captured from props at mount and must
    // not re-trigger the effect on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo(() => ({ data, loading, error }), [data, loading, error]);
  return <HomeDataContext.Provider value={value}>{children}</HomeDataContext.Provider>;
}

export function useHomeData() {
  return useContext(HomeDataContext);
}

export function useHomeModule(module: ModuleSlug) {
  const { data, loading, error } = useHomeData();
  return { items: (data.modules[module] || []) as ContentItem[], loading, error };
}

export function useHomeTicker() {
  const { data, loading, error } = useHomeData();
  return { items: data.ticker as ContentItem[], loading, error };
}
