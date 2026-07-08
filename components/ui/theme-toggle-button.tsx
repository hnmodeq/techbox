"use client";
import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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
    const isDark = currentTheme === "dark";

    return (
      <button
        ref={ref}
        type="button"
        className={cn(
          "group flex h-10 w-full items-center rounded-[var(--corner-radius)] text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] paragraph-color",
          "transition-all duration-300 hover:bg-[var(--muted-background)] hover:text-[var(--primary-text)]",
          className
        )}
        aria-label={label}
        {...props}
      >
        <span className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden">
          <AnimatePresence mode="wait">
            {isDark ? (
              <motion.div
                key="sun"
                initial={{ rotate: -90, scale: 0.6, opacity: 0 }}
                animate={{ rotate: 0, scale: 1, opacity: 1 }}
                exit={{ rotate: 90, scale: 0.6, opacity: 0 }}
                transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
              >
                <Sun className="h-[18px] w-[18px] text-[var(--warning)]" />
              </motion.div>
            ) : (
              <motion.div
                key="moon"
                initial={{ rotate: 90, scale: 0.6, opacity: 0 }}
                animate={{ rotate: 0, scale: 1, opacity: 1 }}
                exit={{ rotate: -90, scale: 0.6, opacity: 0 }}
                transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
              >
                <Moon className="h-[18px] w-[18px] text-[var(--primary-text)]" />
              </motion.div>
            )}
          </AnimatePresence>
        </span>

        <span
          className={cn(
            "overflow-hidden whitespace-nowrap text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] transition-all duration-300",
            expanded ? "w-[120px] opacity-100" : "w-0 opacity-0"
          )}
        >
          {label}
        </span>
      </button>
    );
  }
);
ThemeToggleButton.displayName = "ThemeToggleButton";

export default ThemeToggleButton;
