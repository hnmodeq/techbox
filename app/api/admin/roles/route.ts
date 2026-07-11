import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUserPublic } from "@/lib/auth-server";
import { z } from "zod";

async function requireSuperAdmin() {
  const user = await getSessionUserPublic();
  return user && user.role === "super_admin" ? user : null;
}

function parseModules(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((m): m is string => typeof m === "string");
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value || "[]");
      return Array.isArray(parsed) ? parsed.filter((m): m is string => typeof m === "string") : [];
    } catch {
      return [];
    }
  }
  return [];
}

/** GET /api/admin/roles — aggregate roles from real DB users */
export async function GET() {
  const admin = await requireSuperAdmin();
  if (!admin) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  try {
    const users = await prisma.user.findMany({
      where: { status: "active" },
      select: {
        id: true,
        name: true,
        username: true,
        role: true,
        roleFa: true,
        modules: true,
        avatar: true,
      },
    });

    // Group users by role
    const roleMap = new Map<string, {
      name: string;
      titleFa: string;
      users: { id: string; name: string; username: string; avatar: string | null; modules: string[] }[];
    }>();

    for (const u of users) {
      const modules = parseModules(u.modules);
      if (!roleMap.has(u.role)) {
        roleMap.set(u.role, {
          name: u.role,
          titleFa: u.roleFa || u.role,
          users: [],
        });
      }
      roleMap.get(u.role)!.users.push({
        id: u.id,
        name: u.name,
        username: u.username,
        avatar: u.avatar,
        modules,
      });
    }

    // Build aggregated roles list
    const roles = Array.from(roleMap.entries()).map(([roleKey, data]) => {
      // Collect unique modules across all users with this role
      const allModules = new Set<string>();
      for (const u of data.users) {
        for (const m of u.modules) {
          allModules.add(m);
        }
      }

      return {
        name: roleKey,
        titleFa: data.titleFa,
        modules: Array.from(allModules).sort(),
        userCount: data.users.length,
        users: data.users,
      };
    });

    // Sort: super_admin first, then editor, then user
    const roleOrder = ["super_admin", "editor", "user"];
    roles.sort((a, b) => {
      const ai = roleOrder.indexOf(a.name);
      const bi = roleOrder.indexOf(b.name);
      return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
    });

    return NextResponse.json({ roles });
  } catch {
    return NextResponse.json({ error: "db_unavailable" }, { status: 503 });
  }
}

/** PATCH /api/admin/roles — update a user's role and modules */
export async function PATCH(req: NextRequest) {
  const admin = await requireSuperAdmin();
  if (!admin) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const schema = z.object({
    userId: z.string().min(1),
    role: z.enum(["super_admin", "editor", "user"]).optional(),
    roleFa: z.string().max(80).optional(),
    modules: z.array(z.string()).optional(),
  });

  try {
    const body = schema.parse(await req.json());

    // Prevent self-demotion
    if (body.userId === admin.id && body.role && body.role !== "super_admin") {
      return NextResponse.json({ error: "cannot_deny_self_superadmin" }, { status: 400 });
    }

    const data: Record<string, any> = {};
    if (body.role) {
      data.role = body.role;
      data.roleFa = body.roleFa ?? (body.role === "super_admin" ? "مدیر کل" : body.role === "editor" ? "ویراستار" : "کاربر عضو");
    }
    if (body.modules !== undefined) {
      data.modules = body.modules;
    }

    const updated = await prisma.user.update({
      where: { id: body.userId },
      data,
      select: {
        id: true,
        name: true,
        username: true,
        role: true,
        roleFa: true,
        modules: true,
        avatar: true,
      },
    });

    return NextResponse.json({
      user: {
        ...updated,
        modules: parseModules(updated.modules),
      },
    });
  } catch (e: any) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: "validation", issues: e.errors }, { status: 400 });
    }
    return NextResponse.json({ error: e?.message || "update_failed" }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
