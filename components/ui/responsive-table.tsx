"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Responsive table wrapper.
 * - Desktop: normal table with horizontal scroll
 * - Mobile: each row renders as a card
 *
 * Usage:
 *   <ResponsiveTable
 *     headers={["Title", "Status", "Actions"]}
 *     rows={items.map(item => ({
 *       key: item.id,
 *       cells: [item.title, <Badge>{item.status}</Badge>, <Button>Edit</Button>],
 *       mobileCard: <MobileCard item={item} />, // optional custom mobile view
 *     }))}
 *   />
 */

type Row = {
  key: string;
  cells: ReactNode[];
  mobileCard?: ReactNode;
};

export function ResponsiveTable({
  headers,
  rows,
  className,
}: {
  headers: string[];
  rows: Row[];
  className?: string;
}) {
  return (
    <>
      {/* Desktop: table */}
      <div className={cn("hidden md:block overflow-x-auto rounded-md border", className)}>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              {headers.map((h) => (
                <th key={h} className="px-4 py-2.5 text-right text-xs font-medium text-muted-foreground">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {rows.map((row) => (
              <tr key={row.key} className="hover:bg-muted/20 transition-colors">
                {row.cells.map((cell, i) => (
                  <td key={i} className="px-4 py-3 align-top">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && (
          <div className="p-8 text-center text-sm text-muted-foreground">
            موردی یافت نشد.
          </div>
        )}
      </div>

      {/* Mobile: cards */}
      <div className="md:hidden space-y-2">
        {rows.map((row) => (
          <div key={row.key} className="rounded-lg border bg-card p-3 space-y-2">
            {row.mobileCard || (
              <>
                {/* Default: show first cell as title, rest as key-value */}
                <div className="text-sm font-medium">{row.cells[0]}</div>
                {row.cells.slice(1).map((cell, i) => (
                  <div key={i} className="text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">{headers[i + 1]}:</span> {cell}
                  </div>
                ))}
              </>
            )}
          </div>
        ))}
        {rows.length === 0 && (
          <div className="p-8 text-center text-sm text-muted-foreground">
            موردی یافت نشد.
          </div>
        )}
      </div>
    </>
  );
}
