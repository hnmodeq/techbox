import type { ReactNode } from "react";
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

/**
 * Plain module page header (no animated background, no boxed container).
 * Title uses the module color token.
 */
export default function ModuleHeader({ module, title, description, eyebrow, count, className, children }: ModuleHeaderProps) {
  const meta = moduleMeta[module];
  return (
    <header className={cn("mb-6 flex flex-wrap items-end justify-between gap-3", className)}>
      <div>
        {eyebrow && <div className="mb-2 tb-text-sm text-[var(--tb-fg-muted)]">{eyebrow}</div>}
        <h1 className={cn("tb-text-hero", meta.color)}>{title}</h1>
        {description && <p className="mt-2 tb-text-md text-[var(--tb-fg-muted)]">{description}</p>}
      </div>
      {count && <div className="tb-text-sm text-[var(--tb-fg-muted)]">{count}</div>}
      {children}
    </header>
  );
}
