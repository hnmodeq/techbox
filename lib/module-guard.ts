import { getEnabledModules, type ModuleSlug } from "@/lib/module-config";

/**
 * Check if a module is enabled. Returns true if module config is unavailable (graceful fallback).
 * Use this in server components for module list pages and detail pages.
 */
export async function isModuleEnabled(slug: ModuleSlug): Promise<boolean> {
  try {
    const enabled = await getEnabledModules();
    return enabled.includes(slug);
  } catch {
    return true;
  }
}
