"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { ModuleSlug } from "@/lib/module-config";

type ModuleConfigClient = {
  /** Set of enabled module slugs */
  enabled: Set<ModuleSlug>;
  /** Map of slug → { showOnHome, homeOrder, homeTitle, homeMoreLabel } */
  homeConfig: Record<ModuleSlug, { showOnHome: boolean; homeOrder: number; homeTitle: string; homeMoreLabel: string }>;
  /** Whether the hero section is visible on the homepage */
  heroVisible: boolean;
  loading: boolean;
};

const defaultConfig: ModuleConfigClient = {
  enabled: new Set<ModuleSlug>(["blog", "news", "media", "shop", "forum", "review", "download", "tools", "timeline"]),
  homeConfig: {} as ModuleConfigClient["homeConfig"],
  heroVisible: true,
  loading: true,
};

const ModuleConfigContext = createContext<ModuleConfigClient>(defaultConfig);

export function ModuleConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<ModuleConfigClient>(defaultConfig);

  useEffect(() => {
    fetch("/api/modules/enabled")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data) return;
        const enabledSet = new Set<ModuleSlug>(data.enabled || []);
        const homeConfig = data.homeConfig || {};
        const heroVisible = data.heroVisible !== false;
        setConfig({ enabled: enabledSet, homeConfig, heroVisible, loading: false });
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
