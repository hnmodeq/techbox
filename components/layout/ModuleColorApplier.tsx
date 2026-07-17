"use client";

import { useModuleConfig } from "@/providers/module-config.provider";
import { useEffect, useRef } from "react";
import type { ModuleSlug } from "@/lib/module-config";

const MODULE_SLUGS: ModuleSlug[] = [
  "blog", "news", "media", "shop", "forum", "review", "download", "tools", "timeline",
];

/**
 * Reads module color config from the client provider and overrides
 * CSS custom properties (--blog, --news, etc.) on <html>.
 *
 * Important: we only touch the DOM when necessary to avoid layout thrashing
 * and flickering. When the config is in its default state (enabled + no custom
 * colors), we do nothing at all — the globals.css :root values are already correct.
 */
export function ModuleColorApplier() {
  const { moduleColorsEnabled, unifiedModuleColor, moduleColors, loading } = useModuleConfig();
  const prevStateRef = useRef<string>("");

  useEffect(() => {
    if (loading) return;

    const hasCustomColors = Object.keys(moduleColors).length > 0;

    // In the default state (enabled + no custom colors), the CSS variables
    // from globals.css are already correct — skip DOM writes entirely.
    if (moduleColorsEnabled && !hasCustomColors) {
      // Only run removal if we previously set unified colors and now need to clean up
      if (prevStateRef.current === "unified") {
        for (const slug of MODULE_SLUGS) {
          document.documentElement.style.removeProperty(`--${slug}`);
        }
      }
      prevStateRef.current = "default";
      return;
    }

    // Build a fingerprint of what we're about to apply to avoid redundant writes
    const nextFingerprint = moduleColorsEnabled
      ? `custom:${JSON.stringify(moduleColors)}`
      : `unified:${unifiedModuleColor}`;

    if (nextFingerprint === prevStateRef.current) return;
    prevStateRef.current = nextFingerprint;

    if (!moduleColorsEnabled) {
      // All modules use the unified color
      for (const slug of MODULE_SLUGS) {
        document.documentElement.style.setProperty(`--${slug}`, unifiedModuleColor);
      }
    } else {
      // Reset to defaults first, then apply per-module custom colors
      for (const slug of MODULE_SLUGS) {
        document.documentElement.style.removeProperty(`--${slug}`);
      }
      for (const [slug, color] of Object.entries(moduleColors)) {
        if (color) {
          document.documentElement.style.setProperty(`--${slug}`, color);
        }
      }
    }
  }, [moduleColorsEnabled, unifiedModuleColor, moduleColors, loading]);

  return null;
}
