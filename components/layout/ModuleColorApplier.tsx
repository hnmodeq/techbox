"use client";

import { useEffect } from "react";
import {
  COLORABLE_MODULE_SLUGS,
  resolveModuleColor,
} from "@/config/module-colors";
import { useModuleConfig } from "@/providers/module-config.provider";

/**
 * Applies the administrator's enabled module colours as CSS custom
 * properties. Consumers always include `var(--primary)` as their fallback,
 * so removing these values returns the entire site to ordinary shadcn tokens
 * without having to reload or leave stale colours in the DOM.
 */
export function ModuleColorApplier() {
  const { moduleColorsEnabled, moduleColors } = useModuleConfig();

  useEffect(() => {
    const root = document.documentElement;
    const enabled = moduleColorsEnabled !== false;

    root.dataset.moduleColors = enabled ? "enabled" : "disabled";

    for (const slug of COLORABLE_MODULE_SLUGS) {
      const property = `--module-${slug}-color`;
      if (enabled) {
        root.style.setProperty(property, resolveModuleColor(slug, moduleColors[slug]));
      } else {
        root.style.removeProperty(property);
      }
    }

    return () => {
      // The component only unmounts with the application shell. Removing the
      // runtime overrides prevents a stale colour set surviving hot reloads.
      for (const slug of COLORABLE_MODULE_SLUGS) {
        root.style.removeProperty(`--module-${slug}-color`);
      }
      delete root.dataset.moduleColors;
    };
  }, [moduleColors, moduleColorsEnabled]);

  return null;
}
