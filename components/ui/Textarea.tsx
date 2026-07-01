import * as React from "react";
import { cn } from "@/lib/utils";
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}
export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
 ({className, ...props}, ref)=> (
 <textarea ref={ref}
 className={cn(
 "w-full min-h-[110px] bg-[var(--tb-bg-muted)] text-[var(--tb-fg-primary)]",
 "border border-[var(--tb-border)] rounded-[var(--tb-radius-md)]",
 "px-[14px] py-[10px] tb-text-sm ",
 "placeholder:text-[var(--tb-fg-muted)]/75",
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
