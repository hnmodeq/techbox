"use client";

import * as React from "react";
import { SidebarMainProps } from "@/types/sidebar.types";
import { desktopStore, mobileStore } from "@/stores/sidebar.store";
import { themeStore } from "@/stores/theme.store";
import SidebarShell from "@/components/layout/SidebarShell";

export default function SidebarMain({ onMobileOpenChange }: SidebarMainProps) {
 const desktopOpen = React.useSyncExternalStore(
 desktopStore.subscribe,
 desktopStore.getSnapshot,
 () => true
 );

 const mobileOpen = React.useSyncExternalStore(
 mobileStore.subscribe,
 mobileStore.getSnapshot,
 () => false
 );

 const theme = React.useSyncExternalStore(
 themeStore.subscribe,
 themeStore.getClientSnapshot,
 themeStore.getServerSnapshot
 );

 React.useEffect(() => {
 document.documentElement.classList.toggle("dark", theme === "dark");
 }, [theme]);

 React.useEffect(() => {
 onMobileOpenChange?.(mobileOpen);
 }, [mobileOpen, onMobileOpenChange]);

 // اگر روی دسکتاپ بودیم و mobileOpen از قبل true مانده بود، ریستش کن
 React.useEffect(() => {
 const isDesktop = window.matchMedia("(min-width: 640px)").matches;
 if (isDesktop && mobileOpen) {
 mobileStore.set(false);
 }
 }, [mobileOpen]);

 // قفل اسکرول فقط وقتی منوی موبایل باز است و واقعاً روی موبایل هستیم
 React.useEffect(() => {
 const isMobile = window.matchMedia("(max-width: 639px)").matches;
 if (!mobileOpen || !isMobile) return;
 const prevBodyOverflow = document.body.style.overflow;
 const prevHtmlOverflow = document.documentElement.style.overflow;
 document.body.style.overflow = "hidden";
 document.documentElement.style.overflow = "hidden";
 return () => {
 document.body.style.overflow = prevBodyOverflow;
 document.documentElement.style.overflow = prevHtmlOverflow;
 };
 }, [mobileOpen]);

 const onToggleDesktop = React.useCallback(() => {
 desktopStore.set(!desktopOpen);
 }, [desktopOpen]);

 const onToggleMobile = React.useCallback(() => {
 mobileStore.set(!mobileOpen);
 }, [mobileOpen]);

 const onCloseMobile = React.useCallback(() => {
 mobileStore.set(false);
 }, []);

 const onToggleTheme = React.useCallback(() => {
 themeStore.toggle();
 }, []);

 return (
 <SidebarShell
 mobileOpen={mobileOpen}
 desktopOpen={desktopOpen}
 theme={theme}
 onToggleTheme={onToggleTheme}
 onToggleMobile={onToggleMobile}
 onCloseMobile={onCloseMobile}
 onToggleDesktop={onToggleDesktop}
 />
 );
}
