"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Bell, Search, ShoppingCart, X, Headset, Clock3, ChevronDown, ChevronLeft } from "lucide-react";

import { Icon } from "@/design/icons";
import ConsultationModal from "@/features/consultation/components/consultation-modal";
import { navItems, isActive } from "@/config/sidebar.config";
import { SidebarContentProps, NavItem } from "@/types/sidebar.types";
import { useAuth } from "@/providers/auth.provider";
import { useCart } from "@/providers/cart.provider";
import { getAllAcross, moduleMeta, type ModuleSlug } from "@/lib/content";
import { moduleColors } from "@/config/module-colors";
import { zIndex } from "@/design";

import { Button, ButtonLink } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ThemeToggleButton } from "@/components/ui/theme-toggle-button";

type AnchorRect = { top: number; right: number };

function TehranDateTime({ now, expanded }: { now: Date | null; expanded: boolean }) {
  const label = now
    ? `${now.toLocaleDateString("fa-IR", { timeZone: "Asia/Tehran" })} – ${now.toLocaleTimeString("fa-IR", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Asia/Tehran",
      })} تهران`
    : "ساعت تهران";

  if (!expanded) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger
            render={
              <Button variant="ghost" size="icon-sm" aria-label="ساعت تهران" className="text-muted-foreground hover:text-foreground" />
            }
          >
            <Clock3 className="size-4" />
          </TooltipTrigger>
          <TooltipContent side="left" className="text-xs">
            {label}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <Card className="p-2.5 bg-muted/50">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <div className="truncate text-xs text-muted-foreground">
            {now?.toLocaleDateString("fa-IR", { weekday: "long", timeZone: "Asia/Tehran" }) || "تهران"}
          </div>
          <div className="truncate text-xs text-muted-foreground">
            {now?.toLocaleDateString("fa-IR", { year: "numeric", month: "long", day: "numeric", timeZone: "Asia/Tehran" }) || "—"}
          </div>
        </div>
        <div className="shrink-0 text-xs tabular-nums text-foreground" dir="ltr">
          {now?.toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit", second: "2-digit", timeZone: "Asia/Tehran" }) || "--:--:--"}
        </div>
      </div>
    </Card>
  );
}

function NavLinkItem({
  item,
  active,
  expanded,
  onClick,
}: {
  item: NavItem;
  active: boolean;
  expanded: boolean;
  onClick?: () => void;
}) {
  const IconComp = item.icon as any;
  const iconClass = active ? item.iconActiveClassName || "text-[var(--home)]" : item.iconClassName || "text-muted-foreground";
  const hoverClass = item.iconHoverClassName || item.iconActiveClassName || "group-hover:text-[var(--home)]";

  const content = (
    <Link
      href={item.href}
      onClick={onClick}
      className={`group relative flex h-10 w-full items-center rounded-md text-sm transition-colors ${
        active ? "bg-muted font-bold text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
      }`}
    >
      {active && <span className="absolute bottom-2 right-0 top-2 w-[3px] rounded-full bg-[var(--home)]" />}
      <span className="flex h-10 w-10 shrink-0 items-center justify-center">
        <IconComp size={19} className={`${iconClass} ${hoverClass} transition-colors duration-200`} strokeWidth={1.75} />
      </span>
      <span className={`truncate transition-all ${expanded ? "w-[160px] opacity-100" : "w-0 opacity-0"}`}>{item.title}</span>
    </Link>
  );

  if (!expanded) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger render={<div className="flex w-full">{content}</div>} />
          <TooltipContent side="left" className="text-xs">
            {item.title}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return content;
}

export default function SidebarContent({ expanded, theme, onToggleTheme, onLogoClick, onLinkClick }: SidebarContentProps) {
  const pathname = usePathname();
  const router = useRouter();
  const notifButtonRef = useRef<HTMLButtonElement | null>(null);
  const [mounted, setMounted] = useState(false);
  const { user } = useAuth();
  const [q, setQ] = useState("");
  const [now, setNow] = useState<Date | null>(null);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [consultOpen, setConsultOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const collapsedSearchRef = useRef<HTMLInputElement | null>(null);
  const { count: cartCount, setOpen: setCartOpen } = useCart();

  const [toolsExpanded, setToolsExpanded] = useState(false);

  useEffect(() => {
    setMounted(true);
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (searchOpen) collapsedSearchRef.current?.focus();
  }, [searchOpen]);

  const loadNotifications = useCallback(() => {
    fetch("/api/notifications", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d)) {
          setNotifications(d);
          setUnreadCount(0);
        } else {
          setNotifications(Array.isArray(d.items) ? d.items : []);
          setUnreadCount(typeof d.unreadCount === "number" ? d.unreadCount : 0);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  useEffect(() => {
    if (!notifOpen || unreadCount === 0) return;
    const latest = notifications[0]?.createdAt;
    fetch("/api/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lastReadAt: latest || new Date().toISOString() }),
    })
      .then(() => setUnreadCount(0))
      .catch(() => {});
  }, [notifOpen, unreadCount, notifications]);

  const hasUnreadNotif = unreadCount > 0;

  const doSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (q.trim()) {
      router.push(`/search?q=${encodeURIComponent(q.trim())}`);
      onLinkClick?.();
    }
  };

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      {/* Header */}
      <header className="flex flex-col gap-2 p-2 border-b">
        <div className="flex items-center justify-between gap-1">
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon-sm" onClick={onLogoClick} className="shrink-0" aria-label="لوگو">
              <Image src="/logo.png" alt="TechBox" width={28} height={28} className="rounded-md" />
            </Button>
            {expanded && (
              <Link href="/" className="text-sm font-extrabold tracking-tight text-foreground">
                تکباکس
              </Link>
            )}
          </div>
          <div className="flex items-center gap-0.5">
            {/* Notifications — Popover with shadcn */}
            <Popover open={notifOpen} onOpenChange={setNotifOpen}>
              <PopoverTrigger
                render={
                  <Button ref={notifButtonRef as any} variant="ghost" size="icon-sm" className="relative" aria-label="اعلان‌ها" />
                }
              >
                <Bell className="size-4" />
                {hasUnreadNotif && (
                  <span className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-destructive text-[9px] text-destructive-foreground">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </PopoverTrigger>
              <PopoverContent align="start" className="w-80 p-0" side="left">
                <div className="p-3 border-b flex items-center justify-between">
                  <span className="text-xs font-medium">آخرین رویدادها</span>
                  {unreadCount > 0 && <Badge variant="destructive" className="text-[10px]">{unreadCount} جدید</Badge>}
                </div>
                <ScrollArea className="max-h-80">
                  <ul className="p-2 space-y-2 text-xs">
                    {notifications.length === 0 && <li className="text-muted-foreground text-center py-6">اعلانی نیست</li>}
                    {notifications.map((n: any) => {
                      const sourceColor = moduleColors[n.module as keyof typeof moduleColors]?.active ?? "text-muted-foreground";
                      const sourceLabel = moduleMeta[n.module as ModuleSlug]?.titleFa ?? n.module;
                      return (
                        <li key={n.id} className="border-b last:border-0 pb-2">
                          <Link href={`/${n.module}/${n.slug}`} onClick={() => setNotifOpen(false)} className="line-clamp-2 hover:underline">
                            {!n.read && <span className="me-1 inline-block size-1.5 rounded-full bg-destructive" />}
                            <span className={sourceColor}>{sourceLabel}</span> • {n.actor}: {n.text}
                          </Link>
                          <div className="mt-1 text-[10px] text-muted-foreground line-clamp-1">
                            روی «{n.title}» • {new Date(n.createdAt).toLocaleString("fa-IR")}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </ScrollArea>
                <div className="p-2 border-t">
                  <Button variant="ghost" size="xs" onClick={() => setNotifOpen(false)} className="w-full">
                    بستن
                  </Button>
                </div>
              </PopoverContent>
            </Popover>

            {/* Cart */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button variant="ghost" size="icon-sm" className="relative" onClick={() => setCartOpen(true)} aria-label="سبد خرید" />
                  }
                >
                  <ShoppingCart className="size-4" />
                  {cartCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 size-4 p-0 text-[9px] flex items-center justify-center rounded-full">
                      {cartCount}
                    </Badge>
                  )}
                </TooltipTrigger>
                <TooltipContent side="left">سبد خرید {cartCount > 0 ? `(${cartCount})` : ""}</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Search */}
            {expanded ? (
              <form onSubmit={doSearch} className="flex items-center gap-1 ms-1">
                <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="جستجو…" className="h-8 w-28 text-xs" />
                <Button type="submit" variant="ghost" size="icon-sm" aria-label="جستجو">
                  <Search className="size-3.5" />
                </Button>
              </form>
            ) : (
              <>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger
                      render={
                        <Button variant="ghost" size="icon-sm" onClick={() => setSearchOpen((o) => !o)} aria-label="جستجو" aria-expanded={searchOpen} />
                      }
                    >
                      {searchOpen ? <X className="size-4" /> : <Search className="size-4" />}
                    </TooltipTrigger>
                    <TooltipContent side="left">جستجو</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                {searchOpen && (
                  <div className="absolute left-full top-1/2 z-20 ms-2 flex h-10 -translate-y-1/2 items-center">
                    <Card className="p-1 flex items-center gap-1 w-56 max-w-[60vw]">
                      <Input
                        ref={collapsedSearchRef as any}
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        onBlur={() => {
                          if (!q.trim()) setSearchOpen(false);
                        }}
                        placeholder="جستجو در تکباکس…"
                        className="h-8 text-xs"
                      />
                      <Button type="button" variant="ghost" size="icon-sm" onClick={(e) => { doSearch(e as any); setSearchOpen(false); }}>
                        <Search className="size-3.5" />
                      </Button>
                    </Card>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <TehranDateTime now={now} expanded={expanded} />

        {/* Theme toggle — shadcn Button inside ThemeToggleButton but we keep its nice animation */}
        <div className="h-9">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger
                render={
                  <div className="w-full">
                    <ThemeToggleButton theme={theme} expanded={expanded} onClick={onToggleTheme} />
                  </div>
                }
              />
              {!expanded && <TooltipContent side="left">{theme === "dark" ? "حالت روز" : "حالت شب"}</TooltipContent>}
            </Tooltip>
          </TooltipProvider>
        </div>

        <Separator />
      </header>

      {/* Nav — ScrollArea */}
      <ScrollArea className="flex-1">
        <nav className="p-2">
          <div className="flex flex-col gap-0.5">
            {navItems.map((item) => {
              const active = isActive(pathname, item.href);

              // Tools with children — use DropdownMenu for desktop expanded and simple list for collapsed
              if (item.children && item.children.length > 0) {
                if (!expanded) {
                  // collapsed: show parent as icon with tooltip that has submenu?
                  return (
                    <DropdownMenu key={item.href}>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger
                            render={
                              <DropdownMenuTrigger
                                render={
                                  <Button variant={active ? "secondary" : "ghost"} size="icon-sm" className="w-full justify-start" aria-label={item.title} />
                                }
                              />
                            }
                          >
                            <item.icon size={18} className={active ? item.iconActiveClassName : item.iconClassName} strokeWidth={1.75} />
                          </TooltipTrigger>
                          <TooltipContent side="left">{item.title}</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <DropdownMenuContent side="left" align="start" className="w-56">
                        <DropdownMenuLabel>{item.title}</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {item.children.map((child) => {
                          const ChildIcon = child.icon as any;
                          return (
                            <DropdownMenuItem
                              key={child.href}
                              onClick={() => {
                                router.push(child.href);
                                onLinkClick?.();
                              }}
                              className="flex items-center gap-2"
                            >
                              <ChildIcon size={16} className={child.iconClassName} />
                              {child.title}
                            </DropdownMenuItem>
                          );
                        })}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  );
                }

                // expanded: show parent + collapsible children inline
                return (
                  <div key={item.href} className="flex flex-col">
                    <div className="flex items-center gap-1">
                      <div className="flex-1">
                        <NavLinkItem item={item} active={active} expanded={expanded} onClick={onLinkClick} />
                      </div>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => setToolsExpanded((o) => !o)}
                        aria-label="زیرمنو ابزارها"
                        className="shrink-0"
                      >
                        {toolsExpanded ? <ChevronDown className="size-4" /> : <ChevronLeft className="size-4" />}
                      </Button>
                    </div>
                    {toolsExpanded && (
                      <div className="ms-7 mt-1 flex flex-col gap-0.5 border-s ps-2">
                        {item.children.map((child) => {
                          const childActive = isActive(pathname, child.href);
                          return <NavLinkItem key={child.href} item={child} active={childActive} expanded={expanded} onClick={onLinkClick} />;
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              return <NavLinkItem key={item.href} item={item} active={active} expanded={expanded} onClick={onLinkClick} />;
            })}

            {(user?.role === "super_admin" || (user?.role as string) === "admin") && (
              <NavLinkItem
                item={{
                  title: "مدیریت",
                  href: "/admin",
                  icon: (() => (
                    <Icon name="shield" size={19} strokeWidth={1.75} className="text-[var(--vip)]" />
                  )) as any,
                  iconClassName: "text-[var(--vip)]",
                }}
                active={isActive(pathname, "/admin")}
                expanded={expanded}
                onClick={onLinkClick}
              />
            )}
          </div>
        </nav>
        <ScrollBar orientation="vertical" />
      </ScrollArea>

      <Separator />

      {/* Footer: user */}
      <div className="shrink-0 p-2 space-y-1">
        {user ? (
          <Link
            href="/account"
            onClick={onLinkClick}
            className={`flex items-center gap-2 rounded-md p-1.5 transition-colors ${isActive(pathname, "/account") ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"}`}
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted">
              {user.avatar && user.avatar !== "/assets/hooman.png" ? (
                <Image src={user.avatar} alt={user.name || "کاربر"} width={28} height={28} className="rounded-full object-cover ring-1 ring-border" />
              ) : (
                <span className="flex size-7 items-center justify-center rounded-full bg-muted-foreground/10">
                  <Icon name="user" size={14} />
                </span>
              )}
            </span>
            <span className={`truncate ${expanded ? "w-[140px] opacity-100" : "w-0 opacity-0"} overflow-hidden transition-all`}>
              <span className="block text-xs font-bold">{user.name || user.username}</span>
              <span className="block text-[11px] text-muted-foreground">{user.roleFa || (user.role === "super_admin" ? "مدیر کل" : "کاربر تکباکس")}</span>
            </span>
          </Link>
        ) : (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.dispatchEvent(new CustomEvent("tb_open_auth"))}
                    className="w-full justify-start gap-2"
                  />
                }
              >
                <span className="flex size-7 items-center justify-center rounded-full bg-muted">
                  <Icon name="user" size={14} />
                </span>
                <span className={`${expanded ? "w-[120px] opacity-100" : "w-0 opacity-0"} truncate transition-all font-bold`}>ورود / عضویت</span>
              </TooltipTrigger>
              {!expanded && <TooltipContent side="left">ورود / حساب کاربری</TooltipContent>}
            </Tooltip>
          </TooltipProvider>
        )}

        {/* Consultation — hidden per original but keep button ghost for future */}
        <div className="hidden">
          <Button variant="outline" size="sm" className="w-full justify-center gap-2 text-[var(--consultation)] border-[color-mix(in_oklch,var(--consultation)_35%,transparent)] hover:bg-[color-mix(in_oklch,var(--consultation)_12%,transparent)]" onClick={() => setConsultOpen(true)}>
            <Headset className="size-4" />
            {expanded && "مشاوره زیرساخت"}
          </Button>
        </div>
      </div>

      <ConsultationModal open={consultOpen} onClose={() => setConsultOpen(false)} />
    </div>
  );
}
