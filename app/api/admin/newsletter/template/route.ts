import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUserPublic } from "@/lib/auth-server";
import { ensureSiteSettingsTable } from "@/lib/site-settings-table";
import { z } from "zod";
import { cacheHeaders, PRIVATE_NO_STORE } from "@/lib/cache-headers";

const schema = z.object({
  headerHtml: z.string().max(20000).optional(),
  footerHtml: z.string().max(20000).optional(),
  subject: z.string().max(200).optional(),
});

const KEY_MAP: Record<string, string> = {
  headerHtml: "newsletter.header_html",
  footerHtml: "newsletter.footer_html",
  subject: "newsletter.default_subject",
};

export async function PATCH(req: NextRequest) {
  const user = await getSessionUserPublic();
  if (!user || user.role !== "super_admin") {
    return NextResponse.json({ error: "forbidden" }, { status: 403, headers: cacheHeaders(PRIVATE_NO_STORE) });
  }

  try {
    await ensureSiteSettingsTable();
    const body = schema.parse(await req.json());

    for (const [field, value] of Object.entries(body)) {
      const key = KEY_MAP[field];
      if (!key || typeof value !== "string") continue;
      await prisma.siteSetting.upsert({
        where: { key },
        update: { value, updatedBy: user.id },
        create: { key, value, updatedBy: user.id },
      });
    }

    return NextResponse.json({ ok: true }, { headers: cacheHeaders(PRIVATE_NO_STORE) });
  } catch (e: any) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: "validation", issues: e.errors }, { status: 400, headers: cacheHeaders(PRIVATE_NO_STORE) });
    }
    return NextResponse.json({ error: e?.message || "update_failed" }, { status: 500, headers: cacheHeaders(PRIVATE_NO_STORE) });
  }
}

export const dynamic = "force-dynamic";
