import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/api-permissions";
import { logAudit } from "@/lib/audit-log";
import { cacheHeaders, PRIVATE_NO_STORE } from "@/lib/cache-headers";
import {
  DEFAULT_HOME_ADVERTISEMENTS,
  HOME_AD_PLACEMENTS,
  isSafeAdvertisementHref,
  parseHomeAdvertisements,
} from "@/features/home/lib/home-advertisements";

const KEY = "home.advertisements";

const advertisementSchema = z.object({
  id: z.string().trim().regex(/^[-a-zA-Z0-9_]{2,80}$/),
  image: z.string().trim().url().refine((value) => value.startsWith("https://") && value.toLowerCase().endsWith(".webp"), {
    message: "advertisement image must be an HTTPS WebP URL",
  }),
  alt: z.string().trim().min(1).max(180),
  href: z.string().trim().max(500).optional().default("").refine(isSafeAdvertisementHref, {
    message: "advertisement link must be an internal path or HTTPS URL",
  }),
  afterSection: z.enum(HOME_AD_PLACEMENTS),
  enabled: z.boolean(),
  order: z.number().int().min(0).max(1000),
  version: z.number().int().min(1).max(1_000_000),
});

const advertisementsSchema = z.array(advertisementSchema).max(20).superRefine((items, ctx) => {
  const seen = new Set<string>();
  items.forEach((item, index) => {
    if (seen.has(item.id)) {
      ctx.addIssue({ code: "custom", path: [index, "id"], message: "duplicate advertisement id" });
    }
    seen.add(item.id);
  });
});

export async function GET() {
  const user = await requirePermission("banner:view");
  if (user instanceof NextResponse) return user;

  const row = await prisma.siteSetting.findUnique({
    where: { key: KEY },
    select: { value: true, updatedAt: true },
  });
  const advertisements = row
    ? parseHomeAdvertisements(row.value)
    : DEFAULT_HOME_ADVERTISEMENTS;

  return NextResponse.json(
    { advertisements, usingDefaults: !row, updatedAt: row?.updatedAt ?? null },
    { headers: cacheHeaders(PRIVATE_NO_STORE) },
  );
}

export async function PATCH(req: NextRequest) {
  const user = await requirePermission("banner:edit");
  if (user instanceof NextResponse) return user;

  try {
    const input = advertisementsSchema.parse(await req.json());
    const advertisements = input
      .map((item, index) => ({
        ...item,
        href: item.href || undefined,
        order: index,
      }));

    await prisma.siteSetting.upsert({
      where: { key: KEY },
      update: { value: JSON.stringify(advertisements), updatedBy: user.id },
      create: { key: KEY, value: JSON.stringify(advertisements), updatedBy: user.id },
    });

    revalidateTag("home-data", "max");
    revalidatePath("/");
    logAudit({
      userId: user.id,
      userName: user.name,
      action: "home.advertisements.update",
      details: { count: advertisements.length, ids: advertisements.map((item) => item.id) },
    });

    return NextResponse.json(
      { ok: true, advertisements },
      { headers: cacheHeaders(PRIVATE_NO_STORE) },
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "validation", issues: error.issues },
        { status: 400, headers: cacheHeaders(PRIVATE_NO_STORE) },
      );
    }
    return NextResponse.json(
      { error: "advertisements_update_failed" },
      { status: 500, headers: cacheHeaders(PRIVATE_NO_STORE) },
    );
  }
}

export const dynamic = "force-dynamic";
export const revalidate = 0;
