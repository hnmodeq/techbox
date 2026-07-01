import * as React from "react";
import { cn } from "@/lib/utils";

export interface PanelProps extends React.HTMLAttributes<HTMLDivElement> {
 variant?: "card" | "overlay" | "soft";
 padding?: boolean;
}

const variants = {
 card: "card",
 overlay: "tb-overlay-panel",
 soft: "tb-soft-panel",
} as const;

export const Panel = React.forwardRef<HTMLDivElement, PanelProps>(
 ({ className, variant = "card", padding = true, ...props }, ref) => (
 <div
 ref={ref}
 className={cn(variants[variant], padding && "p-4", className)}
 {...props}
 />
 )
);
Panel.displayName = "Panel";
export default Panel;
