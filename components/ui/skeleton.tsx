import { cn } from "@/lib/utils";
export function Skeleton({className, ...p}: React.HTMLAttributes<HTMLDivElement>){
 return <div className={cn("animate-pulse rounded-[var(--corner-radius)] bg-[var(--muted-background)]", className)} {...p} />
}
export default Skeleton;
