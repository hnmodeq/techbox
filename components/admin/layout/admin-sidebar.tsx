"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { adminNavGroups, type AdminNavItem } from "./admin-nav-items";
import type { AppUser } from "@/lib/auth";


function isActivePath(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(href + "/");
}

function NavItemLink({ item, isActive }: { item: AdminNavItem; isActive: boolean }) {
  const { isMobile, setOpenMobile } = useSidebar();

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        render={<Link href={item.href} />}
        isActive={isActive}
        tooltip={item.title}
        onClick={() => {
          if (isMobile) setOpenMobile(false);
        }}
      >
        <item.icon className="size-4 shrink-0" />
        <span className="truncate">{item.title}</span>
        {item.badge && (
          <Badge variant="destructive" className="ms-auto text-[10px] px-1 py-0 h-4 min-w-4">
            {item.badge}
          </Badge>
        )}
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

export function AdminSidebar({ user }: { user: AppUser | null }) {
  const pathname = usePathname();
  const isSuperAdmin = user?.role === "super_admin";

  return (
    <Sidebar side="right" collapsible="icon" className="border-l">
      <SidebarHeader className="p-3">
        <Link href="/admin" className="flex items-center gap-2 px-1">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-black text-sm">
            T
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-bold truncate">پنل مدیریت</span>
            <span className="text-[10px] text-muted-foreground truncate">تکباکس</span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent>
        {adminNavGroups.map((group) => {
          const visibleItems = group.items.filter(
            (item) => !item.superAdminOnly || isSuperAdmin
          );
          if (visibleItems.length === 0) return null;

          return (
            <SidebarGroup key={group.label}>
              <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {visibleItems.map((item) => (
                    <NavItemLink
                      key={item.href}
                      item={item}
                      isActive={isActivePath(pathname, item.href)}
                    />
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          );
        })}
      </SidebarContent>

      <SidebarSeparator />

      <SidebarFooter className="p-3">
        {user && (
          <div className="flex items-center gap-2 px-1 group-data-[collapsible=icon]:hidden">
            <div className="flex size-7 items-center justify-center rounded-full bg-muted text-xs font-bold">
              {user.name?.charAt(0) || "?"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium truncate">{user.name}</div>
              <div className="text-[10px] text-muted-foreground truncate">
                {user.role === "super_admin" ? "مدیر کل" : "ویراستار"}
              </div>
            </div>
          </div>
        )}
        <div className="flex flex-col gap-1 group-data-[collapsible=icon]:items-center">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:size-8"
            onClick={async () => {
              await fetch("/api/auth/logout", { method: "POST" });
              localStorage.removeItem("tb_auth_user");
              window.location.href = "/admin/login";
            }}
          >
            خروج
          </Button>
          <ButtonLink
            href="/"
            variant="ghost"
            size="sm"
            className="w-full justify-start group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:size-8"
          >
            بازگشت به سایت
          </ButtonLink>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
