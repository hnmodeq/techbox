import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
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
  enabled: z.boolean(),
  showOnHome: z.boolean(),
  homeOrder: z.number().int().min(0).max(100),
  homeTitle: z.string().max(200),
  homeMoreLabel: z.string().max(200),
});

export async function PATCH(req: NextRequest) {
  const user = await getSessionUserPublic();
  if (!user || user.role !== "super_admin") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const heroVisible = body.heroVisible !== false;

    // Validate module entries
    const moduleEntries: Record<string, z.infer<typeof moduleEntrySchema>> = {};
    for (const [key, value] of Object.entries(body)) {
      if (key === "heroVisible") continue;
      moduleEntries[key] = moduleEntrySchema.parse(value);
    }

    const config: SiteLayoutConfig = {
      ...moduleEntries,
      heroVisible,
    } as SiteLayoutConfig;

    await saveModuleConfig(config, user.id);

    // Revalidate cached data so changes take effect immediately
    revalidatePath("/");
    revalidatePath("/api/modules/enabled");

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: e.errors }, { status: 400 });
    }
    return NextResponse.json(
      { error: e?.message || "Failed to update module config" },
      { status: 500 }
    );
  }
}
