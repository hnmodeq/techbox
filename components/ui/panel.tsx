import * as React from "react";
import { cn } from "@/lib/utils";

export interface PanelProps extends React.HTMLAttributes<HTMLDivElement> {
 variant?: "card" | "overlay" | "soft";
 padding?: boolean;
}

const baseCard = "bg-[var(--card-background)] text-[var(--primary-text)] border-[length:var(--border-size)] border-[var(--border-color)] rounded-[var(--corner-radius)] shadow-[var(--shadow-size)]";
const variants = {
 card: baseCard,
 overlay: `${baseCard} !bg-[var(--modal-background)]`,
 soft: `${baseCard} !bg-[var(--card-background)]`,
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
