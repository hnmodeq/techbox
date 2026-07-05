"use client";
import Link from "next/link";
import { Icon } from "@/design/icons";

type Crumb = { label: string; href?: string };

export function ToolPageHeader({
  title,
  subtitle,
  breadcrumbs = [],
  accent = "var(--tools)",
}: {
  title: string;
  subtitle?: string;
  breadcrumbs?: Crumb[];
  accent?: string;
}) {
  return (
    <div dir="rtl" className="relative overflow-hidden rounded-[var(--corner-radius)] border border-[var(--border-color)] bg-[var(--card-background)] p-5 sm:p-7 shadow-[var(--shadow-size)]">
      <div
        className="pointer-events-none absolute -left-20 -top-20 h-44 w-44 rounded-full opacity-15 blur-[40px]"
        style={{ background: accent }}
        aria-hidden
      />
      {breadcrumbs.length > 0 && (
        <nav className="mb-3 flex flex-wrap items-center gap-1.5 text-[12px] paragraph-color">
          {breadcrumbs.map((c, i) => (
            <span key={i} className="flex items-center gap-1.5">
              {i > 0 && <Icon name="chevronLeft" className="h-3 w-3 opacity-60 rtl:rotate-180" />}
              {c.href ? (
                <Link href={c.href} className="hover:text-[var(--primary-text)] transition-colors">
                  {c.label}
                </Link>
              ) : (
                <span className="text-[var(--tb-fg-secondary)] font-bold">{c.label}</span>
              )}
            </span>
          ))}
        </nav>
      )}
      <h1 className="text-[length:var(--h1-font-size)] text-[var(--h1-font-color)] font-extrabold" style={{ color: "var(--primary-text)" }}>{title}</h1>
      {subtitle && (
        <p className="mt-2 max-w-2xl text-[length:var(--h3-font-size)] text-[var(--h3-font-color)] font-semibold paragraph-color">{subtitle}</p>
      )}
    </div>
  );
}

export default ToolPageHeader;
