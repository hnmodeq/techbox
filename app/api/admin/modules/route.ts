import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { getSessionUserPublic } from "@/lib/auth-server";
import {
  getModuleConfig,
  saveModuleConfig,
  getDefaultSiteLayoutConfig,
  type SiteLayoutConfig,
} from "@/lib/module-config";
import { z } from "zod";

export async function GET() {
  const user = await getSessionUserPublic();
  if (!user || user.role !== "super_admin") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  try {
    const config = await getModuleConfig();
    return NextResponse.json(config);
  } catch {
    return NextResponse.json(getDefaultSiteLayoutConfig());
  }
}

const moduleEntrySchema = z.object({
  enabled: z.boolean().optional().default(true),
  showOnHome: z.boolean().optional().default(true),
  homeOrder: z.number().int().min(0).max(100).optional().default(99),
  homeTitle: z.string().max(200).optional().default(""),
  homeMoreLabel: z.string().max(200).optional().default(""),
  showHomeTitle: z.boolean().optional().default(true),
  showHomeMoreLabel: z.boolean().optional().default(true),
});

const TOP_LEVEL_KEYS = new Set([
  "heroVisible",
  "moduleColorsEnabled",
  "unifiedModuleColor",
  "moduleColors",
]);

export async function PATCH(req: NextRequest) {
  const user = await getSessionUserPublic();
  if (!user || user.role !== "super_admin") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const heroVisible = body.heroVisible !== false;
    const moduleColorsEnabled = body.moduleColorsEnabled !== false;
    const unifiedModuleColor = typeof body.unifiedModuleColor === "string" ? body.unifiedModuleColor : "var(--primary)";
    const moduleColors = (body.moduleColors && typeof body.moduleColors === "object") ? body.moduleColors : {};

    // Validate module entries
    const moduleEntries: Record<string, any> = {};
    for (const [key, value] of Object.entries(body)) {
      if (TOP_LEVEL_KEYS.has(key)) continue;
      moduleEntries[key] = moduleEntrySchema.parse(value);
    }

    const config: SiteLayoutConfig = {
      ...moduleEntries,
      heroVisible,
      moduleColorsEnabled,
      unifiedModuleColor,
      moduleColors,
      titles: (body.titles && typeof body.titles === "object") ? body.titles : {},
    } as SiteLayoutConfig;

    await saveModuleConfig(config, user.id);

    // Revalidate cached data so changes take effect immediately
    revalidateTag("module-config", "max");
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
