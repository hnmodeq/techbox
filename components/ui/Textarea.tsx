import * as React from "react";
import { cn } from "@/lib/utils";
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}
export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
 ({className, ...props}, ref)=> (
 <textarea ref={ref}
 className={cn(
 "w-full min-h-[110px] bg-[var(--muted-background)] text-[var(--primary-text)]",
 "border border-[var(--border-color)] rounded-[var(--corner-radius)]",
 "px-[14px] py-[10px] text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] ",
 "placeholder:paragraph-color/75",
 "focus:outline-none focus:border-[var(--tb-ring-1)] focus:shadow-[var(--tb-ring-3)]",
 "transition-[border-color,box-shadow] duration-[var(--tb-motion-sm)]",
 "disabled:opacity-50",
 className
 )}
 {...props}
 />
 )
);
Textarea.displayName="Textarea";
export default Textarea;
