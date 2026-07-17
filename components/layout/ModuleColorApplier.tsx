"use client";

import { useModuleConfig } from "@/providers/module-config.provider";
import { useEffect, useRef } from "react";
import type { ModuleSlug } from "@/lib/module-config";

const MODULE_SLUGS: ModuleSlug[] = [
  "blog", "news", "media", "shop", "forum", "review", "download", "tools", "timeline",
];

/**
 * Reads module color config from the client provider and overrides
 * the CSS custom properties (--blog, --news, etc.) on <html> so
 * every component that uses var(--module-slug) picks up the custom color.
 */
export function ModuleColorApplier() {
  const { moduleColorsEnabled, unifiedModuleColor, moduleColors, loading } = useModuleConfig();
  const prevEnabled = useRef<boolean | undefined>(undefined);

  useEffect(() => {
    if (loading) return;

    // Apply colors to CSS custom properties on document root
    if (!moduleColorsEnabled) {
      // All modules use the unified color
      for (const slug of MODULE_SLUGS) {
        document.documentElement.style.setProperty(`--${slug}`, unifiedModuleColor);
      }
    } else {
      // First reset to defaults (remove overrides so globals.css values apply)
      for (const slug of MODULE_SLUGS) {
        document.documentElement.style.removeProperty(`--${slug}`);
      }
      // Then apply per-module custom colors
      for (const [slug, color] of Object.entries(moduleColors)) {
        if (color) {
          document.documentElement.style.setProperty(`--${slug}`, color);
        }
      }
    }

    prevEnabled.current = moduleColorsEnabled;
  }, [moduleColorsEnabled, unifiedModuleColor, moduleColors, loading]);

  return null;
}
