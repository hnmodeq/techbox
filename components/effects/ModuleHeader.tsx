"use client";

import type { ReactNode } from "react";
import type { ModuleSlug } from "@/lib/content";
import { moduleMeta } from "@/lib/content";
import { useModuleTitle } from "@/providers/module-config.provider";
import { cn } from "@/lib/utils";

type ModuleHeaderProps = {
  module: ModuleSlug;
  /** Optional custom title. When omitted, the display name is resolved from
   *  the module-name source of truth (DB → static fallback). */
  title?: string;
  description?: string;
  eyebrow?: string;
  count?: string;
  className?: string;
  children?: ReactNode;
  subtitle?: string;
};

/**
 * Plain module page header (no animated background, no boxed container).
 * Title uses the module color token. When `title` is not provided, it resolves
 * the display name from the single source of truth (modules.titles in DB,
 * falling back to moduleMeta). This means renaming a module from the admin
 * panel propagates here automatically.
 */
export default function ModuleHeader({ module, title, description, eyebrow, count, className, children }: ModuleHeaderProps) {
  const meta = moduleMeta[module];
  const resolvedTitle = useModuleTitle(module as any, meta.titleFa);
  return (
    <header className={cn("mb-6 flex flex-wrap items-end justify-between gap-3", className)}>
      <div>
        {eyebrow && <div className="mb-2 text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] paragraph-color">{eyebrow}</div>}
        <h1 className={cn("text-[length:var(--h1-font-size)] text-[var(--h1-font-color)] font-extrabold", meta.color)}>{title || resolvedTitle}</h1>
        {description && <p className="mt-2 text-[length:var(--h3-font-size)] text-[var(--h3-font-color)] font-semibold paragraph-color">{description}</p>}
      </div>
      {count && <div className="text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] paragraph-color">{count}</div>}
      {children}
    </header>
  );
}
