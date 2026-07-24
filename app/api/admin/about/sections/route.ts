import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUserPublic } from "@/lib/auth-server";
import { PRIVATE_NO_STORE, cacheHeaders } from "@/lib/cache-headers";

export async function GET() {
  const sections = await prisma.teamSection.findMany({
    orderBy: { order: "asc" },
    include: { members: { orderBy: { order: "asc" } } },
  });
  return NextResponse.json(sections, { headers: cacheHeaders(PRIVATE_NO_STORE) });
}

export async function POST(req: NextRequest) {
  const user = await getSessionUserPublic();
  if (!user || user.role !== "super_admin") return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const { title, order } = await req.json();
  const section = await prisma.teamSection.create({ data: { title: title || "بخش جدید", order: order ?? 0 } });
  return NextResponse.json(section, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const user = await getSessionUserPublic();
  if (!user || user.role !== "super_admin") return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const { id, title, order, enabled } = await req.json();
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const data: any = {};
  if (title !== undefined) data.title = title;
  if (order !== undefined) data.order = order;
  if (enabled !== undefined) data.enabled = enabled;

  const section = await prisma.teamSection.update({ where: { id }, data });
  return NextResponse.json(section);
}

export async function DELETE(req: NextRequest) {
  const user = await getSessionUserPublic();
  if (!user || user.role !== "super_admin") return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  await prisma.teamSection.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

export const dynamic = "force-dynamic";
