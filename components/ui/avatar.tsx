"use client";
import Image from "next/image";
import * as React from "react";
import { cn } from "@/lib/utils";
export function Avatar({ src, alt, size=40, className, ...p }: { src?: string; alt?: string; size?: number } & React.HTMLAttributes<HTMLSpanElement>){
 return (
 <span className={cn("relative inline-block shrink-0 overflow-hidden bg-[var(--muted-background)]", className)} style={{width:size, height:size, borderRadius:"var(--corner-radius)", ...p.style}} {...p}>
 {src ? <Image src={src} alt={alt||""} width={size} height={size} className="h-full w-full object-cover" /> :
 <span className="flex h-full w-full items-center justify-center text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] paragraph-color">{(alt||"?").slice(0,2).toUpperCase()}</span>}
 </span>
 );
}
export default Avatar;
