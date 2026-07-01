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
 className={cn("tb-floating-action", className)}
 style={{ display: hidden ? "none" : "inline-flex", ...style }}
 {...props}
 />
 )
);
FloatingActionButton.displayName = "FloatingActionButton";

export default FloatingActionButton;
