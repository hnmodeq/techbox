import Link from "next/link";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/Badge";

type Props = {
 title: string;
 description?: string;
 href?: string;
 color?: string;
 className?: string;
 children?: ReactNode;
 badge?: string;
 footerLink?: string;
 footerLabel?: string;
};

export default function BentoCard({
 title,
 description,
 href = "#",
 color = "text-foreground",
 className = "",
 children,
 badge,
 footerLink,
 footerLabel = "مشاهده همه →",
}: Props) {
 return (
 <div className={`group relative overflow-hidden rounded-[var(--tb-radius-lg)] border border-[var(--tb-border)] bg-[var(--tb-bg-secondary)]/80 p-5 transition-colors duration-[var(--tb-motion-md)] md:p-6 ${className}`} >
 <div className="flex h-full flex-col gap-3">
 <div className="flex items-start justify-between gap-3">
 <div>
 <h3 className={`tb-text-lg md:tb-text-hero ${color}`}>
 <Link href={href} className="hover:opacity-90">{title}</Link>
 </h3>
 {description && (
 <p className="tb-text-sm text-[var(--tb-fg-muted)] mt-1.5 max-w-[36ch]">{description}</p>
 )}
 </div>
 {badge && <Badge variant="brand" className="shrink-0">{badge}</Badge>}
 </div>

 <div className="min-h-0 flex-1 overflow-hidden">
 {children ?? (
 <div className="h-full rounded-[var(--tb-radius-lg)] border border-dashed border-[color-mix(in_oklch,var(--tb-border)_50%,transparent)] bg-[var(--tb-bg-muted)]/15" />
 )}
 </div>

 {footerLink && (
 <div className="pt-1">
 <Link href={footerLink} className="tb-text-sm text-[var(--tb-fg-muted)] hover:text-[var(--tb-fg-primary)]">
 {footerLabel}
 </Link>
 </div>
 )}
 </div>
 </div>
 );
}
