"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useCallback, useMemo } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { adminNavGroups, type AdminNavItem } from "./admin-nav-items";
import { Search, ExternalLink } from "lucide-react";
import type { AppUser } from "@/lib/auth";

function getBreadcrumbs(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);
  const crumbs: { label: string; href: string }[] = [];
  let currentPath = "";

  for (const segment of segments) {
    currentPath += `/${segment}`;
    const allItems = adminNavGroups.flatMap((g) => g.items);
    const match = allItems.find((item) => item.href === currentPath);
    crumbs.push({
      label: match?.title || segment,
      href: currentPath,
    });
  }

  return crumbs;
}

export function AdminHeader({ user }: { user: AppUser | null }) {
  const pathname = usePathname();
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [jobTitle, setJobTitle] = useState<string>("");
  const breadcrumbs = getBreadcrumbs(pathname);
  const isSuperAdmin = user?.role === "super_admin";

  // Fetch job title for admin job edit pages
  useEffect(() => {
    const parts = pathname.split("/").filter(Boolean);
    if (parts[0] === "admin" && parts[1] === "jobs" && parts[2] && parts[3] === "edit") {
      const jobId = parts[2];
      fetch(`/api/admin/jobs`, { cache: "no-store" })
        .then((r) => r.json())
        .then((jobs: any[]) => {
          const job = jobs.find((j) => j.id === jobId);
          if (job?.title) setJobTitle(job.title);
        })
        .catch(() => {});
    } else {
      setJobTitle("");
    }
  }, [pathname]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setSearchOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  useEffect(() => {
    if (!searchOpen) setQuery("");
  }, [searchOpen]);

  const navigateTo = useCallback(
    (href: string) => {
      setSearchOpen(false);
      router.push(href);
    },
    [router]
  );

  const allItems = useMemo(
    () =>
      adminNavGroups
        .flatMap((g) => g.items)
        .filter((item) => !item.superAdminOnly || isSuperAdmin),
    [isSuperAdmin]
  );

  const filteredGroups = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return adminNavGroups;
    return adminNavGroups
      .map((group) => ({
        ...group,
        items: group.items.filter(
          (item) =>
            (!item.superAdminOnly || isSuperAdmin) &&
            item.title.toLowerCase().includes(q)
        ),
      }))
      .filter((g) => g.items.length > 0);
  }, [query, isSuperAdmin]);

  const matchCount = useMemo(
    () => filteredGroups.reduce((sum, g) => sum + g.items.length, 0),
    [filteredGroups]
  );

  return (
    <header className="flex h-12 shrink-0 items-center gap-2 border-b bg-background px-4">
      <SidebarTrigger className="-me-1 rtl:rotate-180" />
      <Separator orientation="vertical" className="me-2 data-[orientation=vertical]:h-4" />

      <Breadcrumb className="hidden sm:flex flex-1 min-w-0">
        <BreadcrumbList>
          {breadcrumbs.map((crumb, idx) => {
            const isLast = idx === breadcrumbs.length - 1;
            // For job edit pages, show job title instead of ID
            let label = crumb.label;
            const parts = crumb.href.split("/").filter(Boolean);
            if (parts[1] === "jobs" && parts[2] && !["new", "applications"].includes(parts[2]) && parts[3] !== "applications") {
              label = jobTitle || crumb.label;
              if (parts[3] === "edit") label = "ویرایش آگهی استخدام";
            }
            return (
              <React.Fragment key={crumb.href}>
                {idx > 0 && <BreadcrumbSeparator />}
                <BreadcrumbItem>
                  {isLast ? (
                    <BreadcrumbPage className="text-xs font-medium">
                      {label}
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink href={crumb.href} className="text-xs">
                      {label}
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </React.Fragment>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>

      <Button
        variant="outline"
        size="sm"
        className="h-7 gap-1 text-xs text-muted-foreground w-40 justify-start"
        onClick={() => setSearchOpen(true)}
      >
        <Search className="size-3" />
        <span className="truncate">جستجو...</span>
        <kbd className="ms-auto pointer-events-none inline-flex h-4 select-none items-center gap-0.5 rounded border bg-muted px-1 font-mono text-[10px] font-medium text-muted-foreground">
          ⌘K
        </kbd>
      </Button>

      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => window.open("/", "_blank")}
        title="مشاهده سایت"
      >
        <ExternalLink className="size-3.5" />
      </Button>

      {/* Search Dialog */}
      <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
        <DialogContent className="max-w-md p-0 gap-0" dir="rtl">
          <DialogHeader className="p-4 pb-0">
            <DialogTitle className="sr-only">جستجو در پنل مدیریت</DialogTitle>
          </DialogHeader>
          <div className="px-4 pb-3">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="نام صفحه را تایپ کنید..."
              className="h-9"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter" && filteredGroups.length > 0) {
                  const firstItem = filteredGroups[0]?.items[0];
                  if (firstItem) navigateTo(firstItem.href);
                }
                if (e.key === "Escape") setSearchOpen(false);
              }}
            />
            <p className="mt-1.5 text-[10px] text-muted-foreground">
              {matchCount} نتیجه — Enter برای انتخاب اولین مورد
            </p>
          </div>
          <ScrollArea className="max-h-[50vh] border-t">
            <div className="p-2">
              {filteredGroups.map((group) => (
                <div key={group.label} className="mb-2">
                  <div className="px-2 py-1.5 text-[10px] font-medium text-muted-foreground">
                    {group.label}
                  </div>
                  {group.items
                    .filter((item) => !item.superAdminOnly || isSuperAdmin)
                    .map((item) => (
                      <button
                        key={item.href}
                        type="button"
                        onClick={() => navigateTo(item.href)}
                        className="flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-sm text-foreground hover:bg-muted transition-colors text-right"
                      >
                        <item.icon className="size-4 shrink-0 text-muted-foreground" />
                        <span className="flex-1 truncate">{item.title}</span>
                        <span className="text-[10px] text-muted-foreground font-mono truncate max-w-[140px]" dir="ltr">
                          {item.href}
                        </span>
                      </button>
                    ))}
                </div>
              ))}
              {matchCount === 0 && (
                <div className="p-6 text-center text-sm text-muted-foreground">
                  نتیجه‌ای پیدا نشد.
                </div>
              )}
            </div>
          </ScrollArea>
          <div className="border-t p-2 flex justify-center">
            <button
              type="button"
              onClick={() => {
                setSearchOpen(false);
                window.open("/", "_blank");
              }}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors py-1 px-2 rounded hover:bg-muted"
            >
              <ExternalLink className="size-3" />
              مشاهده سایت
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </header>
  );
}
