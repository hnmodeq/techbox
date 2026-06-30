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
    <div className={`group relative overflow-hidden rounded-[var(--tb-radius-2xl)] border border-[var(--tb-border)] bg-[var(--tb-card)]/80 p-5 shadow-[var(--tb-shadow)] backdrop-blur-[var(--tb-blur-sm)] transition-all duration-[var(--tb-duration-normal)] hover:-translate-y-1 hover:shadow-[var(--tb-shadow-glow)] md:p-6 ${className}`} >
      <div className="flex h-full flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className={`text-xl md:text-2xl font-extrabold leading-tight ${color}`}>
              <Link href={href} className="hover:opacity-90">{title}</Link>
            </h3>
            {description && (
              <p className="text-[13px] leading-6 text-[var(--tb-muted-foreground)] mt-1.5 max-w-[36ch]">{description}</p>
            )}
          </div>
          {badge && <Badge variant="brand" className="shrink-0">{badge}</Badge>}
        </div>

        <div className="min-h-0 flex-1 overflow-hidden">
          {children ?? (
            <div className="h-full rounded-[var(--tb-radius-xl)] border border-dashed border-[color-mix(in_oklch,var(--tb-border)_50%,transparent)] bg-[var(--tb-muted)]/15" />
          )}
        </div>

        {footerLink && (
          <div className="pt-1">
            <Link href={footerLink} className="text-xs font-semibold text-[var(--tb-muted-foreground)] hover:text-[var(--tb-foreground)]">
              {footerLabel}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
