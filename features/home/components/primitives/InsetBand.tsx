/**
 * InsetBand — Tom's Guide's `flw-area-inset`: a tinted, rounded panel that
 * holds a whole section and visually separates it from the page.
 *
 * Dark-mode note: in light mode the inset is a PALE wash that reads as
 * slightly raised. Inverting that literally would produce a lighter-than-
 * page panel, which looks wrong on a dark page — so in dark mode the inset
 * is DARKER than the background and reads as recessed. That flip is
 * intentional; see the dark-mode rules table in the spec.
 *
 * Server Component.
 *
 * Docs: docs/homepage-upgrade/02-DESIGN-SPEC.md §1 (dark-mode rules), §3, §7, §11
 */
import * as React from "react";
import { cn } from "@/lib/utils";

export type SectionShellProps = {
  children: React.ReactNode;
  /** id of the <h2> inside, for aria-labelledby. */
  labelledBy: string;
  className?: string;
  id?: string;
};

/**
 * Plain section wrapper: standard vertical rhythm + 1280 container.
 * Use when the section sits directly on the page background.
 */
export function SectionShell({ children, labelledBy, className, id }: SectionShellProps) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      className={cn("w-full px-4 py-12 sm:px-6 lg:px-8 lg:py-16", className)}
    >
      <div className="mx-auto w-full max-w-[1280px]">{children}</div>
    </section>
  );
}

export type InsetBandProps = SectionShellProps & {
  /** brand = solid brand panel (Finder, About) · tint = pale inset (Deals, Insights) */
  tone?: "tint" | "brand" | "ink";
  /** Break out of the container to full viewport width. */
  fullBleed?: boolean;
};

export function InsetBand({
  children,
  labelledBy,
  tone = "tint",
  fullBleed = false,
  className,
  id,
}: InsetBandProps) {
  const toneCls =
    tone === "brand"
      ? // Brand-filled panels need a hairline in dark mode or the edge vanishes
        "bg-[color:var(--hp-brand)] text-[color:var(--hp-on-brand)] dark:border dark:border-white/[0.08]"
      : tone === "ink"
        ? "bg-[color:var(--hp-brand-ink)] text-[color:var(--hp-on-brand)]"
        : "bg-[color:var(--hp-inset)]";

  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      className={cn(
        fullBleed ? "w-full" : "w-full px-4 py-6 sm:px-6 lg:px-8",
      )}
    >
      <div
        className={cn(
          "mx-auto w-full",
          fullBleed ? "max-w-none" : "max-w-[1280px] rounded-[var(--hp-r-lg)]",
          "px-5 py-10 sm:px-8 lg:py-14",
          toneCls,
          className,
        )}
      >
        <div className={cn(fullBleed && "mx-auto w-full max-w-[1280px]")}>{children}</div>
      </div>
    </section>
  );
}

export default InsetBand;
