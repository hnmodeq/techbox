import Link from "next/link";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";

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
 <div className={`group relative overflow-hidden rounded-[var(--corner-radius)] border-[length:var(--border-size)] border-[var(--border-color)] bg-[var(--card-background)]/80 p-5 transition-colors duration-[200ms] md:p-6 ${className}`} >
 <div className="flex h-full flex-col gap-3">
 <div className="flex items-start justify-between gap-3">
 <div>
 <h3 className={`text-[length:var(--h2-font-size)] text-[var(--h2-font-color)] font-bold md:text-[length:var(--h1-font-size)] text-[var(--h1-font-color)] font-extrabold ${color}`}>
 <Link href={href} className="hover:opacity-90">{title}</Link>
 </h3>
 {description && (
 <p className="text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] paragraph-color mt-1.5 max-w-[36ch]">{description}</p>
 )}
 </div>
 {badge && <Badge variant="brand" className="shrink-0">{badge}</Badge>}
 </div>

 <div className="min-h-0 flex-1 overflow-hidden">
 {children ?? (
 <div className="h-full rounded-[var(--corner-radius)] border-[length:var(--border-size)] border-dashed border-[color-mix(in_oklch,var(--border-color)_50%,transparent)] bg-[var(--muted-background)]/15" />
 )}
 </div>

 {footerLink && (
 <div className="pt-1">
 <Link href={footerLink} className="text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] paragraph-color hover:text-[var(--primary-text)]">
 {footerLabel}
 </Link>
 </div>
 )}
 </div>
 </div>
 );
}
