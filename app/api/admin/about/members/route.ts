import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/api-permissions";
import { PRIVATE_NO_STORE, cacheHeaders } from "@/lib/cache-headers";

export async function GET(req: NextRequest) {
  const sectionId = new URL(req.url).searchParams.get("sectionId");
  const where = sectionId ? { sectionId } : {};
  const members = await prisma.teamMember.findMany({ where, orderBy: { order: "asc" } });
  return NextResponse.json(members, { headers: cacheHeaders(PRIVATE_NO_STORE) });
}

export async function POST(req: NextRequest) {
  const user = await requirePermission("about:edit");
  if (user instanceof NextResponse) return user;

  const body = await req.json();
  const { sectionId, userId, name, role, avatar, order } = body;
  if (!sectionId) return NextResponse.json({ error: "sectionId required" }, { status: 400 });

  let memberName = name || "";
  let memberRole = role || "";
  let memberAvatar = avatar || null;
  // Only persist a userId we have verified exists, so a bad id from the
  // client cannot create a dangling reference.
  let linkedUserId: string | null = null;

  // If userId provided, auto-fill from user record
  if (userId) {
    const dbUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, job: true, roleFa: true, avatar: true },
    });
    if (dbUser) {
      memberName = memberName || dbUser.name;
      memberRole = memberRole || dbUser.job || dbUser.roleFa || "";
      memberAvatar = memberAvatar || dbUser.avatar;
      // Keep the link. Previously the id was used to copy these three fields
      // and then dropped, which left the row as loose text with no route back
      // to the account.
      linkedUserId = dbUser.id;
    }
  }

  if (!memberName) return NextResponse.json({ error: "name required" }, { status: 400 });

  const member = await prisma.teamMember.create({
    data: {
      sectionId,
      userId: linkedUserId,
      name: memberName,
      role: memberRole,
      avatar: memberAvatar,
      order: order ?? 0,
    },
  });
  return NextResponse.json(member, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const user = await requirePermission("about:edit");
  if (user instanceof NextResponse) return user;

  const { id, name, role, avatar, order, sectionId } = await req.json();
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const data: any = {};
  if (name !== undefined) data.name = name;
  if (role !== undefined) data.role = role;
  if (avatar !== undefined) data.avatar = avatar;
  if (order !== undefined) data.order = order;
  if (sectionId !== undefined) data.sectionId = sectionId;

  const member = await prisma.teamMember.update({ where: { id }, data });
  return NextResponse.json(member);
}

export async function DELETE(req: NextRequest) {
  const user = await requirePermission("about:edit");
  if (user instanceof NextResponse) return user;

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  await prisma.teamMember.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

export const dynamic = "force-dynamic";
