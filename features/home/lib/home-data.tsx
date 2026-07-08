"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { ContentItem, ModuleSlug } from "@/lib/content";

type HomeData = {
  modules: Partial<Record<ModuleSlug, ContentItem[]>>;
  ticker: ContentItem[];
  generatedAt?: string;
};

const emptyData: HomeData = { modules: {}, ticker: [] };
const HomeDataContext = createContext<{ data: HomeData; loading: boolean; error: string }>({ data: emptyData, loading: true, error: "" });

export function HomeDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<HomeData>(emptyData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError("");
    fetch("/api/home")
      .then((r) => {
        if (!r.ok) throw new Error("home_data_unavailable");
        return r.json();
      })
      .then((body) => {
        if (!mounted) return;
        setData({ modules: body.modules || {}, ticker: body.ticker || [], generatedAt: body.generatedAt });
      })
      .catch((e) => {
        if (!mounted) return;
        setData(emptyData);
        setError(e?.message || "home_data_unavailable");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
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
