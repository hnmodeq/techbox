import type { ReactNode } from "react";
import PixelBlastBackground from "@/components/effects/PixelBlastBackground";
import type { ModuleSlug } from "@/lib/content";
import { moduleMeta } from "@/lib/content";
import { cn } from "@/lib/utils";

type ModuleHeaderProps = {
  module: ModuleSlug;
  title: string;
  description?: string;
  eyebrow?: string;
  count?: string;
  className?: string;
  children?: ReactNode;
};

/** Extract a CSS custom property name (e.g. "--tb-blog") from a `text-[var(--tb-blog)]` class. */
function extractColorVar(colorClass: string): string {
  const match = colorClass.match(/var\((--[\w-]+)\)/);
  return match ? match[1] : "--tb-pixelblast-color";
}

export default function ModuleHeader({ module, title, description, eyebrow, count, className, children }: ModuleHeaderProps) {
  const meta = moduleMeta[module];
  const colorVar = extractColorVar(meta.color);
  return (
    <header className={cn("relative mb-6 overflow-hidden rounded-[var(--tb-radius-2xl)] border border-[var(--tb-border)] bg-[var(--tb-card)]/70 p-5 md:p-6", className)}>
      <PixelBlastBackground variant="square" colorVar={colorVar} />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-l from-[var(--tb-card)]/85 via-[var(--tb-card)]/55 to-[var(--tb-card)]/20" aria-hidden="true" />
      <div className="relative z-10 flex flex-wrap items-end justify-between gap-3">
        <div>
          {eyebrow && <div className="mb-2 text-[11px] font-bold text-[var(--tb-muted-foreground)]">{eyebrow}</div>}
          <h1 className={cn("text-3xl font-black md:text-4xl", meta.color)}>{title}</h1>
          {description && <p className="mt-2 text-sm text-[var(--tb-muted-foreground)]">{description}</p>}
        </div>
        {count && <div className="text-[11px] text-[var(--tb-muted-foreground)]">{count}</div>}
        {children}
      </div>
    </header>
  );
}
