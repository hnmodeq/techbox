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
 const [mounted, setMounted] = React.useState(false);
 React.useEffect(() => setMounted(true), []);
 const currentTheme = mounted ? theme : "dark";
 const label = currentTheme === "dark" ? labelDark : labelLight;
 return (
 <button
 ref={ref}
 type="button"
 className={cn(
 "group flex h-10 w-full items-center rounded-[var(--corner-radius)] text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] paragraph-color",
 "transition-colors duration-[200ms] hover:bg-[var(--muted-background)] hover:text-[var(--primary-text)]",
 className
 )}
 aria-label={label}
 {...props}
 >
 <span className="relative flex h-10 w-10 shrink-0 items-center justify-center">
 <Sun className={cn(
 "absolute h-[18px] w-[18px] transition-all duration-[200ms]",
 currentTheme === "dark" ? "scale-100 text-[var(--warning)] opacity-100" : "scale-0 opacity-0"
 )} />
 <Moon className={cn(
 "absolute h-[18px] w-[18px] transition-all duration-[200ms]",
 currentTheme === "dark" ? "scale-0 opacity-0" : "scale-100 opacity-100"
 )} />
 </span>
 <span className={cn(
 "overflow-hidden whitespace-nowrap text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] transition-all duration-[200ms]",
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
