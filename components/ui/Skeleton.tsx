import { cn } from "@/lib/utils";
export function Skeleton({className, ...p}: React.HTMLAttributes<HTMLDivElement>){
 return <div className={cn("animate-pulse rounded-[var(--tb-radius-md)] bg-[var(--tb-bg-muted)]", className)} {...p} />
}
export default Skeleton;
