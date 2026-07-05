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
    subtitle?: string;
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
        {eyebrow && <div className="mb-2 text-[length:var(--font-size-paragraph)] text-[var(--paragraph-color)] paragraph-color">{eyebrow}</div>}
        <h1 className={cn("text-[length:var(--font-size-h1)] text-[var(--h1-font-color)] font-extrabold", meta.color)}>{title}</h1>
        {description && <p className="mt-2 text-[length:var(--font-size-h3)] text-[var(--h3-font-color)] font-semibold paragraph-color">{description}</p>}
      </div>
      {count && <div className="text-[length:var(--font-size-paragraph)] text-[var(--paragraph-color)] paragraph-color">{count}</div>}
      {children}
    </header>
  );
}
