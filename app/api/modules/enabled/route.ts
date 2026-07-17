import { NextResponse } from "next/server";
import { getModuleConfig, DEFAULT_MODULE_SLUGS, type ModuleSlug } from "@/lib/module-config";
import { cacheHeaders, PUBLIC_CONTENT_CACHE } from "@/lib/cache-headers";

export async function GET() {
  try {
    const config = await getModuleConfig();
    const enabled = DEFAULT_MODULE_SLUGS.filter((s) => config[s]?.enabled);

    const homeConfig: Record<string, { showOnHome: boolean; homeOrder: number; homeTitle: string; homeMoreLabel: string; showHomeTitle: boolean; showHomeMoreLabel: boolean }> = {};
    for (const slug of enabled) {
      const cfg = config[slug];
      homeConfig[slug] = {
        showOnHome: cfg.showOnHome,
        homeOrder: cfg.homeOrder,
        homeTitle: cfg.homeTitle,
        homeMoreLabel: cfg.homeMoreLabel,
        showHomeTitle: cfg.showHomeTitle,
        showHomeMoreLabel: cfg.showHomeMoreLabel,
      };
    }

    return NextResponse.json({
      enabled,
      homeConfig,
      heroVisible: config.heroVisible !== false,
      moduleColorsEnabled: config.moduleColorsEnabled !== false,
      unifiedModuleColor: config.unifiedModuleColor || "var(--primary)",
      moduleColors: config.moduleColors || {},
    }, {
      headers: cacheHeaders(PUBLIC_CONTENT_CACHE),
    });
  } catch {
    // Fallback: all modules enabled
    return NextResponse.json({
      enabled: DEFAULT_MODULE_SLUGS,
      homeConfig: {},
    }, {
      headers: cacheHeaders(PUBLIC_CONTENT_CACHE),
    });
  }
}
