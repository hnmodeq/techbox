"use client";

import * as React from "react";
import { SidebarMainProps } from "@/types/sidebar.types";
import { desktopStore } from "@/stores/sidebar.store";
import SidebarShell from "@/components/layout/SidebarShell";
import { useTheme } from "next-themes";

export default function SidebarMain({ onMobileOpenChange }: SidebarMainProps) {
  const [mounted, setMounted] = React.useState(false);
  const [desktopOpen, setDesktopOpen] = React.useState(true);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const { theme, resolvedTheme, setTheme: setNextTheme } = useTheme();
  const skipInitialDatasetSyncRef = React.useRef(true);

  const activeTheme = resolvedTheme ?? theme;
  const currentTheme = activeTheme === "dark" ? "dark" : "light";

  React.useEffect(() => {
    setMounted(true);
    const savedDesktopOpen = desktopStore.getSnapshot();
    document.documentElement.dataset.mainSidebarOpen = String(savedDesktopOpen);
    setDesktopOpen(savedDesktopOpen);

    requestAnimationFrame(() => {
      document.documentElement.classList.remove("main-sidebar-booting");
    });

    const u1 = desktopStore.subscribe(() => setDesktopOpen(desktopStore.getSnapshot()));
    return () => { u1(); };
  }, []);

  React.useEffect(() => {
    if (typeof document === "undefined") return;
    if (skipInitialDatasetSyncRef.current) {
      skipInitialDatasetSyncRef.current = false;
      return;
    }
    document.documentElement.dataset.mainSidebarOpen = String(desktopOpen);
  }, [desktopOpen]);

  const toggleTheme = React.useCallback(() => {
    setNextTheme(currentTheme === "dark" ? "light" : "dark");
  }, [currentTheme, setNextTheme]);

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

  return (
    <SidebarShell
      mobileOpen={mobileOpen}
      desktopOpen={desktopOpen}
      theme={currentTheme}
      onToggleTheme={toggleTheme}
      onToggleMobile={onToggleMobile}
      onCloseMobile={onCloseMobile}
      onToggleDesktop={onToggleDesktop}
    />
  );
}
