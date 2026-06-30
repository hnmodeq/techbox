import type { ReactNode } from "react";
import HeroBackground from "@/components/effects/HeroBackground";
import { cn } from "@/lib/utils";

type PageHeaderProps = {
  /** CSS var name for the synced color, e.g. "--tb-admin", "--tb-account", "--tb-raid". */
  colorVar: string;
  title: string;
  description?: string;
  /** Tailwind text color class for the title, e.g. "text-[var(--tb-admin)]". */
  titleClassName?: string;
  className?: string;
  children?: ReactNode;
};

/**
 * Page-level header with a PixelBlast background synced to a page color.
 * Use on non-module pages (admin, account, tools, about, contact, …).
 */
export default function PageHeader({ colorVar, title, description, titleClassName, className, children }: PageHeaderProps) {
  return (
    <header className={cn("relative mb-6 overflow-hidden rounded-[var(--tb-radius-2xl)] border border-[var(--tb-border)] bg-[var(--tb-card)]/70 p-5 md:p-6", className)} dir="rtl">
      <HeroBackground variant="square" colorVar={colorVar} />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-l from-[var(--tb-card)]/85 via-[var(--tb-card)]/55 to-[var(--tb-card)]/20" aria-hidden="true" />
      <div className="relative z-10 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className={cn("text-2xl font-black md:text-3xl", titleClassName)}>{title}</h1>
          {description && <p className="mt-2 text-sm text-[var(--tb-muted-foreground)]">{description}</p>}
        </div>
        {children}
      </div>
    </header>
  );
}
