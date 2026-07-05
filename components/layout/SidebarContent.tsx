"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Icon } from "@/design/icons";
import ConsultationModal from "@/features/consultation/components/consultation-modal";
import { createPortal } from "react-dom";
import { navItems, linkBase, linkInactive, isActive } from "@/config/sidebar.config";
import { SidebarContentProps, NavItem } from "@/types/sidebar.types";
import SidebarTooltip from "@/components/layout/SidebarTooltip";
import { useEffect, useMemo, useRef, useState } from "react";
import { getCurrentUserClient, type AppUser } from "@/lib/auth";
import { useCart } from "@/providers/cart.provider";
import { getAllAcross, moduleMeta, type ModuleSlug } from "@/lib/content";
import { moduleColors } from "@/config/module-colors";
import { zIndex } from "@/design";
import { Button, ButtonLink } from "@/components/ui/button";
import { IconRailButton } from "@/components/ui/icon-rail-button";
import { CloseButton } from "@/components/ui/close-button";
import { OverlayBackdrop } from "@/components/ui/overlay";
import { Panel } from "@/components/ui/panel";
import { ThemeToggleButton } from "@/components/ui/theme-toggle-button";

type AnchorRect = { top: number; right: number };

function TehranDateTime({ now, expanded }: { now: Date | null; expanded: boolean }) {
 const label = now
 ? `${now.toLocaleDateString("fa-IR", { timeZone: "Asia/Tehran" })} – ${now.toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Tehran" })} تهران`
 : "ساعت تهران";

 return (
 <div className={expanded ? "shrink-0" : "h-[58px] shrink-0"}>
 {!expanded ? (
 <SidebarTooltip enabled label={label} tooltipClassName="paragraph-color">
 <span className="inline-flex h-9 w-9 items-center justify-center rounded-[var(--corner-radius)] text-[var(--paragraph-color)] hover:bg-[var(--muted-background)] hover:text-[var(--primary-text)] transition-colors cursor-pointer" aria-label="ساعت تهران">
 <Icon name="clock" size={18} />
 </span>
 </SidebarTooltip>
 ) : (
 <div className="flex items-center justify-between gap-2 rounded-[var(--corner-radius)] border-[length:var(--border-size)] border-[var(--border-color)] bg-[var(--muted-background)] px-3 py-2 shadow-[var(--shadow-size)]">
 <div className="min-w-0">
 <div className="truncate text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] paragraph-color">
 {now?.toLocaleDateString("fa-IR", { weekday: "long", timeZone: "Asia/Tehran" }) || "تهران"}
 </div>
 <div className="truncate text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] paragraph-color">
 {now?.toLocaleDateString("fa-IR", { year: "numeric", month: "long", day: "numeric", timeZone: "Asia/Tehran" }) || "—"}
 </div>
 </div>
 <div className="shrink-0 text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] tabular-nums" dir="ltr">
 {now?.toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit", second: "2-digit", timeZone: "Asia/Tehran" }) || "--:--:--"}
 </div>
 </div>
 )}
 </div>
 );
}

function getTooltipColorClass(item: NavItem, active: boolean) {
 return active
 ? item.iconActiveClassName || item.tooltipClassName || "text-[var(--home)]"
 : item.tooltipClassName || item.iconActiveClassName || "paragraph-color";
}

export default function SidebarContent({
 expanded,
 theme,
 onToggleTheme,
 onLogoClick,
 onLinkClick,
}: SidebarContentProps) {
 const pathname = usePathname();
 const router = useRouter();
 const notifButtonRef = useRef<HTMLButtonElement | null>(null);
 const [notifPos, setNotifPos] = useState<AnchorRect | null>(null);
 const [mounted, setMounted] = useState(false);
 const [user, setUser] = useState<AppUser | null>(null);
 const [q, setQ] = useState("");
 const [now, setNow] = useState<Date | null>(null);
 const [notifOpen, setNotifOpen] = useState(false);
 const [consultOpen, setConsultOpen] = useState(false);
 const [searchOpen, setSearchOpen] = useState(false);
 const collapsedSearchRef = useRef<HTMLInputElement | null>(null);
 const notifPanelRef = useRef<HTMLDivElement | null>(null);
 const { count: cartCount, setOpen: setCartOpen } = useCart();

  const [toolsExpanded, setToolsExpanded] = useState(false);

  useEffect(() => {
    setMounted(true);
 fetch("/api/auth/me")
   .then((r) => r.json())
   .then((d) => {
     if (d?.user) setUser(d.user);
     else setUser(getCurrentUserClient());
   })
   .catch(() => setUser(getCurrentUserClient()));
 setNow(new Date());
 const t = setInterval(() => setNow(new Date()), 1000);
 return () => clearInterval(t);
 }, []);

 useEffect(() => {
 const h = () => setUser(getCurrentUserClient());
 const onCustomAuth = (e: any) => {
   if (e.detail) setUser(e.detail);
   else fetch("/api/auth/me").then(r=>r.json()).then(d=>setUser(d?.user||null)).catch(()=>{});
 };
 window.addEventListener("storage", h);
 window.addEventListener("tb_auth_changed", onCustomAuth);
 return () => {
   window.removeEventListener("storage", h);
   window.removeEventListener("tb_auth_changed", onCustomAuth);
 };
 }, []);

 useEffect(() => {
 if (!notifOpen) return;
 const update = () => {
 const rect = notifButtonRef.current?.getBoundingClientRect();
 if (!rect) return;
 const panelW = 320;
 const safe = 12;
 const right = Math.max(safe, window.innerWidth - rect.right);
 const top = Math.min(window.innerHeight - 80, rect.bottom + 8);
 setNotifPos({ right: Math.min(right, window.innerWidth - panelW - safe), top });
 };
 update();
 window.addEventListener("resize", update);
 window.addEventListener("scroll", update, true);
 return () => {
 window.removeEventListener("resize", update);
 window.removeEventListener("scroll", update, true);
 };
 }, [notifOpen]);

 // Close the notification popover when clicking anywhere outside it / its trigger.
 useEffect(() => {
 if (!notifOpen) return;
 const onDown = (e: PointerEvent) => {
 const target = e.target as Node;
 if (notifPanelRef.current?.contains(target)) return;
 if (notifButtonRef.current?.contains(target)) return;
 setNotifOpen(false);
 };
 const onKey = (e: KeyboardEvent) => {
 if (e.key === "Escape") setNotifOpen(false);
 };
 document.addEventListener("pointerdown", onDown);
 document.addEventListener("keydown", onKey);
 return () => {
 document.removeEventListener("pointerdown", onDown);
 document.removeEventListener("keydown", onKey);
 };
 }, [notifOpen]);

 // Focus the collapsed search field when it expands.
 useEffect(() => {
 if (searchOpen) collapsedSearchRef.current?.focus();
 }, [searchOpen]);

 const notifications = useMemo(() => getAllAcross().slice(0, 8), []);

 const doSearch = (e?: React.FormEvent) => {
 e?.preventDefault();
 if (q.trim()) {
 router.push(`/search?q=${encodeURIComponent(q.trim())}`);
 onLinkClick?.();
 }
 };

 const notificationPanel = notifOpen && mounted && notifPos
 ? createPortal(
 <div
 ref={notifPanelRef}
 className="fixed w-[320px] max-w-[92vw] p-3 text-right bg-[var(--card-background)] text-[var(--primary-text)] border-[length:var(--border-size)] border-[var(--border-color)] rounded-[var(--corner-radius)] shadow-[var(--shadow-size)]"
 style={{ zIndex: zIndex.notification, top: notifPos.top, right: notifPos.right }}
 dir="rtl"
 >
 <div className="mb-2 text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] ">آخرین رویدادها</div>
 <ul className="max-h-80 space-y-2 overflow-y-auto text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)]">
              {notifications.map((n: any) => {
                // Title stays neutral; the source module label carries the module color.
                const sourceColor = moduleColors[n.module as keyof typeof moduleColors]?.active ?? "paragraph-color";
                const sourceLabel = moduleMeta[n.module as ModuleSlug]?.titleFa ?? n.module;
                return (
                  <li key={`${n.module}-${n.slug}`} className="border-b-[length:var(--border-size)] border-[color-mix(in_oklch,var(--border-color)_40%,transparent)] pb-2 last:border-0">
                    <Link href={`/${n.module}/${n.slug}`} onClick={() => setNotifOpen(false)} className="line-clamp-2 text-[var(--primary-text)] transition-opacity hover:opacity-80">
                      {n.title}
                    </Link>
                    <div className="mt-0.5 text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] paragraph-color">
                      <span className={sourceColor}>{sourceLabel}</span> • {n.date_fa}{n.time ? ` • ${n.time}`: ""}
                    </div>
                  </li>
                );
              })}
 </ul>
 <Button variant="ghost" size="xs" onClick={() => setNotifOpen(false)} className="mt-2 w-full text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)]">بستن</Button>
 </div>,
 document.body
 )
 : null;

 return (
 <div className="relative flex h-full w-full flex-col text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)]" dir="rtl">
 <header className="shrink-0 space-y-3 p-3">
 <div className="flex h-10 items-center gap-2">
 <div className="relative h-10 w-10 shrink-0">
 {onLogoClick ? (
 <SidebarTooltip label="باز/بستن منو" enabled={!expanded} tooltipClassName="text-[var(--home)]">
 <Button onClick={onLogoClick} variant="link" size="icon" className="relative h-10 w-10 overflow-hidden rounded-[var(--corner-radius)] p-0 transition-opacity hover:opacity-90" aria-label="toggle sidebar">
 <Image src="/logo.png" alt="تکباکس" fill sizes="40px" className="object-contain" />
 </Button>
 </SidebarTooltip>
 ) : (
 <Image src="/logo.png" alt="تکباکس" fill sizes="40px" className="object-contain" />
 )}
 </div>

          <div className={`overflow-hidden transition-all duration-[200ms] ${expanded ? "w-[170px] opacity-100" : "w-0 opacity-0"}`}>
            <div className="text-[length:var(--h3-font-size)] text-[var(--h3-font-color)] font-semibold text-[var(--primary-text)]">تکباکس</div>
            <div className="text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] paragraph-color">پاتوق بچه‌های فناوری اطلاعات</div>
          </div>
        </div>

        {/* Notifications + cart — always visible, stable in both expanded & collapsed states */}
        <div className={`flex shrink-0 items-center gap-1 ${expanded ? "flex-row justify-start" : "flex-col"}`}>
          <SidebarTooltip label="اعلان‌ها" enabled={!expanded} tooltipClassName="text-[var(--news)]">
            <IconRailButton ref={notifButtonRef} tone="news" onClick={() => setNotifOpen((o) => !o)} aria-label="notifications">
              <Icon name="bell" size={18} />
              <span className="absolute left-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-[var(--danger)]" />
            </IconRailButton>
          </SidebarTooltip>

          <SidebarTooltip label={cartCount > 0 ? `سبد خرید – ${cartCount} قلم`: "سبد خرید"} enabled={!expanded} tooltipClassName="text-[var(--shop)]">
            <IconRailButton tone="shop" onClick={() => setCartOpen(true)} aria-label="سبد خرید">
              <Icon name="cart" size={18} />
              {cartCount > 0 && (
                <span className="absolute -left-0.5 -top-0.5 flex h-[16px] min-w-[16px] items-center justify-center rounded-full bg-[var(--shop)] px-1 text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] text-[#ffffff]">
                  {cartCount > 99 ? "۹۹+" : (cartCount ?? 0).toLocaleString("fa-IR")}
                </span>
              )}
            </IconRailButton>
          </SidebarTooltip>
        </div>

        <TehranDateTime now={now} expanded={expanded} />

 <div className="relative h-10 shrink-0">
 {expanded ? (
 <form onSubmit={doSearch} className="relative h-10">
 <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="جستجو در تکباکس…" className="input h-10 !py-2 pe-8 text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)]" />
 <Button type="submit" variant="link" size="iconSm" className="absolute left-1.5 top-1/2 -translate-y-1/2 paragraph-color hover:text-[var(--primary-text)]" aria-label="search">
 <Icon name="search" size={14} />
 </Button>
 </form>
 ) : (
 <>
 <SidebarTooltip label="جستجو" enabled={!searchOpen} tooltipClassName="text-[var(--home)]">
 <IconRailButton tone="brand" onClick={() => setSearchOpen((o) => !o)} aria-label="جستجو" aria-expanded={searchOpen}>
 {searchOpen ? <Icon name="close" size={18} /> : <Icon name="search" size={18} />}
 </IconRailButton>
 </SidebarTooltip>

 {/* Expanding search that pops out to the left of the rail icon. */}
 {searchOpen && (
 <form
 onSubmit={(e) => { doSearch(e); setSearchOpen(false); }}
 className="absolute left-full top-1/2 z-20 ms-2 flex h-10 -translate-y-1/2 items-center"
 dir="rtl"
 >
 <div className="relative w-56 max-w-[60vw] rounded-[var(--corner-radius)] border-[length:var(--border-size)] border-[var(--border-color)] bg-[var(--card-background)] shadow-[var(--shadow-size)]">
 <input
 ref={collapsedSearchRef}
 value={q}
 onChange={(e) => setQ(e.target.value)}
 onBlur={() => { if (!q.trim()) setSearchOpen(false); }}
 placeholder="جستجو در تکباکس…"
 className="input h-10 w-full !py-2 pe-9 text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] !border-0 !bg-transparent"
 />
 <Button type="submit" variant="link" size="iconSm" className="absolute left-1.5 top-1/2 -translate-y-1/2 paragraph-color hover:text-[var(--primary-text)]" aria-label="search">
 <Icon name="search" size={14} />
 </Button>
 </div>
 </form>
 )}
 </>
 )}
 </div>

 <div className="hidden">
 {expanded ? (
 <Button
 type="button"
 variant="ghost"
 onClick={() => setConsultOpen(true)}
 className="flex h-10 w-full items-center justify-center gap-2 rounded-[var(--corner-radius)] border-[length:var(--border-size)] border-[color-mix(in_oklch,var(--consultation)_35%,transparent)] text-center text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] text-[var(--consultation)] hover:bg-[color-mix(in_oklch,var(--consultation)_12%,transparent)]"
 >
 <Icon name="headset" size={16} strokeWidth={1.75} />
 مشاوره زیرساخت
 </Button>
 ) : (
 <SidebarTooltip label="مشاوره زیرساخت" enabled tooltipClassName="text-[var(--consultation)]">
 <IconRailButton tone="consultation" onClick={() => setConsultOpen(true)} aria-label="مشاوره زیرساخت">
 <Icon name="headset" size={18} strokeWidth={1.75} />
 </IconRailButton>
 </SidebarTooltip>
 )}
 </div>

 <div className="h-10 shrink-0">
 <SidebarTooltip label={theme === "dark" ? "حالت روز" : "حالت شب"} enabled={!expanded} tooltipClassName="text-[var(--warning)]">
 <ThemeToggleButton theme={theme} expanded={expanded} onClick={onToggleTheme} />
 </SidebarTooltip>
 </div>

 <div className="border-t-[length:var(--border-size)] border-[var(--border-color)]" />
 </header>

      <nav className="flex-1 overflow-y-auto px-2 py-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex flex-col gap-[2px]">
          {navItems.map((item) => {
            const Icon = item.icon as any;
            const active = isActive(pathname, item.href);
            const iconClass = active ? item.iconActiveClassName || "text-[var(--home)]" : item.iconClassName || "paragraph-color";
            const hoverClass = item.iconHoverClassName || item.iconActiveClassName || "group-hover:text-[var(--home)]";

            if (item.children && item.children.length > 0) {
              return (
                <div key={item.href} className="flex flex-col">
                  <SidebarTooltip label={item.title} enabled={!expanded} tooltipClassName={getTooltipColorClass(item, active)}>
                    <div className="flex items-center">
                      <Link
                        href={item.href}
                        onClick={onLinkClick}
                        className={`${linkBase} flex-1 paragraph-font-size ${active ? `bg-[var(--muted-background)] font-bold ${item.iconActiveClassName || ""}` : `${linkInactive} ${item.iconHoverClassName || ""}`}`}
                      >
                        {active && <span className="absolute bottom-[8px] right-0 top-[8px] w-[3px] rounded-full bg-[var(--tools)]" />}
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center">
                          <Icon size={19} className={`${iconClass} ${hoverClass} transition-colors duration-[200ms]`} strokeWidth={1.75} />
                        </span>
                        <span className={`truncate transition-all ${expanded ? "w-[130px] opacity-100" : "w-0 opacity-0"}`}>{item.title}</span>
                      </Link>
                      {expanded && (
                        <button
                          type="button"
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setToolsExpanded((o) => !o); }}
                          className="flex h-9 w-9 items-center justify-center rounded-[var(--corner-radius)] paragraph-color hover:bg-[var(--muted-background)] hover:text-[var(--primary-text)] cursor-pointer shrink-0"
                          aria-label="زیرمنو ابزارها"
                        >
                          <span className={`transition-transform duration-200 ${toolsExpanded ? "rotate-90" : "-rotate-90 rtl:rotate-90"}`}>▼</span>
                        </button>
                      )}
                    </div>
                  </SidebarTooltip>

                  {expanded && toolsExpanded && (
                    <div className="flex flex-col gap-0.5 pr-8 pl-2 pt-1 pb-2 border-r border-[var(--border-color)] mr-5 mt-1">
                      {item.children.map((child) => {
                        const ChildIcon = child.icon as any;
                        const childActive = isActive(pathname, child.href);
                        return (
                          <Link
                            key={child.href}
                            href={child.href}
                            onClick={onLinkClick}
                            className={`flex items-center gap-2.5 py-2 px-3 rounded-[var(--corner-radius)] text-xs transition-colors ${childActive ? "bg-[var(--muted-background)] font-bold text-[var(--tools)]" : "paragraph-color hover:bg-[var(--muted-background)]/50 hover:text-[var(--primary-text)]"}`}
                          >
                            <ChildIcon size={16} className={child.iconClassName || "paragraph-color"} />
                            <span className="truncate">{child.title}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <SidebarTooltip key={item.href} label={item.title} enabled={!expanded} tooltipClassName={getTooltipColorClass(item, active)}>
                <Link
                  href={item.href}
                  onClick={onLinkClick}
                  className={`${linkBase} paragraph-font-size ${active ? `bg-[var(--muted-background)] font-bold ${item.iconActiveClassName || ""}` : `${linkInactive} ${item.iconHoverClassName || ""}`}`}
                >
                  {active && <span className="absolute bottom-[8px] right-0 top-[8px] w-[3px] rounded-full bg-[var(--home)]" />}
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center">
                    <Icon size={19} className={`${iconClass} ${hoverClass} transition-colors duration-[200ms]`} strokeWidth={1.75} />
                  </span>
                  <span className={`truncate transition-all ${expanded ? "w-[160px] opacity-100" : "w-0 opacity-0"}`}>{item.title}</span>
                </Link>
              </SidebarTooltip>
            );
          })}
 {(user?.role === "super_admin" || (user?.role as string) === "admin") && (() => {
 const active = isActive(pathname, "/admin");
 return (
 <SidebarTooltip key="/admin" label="مدیریت" enabled={!expanded} tooltipClassName="text-[var(--vip)]">
 <Link
 href="/admin"
 onClick={onLinkClick}
 className={`${linkBase} text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] ${active ? "bg-[var(--muted-background)] text-[var(--primary-text)]" : linkInactive}`}
 >
 {active && <span className="absolute bottom-[8px] right-0 top-[8px] w-[3px] rounded-full bg-[var(--vip)]" />}
 <span className="flex h-10 w-10 shrink-0 items-center justify-center">
 <Icon name="shield" size={19} className="text-[var(--vip)]" strokeWidth={1.75} />
 </span>
 <span className={`truncate transition-all ${expanded ? "w-[160px] opacity-100" : "w-0 opacity-0"}`}>مدیریت</span>
 </Link>
 </SidebarTooltip>
 );
 })()}

 </div>
 </nav>

 <div className="shrink-0 space-y-2 border-t-[length:var(--border-size)] border-[var(--border-color)] px-2 py-2">
 {user ? (
 <Link href="/account" onClick={onLinkClick} className={`${linkBase} text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] ${isActive(pathname, "/account") ? "bg-[var(--muted-background)] text-[var(--primary-text)]" : linkInactive}`}>
 <span className="flex h-10 w-10 shrink-0 items-center justify-center">
 {user.avatar && user.avatar !== "/assets/hooman.png" ? (
   <Image src={user.avatar} alt={user.name || "کاربر"} width={28} height={28} className="rounded-full object-cover ring-1 ring-[var(--border-color)]" />
 ) : (
   <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--muted-background)] paragraph-color"><Icon name="user" size={15} /></span>
 )}
 </span>
 <span className={`truncate ${expanded ? "w-[140px] opacity-100" : "w-0 opacity-0"} overflow-hidden transition-all`}>
 <span className="block text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] font-bold">{user.name || user.username}</span>
 <span className="block text-xs paragraph-color">{user.roleFa || (user.role === "super_admin" ? "مدیر کل" : "کاربر تکباکس")}</span>
 </span>
 </Link>
 ) : (
 <SidebarTooltip label="ورود / حساب کاربری" enabled={!expanded} tooltipClassName="text-[var(--account)]">
 <Button variant="link" size="md" onClick={() => window.dispatchEvent(new CustomEvent("tb_open_auth"))} className={`${linkBase} ${linkInactive} w-full justify-start p-0 text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] no-underline hover:no-underline`}>
 <span className="flex h-10 w-10 items-center justify-center">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--muted-background)]"><Icon name="user" size={15} /></span>
 </span>
 <span className={`${expanded ? "w-[120px] opacity-100" : "w-0 opacity-0"} truncate transition-all font-bold`}>ورود / عضویت</span>
 </Button>
 </SidebarTooltip>
 )}
 </div>

 <ConsultationModal open={consultOpen} onClose={() => setConsultOpen(false)} />

 {notificationPanel}
 </div>
 );
}
