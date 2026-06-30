import * as React from "react";

export type ThemeMode = "light" | "dark";

export type SidebarMainProps = {
  onMobileOpenChange?: (open: boolean) => void;
};

export type NavItem = {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  iconClassName?: string;        // رنگ عادی آیکون
  iconHoverClassName?: string;   // رنگ hover آیکون
  iconActiveClassName?: string;  // رنگ active آیکون
  tooltipClassName?: string;     // رنگ tooltip در حالت بسته
};

export type SidebarContentProps = {
  expanded: boolean;
  theme: ThemeMode;
  onToggleTheme: () => void;
  onLogoClick?: () => void;
  onLinkClick?: () => void;
};

export type SidebarShellProps = {
  mobileOpen: boolean;
  desktopOpen: boolean;
  theme: ThemeMode;
  onToggleTheme: () => void;
  onToggleMobile: () => void;
  onCloseMobile: () => void;
  onToggleDesktop: () => void;
};
