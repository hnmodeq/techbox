"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Newspaper, Wrench, ShoppingBag, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { label: "خانه", href: "/", icon: Home, active: (path: string) => path === "/" },
  { label: "اخبار", href: "/news", icon: Newspaper, active: (path: string) => path === "/news" || path.startsWith("/news/") },
  { label: "ابزارها", href: "/tools", icon: Wrench, active: (path: string) => path === "/tools" || path.startsWith("/tools/") },
  {
    label: "فروشگاه",
    href: "/landing/storage/shop",
    icon: ShoppingBag,
    active: (path: string) => path.startsWith("/shop") || path.startsWith("/landing/storage/shop"),
  },
  { label: "حساب", href: "/account", icon: UserRound, active: (path: string) => path === "/account" },
] as const;

export function MobileBottomNav() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="ناوبری اصلی موبایل"
      className="fixed inset-x-0 bottom-0 z-50 border-t bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur supports-backdrop-filter:bg-background/85 sm:hidden"
    >
      <div className="grid h-16 grid-cols-5" dir="rtl">
        {items.map((item) => {
          const selected = item.active(pathname);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={selected ? "page" : undefined}
              className={cn(
                "relative flex min-h-11 flex-col items-center justify-center gap-0.5 rounded-md px-1 text-[10px] font-medium text-muted-foreground outline-none transition-colors",
                "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
                selected ? "text-primary" : "hover:bg-muted/60 hover:text-foreground"
              )}
            >
              <Icon className="size-5" aria-hidden="true" />
              <span>{item.label}</span>
              {selected && <span className="absolute inset-x-4 top-0 h-0.5 rounded-full bg-primary" aria-hidden="true" />}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
