import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth-server";
import { z } from "zod";

const schema = z.object({
  sourceModule: z.string().min(1),
  sourceSlug: z.string().min(1),
  targetModule: z.string().min(1),
  targetSlug: z.string().min(1),
  reason: z.string().optional(),
});

async function requireSuperAdmin() {
  const user = await getSessionUser();
  return Boolean(user && user.role === "super_admin");
}

export async function GET() {
  if (!(await requireSuperAdmin())) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const redirects = await prisma.slugRedirect.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(redirects);
}

export async function POST(req: NextRequest) {
  if (!(await requireSuperAdmin())) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const body = schema.parse(await req.json());
  const redirect = await prisma.slugRedirect.upsert({
    where: { source_module_slug: { sourceModule: body.sourceModule, sourceSlug: body.sourceSlug } },
    update: body,
    create: body,
  });
  return NextResponse.json(redirect);
}

export async function DELETE(req: NextRequest) {
  if (!(await requireSuperAdmin())) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id_required" }, { status: 400 });
  await prisma.slugRedirect.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

export const dynamic = "force-dynamic";
