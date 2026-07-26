/**
 * Eyebrow — the small category kicker above a headline.
 *
 * Tom's Guide styles these `font-weight: 900; letter-spacing: 2.5px;
 * text-transform: uppercase`. Two of those three do not survive
 * translation to Persian:
 *
 *   - Persian has no uppercase.
 *   - letter-spacing BREAKS Arabic-script joining — "شبکه" rendered with
 *     2.5px tracking falls apart into disconnected letterforms.
 *
 * So Persian kickers carry the same visual weight through boldness and
 * colour instead, with only a hair of tracking. Latin-only kickers
 * (RAID, NAS, 10GbE) can opt into the full tracked-uppercase treatment
 * via `latin`.
 *
 * Server Component.
 *
 * Docs: docs/homepage-upgrade/02-DESIGN-SPEC.md §1 (typography note)
 */
import * as React from "react";
import { cn } from "@/lib/utils";

export type EyebrowProps = {
  children: React.ReactNode;
  /** Latin script: restore uppercase + full 2.5px tracking. */
  latin?: boolean;
  /** Render on a dark/brand background. */
  onDark?: boolean;
  /** Use the accent colour instead of brand (for dark panels where blue is unreadable). */
  accent?: boolean;
  as?: "span" | "p" | "div";
  className?: string;
};

export function Eyebrow({
  children,
  latin = false,
  onDark = false,
  accent = false,
  as: Tag = "span",
  className,
}: EyebrowProps) {
  return (
    <Tag
      {...(latin ? { lang: "en" as const } : {})}
      className={cn(
        "hp-eyebrow block",
        latin && "hp-eyebrow--latin",
        accent
          ? "text-[color:var(--hp-accent)]"
          : onDark
            ? "text-[color:var(--hp-on-brand-mut)]"
            : "text-[color:var(--hp-brand)]",
        className,
      )}
    >
      {children}
    </Tag>
  );
}

export default Eyebrow;
