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
 "bg-[var(--card-background)] text-[var(--primary-text)]",
 "border-[length:var(--border-size)] border-[var(--border-color)]",
 "rounded-[var(--corner-radius)]",
 "shadow-[var(--shadow-size)]",
 padding && "p-4 md:p-5",
 hover && "transition-all duration-[200ms] ease-[ease] hover:shadow-[var(--shadow-size)] hover:-translate-y-[1px]",
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
 <h3 className={cn("text-[length:var(--h2-font-size)] text-[var(--h2-font-color)] font-bold md:text-[length:var(--h2-font-size)] text-[var(--h2-font-color)] font-bold ",className)} {...p} />
);
export const CardContent = ({className,...p}:React.HTMLAttributes<HTMLDivElement>)=>(
 <div className={cn("text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] ", "paragraph-color", className)} {...p} />
);
export default Card;
