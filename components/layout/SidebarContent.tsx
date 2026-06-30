"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, Search, Clock, ShoppingCart, ShieldCheck } from "lucide-react";
import { createPortal } from "react-dom";
import { navItems, linkBase, linkInactive, isActive } from "@/config/sidebar.config";
import { SidebarContentProps, NavItem } from "@/types/sidebar.types";
import SidebarTooltip from "@/components/layout/SidebarTooltip";
import { useEffect, useMemo, useRef, useState } from "react";
import { getCurrentUserClient, type AppUser } from "@/lib/auth";
import { useCart } from "@/providers/cart.provider";
import { getAllAcross } from "@/lib/content";
import { zIndex } from "@/design";
import { Button, ButtonLink } from "@/components/ui/Button";
import { IconRailButton } from "@/components/ui/IconRailButton";
import { CloseButton } from "@/components/ui/CloseButton";
import { OverlayBackdrop } from "@/components/ui/Overlay";
import { Panel } from "@/components/ui/Panel";
import { ThemeToggleButton } from "@/components/ui/ThemeToggleButton";

type AnchorRect = { top: number; right: number };

function TehranDateTime({ now, expanded }: { now: Date | null; expanded: boolean }) {
  const label = now
    ? `${now.toLocaleDateString("fa-IR", { timeZone: "Asia/Tehran" })} – ${now.toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Tehran" })} تهران`
    : "ساعت تهران";

  return (
    <div className="h-[58px] shrink-0">
      {!expanded ? (
        <SidebarTooltip enabled label={label} tooltipClassName="text-[var(--tb-muted-foreground)]">
          <span className="icon-rail-btn" aria-label="ساعت تهران">
            <Clock size={18} />
          </span>
        </SidebarTooltip>
      ) : (
        <div className="rounded-[var(--tb-radius-lg)] border border-[var(--tb-border)] bg-[var(--tb-muted)] px-3 py-2 text-center shadow-[var(--tb-shadow-sm)]">
          <div className="text-[10px] text-[var(--tb-muted-foreground)]">
            {now?.toLocaleDateString("fa-IR", { weekday: "long", timeZone: "Asia/Tehran" }) || "تهران"}
          </div>
          <div className="text-[11px] font-bold tabular-nums" dir="ltr">
            {now?.toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit", second: "2-digit", timeZone: "Asia/Tehran" }) || "--:--:--"}
          </div>
          <div className="text-[10px] text-[var(--tb-muted-foreground)]">
            {now?.toLocaleDateString("fa-IR", { year: "numeric", month: "long", day: "numeric", timeZone: "Asia/Tehran" }) || "—"}
          </div>
        </div>
      )}
    </div>
  );
}

function getTooltipColorClass(item: NavItem, active: boolean) {
  return active
    ? item.iconActiveClassName || item.tooltipClassName || "text-[var(--tb-brand)]"
    : item.tooltipClassName || item.iconActiveClassName || "text-[var(--tb-muted-foreground)]";
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
  const [loginOpen, setLoginOpen] = useState(false);
  const { count: cartCount, setOpen: setCartOpen } = useCart();

  useEffect(() => {
    setMounted(true);
    setUser(getCurrentUserClient());
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const h = () => setUser(getCurrentUserClient());
    window.addEventListener("storage", h);
    return () => window.removeEventListener("storage", h);
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
          className="fixed w-[320px] max-w-[92vw] p-3 text-right card"
          style={{ zIndex: zIndex.notification, top: notifPos.top, right: notifPos.right }}
          dir="rtl"
        >
          <div className="mb-2 text-[12px] font-bold">آخرین رویدادها</div>
          <ul className="max-h-80 space-y-2 overflow-y-auto text-[11px]">
            {notifications.map((n: any) => (
              <li key={`${n.module}-${n.slug}`} className="border-b border-[color-mix(in_oklch,var(--tb-border)_40%,transparent)] pb-2 last:border-0">
                <Link href={`/${n.module}/${n.slug}`} onClick={() => setNotifOpen(false)} className="line-clamp-2 leading-5 hover:text-[var(--tb-brand)]">
                  {n.title}
                </Link>
                <div className="mt-0.5 text-[10px] text-[var(--tb-muted-foreground)]">{n.date_fa} • {n.module}</div>
              </li>
            ))}
          </ul>
          <Button variant="ghost" size="xs" onClick={() => setNotifOpen(false)} className="mt-2 w-full text-[10px]">بستن</Button>
        </div>,
        document.body
      )
    : null;

  return (
    <div className="relative flex h-full w-full flex-col text-[13px]" dir="rtl">
      <header className="shrink-0 space-y-3 p-3">
        <div className="flex h-10 items-center gap-2">
          <div className="relative h-10 w-10 shrink-0">
            {onLogoClick ? (
              <SidebarTooltip label="باز/بستن منو" enabled={!expanded} tooltipClassName="text-[var(--tb-brand)]">
                <Button onClick={onLogoClick} variant="link" size="icon" className="relative h-10 w-10 overflow-hidden rounded-[var(--tb-radius-lg)] p-0 transition-opacity hover:opacity-90" aria-label="toggle sidebar">
                  <Image src="/logo.png" alt="تکباکس" fill sizes="40px" className="object-contain" />
                </Button>
              </SidebarTooltip>
            ) : (
              <Image src="/logo.png" alt="تکباکس" fill sizes="40px" className="object-contain" />
            )}
          </div>

          <div className={`overflow-hidden transition-all duration-[var(--tb-duration-normal)] ${expanded ? "w-[170px] opacity-100" : "w-0 opacity-0"}`}>
            <div className="text-[14px] font-black leading-tight text-[var(--tb-foreground)]">تکباکس</div>
            <div className="text-[10px] leading-tight text-[var(--tb-muted-foreground)]">پاتوق بچه‌های فناوری اطلاعات</div>
          </div>

          <div className="ms-auto flex h-10 items-center gap-1">
            <SidebarTooltip label="اعلان‌ها" enabled={!expanded} tooltipClassName="text-[var(--tb-news)]">
              <IconRailButton ref={notifButtonRef} tone="news" onClick={() => setNotifOpen((o) => !o)} aria-label="notifications">
                <Bell size={18} />
                <span className="absolute left-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-[var(--tb-danger)]" />
              </IconRailButton>
            </SidebarTooltip>

            <SidebarTooltip label={cartCount > 0 ? `سبد خرید – ${cartCount} قلم` : "سبد خرید"} enabled={!expanded} tooltipClassName="text-[var(--tb-shop)]">
              <IconRailButton tone="shop" onClick={() => setCartOpen(true)} aria-label="سبد خرید">
                <ShoppingCart size={18} />
                {cartCount > 0 && (
                  <span className="absolute -left-0.5 -top-0.5 flex h-[16px] min-w-[16px] items-center justify-center rounded-full bg-[var(--tb-shop)] px-1 text-[9px] font-bold text-black">
                    {cartCount > 99 ? "۹۹+" : cartCount.toLocaleString("fa-IR")}
                  </span>
                )}
              </IconRailButton>
            </SidebarTooltip>
          </div>
        </div>

        <TehranDateTime now={now} expanded={expanded} />

        <div className="h-10 shrink-0">
          {expanded ? (
            <form onSubmit={doSearch} className="relative h-10">
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="جستجو در تکباکس…" className="input h-10 !py-2 pe-8 text-xs" />
              <Button type="submit" variant="link" size="iconSm" className="absolute left-1.5 top-1/2 -translate-y-1/2 text-[var(--tb-muted-foreground)] hover:text-[var(--tb-foreground)]" aria-label="search">
                <Search size={14} />
              </Button>
            </form>
          ) : (
            <SidebarTooltip label="جستجو" enabled tooltipClassName="text-[var(--tb-brand)]">
              <IconRailButton tone="brand" onClick={() => { const v = prompt("جستجو:"); if (v) router.push(`/search?q=${encodeURIComponent(v)}`); }} aria-label="جستجو">
                <Search size={18} />
              </IconRailButton>
            </SidebarTooltip>
          )}
        </div>

        <div className="h-10 shrink-0">
          {expanded ? (
            <Link href="/consultation" onClick={onLinkClick} className="vip-cta flex h-10 w-full items-center justify-center text-center text-[12px] font-black">
              مشاوره VIP ⚡
            </Link>
          ) : (
            <SidebarTooltip label="مشاوره VIP" enabled tooltipClassName="text-[var(--tb-vip)]">
              <Link href="/consultation" onClick={onLinkClick} className="icon-rail-btn text-[var(--tb-vip)] hover:text-[var(--tb-vip)]">
                <span className="text-[16px]">⚡</span>
              </Link>
            </SidebarTooltip>
          )}
        </div>

        <div className="h-10 shrink-0">
          <SidebarTooltip label={theme === "dark" ? "حالت روز" : "حالت شب"} enabled={!expanded} tooltipClassName="text-[var(--tb-warning)]">
            <ThemeToggleButton theme={theme} expanded={expanded} onClick={onToggleTheme} />
          </SidebarTooltip>
        </div>

        <div className="border-t border-[var(--tb-border)]" />
      </header>

      <nav className="flex-1 overflow-y-auto px-2 py-1">
        <div className="flex flex-col gap-[2px]">
          {navItems.map((item) => {
            const Icon = item.icon as any;
            const active = isActive(pathname, item.href);
            const iconClass = active ? item.iconActiveClassName || "text-primary" : item.iconClassName || "text-[var(--tb-muted-foreground)]";
            const hoverClass = item.iconHoverClassName || item.iconActiveClassName || "group-hover:text-[var(--tb-brand)]";
            return (
              <SidebarTooltip key={item.href} label={item.title} enabled={!expanded} tooltipClassName={getTooltipColorClass(item, active)}>
                <Link
                  href={item.href}
                  onClick={onLinkClick}
                  className={`${linkBase} text-[13px] ${active ? "bg-[var(--tb-muted)] text-[var(--tb-foreground)]" : linkInactive}`}
                >
                  {active && <span className="absolute bottom-[8px] right-0 top-[8px] w-[3px] rounded-full bg-[var(--tb-brand)]" />}
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center">
                    <Icon size={19} className={`${iconClass} ${hoverClass}`} strokeWidth={1.75} />
                  </span>
                  <span className={`truncate transition-all ${expanded ? "w-[160px] opacity-100" : "w-0 opacity-0"}`}>{item.title}</span>
                </Link>
              </SidebarTooltip>
            );
          })}
          {(user?.role === "super_admin" || (user?.role as string) === "admin") && (() => {
            const active = isActive(pathname, "/admin");
            return (
              <SidebarTooltip key="/admin" label="مدیریت" enabled={!expanded} tooltipClassName="text-[var(--tb-vip)]">
                <Link
                  href="/admin"
                  onClick={onLinkClick}
                  className={`${linkBase} text-[13px] ${active ? "bg-[var(--tb-muted)] text-[var(--tb-foreground)]" : linkInactive}`}
                >
                  {active && <span className="absolute bottom-[8px] right-0 top-[8px] w-[3px] rounded-full bg-[var(--tb-vip)]" />}
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center">
                    <ShieldCheck size={19} className="text-[var(--tb-vip)]" strokeWidth={1.75} />
                  </span>
                  <span className={`truncate transition-all ${expanded ? "w-[160px] opacity-100" : "w-0 opacity-0"}`}>مدیریت</span>
                </Link>
              </SidebarTooltip>
            );
          })()}

        </div>
      </nav>

      <div className="shrink-0 space-y-2 border-t border-[var(--tb-border)] px-2 py-2">
        {user ? (
          <Link href="/account" onClick={onLinkClick} className={`${linkBase} text-[12px] ${isActive(pathname, "/account") ? "bg-[var(--tb-muted)] text-[var(--tb-foreground)]" : linkInactive}`}>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center">
              <Image src={user.avatar || "/assets/hooman.png"} alt={user.name} width={28} height={28} className="rounded-full object-cover ring-1 ring-[var(--tb-border)]" />
            </span>
            <span className={`truncate leading-tight ${expanded ? "w-[140px] opacity-100" : "w-0 opacity-0"} overflow-hidden transition-all`}>
              <span className="block text-[12px] font-bold">{user.name}</span>
              <span className="block text-[10px] text-[var(--tb-muted-foreground)]">{user.role === "super_admin" ? "مدیر کل" : "ویراستار"}</span>
            </span>
          </Link>
        ) : (
          <SidebarTooltip label="ورود / حساب کاربری" enabled={!expanded} tooltipClassName="text-[var(--tb-account)]">
            <Button variant="link" size="md" onClick={() => setLoginOpen(true)} className={`${linkBase} ${linkInactive} w-full justify-start p-0 text-[12px] no-underline hover:no-underline`}>
              <span className="flex h-10 w-10 items-center justify-center">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--tb-muted)] text-[11px]">👤</span>
              </span>
              <span className={`${expanded ? "w-[120px] opacity-100" : "w-0 opacity-0"} truncate transition-all`}>ورود</span>
            </Button>
          </SidebarTooltip>
        )}
      </div>

      {loginOpen && (
        <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: zIndex.modal }} dir="rtl">
          <OverlayBackdrop onClick={() => setLoginOpen(false)} />
          <Panel className="relative w-full max-w-sm space-y-3" style={{ zIndex: zIndex.modalContent }}>
            <div className="flex items-center justify-between">
              <h3 className="text-[15px] font-black">ورود به تکباکس</h3>
              <CloseButton onClick={() => setLoginOpen(false)} />
            </div>
            <p className="text-[11px] text-[var(--tb-muted-foreground)]">
              حساب تست: <b>sara</b> / <b>nima</b> / <b>rojina</b> / <b>admin</b><br />رمز همه: <code>techbox123</code>
            </p>
            <ButtonLink href="/admin/login" onClick={() => setLoginOpen(false)} className="w-full text-[13px]">رفتن به ورود کامل →</ButtonLink>
            <Button variant="ghost" size="xs" onClick={() => setLoginOpen(false)} className="w-full text-[11px]">بستن</Button>
          </Panel>
        </div>
      )}

      {notificationPanel}
    </div>
  );
}
