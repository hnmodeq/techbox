// Shared client-safe authentication types and permission helpers.
// Session identity is never persisted in browser storage; AuthProvider obtains
// it from the HTTP-only cookie through /api/auth/me.

import { hasAnyPermission } from "@/lib/permissions";

export type AppUser = {
  id: string;
  name: string;
  email: string;
  username: string;
  role: string;
  modules: string[];
  permissions: string[];
  avatar?: string;
  roleFa?: string;
  job?: string;
  bio?: string;
  status?: string;
  emailVerified?: boolean;
  verifiedType?: string | null;
  verifiedLabel?: string | null;
};

export function moduleViewPermissions(module: string): string[] {
  if (module === "shop") return ["product:list:view", "product:basic:view"];
  if (module === "workwithus" || module === "jobs") return ["job:view"];
  if (module === "timeline") return ["content:timeline:view", "timeline:view"];
  return [`content:${module}:view`, `content:${module}:edit`, `content:${module}:create`];
}

export function moduleEditPermissions(module: string): string[] {
  if (module === "shop") {
    return ["product:create", "product:basic:edit", "product:content:edit", "product:status:edit"];
  }
  if (module === "workwithus" || module === "jobs") return ["job:edit"];
  if (module === "timeline") return ["content:timeline:edit", "timeline:edit"];
  return [`content:${module}:edit`, `content:${module}:create`, `content:${module}:publish`];
}

export function canView(user: AppUser | null, module: string): boolean {
  if (!user) return false;
  if (user.role === "super_admin") return true;
  return hasAnyPermission(user.permissions || [], moduleViewPermissions(module));
}

export function canEdit(user: AppUser | null, module: string): boolean {
  if (!user) return false;
  if (user.role === "super_admin") return true;
  return hasAnyPermission(user.permissions || [], moduleEditPermissions(module));
}
