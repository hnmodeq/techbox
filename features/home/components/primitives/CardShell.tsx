/**
 * CardShell — the surface every homepage card sits on.
 *
 * Carries the `hp-card` class, which the dark-mode image knock-down in
 * design/globals.css hooks onto (`.dark .hp-card img { filter:
 * brightness(.92) }`) so white product shots don't glare on a dark page.
 *
 * Server Component.
 *
 * Docs: docs/homepage-upgrade/02-DESIGN-SPEC.md §1
 */
import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { RemoteImage } from "@/components/ui/remote-image";

export type CardShellProps = {
  children: React.ReactNode;
  /** Whole card becomes a link. */
  href?: string;
  /** bordered = default card · plain = no chrome until hover (Spiceworks tools) */
  variant?: "bordered" | "plain" | "flat";
  /** Lift + shadow on hover. */
  interactive?: boolean;
  className?: string;
};

export function CardShell({
  children,
  href,
  variant = "bordered",
  interactive = true,
  className,
}: CardShellProps) {
  const cls = cn(
    "hp-card group relative flex flex-col overflow-hidden",
    variant === "bordered" &&
      "rounded-[var(--hp-r-md)] border border-[color:var(--hp-border)] bg-[color:var(--hp-surface)]",
    variant === "flat" && "rounded-[var(--hp-r-sm)] bg-transparent",
    variant === "plain" &&
      "rounded-[var(--hp-r-md)] bg-transparent hover:bg-[color:var(--hp-surface)]",
    interactive && [
      "transition-[transform,box-shadow,background-color,border-color] duration-200",
      "motion-reduce:transition-none motion-reduce:hover:translate-y-0",
      variant === "bordered" && "hover:-translate-y-0.5 hover:shadow-[var(--hp-shadow-hover)]",
      variant === "plain" && "hover:shadow-[var(--hp-shadow-card)]",
    ],
    className,
  );

  if (href) {
    return (
      <Link href={href} className={cn(cls, "focus-visible:ring-2 focus-visible:ring-[color:var(--hp-brand)] focus-visible:outline-none")}>
        {children}
      </Link>
    );
  }
  return <div className={cls}>{children}</div>;
}

/**
 * Fixed-ratio media box.
 *
 * CLS is the main performance risk on this page — 14 sections of images —
 * so the ratio is always reserved before the image loads. Never render a
 * bare <img> in a card.
 */
export function CardMedia({
  src,
  alt,
  ratio = "450/253",
  className,
  priority = false,
  sizes,
  children,
}: {
  src?: string | null;
  alt: string;
  /** TG cards are 450×253, SW lead is 578×325, SW thumb is 143×95. */
  ratio?: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={cn("hp-media relative w-full overflow-hidden bg-[color:var(--hp-brand-tint)]", className)}
      style={{ aspectRatio: ratio }}
    >
      <RemoteImage
        src={src}
        alt={alt}
        // Falls back to the slot's own width rather than Next's 100vw
        // default, which would fetch a desktop-width file for a thumbnail.
        sizes={sizes ?? "(min-width: 1024px) 450px, 100vw"}
        priority={priority}
        className="transition-transform duration-300 group-hover:scale-[1.03] motion-reduce:transform-none motion-reduce:transition-none"
      />
      {children}
    </div>
  );
}

export default CardShell;
