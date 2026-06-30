"use client";
import * as React from "react";
import { cn } from "@/lib/utils";
import { zIndex } from "@/design";

export interface OverlayProps extends React.HTMLAttributes<HTMLDivElement> {
  layer?: keyof typeof zIndex;
  blur?: boolean;
}

export const Overlay = React.forwardRef<HTMLDivElement, OverlayProps>(
  ({ className, layer = "modal", blur = true, style, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("fixed inset-0", blur ? "tb-overlay-backdrop" : "bg-[var(--tb-overlay-backdrop)]", className)}
      style={{ zIndex: zIndex[layer], ...style }}
      {...props}
    />
  )
);
Overlay.displayName = "Overlay";

export interface OverlayBackdropProps extends React.HTMLAttributes<HTMLDivElement> {
  blur?: boolean;
}

export const OverlayBackdrop = React.forwardRef<HTMLDivElement, OverlayBackdropProps>(
  ({ className, blur = true, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("absolute inset-0", blur ? "tb-overlay-backdrop" : "bg-[var(--tb-overlay-backdrop)]", className)}
      {...props}
    />
  )
);
OverlayBackdrop.displayName = "OverlayBackdrop";

export default Overlay;
