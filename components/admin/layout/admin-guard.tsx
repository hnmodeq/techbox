"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getCurrentUserClient, type AppUser } from "@/lib/auth";
import { SpinnerCenter } from "@/components/ui/spinner";

/**
 * Shared auth guard for all admin pages.
 * Handles loading state, redirect to login, and role-based access.
 */
export function AdminGuard({
  children,
  superAdminOnly = false,
}: {
  children: (user: AppUser) => React.ReactNode;
  superAdminOnly?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = getCurrentUserClient();
    if (!currentUser) {
      router.push(`/admin/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }
    if (superAdminOnly && currentUser.role !== "super_admin") {
      router.push("/admin");
      return;
    }
    setUser(currentUser);
    setLoading(false);
  }, [router, pathname, superAdminOnly]);

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <SpinnerCenter />
          <p className="text-xs text-muted-foreground animate-pulse">در حال بررسی دسترسی...</p>
        </div>
      </div>
    );
  }

  return <>{children(user)}</>;
}
