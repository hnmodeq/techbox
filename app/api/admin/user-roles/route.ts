import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUserPublic } from "@/lib/auth-server";
import { requireAnyPermission, requirePermission } from "@/lib/api-permissions";
import { logAudit } from "@/lib/audit-log";
import { getUserPermissions, hasPermission } from "@/lib/permissions";

// GET /api/admin/user-roles?userId=xxx — get user's roles and effective permissions
export async function GET(req: NextRequest) {
  const user = await getSessionUserPublic();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const userId = new URL(req.url).searchParams.get("userId") || user.id;
  if (user.role !== "super_admin" && userId !== user.id) {
    const authorized = await requireAnyPermission(["role:view", "user:role:assign"]);
    if (authorized instanceof NextResponse) return authorized;
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
  const user = await requirePermission("user:role:assign");
  if (user instanceof NextResponse) return user;

  try {
    const { userId, roleId } = await req.json();

    if (!userId || !roleId) {
      return NextResponse.json({ error: "userId and roleId required" }, { status: 400 });
    }

    const role = await prisma.role.findUnique({
      where: { id: roleId },
      select: { name: true, nameFa: true, permissions: true },
    });
    if (!role) return NextResponse.json({ error: "role_not_found" }, { status: 404 });
    const grantedPermissions = Array.isArray(role.permissions) ? role.permissions as string[] : [];
    if (user.role !== "super_admin" && grantedPermissions.some((permission) => !hasPermission(user.permissions, permission))) {
      return NextResponse.json({ error: "cannot_assign_role_with_unowned_permissions" }, { status: 403 });
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

    const targetUser = await prisma.user.findUnique({ where: { id: userId }, select: { name: true } });

    // Auto-assign blue badge when content_writer role is given
    if (role?.name === "content_writer") {
      await prisma.user.update({
        where: { id: userId },
        data: { verifiedType: "content" },
      });
    }

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
  const user = await requirePermission("user:role:assign");
  if (user instanceof NextResponse) return user;

  try {
    const { userId, roleId } = await req.json();

    if (!userId || !roleId) {
      return NextResponse.json({ error: "userId and roleId required" }, { status: 400 });
    }

    const role = await prisma.role.findUnique({
      where: { id: roleId },
      select: { name: true, nameFa: true, permissions: true },
    });
    if (!role) return NextResponse.json({ error: "role_not_found" }, { status: 404 });
    const grantedPermissions = Array.isArray(role.permissions) ? role.permissions as string[] : [];
    if (user.role !== "super_admin" && grantedPermissions.some((permission) => !hasPermission(user.permissions, permission))) {
      return NextResponse.json({ error: "cannot_remove_role_with_unowned_permissions" }, { status: 403 });
    }

    await prisma.userRole.delete({
      where: { userId_roleId: { userId, roleId } },
    });
    const targetUser = await prisma.user.findUnique({ where: { id: userId }, select: { name: true } });

    // Remove blue badge when content_writer role is removed
    if (role?.name === "content_writer") {
      // Check if user still has a verification request approval (yellow/purple badge)
      const hasVerification = await prisma.verificationRequest.findFirst({
        where: { userId, status: "approved" },
      });
      if (!hasVerification) {
        await prisma.user.update({
          where: { id: userId },
          data: { verifiedType: null, verifiedLabel: null },
        });
      }
    }

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
