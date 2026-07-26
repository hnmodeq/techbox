import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireStaff } from "@/lib/api-permissions";
import { logAudit } from "@/lib/audit-log";
import { revalidateTag, revalidatePath } from "next/cache";
import { z } from "zod";

/**
 * Admin CRUD for homepage partners.
 *
 * Every mutation invalidates the homepage cache. Skipping that was the
 * bug behind "I changed a setting and nothing happened" — the write
 * succeeded while readers kept serving a stale `unstable_cache` value.
 */

const partnerSchema = z.object({
  name: z.string().min(1).max(120),
  logo: z.string().max(1000).nullish(),
  url: z.string().max(1000).nullish(),
  tagline: z.string().max(200).nullish(),
  order: z.number().int().min(0).max(999).optional(),
  published: z.boolean().optional(),
});

/**
 * The generated Prisma client will not have `partner` until
 * `pnpm prisma:generate` has run against the migrated schema. Return a
 * clear 503 rather than a raw "Cannot read properties of undefined".
 */
function partnerModel() {
  return (prisma as unknown as { partner?: any }).partner ?? null;
}

const NEEDS_GENERATE = NextResponse.json(
  {
    error: "prisma_client_stale",
    message: "کلاینت Prisma به‌روز نیست. دستور pnpm prisma:generate را اجرا کنید.",
  },
  { status: 503 },
);

function bust() {
  revalidateTag("home-data", "max");
  revalidatePath("/");
}

export async function GET() {
  const user = await requireStaff();
  if (user instanceof NextResponse) return user;
  if (!partnerModel()) return NEEDS_GENERATE;

  const partners = await partnerModel().findMany({
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
  });
  return NextResponse.json(partners);
}

export async function POST(req: NextRequest) {
  const user = await requireStaff();
  if (user instanceof NextResponse) return user;
  if (!partnerModel()) return NEEDS_GENERATE;

  const parsed = partnerSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "validation", issues: parsed.error.issues }, { status: 400 });
  }

  const created = await partnerModel().create({
    data: {
      name: parsed.data.name.trim(),
      logo: parsed.data.logo?.trim() || null,
      url: parsed.data.url?.trim() || null,
      tagline: parsed.data.tagline?.trim() || null,
      order: parsed.data.order ?? 0,
      published: parsed.data.published ?? true,
    },
  });

  bust();
  logAudit({ userId: user.id, userName: user.name, action: "partner.create", target: created.id, details: { name: created.name } });
  return NextResponse.json(created, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const user = await requireStaff();
  if (user instanceof NextResponse) return user;
  if (!partnerModel()) return NEEDS_GENERATE;

  const body = await req.json().catch(() => null);
  if (!body?.id || typeof body.id !== "string") {
    return NextResponse.json({ error: "id_required" }, { status: 400 });
  }
  const parsed = partnerSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "validation", issues: parsed.error.issues }, { status: 400 });
  }

  const data: Record<string, unknown> = {};
  if (parsed.data.name !== undefined) data.name = parsed.data.name.trim();
  if (parsed.data.logo !== undefined) data.logo = parsed.data.logo?.trim() || null;
  if (parsed.data.url !== undefined) data.url = parsed.data.url?.trim() || null;
  if (parsed.data.tagline !== undefined) data.tagline = parsed.data.tagline?.trim() || null;
  if (parsed.data.order !== undefined) data.order = parsed.data.order;
  if (parsed.data.published !== undefined) data.published = parsed.data.published;

  const updated = await partnerModel().update({ where: { id: body.id }, data });

  bust();
  logAudit({ userId: user.id, userName: user.name, action: "partner.update", target: body.id, details: { keys: Object.keys(data) } });
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest) {
  const user = await requireStaff();
  if (user instanceof NextResponse) return user;
  if (!partnerModel()) return NEEDS_GENERATE;

  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id_required" }, { status: 400 });

  await partnerModel().delete({ where: { id } });

  bust();
  logAudit({ userId: user.id, userName: user.name, action: "partner.delete", target: id });
  return NextResponse.json({ ok: true });
}
