"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";
import Dock, { type DockItemData } from "@/components/effects/Dock";
import { navItems, ICON_STROKE } from "@/config/sidebar.config";
import { getCurrentUserClient, type AppUser } from "@/lib/auth";
import { cn } from "@/lib/utils";

/**
 * Vertical Dock variant of the sidebar.
 * - Uses the same nav config + module color classes (central, no hardcoded colors).
 * - Adds an admin-only item after all nav items.
 *
 * Usage: render <SidebarDock /> where you want the magnifying vertical dock,
 * e.g. as a floating rail, instead of (or alongside) the classic SidebarContent.
 */
export default function SidebarDock({ className }: { className?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<AppUser | null>(null);

  useEffect(() => {
    setUser(getCurrentUserClient());
  }, [pathname]);

  const isAdmin = user?.role === "super_admin" || (user?.role as string) === "admin";

  const items: DockItemData[] = navItems.map((item) => {
    const Icon = item.icon;
    const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
    return {
      label: item.title,
      onClick: () => router.push(item.href),
      active,
      icon: (
        <Icon
          strokeWidth={ICON_STROKE}
          className={cn("h-5 w-5", active ? item.iconActiveClassName : item.iconClassName)}
        />
      ),
    };
  });

  if (isAdmin) {
    const adminActive = pathname.startsWith("/admin");
    items.push({
      label: "مدیریت",
      onClick: () => router.push("/admin"),
      active: adminActive,
      icon: <ShieldCheck strokeWidth={ICON_STROKE} className="h-5 w-5 text-[var(--tb-vip)]" />,
    });
  }

  return (
    <Dock
      items={items}
      orientation="vertical"
      panelSize={64}
      baseItemSize={46}
      magnification={64}
      distance={160}
      className={className}
    />
  );
}
