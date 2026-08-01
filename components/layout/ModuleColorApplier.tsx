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

    // Do not remove the variables in an effect cleanup. RootLayout writes
    // the same values into the initial <html style>, and React Strict Mode
    // deliberately runs setup → cleanup → setup in development. Cleaning the
    // root in that middle step briefly exposed the blue --primary fallback
    // before the configured colour was applied again.
    //
    // The next effect removes values explicitly when the colour system is
    // disabled, and a full document navigation replaces <html>, so a cleanup
    // here would only create a visible flash.
  }, [moduleColors, moduleColorsEnabled]);

  return null;
}
