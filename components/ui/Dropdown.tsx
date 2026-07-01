"use client";
import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import { zIndex } from "@/design";

interface DropdownItem { label: string; value: string; href?: string; onSelect?: ()=>void; }
export function Dropdown({ trigger, items, align="end" }: { 
 trigger: React.ReactNode; 
 items: DropdownItem[];
 align?: "start" | "end";
}) {
 const [open,setOpen] = React.useState(false);
 const ref = React.useRef<HTMLDivElement>(null);
 React.useEffect(()=>{
 const h=(e:MouseEvent)=>{ if(ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
 document.addEventListener("mousedown",h); return ()=>document.removeEventListener("mousedown",h);
 },[]);
 return (
 <div className="relative" ref={ref} dir="rtl">
 <div onClick={()=>setOpen(o=>!o)} className="cursor-pointer">{trigger}</div>
 {open && (
 <div className={`absolute top-full mt-2 min-w-[180px] card p-1 ${align==="end" ? "left-0" : "right-0"}`} style={{zIndex:zIndex.dropdown}}>
 {items.map(it=>(
 <button key={it.value}
 onClick={()=>{ it.onSelect?.(); setOpen(false); if(it.href) window.location.href=it.href; }}
 className="w-full text-right px-3 py-2 tb-text-sm rounded-[var(--tb-radius-md)] hover:bg-[var(--tb-bg-muted)] transition-colors"
 >{it.label}</button>
 ))}
 </div>
 )}
 </div>
 );
}

export function Select({ value, onValueChange, options, placeholder="انتخاب…" }:{
 value?:string; onValueChange?:(v:string)=>void;
 options:{label:string; value:string}[];
 placeholder?:string;
}) {
 return (
 <div className="relative">
 <select
 value={value}
 onChange={e=>onValueChange?.(e.target.value)}
 className="input appearance-none pe-8 tb-text-sm cursor-pointer"
 style={{
 backgroundImage: "none"
 }}
 >
 {placeholder && <option value="">{placeholder}</option>}
 {options.map(o=> <option key={o.value} value={o.value}>{o.label}</option>)}
 </select>
 <ChevronDown size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--tb-fg-muted)]" />
 </div>
 );
}
