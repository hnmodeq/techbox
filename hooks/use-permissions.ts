"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth.provider";
import { hasPermission } from "@/lib/permissions";

/** Permission checks over the server-validated session returned by /api/auth/me. */
export function usePermissions() {
  const { user, loading } = useAuth();
  const permissions = useMemo(() => user?.permissions || [], [user?.permissions]);

  const has = useCallback(
    (permission: string) => user?.role === "super_admin" || hasPermission(permissions, permission),
    [permissions, user?.role]
  );
  const hasAny = useCallback(
    (required: string[]) => user?.role === "super_admin" || required.some((permission) => hasPermission(permissions, permission)),
    [permissions, user?.role]
  );

  return { permissions, has, hasAny, loading, user };
}

export function useRequirePermission(permission: string) {
  const { has, loading } = usePermissions();
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!has(permission)) {
      setAuthorized(false);
      import("sonner").then(({ toast }) => toast.error("ورود غیر مجاز"));
      router.replace("/admin");
    } else {
      setAuthorized(true);
    }
  }, [has, loading, permission, router]);

  return { authorized, loading };
}
