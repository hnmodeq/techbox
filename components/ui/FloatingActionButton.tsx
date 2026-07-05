"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

export interface FloatingActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
 hidden?: boolean;
}

export const FloatingActionButton = React.forwardRef<HTMLButtonElement, FloatingActionButtonProps>(
 ({ className, hidden, style, ...props }, ref) => (
 <button
 ref={ref}
 className={cn("fixed bottom-6 right-6 z-50 inline-flex items-center justify-center rounded-full bg-[var(--home)] p-3.5 text-white shadow-[var(--shadow-size)] transition-transform hover:scale-110 active:scale-95", className)}
 style={{ display: hidden ? "none" : "inline-flex", ...style }}
 {...props}
 />
 )
);
FloatingActionButton.displayName = "FloatingActionButton";

export default FloatingActionButton;
