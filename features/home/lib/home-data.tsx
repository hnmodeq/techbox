"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { ContentItem, ModuleSlug } from "@/lib/content";

export type HomeData = {
  modules: Partial<Record<ModuleSlug, ContentItem[]>>;
  ticker: ContentItem[];
  generatedAt?: string;
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
      setData({
        modules: body.modules || {},
        ticker: body.ticker || [],
        generatedAt: body.generatedAt,
      });
    };

    if (initialData) {
      // We already have server-rendered data → keep it fresh with a silent
      // background refresh. No loading flip, so there is no flicker/jump.
      fetch("/api/home")
        .then((r) => (r.ok ? r.json() : null))
        .then((body) => body && apply(body))
        .catch(() => {});
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
