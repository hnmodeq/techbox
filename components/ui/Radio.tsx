"use client";
import * as React from "react";
import { cn } from "@/lib/utils";
export const Radio = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
 ({className, ...props}, ref) => (
 <input ref={ref} type="radio"
 className={cn("w-[16px] h-[16px] accent-[var(--home)]", className)}
 {...props} />
 )
);
Radio.displayName="Radio";
export default Radio;
