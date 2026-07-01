"use client";
import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ThemeToggleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
 theme: "light" | "dark";
 expanded?: boolean;
 labelDark?: string;
 labelLight?: string;
}

export const ThemeToggleButton = React.forwardRef<HTMLButtonElement, ThemeToggleButtonProps>(
 ({ theme, expanded = true, className, labelDark = "حالت روز", labelLight = "حالت شب", ...props }, ref) => {
 const label = theme === "dark" ? labelDark : labelLight;
 return (
 <button
 ref={ref}
 type="button"
 className={cn(
 "group flex h-10 w-full items-center rounded-[var(--tb-radius-lg)] tb-text-sm text-[var(--tb-fg-muted)]",
 "transition-colors duration-[var(--tb-motion-md)] hover:bg-[var(--tb-bg-muted)] hover:text-[var(--tb-fg-primary)]",
 className
 )}
 aria-label={label}
 {...props}
 >
 <span className="relative flex h-10 w-10 shrink-0 items-center justify-center">
 <Sun className={cn(
 "absolute h-[18px] w-[18px] transition-all duration-[var(--tb-motion-md)]",
 theme === "dark" ? "scale-100 text-[var(--tb-warning)] opacity-100" : "scale-0 opacity-0"
 )} />
 <Moon className={cn(
 "absolute h-[18px] w-[18px] transition-all duration-[var(--tb-motion-md)]",
 theme === "dark" ? "scale-0 opacity-0" : "scale-100 opacity-100"
 )} />
 </span>
 <span className={cn(
 "overflow-hidden whitespace-nowrap tb-text-sm transition-all duration-[var(--tb-motion-md)]",
 expanded ? "w-[120px] opacity-100" : "w-0 opacity-0"
 )}>
 {label}
 </span>
 </button>
 );
 }
);
ThemeToggleButton.displayName = "ThemeToggleButton";

export default ThemeToggleButton;
