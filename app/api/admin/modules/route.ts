import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { requirePermission } from "@/lib/api-permissions";
import {
  getModuleConfig,
  saveModuleConfig,
  getDefaultSiteLayoutConfig,
  type SiteLayoutConfig,
} from "@/lib/module-config";
import { z } from "zod";
import { COLORABLE_MODULE_SLUGS, isModuleColor } from "@/config/module-colors";

export async function GET() {
  const user = await requirePermission("module:view");
  if (user instanceof NextResponse) return user;

  try {
    const config = await getModuleConfig();
    return NextResponse.json(config);
  } catch {
    return NextResponse.json(getDefaultSiteLayoutConfig());
  }
}

const TOP_LEVEL_KEYS = new Set([
  "heroVisible",
  "tickerVisible",
  "moduleColorsEnabled",
  "unifiedModuleColor",
  "moduleColors",
  "moduleColorsDark",
  "titles",
]);

export async function PATCH(req: NextRequest) {
  const user = await requirePermission("module:edit");
  if (user instanceof NextResponse) return user;

  try {
    const body = await req.json();
    const heroVisible = body.heroVisible !== false;
    const tickerVisible = body.tickerVisible !== false;
    const moduleColorsEnabled = body.moduleColorsEnabled !== false;
    const unifiedModuleColor = "var(--primary)"; // retained for older settings payloads; disabled mode is now pure shadcn.
    const sanitizePalette = (value: unknown) => {
      const incoming: Record<string, unknown> = value && typeof value === "object"
        ? value as Record<string, unknown>
        : {};
      return Object.fromEntries(
        COLORABLE_MODULE_SLUGS.flatMap((slug) => {
          const color = incoming[slug];
          return isModuleColor(color) ? [[slug, color.trim()]] : [];
        }),
      );
    };
    const moduleColors = sanitizePalette(body.moduleColors);
    const moduleColorsDark = sanitizePalette(body.moduleColorsDark);

    // No strict validation — frontend now always sends complete objects
    const moduleEntries: Record<string, any> = {};
    for (const [key, value] of Object.entries(body)) {
      if (TOP_LEVEL_KEYS.has(key)) continue;
      moduleEntries[key] = value;
    }

    const config: SiteLayoutConfig = {
      ...moduleEntries,
      heroVisible,
      tickerVisible,
      moduleColorsEnabled,
      unifiedModuleColor,
      moduleColors,
      moduleColorsDark,
      titles: (body.titles && typeof body.titles === "object") ? body.titles : {},
    } as SiteLayoutConfig;

    await saveModuleConfig(config, user.id);

    // Revalidate cached data so changes take effect immediately
    revalidateTag("module-config", "max");
    // The ticker query lives inside the layout-data cache, so toggling it
    // must invalidate that too or the change is invisible for 24h.
    revalidateTag("home-data", "max");
    revalidatePath("/");
    revalidatePath("/api/modules/enabled");

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    if (e instanceof z.ZodError) {
      const messages = e.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
      return NextResponse.json({ error: messages }, { status: 400 });
    }
    return NextResponse.json(
      { error: e?.message || "Failed to update module config" },
      { status: 500 }
    );
  }
}
