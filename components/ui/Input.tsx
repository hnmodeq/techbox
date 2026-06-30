"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, invalid, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "w-full bg-[var(--tb-muted)] text-[var(--tb-foreground)]",
        "border border-[var(--tb-border)]",
        "rounded-[var(--tb-radius-md)] px-[14px] py-[10px]",
        "text-[13px] leading-5",
        "transition-all duration-[var(--tb-duration-fast)] ease-[var(--tb-ease-standard)]",
        "placeholder:text-[var(--tb-muted-foreground)]/80",
        "focus:outline-none focus:border-[var(--tb-ring)] focus:shadow-[var(--tb-focus-ring)]",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        invalid && "border-[var(--tb-danger)] focus:border-[var(--tb-danger)] focus:shadow-[0_0_0_3px_color-mix(in_oklch,var(--tb-danger)_24%,transparent)]",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";
