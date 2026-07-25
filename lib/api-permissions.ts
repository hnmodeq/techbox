import { NextResponse } from "next/server";
import { getSessionUserPublic } from "@/lib/auth-server";
import { hasPermission } from "@/lib/permissions";
import { getEffectivePermissions } from "@/lib/user-permissions";
import { prisma } from "@/lib/db";
import { logAudit } from "@/lib/audit-log";

export type AuthorizedUser = NonNullable<Awaited<ReturnType<typeof getSessionUserPublic>>> & {
  permissions: string[];
};

async function authorize(required: string[], mode: "any" | "all"): Promise<AuthorizedUser | NextResponse> {
  const user = await getSessionUserPublic();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const permissions = await getEffectivePermissions(user);
  const allowed = user.role === "super_admin" ||
    (mode === "all"
      ? required.every((permission) => hasPermission(permissions, permission))
      : required.some((permission) => hasPermission(permissions, permission)));

  if (!allowed) {
    await logAudit({
      userId: user.id,
      userName: user.name,
      action: "unauthorized_access",
      target: required.join("|"),
      details: { mode, required },
    }).catch(() => {});
    return NextResponse.json({ error: "forbidden", required }, { status: 403 });
  }

  return Object.assign(user, { permissions });
}

export function requirePermission(permission: string) {
  return authorize([permission], "all");
}

export function requireAnyPermission(permissions: string[]) {
  return authorize(permissions, "any");
}

export function requireAllPermissions(permissions: string[]) {
  return authorize(permissions, "all");
}

export async function requireStaff() {
  const user = await getSessionUserPublic();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const permissions = await getEffectivePermissions(user);
  if (user.role !== "super_admin" && permissions.length === 0) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  return Object.assign(user, { permissions }) as AuthorizedUser;
}

export function modulePermissions(module: string, access: "view" | "create" | "edit" | "delete" | "publish") {
  if (module === "shop") {
    const map = {
      view: ["product:list:view", "product:basic:view"],
      create: ["product:create"],
      edit: ["product:basic:edit", "product:content:edit", "product:status:edit"],
      delete: ["product:delete"],
      publish: ["product:status:edit"],
    } as const;
    return [...map[access]];
  }
  return [`content:${module}:${access}`];
}

export function requireModulePermission(
  module: string,
  access: "view" | "create" | "edit" | "delete" | "publish"
) {
  return requireAnyPermission(modulePermissions(module, access));
}

export async function getUserEffectivePermissions(userId: string): Promise<string[]> {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, role: true } });
  return user ? getEffectivePermissions(user) : [];
}
