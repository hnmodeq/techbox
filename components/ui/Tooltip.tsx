"use client";
import * as React from "react";
import { cn } from "@/lib/utils";
import { zIndex } from "@/design";

export function Tooltip({ content, children, side="top" }:{
  content: React.ReactNode;
  children: React.ReactNode;
  side?: "top"|"bottom"|"left"|"right";
}){
  const [open,setOpen] = React.useState(false);
  return (
    <span className="relative inline-flex"
      onMouseEnter={()=>setOpen(true)}
      onMouseLeave={()=>setOpen(false)}
      onFocus={()=>setOpen(true)}
      onBlur={()=>setOpen(false)}
    >
      {children}
      {open && (
        <span role="tooltip"
          className={cn(
            "absolute whitespace-nowrap text-[11px] px-2 py-1 rounded-[var(--tb-radius-md)] shadow-[var(--tb-shadow-md)] pointer-events-none",
            "bg-[var(--popover)] text-[var(--popover-foreground)] border border-[var(--border)]",
            side==="top" && "bottom-full mb-2 left-1/2 -translate-x-1/2",
            side==="bottom" && "top-full mt-2 left-1/2 -translate-x-1/2",
            side==="left" && "right-full me-2 top-1/2 -translate-y-1/2",
            side==="right" && "left-full ms-2 top-1/2 -translate-y-1/2",
          )}
          style={{zIndex:zIndex.tooltip}}
        >{content}</span>
      )}
    </span>
  );
}
export default Tooltip;
