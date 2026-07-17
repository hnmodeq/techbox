import { NextResponse } from "next/server";
import { getModuleConfig, DEFAULT_MODULE_SLUGS, type ModuleSlug } from "@/lib/module-config";

export async function GET() {
  try {
    const config = await getModuleConfig();
    const enabled = DEFAULT_MODULE_SLUGS.filter((s) => config[s]?.enabled);

    const homeConfig: Record<string, { showOnHome: boolean; homeOrder: number; homeTitle: string; homeMoreLabel: string }> = {};
    for (const slug of enabled) {
      const cfg = config[slug];
      homeConfig[slug] = {
        showOnHome: cfg.showOnHome,
        homeOrder: cfg.homeOrder,
        homeTitle: cfg.homeTitle,
        homeMoreLabel: cfg.homeMoreLabel,
      };
    }

    return NextResponse.json({ enabled, homeConfig, heroVisible: config.heroVisible !== false });
  } catch {
    // Fallback: all modules enabled
    return NextResponse.json({
      enabled: DEFAULT_MODULE_SLUGS,
      homeConfig: {},
    });
  }
}

export const revalidate = 30;
