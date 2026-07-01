import * as React from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
 padding?: boolean;
 hover?: boolean;
}
export const Card = React.forwardRef<HTMLDivElement, CardProps>(
 ({ className, padding = true, hover = false, ...props }, ref) => (
 <div
 ref={ref}
 className={cn(
 "bg-[var(--tb-bg-secondary)] text-[var(--tb-fg-primary)]",
 "border border-[var(--tb-border)]",
 "rounded-[var(--tb-radius-lg)]",
 "shadow-[var(--tb-shadow-md)]",
 padding && "p-4 md:p-5",
 hover && "transition-all duration-[var(--tb-motion-md)] ease-[var(--tb-ease)] hover:shadow-[var(--tb-shadow-md)] hover:-translate-y-[1px]",
 className
 )}
 {...props}
 />
 )
);
Card.displayName = "Card";

export const CardHeader = ({className,...p}:React.HTMLAttributes<HTMLDivElement>)=>(
 <div className={cn("mb-3",className)} {...p} />
);
export const CardTitle = ({className,...p}:React.HTMLAttributes<HTMLHeadingElement>)=>(
 <h3 className={cn("tb-text-lg md:tb-text-lg ",className)} {...p} />
);
export const CardContent = ({className,...p}:React.HTMLAttributes<HTMLDivElement>)=>(
 <div className={cn("tb-text-sm ", "text-[var(--tb-fg-muted)]", className)} {...p} />
);
export default Card;
