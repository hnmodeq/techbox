"use client";

/**
 * RelativeDate — "تاریخ نسبی"
 *
 * The single component for showing a publish date anywhere in TechBox.
 * Renders the relative ladder from `formatRelativeFa` ("۳ ساعت پیش",
 * "۴ هفته پیش", "۱ سال پیش") with a tooltip carrying the real Jalali
 * date ("۱ تیر").
 *
 * Say "use RelativeDate" / "تاریخ نسبی" and this is what is meant.
 *
 * Hydration note: the relative label is time-dependent, so the server
 * and the client can format the same timestamp differently if the page
 * sits in a cache — a post rendered at "۵۹ دقیقه پیش" is "۱ ساعت پیش"
 * by the time it reaches a visitor. `suppressHydrationWarning` covers
 * that expected drift, and an effect re-formats on mount so the value
 * the user ends up looking at is computed against their own clock.
 */

import * as React from "react";
import { formatRelativeFa, formatAbsoluteFa } from "@/lib/date-format";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export type RelativeDateProps = {
  /** ISO string or Date. */
  date: string | Date | undefined | null;
  className?: string;
  /** Tooltip copy prefix. The absolute date is always appended. */
  label?: string;
};

export function RelativeDate({ date, className, label }: RelativeDateProps) {
  const iso = React.useMemo(
    () => (date instanceof Date ? date.toISOString() : date ?? ""),
    [date],
  );

  const [text, setText] = React.useState(() => formatRelativeFa(date));

  // Recompute against the visitor's clock after mount, so a cached page
  // does not keep showing a stale "لحظاتی پیش".
  React.useEffect(() => {
    setText(formatRelativeFa(iso));
  }, [iso]);

  if (!iso || !text) return null;

  const absolute = formatAbsoluteFa(iso);

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <time
            dateTime={iso}
            // `w-fit` matters: the tooltip is positioned against the
            // trigger's box, and a full-width block box centres the tooltip
            // on the CONTAINER rather than on the date text — which reads as
            // the tooltip being randomly offset. Shrinking the box to the
            // text puts the tooltip directly above the words. Callers may
            // still pass `block`/`inline-block` for layout; w-fit keeps the
            // width honest either way.
            className={cn("w-fit cursor-default", className)}
            suppressHydrationWarning
          />
        }
      >
        {text}
      </TooltipTrigger>
      <TooltipContent>{label ? `${label}: ${absolute}` : absolute}</TooltipContent>
    </Tooltip>
  );
}

export default RelativeDate;
