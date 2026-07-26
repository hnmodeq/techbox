/**
 * SectionHeader — the title block above every homepage section.
 *
 * Matches the Spiceworks / Tom's Guide widget-header pattern:
 *   [ h2 title ]                          [ see-all link ]
 *   [ optional one-line description                      ]
 *
 * In RTL the title sits on the RIGHT and the see-all link on the LEFT,
 * which is the mirror of both sources.
 *
 * Server Component — no interactivity.
 *
 * Docs: docs/homepage-upgrade/02-DESIGN-SPEC.md §1 (typography), §2
 */
import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export type SectionHeaderProps = {
  /** Persian section title, e.g. "مجله تکباکس". Rendered as <h2>. */
  title: string;
  /** One-line description under the title. Optional. */
  description?: string;
  /** "see all" destination. Omit to hide the link entirely. */
  href?: string;
  /** Link label. Arrow is appended automatically. */
  linkLabel?: string;
  /**
   * id for the <h2>, so the parent <section> can point at it with
   * aria-labelledby. Required for the a11y contract.
   */
  headingId: string;
  /** Render on a dark band (Timeline, About) — flips text to on-brand colours. */
  onDark?: boolean;
  className?: string;
};

export function SectionHeader({
  title,
  description,
  href,
  linkLabel = "مشاهده همه",
  headingId,
  onDark = false,
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn("mb-6", className)}>
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
        <h2
          id={headingId}
          className={cn(
            "text-[28px] font-bold leading-[40px] tracking-tight",
            onDark ? "text-[color:var(--hp-on-brand)]" : "text-[color:var(--hp-ink)]",
          )}
        >
          {title}
        </h2>

        {href && (
          <Link
            href={href}
            className={cn(
              "shrink-0 text-[13px] font-bold transition-colors",
              onDark
                ? "text-[color:var(--hp-on-brand-mut)] hover:text-[color:var(--hp-on-brand)]"
                : "text-[color:var(--hp-brand)] hover:text-[color:var(--hp-brand-hover)]",
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
            onDark ? "text-[color:var(--hp-on-brand-mut)]" : "text-[color:var(--hp-ink-3)]",
          )}
        >
          {description}
        </p>
      )}
    </div>
  );
}

export default SectionHeader;
