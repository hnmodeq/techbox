import { NextRequest, NextResponse } from "next/server";
import { getSessionUserPublic } from "@/lib/auth-server";
import {
  getModuleConfig,
  saveModuleConfig,
  getDefaultModuleConfigMap,
  type ModuleConfigMap,
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
    return NextResponse.json(getDefaultModuleConfigMap());
  }
}

const moduleConfigSchema = z.record(
  z.object({
    enabled: z.boolean(),
    showOnHome: z.boolean(),
    homeOrder: z.number().int().min(0).max(100),
    homeTitle: z.string().max(200),
    homeMoreLabel: z.string().max(200),
  })
);

export async function PATCH(req: NextRequest) {
  const user = await getSessionUserPublic();
  if (!user || user.role !== "super_admin") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const parsed = moduleConfigSchema.parse(body) as ModuleConfigMap;

    await saveModuleConfig(parsed, user.id);

    // Revalidate cached data so changes take effect immediately
    const { revalidateTag } = await import("next/cache");
    revalidateTag("module-config");
    revalidateTag("home-data");

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
