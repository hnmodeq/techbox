// components/sidebar/sidebar.config.ts
import {
 House,
 BookOpen,
 Newspaper,
 Clapperboard,
 ShoppingBag,
 Users,
 ShieldCheck,
 Download,
 CircleUser,
 Calculator,
 Network,
} from "lucide-react";
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
 title: "اخبار",
 href: "/news",
 icon: Newspaper,
 iconClassName: moduleColors.news.base,
 iconHoverClassName: moduleColors.news.hover,
 iconActiveClassName: moduleColors.news.active,
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
 href: "/shop",
 icon: ShoppingBag,
 iconClassName: moduleColors.shop.base,
 iconHoverClassName: moduleColors.shop.hover,
 iconActiveClassName: moduleColors.shop.active,
 },
 {
 title: "RAID Calculator",
 href: "/tools/raid-calculator",
 icon: Calculator,
 iconClassName: moduleColors.raid.base,
 iconHoverClassName: moduleColors.raid.hover,
 iconActiveClassName: moduleColors.raid.active,
 },
 {
 title: "Subnet Calculator",
 href: "/tools/subnet-calculator",
 icon: Network,
 iconClassName: moduleColors.subnet.base,
 iconHoverClassName: moduleColors.subnet.hover,
 iconActiveClassName: moduleColors.subnet.active,
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
 "inline-flex h-10 w-10 items-center rounded-[var(--tb-radius-lg)] transition-all duration-[var(--tb-motion-md)]",
 buttonClassName: "text-[var(--tb-fg-muted)]",
 buttonHoverClassName: "hover:text-[var(--tb-fg-primary)]",
 sunIconClassName: "text-[var(--tb-warning)]",
 sunIconHoverClassName: "group-hover:text-[var(--tb-warning)]",
 sunIconActiveClassName: "text-[var(--tb-fg-primary)] group-hover:text-[var(--tb-warning)]",
 moonIconClassName: "text-zinc-200 dark:text-zinc-100",
 moonIconHoverClassName: "group-hover:text-[var(--tb-info)]",
 moonIconActiveClassName:
 "text-[var(--tb-fg-primary)] dark:text-[var(--tb-fg-primary)] group-hover:text-[var(--tb-info)]",
};

export const sidebarBase = [
 "bg-[var(--tb-bg-primary)] text-[var(--tb-fg-primary)]",
 "shadow-[var(--tb-shadow-lg)]",
].join(" ");

export const linkBase =
 "group relative flex h-11 w-full items-center rounded-[var(--tb-radius-lg)] tb-text-md transition-all duration-[var(--tb-motion-md)]";

export const linkInactive = "text-[var(--tb-fg-muted)] hover:text-[var(--tb-fg-primary)]";

export const linkActive = "bg-[var(--tb-bg-muted)]/50 text-[var(--tb-fg-primary)]";

export function isActive(pathname: string, href: string) {
 return href === "/"
 ? pathname === "/"
 : pathname === href || pathname.startsWith(`${href}/`);
}
