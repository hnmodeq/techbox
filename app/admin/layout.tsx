"use client";

import { usePathname } from "next/navigation";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/layout/admin-sidebar";
import { AdminHeader } from "@/components/admin/layout/admin-header";
import { useAuth } from "@/providers/auth.provider";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Login page gets no admin chrome.
  if (pathname === "/admin/login") return <>{children}</>;
  return <AdminLayoutInner>{children}</AdminLayoutInner>;
}

function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  return (
    <SidebarProvider defaultOpen>
      <div className="flex min-h-svh w-full" dir="rtl">
        <AdminSidebar user={user} />
        <SidebarInset>
          <AdminHeader user={user} />
          <div className="flex-1 overflow-auto">{children}</div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
