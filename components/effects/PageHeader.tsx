import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type PageHeaderProps = {
  /** CSS var name for the synced color, e.g. "--tb-admin". Kept for API compatibility. */
  colorVar?: string;
  title: string;
  description?: string;
  /** Tailwind text color class for the title, e.g. "text-[var(--tb-admin)]". */
  titleClassName?: string;
  className?: string;
  children?: ReactNode;
};

/**
 * Plain page-level header (no animated background, no boxed container).
 * Use on non-module pages (admin, account, tools, about, contact, …).
 */
export default function PageHeader({ title, description, titleClassName, className, children }: PageHeaderProps) {
  return (
    <header className={cn("mb-6 flex flex-wrap items-end justify-between gap-3", className)} dir="rtl">
      <div>
        <h1 className={cn("text-[length:var(--h1-font-size)] text-[var(--h1-font-color)] font-extrabold", titleClassName)}>{title}</h1>
        {description && <p className="mt-2 text-[length:var(--h3-font-size)] text-[var(--h3-font-color)] font-semibold paragraph-color">{description}</p>}
      </div>
      {children}
    </header>
  );
}
