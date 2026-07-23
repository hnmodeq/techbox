"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUserClient } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";

/**
 * Hook to check user permissions in admin pages.
 * Loads the user's roles and returns permission checking functions.
 *
 * Usage:
 *   const { permissions, has, loading } = usePermissions();
 *   if (!has("product:price:edit")) return <AccessDenied />;
 */
export function usePermissions() {
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const currentUser = getCurrentUserClient();
    if (!currentUser) {
      setLoading(false);
      return;
    }
    setUser(currentUser);

    if (currentUser.role === "super_admin") {
      setPermissions(["*"]);
      setLoading(false);
      return;
    }

    fetch(`/api/admin/user-roles?userId=${currentUser.id}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        if (data.permissions) setPermissions(data.permissions);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const has = (permission: string): boolean => {
    if (user?.role === "super_admin") return true;
    return hasPermission(permissions, permission);
  };

  const hasAny = (perms: string[]): boolean => {
    if (user?.role === "super_admin") return true;
    return perms.some((p) => hasPermission(permissions, p));
  };

  return { permissions, has, hasAny, loading, user };
}

/**
 * Hook that redirects to dashboard with toast if user lacks permission.
 */
export function useRequirePermission(permission: string) {
  const { has, loading } = usePermissions();
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!has(permission)) {
      // Unauthorized — redirect to dashboard
      import("sonner").then(({ toast }) => {
        toast.error("ورود غیر مجاز");
      });
      router.push("/admin");
    } else {
      setAuthorized(true);
    }
  }, [loading, has, permission, router]);

  return { authorized, loading };
}
