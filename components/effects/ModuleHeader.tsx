import type { ReactNode } from "react";
import HeroBackground from "@/components/effects/HeroBackground";
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

/** Extract a CSS custom property name (e.g. "--tb-blog") from a `text-[var(--tb-blog)]`class. */
function extractColorVar(colorClass: string): string {
 const match = colorClass.match(/var\((--[\w-]+)\)/);
 return match ? match[1] : "--tb-primary";
}

export default function ModuleHeader({ module, title, description, eyebrow, count, className, children }: ModuleHeaderProps) {
 const meta = moduleMeta[module];
 const colorVar = extractColorVar(meta.color);
 return (
 <header className={cn("relative mb-6 overflow-hidden rounded-[var(--tb-radius-lg)] border border-[var(--tb-border)] bg-[var(--tb-bg-secondary)]/70 p-5 md:p-6", className)}>
 <HeroBackground variant="square" colorVar={colorVar} />
 <div className="pointer-events-none absolute inset-0 bg-gradient-to-l from-[var(--tb-bg-secondary)]/85 via-[var(--tb-bg-secondary)]/55 to-[var(--tb-bg-secondary)]/20" aria-hidden="true" />
 <div className="relative z-10 flex flex-wrap items-end justify-between gap-3">
 <div>
 {eyebrow && <div className="mb-2 tb-text-sm text-[var(--tb-fg-muted)]">{eyebrow}</div>}
 <h1 className={cn("tb-text-hero md:tb-text-hero", meta.color)}>{title}</h1>
 {description && <p className="mt-2 tb-text-md text-[var(--tb-fg-muted)]">{description}</p>}
 </div>
 {count && <div className="tb-text-sm text-[var(--tb-fg-muted)]">{count}</div>}
 {children}
 </div>
 </header>
 );
}
