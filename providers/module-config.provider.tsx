"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { ModuleSlug, SiteLayoutConfig } from "@/lib/module-config";

type ModuleConfigClient = {
  /** Set of enabled module slugs */
  enabled: Set<ModuleSlug>;
  /** Map of slug → { showOnHome, homeOrder, homeTitle, homeMoreLabel, showHomeTitle, showHomeMoreLabel } */
  homeConfig: Record<ModuleSlug, { showOnHome: boolean; homeOrder: number; homeTitle: string; homeMoreLabel: string; showHomeTitle: boolean; showHomeMoreLabel: boolean }>;
  /** Whether the hero section is visible on the homepage */
  heroVisible: boolean;
  /** Whether the per-module color system is enabled */
  moduleColorsEnabled: boolean;
  /** Unified color when moduleColorsEnabled is false */
  unifiedModuleColor: string;
  /** Per-module custom colors */
  moduleColors: Partial<Record<ModuleSlug, string>>;
  /** Module display names — single source of truth (overrides moduleMeta/sidebar) */
  titles: Partial<Record<ModuleSlug, string>>;
  loading: boolean;
};

const ALL_SLUGS: ModuleSlug[] = [
  "blog", "news", "media", "shop", "forum", "review", "download", "tools", "timeline",
];

const defaultConfig: ModuleConfigClient = {
  enabled: new Set(ALL_SLUGS),
  homeConfig: {} as ModuleConfigClient["homeConfig"],
  heroVisible: true,
  moduleColorsEnabled: true,
  unifiedModuleColor: "var(--primary)",
  moduleColors: {},
  titles: {},
  loading: true,
};

function serverConfigToClient(data: SiteLayoutConfig): ModuleConfigClient {
  const enabledSet = new Set<ModuleSlug>(
    ALL_SLUGS.filter((slug) => data[slug]?.enabled !== false)
  );
  const homeConfig = {} as ModuleConfigClient["homeConfig"];
  for (const slug of ALL_SLUGS) {
    const cfg = data[slug];
    if (!cfg) continue;
    homeConfig[slug] = {
      showOnHome: cfg.showOnHome,
      homeOrder: cfg.homeOrder,
      homeTitle: cfg.homeTitle,
      homeMoreLabel: cfg.homeMoreLabel,
      showHomeTitle: cfg.showHomeTitle,
      showHomeMoreLabel: cfg.showHomeMoreLabel,
    };
  }
  return {
    enabled: enabledSet,
    homeConfig,
    heroVisible: data.heroVisible !== false,
    moduleColorsEnabled: data.moduleColorsEnabled !== false,
    unifiedModuleColor: data.unifiedModuleColor || "var(--primary)",
    moduleColors: data.moduleColors || {},
    titles: data.titles || {},
    loading: false,
  };
}

const ModuleConfigContext = createContext<ModuleConfigClient>(defaultConfig);

export function ModuleConfigProvider({
  children,
  serverConfig,
}: {
  children: ReactNode;
  /** Pre-loaded server-side config — eliminates the "all modules enabled" flash */
  serverConfig?: SiteLayoutConfig;
}) {
  const [config, setConfig] = useState<ModuleConfigClient>(() =>
    serverConfig ? serverConfigToClient(serverConfig) : defaultConfig
  );

  useEffect(() => {
    // Always fetch latest config from API so color toggle works immediately after save
    fetch("/api/modules/enabled", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data) return;
        const enabledSet = new Set<ModuleSlug>(data.enabled || []);
        const homeConfig = data.homeConfig || {};
        const heroVisible = data.heroVisible !== false;
        const moduleColorsEnabled = data.moduleColorsEnabled !== false;
        const unifiedModuleColor = data.unifiedModuleColor || "var(--primary)";
        const moduleColors = data.moduleColors || {};
        const titles = data.titles || {};
        setConfig({ enabled: enabledSet, homeConfig, heroVisible, moduleColorsEnabled, unifiedModuleColor, moduleColors, titles, loading: false });
      })
      .catch(() => {
        setConfig((prev) => ({ ...prev, loading: false }));
      });
  }, []);

  const value = useMemo(() => config, [config]);
  return <ModuleConfigContext.Provider value={value}>{children}</ModuleConfigContext.Provider>;
}

export function useModuleConfig() {
  return useContext(ModuleConfigContext);
}

export function useModuleEnabled(slug: ModuleSlug): boolean {
  const { enabled } = useModuleConfig();
  return enabled.has(slug);
}

export function useEnabledModules(): Set<ModuleSlug> {
  const { enabled } = useModuleConfig();
  return enabled;
}

/**
 * Returns the module display-name map (source of truth). Use
 * `useModuleTitle(slug, fallback)` to resolve a single name with a fallback.
 */
export function useModuleTitles(): Partial<Record<ModuleSlug, string>> {
  const { titles } = useModuleConfig();
  return titles;
}

export function useModuleTitle(slug: ModuleSlug, fallback?: string): string {
  const { titles } = useModuleConfig();
  return titles[slug] || fallback || slug;
}
