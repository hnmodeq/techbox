import { NextResponse } from "next/server";
import { getSessionUserPublic } from "@/lib/auth-server";
import { prisma } from "@/lib/db";
import { hasPermission, getUserPermissions } from "@/lib/permissions";
import { logAudit } from "@/lib/audit-log";

/**
 * Check if the current user has a specific permission.
 * Returns the user if authorized, or a NextResponse error if not.
 *
 * Usage in API routes:
 *   const user = await requirePermission("product:price:edit");
 *   if (user instanceof NextResponse) return user; // unauthorized
 *   // ... continue with authorized logic
 */
export async function requirePermission(permission: string) {
  const user = await getSessionUserPublic();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // Super_admin bypasses all permission checks
  if (user.role === "super_admin") return user;

  // Get user's permissions from their roles
  const userRoles = await prisma.userRole.findMany({
    where: { userId: user.id },
    include: { role: { select: { permissions: true } } },
  });

  const permissions = getUserPermissions(
    userRoles.map((ur: any) => ({ permissions: ur.role.permissions as string[] }))
  );

  if (!hasPermission(permissions, permission)) {
    // Log unauthorized attempt
    await logAudit({
      userId: user.id,
      userName: user.name,
      action: "unauthorized_access",
      target: permission,
      details: { attempted: permission, userPermissions: permissions.slice(0, 20) },
    }).catch(() => {});

    return NextResponse.json({ error: "forbidden", permission }, { status: 403 });
  }

  return user;
}

/**
 * Get user's effective permissions from their roles.
 * Returns empty array if user not found.
 */
export async function getUserEffectivePermissions(userId: string): Promise<string[]> {
  const userRoles = await prisma.userRole.findMany({
    where: { userId },
    include: { role: { select: { permissions: true } } },
  });

  return getUserPermissions(
    userRoles.map((ur: any) => ({ permissions: ur.role.permissions as string[] }))
  );
}

/**
 * Check if user has a specific permission (client-side helper).
 * This is a lightweight check that doesn't make API calls.
 * For server-side checks, use requirePermission.
 */
export function checkPermissionFromRoles(
  userRoles: Array<{ permissions: string[] }>,
  permission: string
): boolean {
  const permissions = getUserPermissions(userRoles);
  return hasPermission(permissions, permission);
}
