"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import type { AppUser } from "@/lib/auth";
import { useAuth } from "@/providers/auth.provider";
import { SpinnerCenter } from "@/components/ui/spinner";

/** Client UX guard backed by the server-validated AuthProvider session.
 * API routes remain the security boundary for every privileged operation. */
export function AdminGuard({
  children,
  superAdminOnly = false,
}: {
  children: (user: AppUser) => React.ReactNode;
  superAdminOnly?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace(`/admin/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }
    if (superAdminOnly && user.role !== "super_admin") router.replace("/admin");
  }, [loading, pathname, router, superAdminOnly, user]);

  if (loading || !user || (superAdminOnly && user.role !== "super_admin")) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <SpinnerCenter />
          <p className="animate-pulse text-xs text-muted-foreground">در حال بررسی دسترسی...</p>
        </div>
      </div>
    );
  }

  return <>{children(user)}</>;
}
