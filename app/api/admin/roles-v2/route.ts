import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUserPublic } from "@/lib/auth-server";
import { logAudit } from "@/lib/audit-log";

// GET /api/admin/roles-v2 — list all roles with user counts
export async function GET() {
  const user = await getSessionUserPublic();
  if (!user || user.role !== "super_admin") {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const roles = await prisma.role.findMany({
      include: {
        _count: { select: { users: true } },
        users: {
          include: {
            user: { select: { id: true, name: true, username: true, avatar: true } },
          },
        },
      },
      orderBy: [{ isSystem: "desc" }, { name: "asc" }],
    });

    return NextResponse.json({ roles });
  } catch (error) {
    console.error("[roles-v2]", error);
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}

// POST /api/admin/roles-v2 — create a new role
export async function POST(req: NextRequest) {
  const user = await getSessionUserPublic();
  if (!user || user.role !== "super_admin") {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, nameFa, description, permissions, color } = body;

    if (!name || !nameFa || !Array.isArray(permissions)) {
      return NextResponse.json({ error: "name, nameFa, permissions required" }, { status: 400 });
    }

    // Check for duplicate name
    const existing = await prisma.role.findUnique({ where: { name } });
    if (existing) {
      return NextResponse.json({ error: "role_name_exists" }, { status: 409 });
    }

    const role = await prisma.role.create({
      data: {
        name,
        nameFa,
        description: description || null,
        permissions,
        color: color || null,
        isSystem: false,
      },
    });

    await logAudit({
      userId: user.id,
      userName: user.name,
      action: "role.create",
      target: `role:${role.id}`,
      details: { name, nameFa, permissionCount: permissions.length },
    });

    return NextResponse.json({ ok: true, role });
  } catch (error) {
    console.error("[roles-v2:create]", error);
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}

// PATCH /api/admin/roles-v2 — update a role
export async function PATCH(req: NextRequest) {
  const user = await getSessionUserPublic();
  if (!user || user.role !== "super_admin") {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id, name, nameFa, description, permissions, color } = body;

    if (!id) {
      return NextResponse.json({ error: "id required" }, { status: 400 });
    }

    const existing = await prisma.role.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }

    if (existing.isSystem) {
      return NextResponse.json({ error: "cannot_edit_system_role" }, { status: 403 });
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (nameFa !== undefined) updateData.nameFa = nameFa;
    if (description !== undefined) updateData.description = description;
    if (permissions !== undefined) updateData.permissions = permissions;
    if (color !== undefined) updateData.color = color;

    const role = await prisma.role.update({
      where: { id },
      data: updateData,
    });

    await logAudit({
      userId: user.id,
      userName: user.name,
      action: "role.update",
      target: `role:${id}`,
      details: { name: role.name, fields: Object.keys(updateData) },
    });

    return NextResponse.json({ ok: true, role });
  } catch (error) {
    console.error("[roles-v2:update]", error);
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}

// DELETE /api/admin/roles-v2 — delete a role
export async function DELETE(req: NextRequest) {
  const user = await getSessionUserPublic();
  if (!user || user.role !== "super_admin") {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const id = new URL(req.url).searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "id required" }, { status: 400 });
    }

    const existing = await prisma.role.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }

    if (existing.isSystem) {
      return NextResponse.json({ error: "cannot_delete_system_role" }, { status: 403 });
    }

    // Remove all user assignments first
    await prisma.userRole.deleteMany({ where: { roleId: id } });
    await prisma.role.delete({ where: { id } });

    await logAudit({
      userId: user.id,
      userName: user.name,
      action: "role.delete",
      target: `role:${id}`,
      details: { name: existing.name },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[roles-v2:delete]", error);
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
