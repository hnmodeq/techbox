"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

export function Switch({ checked, onCheckedChange, disabled, className }:{
 checked?: boolean;
 onCheckedChange?: (v:boolean)=>void;
 disabled?: boolean;
 className?: string;
}){
 return (
 <button
 type="button"
 role="switch"
 aria-checked={checked}
 disabled={disabled}
 onClick={()=>onCheckedChange?.(!checked)}
 className={cn(
 "relative inline-flex h-5 w-9 shrink-0 rounded-full border transition-colors",
 "duration-[150ms]",
 checked ? "bg-[var(--home)] border-[var(--home)]" : "bg-[var(--muted-background)] border-[var(--border-color)]",
 "disabled:opacity-50",
 className
 )}
 >
 <span className={cn(
 "pointer-events-none block h-4 w-4 rounded-full bg-white shadow transition-transform duration-[150ms] mt-[1px]",
 checked ? "translate-x-[18px] rtl:-translate-x-[18px]" : "translate-x-[2px] rtl:-translate-x-[2px]"
 )} />
 </button>
 );
}
export default Switch;
