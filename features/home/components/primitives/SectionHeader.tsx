/**
 * Shared homepage header.
 *
 * Every content section uses the same Magazine-style rhythm: section title,
 * hairline rule, then a "see all" action. The title always stays on the
 * ordinary shadcn foreground token; when module colours are enabled only the
 * decorative rule and action receive that module's accent.
 */
import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export type SectionHeaderProps = {
  /** Persian section title, e.g. "مجله تکباکس". Rendered as <h2>. */
  title: string;
  /** One-line description under the title. Optional. */
  description?: string;
  /** "See all" destination. Omit to hide the action. */
  href?: string;
  /** Link label. Arrow is appended automatically. */
  linkLabel?: string;
  /** id for the <h2>, so the parent section can point at it. */
  headingId: string;
  /** Render on a dark band (Timeline, About). */
  onDark?: boolean;
  /** The active module colour; omit for the standard shadcn primary. */
  accentColor?: string;
  /** The Magazine line-and-action treatment. Defaults to on for all sections. */
  rule?: boolean;
  className?: string;
};

type HeaderStyle = React.CSSProperties & {
  "--section-header-accent"?: string;
};

export function SectionHeader({
  title,
  description,
  href,
  linkLabel = "مشاهده همه",
  headingId,
  onDark = false,
  accentColor,
  rule = true,
  className,
}: SectionHeaderProps) {
  const style: HeaderStyle = {
    "--section-header-accent": accentColor || (onDark ? "var(--primary-foreground)" : "var(--primary)"),
  };

  return (
    <div className={cn("mb-6", className)} style={style}>
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
        {/* The title intentionally never receives a module colour. */}
        <h2
          id={headingId}
          className={cn(
            "text-2xl font-bold leading-[40px] tracking-tight",
            onDark ? "text-primary-foreground" : "text-foreground",
          )}
        >
          {title}
        </h2>

        {rule && (
          <span
            aria-hidden="true"
            className="hidden h-px min-w-8 flex-1 self-center bg-[color:var(--section-header-accent)] sm:block"
          />
        )}

        {href && (
          <Link
            href={href}
            className={cn(
              "shrink-0 text-[13px] font-bold text-[color:var(--section-header-accent)] underline-offset-4 transition-opacity hover:underline hover:opacity-80 focus-visible:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              onDark && "focus-visible:ring-primary-foreground",
            )}
          >
            {/* RTL: "forward" is a LEFT arrow */}
            {linkLabel} <span aria-hidden="true">←</span>
          </Link>
        )}
      </div>

      {description && (
        <p
          className={cn(
            "mt-2 max-w-3xl text-[15px] leading-[28px]",
            onDark ? "text-primary-foreground/70" : "text-muted-foreground",
          )}
        >
          {description}
        </p>
      )}
    </div>
  );
}

export default SectionHeader;
