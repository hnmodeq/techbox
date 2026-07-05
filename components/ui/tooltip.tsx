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
 "absolute whitespace-nowrap text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] px-2 py-1 rounded-[var(--corner-radius)] shadow-[var(--shadow-size)] pointer-events-none",
 "bg-[var(--card-background)] text-[var(--primary-text)] border-[length:var(--border-size)] border-[var(--border-color)]",
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
