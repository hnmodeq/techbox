import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/api-permissions";
import { z } from "zod";

const schema = z.object({
  sourceModule: z.string().min(1),
  sourceSlug: z.string().min(1),
  targetModule: z.string().min(1),
  targetSlug: z.string().min(1),
  reason: z.string().optional(),
});

export async function GET() {
  const user = await requirePermission("redirect:view");
  if (user instanceof NextResponse) return user;
  return NextResponse.json(await prisma.slugRedirect.findMany({ orderBy: { createdAt: "desc" } }));
}

export async function POST(req: NextRequest) {
  const user = await requirePermission("redirect:edit");
  if (user instanceof NextResponse) return user;
  const body = schema.parse(await req.json());
  const redirect = await prisma.slugRedirect.upsert({
    where: { source_module_slug: { sourceModule: body.sourceModule, sourceSlug: body.sourceSlug } },
    update: body,
    create: body,
  });
  return NextResponse.json(redirect);
}

export async function DELETE(req: NextRequest) {
  const user = await requirePermission("redirect:edit");
  if (user instanceof NextResponse) return user;
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id_required" }, { status: 400 });
  await prisma.slugRedirect.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

export const dynamic = "force-dynamic";
