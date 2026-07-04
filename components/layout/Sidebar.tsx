"use client";

import * as React from "react";
import { SidebarMainProps } from "@/types/sidebar.types";
import { desktopStore } from "@/stores/sidebar.store";
import { themeStore } from "@/stores/theme.store";
import SidebarShell from "@/components/layout/SidebarShell";

export default function SidebarMain({ onMobileOpenChange }: SidebarMainProps) {
  const [mounted, setMounted] = React.useState(false);
  const [desktopOpen, setDesktopOpen] = React.useState(true);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [theme, setTheme] = React.useState<"light" | "dark">("dark");

  React.useEffect(() => {
    setMounted(true);
    setDesktopOpen(desktopStore.getSnapshot());
    setTheme(themeStore.getClientSnapshot());

    const u1 = desktopStore.subscribe(() => setDesktopOpen(desktopStore.getSnapshot()));
    const u3 = themeStore.subscribe(() => setTheme(themeStore.getClientSnapshot()));
    return () => { u1(); u3(); };
  }, []);

  React.useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  React.useEffect(() => {
    onMobileOpenChange?.(mobileOpen);
  }, [mobileOpen, onMobileOpenChange]);

  // Lock body scroll only when mobile sidebar is actively open on a mobile device
  React.useEffect(() => {
    if (!mobileOpen || typeof window === "undefined" || window.innerWidth >= 640) return;
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
    setMobileOpen((prev) => !prev);
  }, []);

  const onCloseMobile = React.useCallback(() => {
    setMobileOpen(false);
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
