"use client";
import * as React from "react";
import { cn } from "@/lib/utils";
export const Checkbox = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
 ({className, ...props}, ref) => (
 <input ref={ref} type="checkbox"
 className={cn("w-[16px] h-[16px] rounded-[4px] accent-[var(--tb-primary)]", "bg-[var(--tb-bg-muted)] border border-[var(--tb-border)]", className)}
 {...props} />
 )
);
Checkbox.displayName="Checkbox";
export default Checkbox;
