"use client";
import * as React from "react";
import { cn } from "@/lib/utils";
export const Checkbox = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
 ({className, ...props}, ref) => (
 <input ref={ref} type="checkbox"
      className={cn("w-[16px] h-[16px] rounded-[var(--corner-radius)] accent-[var(--home)]", "bg-[var(--muted-background)] border-[length:var(--border-size)] border-[var(--border-color)]", className)}
 {...props} />
 )
);
Checkbox.displayName="Checkbox";
export default Checkbox;
