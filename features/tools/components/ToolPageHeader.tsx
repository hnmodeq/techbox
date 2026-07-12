"use client";
import Link from "next/link";
import { Icon } from "@/design/icons";

type Crumb = { label: string; href?: string };

export function ToolPageHeader({
  title,
  subtitle,
  breadcrumbs = [],
  accent = "bg-primary",
}: {
  title: string;
  subtitle?: string;
  breadcrumbs?: Crumb[];
  accent?: string;
}) {
  return (
    <div dir="rtl" className="relative overflow-hidden rounded-lg border border-border bg-card p-5 sm:p-7 shadow-sm">
      <div
        className={`pointer-events-none absolute -left-20 -top-20 h-44 w-44 rounded-full opacity-15 blur-[40px] ${accent}`}
        aria-hidden
      />
      {breadcrumbs.length > 0 && (
        <nav className="mb-3 flex flex-wrap items-center gap-1.5 text-[12px] text-muted-foreground">
          {breadcrumbs.map((c, i) => (
            <span key={i} className="flex items-center gap-1.5">
              {i > 0 && <Icon name="chevronLeft" className="h-3 w-3 opacity-60 rtl:rotate-180" />}
              {c.href ? (
                <Link href={c.href} className="hover:text-foreground transition-colors">
                  {c.label}
                </Link>
              ) : (
                <span className="text-muted-foreground font-bold">{c.label}</span>
              )}
            </span>
          ))}
        </nav>
      )}
      <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground">{title}</h1>
      {subtitle && (
        <p className="mt-2 max-w-2xl text-sm sm:text-base text-muted-foreground font-semibold">{subtitle}</p>
      )}
    </div>
  );
}

export default ToolPageHeader;
