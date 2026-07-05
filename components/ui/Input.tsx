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
 "w-full bg-[var(--muted-background)] text-[var(--primary-text)]",
 "border border-[var(--border-color)]",
 "rounded-[var(--corner-radius)] px-[14px] py-[10px]",
 "text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] ",
 "transition-all duration-[var(--tb-motion-sm)] ease-[var(--tb-ease)]",
 "placeholder:paragraph-color/80",
 "focus:outline-none focus:border-[var(--tb-ring-1)] focus:shadow-[var(--tb-ring-3)]",
 "disabled:opacity-50 disabled:cursor-not-allowed",
 invalid && "border-[var(--tb-danger)] focus:border-[var(--tb-danger)] focus:shadow-[0_0_0_3px_color-mix(in_oklch,var(--tb-danger)_24%,transparent)]",
 className
 )}
 {...props}
 />
 )
);
Input.displayName = "Input";
