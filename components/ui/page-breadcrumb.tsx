import Link from "next/link";
import { ChevronLeft } from "lucide-react";

/**
 * Simple visual breadcrumb for content pages.
 * Structured data breadcrumbs are handled separately by JSON-LD components.
 */
export function PageBreadcrumb({
  items,
}: {
  items: Array<{ label: string; href?: string }>;
}) {
  if (items.length === 0) return null;

  return (
    <nav aria-label="breadcrumb" className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground mb-4">
      {items.map((item, idx) => (
        <span key={idx} className="flex items-center gap-1.5">
          {idx > 0 && <ChevronLeft className="size-3 rtl:rotate-180" />}
          {item.href ? (
            <Link href={item.href} className="hover:text-foreground transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className="text-foreground font-medium">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
