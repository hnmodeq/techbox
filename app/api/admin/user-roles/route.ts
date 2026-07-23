import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUserPublic } from "@/lib/auth-server";
import { logAudit } from "@/lib/audit-log";
import { getUserPermissions } from "@/lib/permissions";

// GET /api/admin/user-roles?userId=xxx — get user's roles and effective permissions
export async function GET(req: NextRequest) {
  const user = await getSessionUserPublic();
  if (!user || user.role !== "super_admin") {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const userId = new URL(req.url).searchParams.get("userId");
  if (!userId) {
    return NextResponse.json({ error: "userId required" }, { status: 400 });
  }

  try {
    const userRoles = await prisma.userRole.findMany({
      where: { userId },
      include: {
        role: { select: { id: true, name: true, nameFa: true, permissions: true, color: true, isSystem: true } },
      },
    });

    const permissions = getUserPermissions(userRoles.map((ur: any) => ({ permissions: ur.role.permissions as string[] })));

    return NextResponse.json({
      roles: userRoles.map((ur: any) => ({
        id: ur.role.id,
        name: ur.role.name,
        nameFa: ur.role.nameFa,
        color: ur.role.color,
        isSystem: ur.role.isSystem,
        assignedAt: ur.assignedAt,
      })),
      permissions,
    });
  } catch (error) {
    console.error("[user-roles]", error);
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}

// POST /api/admin/user-roles — assign a role to a user
export async function POST(req: NextRequest) {
  const user = await getSessionUserPublic();
  if (!user || user.role !== "super_admin") {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const { userId, roleId } = await req.json();

    if (!userId || !roleId) {
      return NextResponse.json({ error: "userId and roleId required" }, { status: 400 });
    }

    // Check if already assigned
    const existing = await prisma.userRole.findUnique({
      where: { userId_roleId: { userId, roleId } },
    });
    if (existing) {
      return NextResponse.json({ error: "already_assigned" }, { status: 409 });
    }

    const assignment = await prisma.userRole.create({
      data: { userId, roleId, assignedBy: user.id },
    });

    const role = await prisma.role.findUnique({ where: { id: roleId }, select: { name: true, nameFa: true } });
    const targetUser = await prisma.user.findUnique({ where: { id: userId }, select: { name: true } });

    await logAudit({
      userId: user.id,
      userName: user.name,
      action: "user.role.assign",
      target: `user:${userId}`,
      details: { roleName: role?.name, roleNameFa: role?.nameFa, targetUserName: targetUser?.name },
    });

    return NextResponse.json({ ok: true, assignment });
  } catch (error) {
    console.error("[user-roles:assign]", error);
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}

// DELETE /api/admin/user-roles — remove a role from a user
export async function DELETE(req: NextRequest) {
  const user = await getSessionUserPublic();
  if (!user || user.role !== "super_admin") {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const { userId, roleId } = await req.json();

    if (!userId || !roleId) {
      return NextResponse.json({ error: "userId and roleId required" }, { status: 400 });
    }

    await prisma.userRole.delete({
      where: { userId_roleId: { userId, roleId } },
    });

    const role = await prisma.role.findUnique({ where: { id: roleId }, select: { name: true, nameFa: true } });
    const targetUser = await prisma.user.findUnique({ where: { id: userId }, select: { name: true } });

    await logAudit({
      userId: user.id,
      userName: user.name,
      action: "user.role.remove",
      target: `user:${userId}`,
      details: { roleName: role?.name, roleNameFa: role?.nameFa, targetUserName: targetUser?.name },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[user-roles:remove]", error);
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
