"use client";

import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { getCurrentUserClient, type AppUser } from "@/lib/auth";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/layout/admin-sidebar";
import { AdminHeader } from "@/components/admin/layout/admin-header";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [user, setUser] = useState<AppUser | null>(null);

  // Login page gets no layout
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <AdminLayoutInner>{children}</AdminLayoutInner>
  );
}

function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);

  useEffect(() => {
    setUser(getCurrentUserClient());
  }, []);

  return (
    <SidebarProvider defaultOpen>
      <div className="flex min-h-svh w-full" dir="rtl">
        <AdminSidebar user={user} />
        <SidebarInset>
          <AdminHeader user={user} />
          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
