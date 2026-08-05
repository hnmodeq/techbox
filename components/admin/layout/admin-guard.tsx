"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import type { AppUser } from "@/lib/auth";
import { useAuth } from "@/providers/auth.provider";
import { SpinnerCenter } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";

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
  const { user, loading, unavailable } = useAuth();

  useEffect(() => {
    if (loading || unavailable) return;
    if (!user) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }
    if (superAdminOnly && user.role !== "super_admin") router.replace("/admin");
  }, [loading, pathname, router, superAdminOnly, unavailable, user]);

  if (unavailable && !user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4" dir="rtl">
        <div className="max-w-md space-y-3 rounded-md border border-amber-500/30 bg-amber-500/10 p-6 text-center">
          <p className="font-bold">ارتباط با پایگاه داده موقتاً برقرار نیست</p>
          <p className="text-xs leading-6 text-muted-foreground">نشست شما حذف نشده است. پس از بررسی اتصال Neon دوباره تلاش کنید.</p>
          <Button type="button" size="sm" onClick={() => window.location.reload()}>تلاش مجدد</Button>
        </div>
      </div>
    );
  }

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
