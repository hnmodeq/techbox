// components/sidebar/sidebar.config.ts
import {
 House,
 BookOpen,
 Clapperboard,
 ShoppingBag,
 Users,
 ShieldCheck,
 Download,
 CircleUser,
 Calculator,
 Network,
} from "lucide-react";
import { NasIcon, NvrIcon, TimelineIcon } from "@/design/icons";
import { NavItem } from "@/types/sidebar.types";
import { moduleColors } from "@/config/module-colors";

export const DESKTOP_KEY = "takbox-sidebar-desktop-open";
export const MOBILE_KEY = "takbox-sidebar-mobile-open";
export const THEME_KEY = "takbox-theme";
export const ICON_STROKE = 1.75;

export const navItems: NavItem[] = [
 {
 title: "خانه",
 href: "/",
 icon: House,
 iconClassName: moduleColors.home.base,
 iconHoverClassName: moduleColors.home.hover,
 iconActiveClassName: moduleColors.home.active,
 },
 {
 title: "وبلاگ",
 href: "/blog",
 icon: BookOpen,
 iconClassName: moduleColors.blog.base,
 iconHoverClassName: moduleColors.blog.hover,
 iconActiveClassName: moduleColors.blog.active,
 },
 {
 title: "رسانه",
 href: "/media",
 icon: Clapperboard,
 iconClassName: moduleColors.media.base,
 iconHoverClassName: moduleColors.media.hover,
 iconActiveClassName: moduleColors.media.active,
 },
 {
 title: "فروشگاه",
 href: "/landing/storage/shop",
 icon: ShoppingBag,
 iconClassName: moduleColors.shop.base,
 iconHoverClassName: moduleColors.shop.hover,
 iconActiveClassName: moduleColors.shop.active,
 children: [
   { title: "ذخیره‌ساز", href: "/landing/storage/shop", icon: ShoppingBag, iconClassName: moduleColors.shop.base, iconHoverClassName: moduleColors.shop.hover, iconActiveClassName: moduleColors.shop.active },
 ],
 },
 {
 title: "ابزارهای زیرساخت",
 href: "/tools",
 icon: Calculator,
 iconClassName: moduleColors.tools.base,
 iconHoverClassName: moduleColors.tools.hover,
 iconActiveClassName: moduleColors.tools.active,
 tooltipClassName: "text-[var(--tools)]",
 children: [
   { title: "محاسبه فضای ذخیره‌ساز", href: "/tools/raid-calculator", icon: Calculator, iconClassName: moduleColors.raid.base, iconHoverClassName: moduleColors.raid.hover, iconActiveClassName: moduleColors.raid.active },
   { title: "انتخاب ذخیره‌ساز شبکه", href: "/tools/nas-selector", icon: NasIcon, iconClassName: moduleColors.nas.base, iconHoverClassName: moduleColors.nas.hover, iconActiveClassName: moduleColors.nas.active },
   { title: "انتخاب ذخیره‌ساز دوربین", href: "/tools/nvr-selector", icon: NvrIcon, iconClassName: moduleColors.nvr.base, iconHoverClassName: moduleColors.nvr.hover, iconActiveClassName: moduleColors.nvr.active },
   { title: "محاسبه زیرشبکه", href: "/tools/subnet-calculator", icon: Network, iconClassName: moduleColors.subnet.base, iconHoverClassName: moduleColors.subnet.hover, iconActiveClassName: moduleColors.subnet.active },
 ],
 },
 {
 title: "انجمن",
 href: "/forum",
 icon: Users,
 iconClassName: moduleColors.forum.base,
 iconHoverClassName: moduleColors.forum.hover,
 iconActiveClassName: moduleColors.forum.active,
 },
 {
 title: "نقد و بررسی",
 href: "/review",
 icon: ShieldCheck,
 iconClassName: moduleColors.review.base,
 iconHoverClassName: moduleColors.review.hover,
 iconActiveClassName: moduleColors.review.active,
 },
 {
 title: "تایم‌لاین فناوری",
 href: "/timeline",
 icon: TimelineIcon,
 iconClassName: moduleColors.timeline.base,
 iconHoverClassName: moduleColors.timeline.hover,
 iconActiveClassName: moduleColors.timeline.active,
 tooltipClassName: "text-[var(--primary)]",
 },
 {
 title: "دانلود",
 href: "/download",
 icon: Download,
 iconClassName: moduleColors.download.base,
 iconHoverClassName: moduleColors.download.hover,
 iconActiveClassName: moduleColors.download.active,
 },
];

export const accountItem: NavItem = {
 title: "حساب کاربری",
 href: "/account",
 icon: CircleUser,
 iconClassName: moduleColors.account.base,
 iconHoverClassName: moduleColors.account.hover,
 iconActiveClassName: moduleColors.account.active,
};

export const themeIconClass = {
 buttonBase:
 "inline-flex h-10 w-10 items-center rounded-[var(--corner-radius)] transition-all duration-[200ms]",
 buttonClassName: "text-[var(--paragraph-color)]",
 buttonHoverClassName: "hover:text-[var(--primary-text)]",
 sunIconClassName: "text-[var(--warning)]",
 sunIconHoverClassName: "group-hover:text-[var(--warning)]",
 sunIconActiveClassName: "text-[var(--primary-text)] group-hover:text-[var(--warning)]",
  moonIconClassName: "text-[var(--primary-text)]",
 moonIconHoverClassName: "group-hover:text-[var(--info)]",
 moonIconActiveClassName:
 "text-[var(--primary-text)] dark:text-[var(--primary-text)] group-hover:text-[var(--info)]",
};

export const sidebarBase = [
 "bg-[var(--sidebar-background)] text-[var(--primary-text)]",
 "shadow-[var(--shadow-size)] border-l-[length:var(--border-size)] border-[var(--border-color)]",
].join(" ");

export const linkBase =
 "group relative flex h-11 w-full items-center rounded-[var(--corner-radius)] text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] transition-all duration-[200ms]";

export const linkInactive = "text-[var(--paragraph-color)] hover:text-[var(--primary-text)]";

export const linkActive = "bg-[var(--muted-background)]/50 text-[var(--primary-text)]";

export function isActive(pathname: string, href: string) {
 return href === "/"
 ? pathname === "/"
 : pathname === href || pathname.startsWith(`${href}/`);
}
