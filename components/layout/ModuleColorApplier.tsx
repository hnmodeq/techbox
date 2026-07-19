"use client";

import { useModuleConfig } from "@/providers/module-config.provider";
import { useEffect, useRef } from "react";
import type { ModuleSlug } from "@/lib/module-config";

const MODULE_SLUGS = [
  "blog", "news", "media", "shop", "forum", "review", "download", "tools", "timeline",
  "nas", "nvr", "raid", "subnet", "home", "account", "admin", "about", "contact", "workwithus", "consultation"
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
  const { moduleColorsEnabled, unifiedModuleColor, moduleColors } = useModuleConfig();

  const hasCustomColors = Object.keys(moduleColors).length > 0;

  // In the default state (enabled + no custom colors), the CSS variables
  // from globals.css are already correct — no override needed.
  if (moduleColorsEnabled && !hasCustomColors) {
    return null;
  }

  // Generate the override CSS text
  let cssText = ":root {\n";

  if (!moduleColorsEnabled) {
    // All modules use the unified color
    for (const slug of MODULE_SLUGS) {
      cssText += `  --${slug}: ${unifiedModuleColor} !important;\n`;
    }
  } else {
    // Apply per-module custom colors
    for (const [slug, color] of Object.entries(moduleColors)) {
      if (color) {
        cssText += `  --${slug}: ${color} !important;\n`;
      }
    }
  }

  cssText += "}";

  return (
    <style dangerouslySetInnerHTML={{ __html: cssText }} />
  );
}
