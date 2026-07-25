import { prisma } from "@/lib/db";
import { getUserPermissions, hasAnyPermission } from "@/lib/permissions";

export type PermissionUser = { id: string; role: string };

export async function getEffectivePermissions(user: PermissionUser): Promise<string[]> {
  if (user.role === "super_admin") return ["*"];
  const assignments = await prisma.userRole.findMany({
    where: { userId: user.id },
    include: { role: { select: { permissions: true } } },
  });
  return getUserPermissions(
    assignments.map((assignment: any) => ({
      permissions: Array.isArray(assignment.role.permissions)
        ? (assignment.role.permissions as string[])
        : [],
    }))
  );
}

const MODULE_PERMISSION_MAP: Record<string, string[]> = {
  blog: ["content:blog:view", "content:blog:create", "content:blog:edit", "content:blog:publish"],
  news: ["content:news:view", "content:news:create", "content:news:edit", "content:news:publish"],
  media: ["content:media:view", "content:media:create", "content:media:edit"],
  review: ["content:review:view", "content:review:create", "content:review:edit"],
  download: ["content:download:view", "content:download:create", "content:download:edit"],
  forum: ["content:forum:view", "content:forum:create", "content:forum:edit", "forum:moderate"],
  timeline: ["content:timeline:view", "content:timeline:create", "content:timeline:edit", "timeline:view"],
  tools: ["content:tools:view", "content:tools:create", "content:tools:edit"],
  shop: ["product:list:view", "product:create", "product:basic:edit", "product:content:edit"],
  workwithus: ["job:view", "job:edit", "job:applications"],
};

export function deriveModulesFromPermissions(role: string, permissions: string[]): string[] {
  if (role === "super_admin" || permissions.includes("*") || permissions.includes("*:*:*")) {
    return Object.keys(MODULE_PERMISSION_MAP);
  }
  return Object.entries(MODULE_PERMISSION_MAP)
    .filter(([, required]) => hasAnyPermission(permissions, required))
    .map(([module]) => module);
}
