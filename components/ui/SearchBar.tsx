"use client";
import { Search } from "lucide-react";
import { Input } from "./Input";
import React from "react";
import { cn } from "@/lib/utils";

export interface SearchBarProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
 onSearch?: (q:string)=>void;
 containerClassName?: string;
}
export function SearchBar({ onSearch, containerClassName, onKeyDown, ...props }: SearchBarProps){
 const handleKey = (e: React.KeyboardEvent<HTMLInputElement>)=>{
 onKeyDown?.(e);
 if(e.key==="Enter" && onSearch){ e.preventDefault(); onSearch((e.target as HTMLInputElement).value); }
 };
 return (
 <div className={cn("relative w-full", containerClassName)} dir="rtl">
 <Input {...props} onKeyDown={handleKey} type="search"
 className={cn("pe-9", props.className)}
 placeholder={props.placeholder || "جستجو در تکباکس…"} />
 <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 paragraph-color" />
 </div>
 );
}
export default SearchBar;
