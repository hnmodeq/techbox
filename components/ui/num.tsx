/**
 * <Num> — numeral rendering guard.
 *
 * Decision D9 (locked):
 *   Persian digits → prices, dates, counts, ratings, countdowns, year chips
 *   Latin digits   → product names, model numbers (DS923+), RAID levels
 *                    (RAID 5), specs (10GbE, ATSC 3.0), SKUs
 *
 * Wrapping Latin runs in this component does two things a bare string
 * cannot:
 *   1. Marks them `lang="en"` so a screen reader switches voice instead of
 *      reading "TS-464" with Persian phonetics.
 *   2. Makes them greppable, so a future "convert everything to Persian
 *      digits" pass cannot silently mangle a model number.
 *
 * Docs: docs/homepage-upgrade/02-DESIGN-SPEC.md §1.6
 */
import * as React from "react";
import { cn } from "@/lib/utils";
import { toFa } from "@/lib/date-format";

type NumProps = {
  children: React.ReactNode;
  /**
   * Keep Latin digits and tag the run as English.
   * Use for model numbers, RAID levels, protocol names, SKUs.
   */
  latin?: boolean;
  /** Tabular figures — for anything that ticks (countdowns) or aligns (price columns). */
  tabular?: boolean;
  className?: string;
};

/** Converts ASCII digits inside a string to Persian digits, leaving letters alone. */
function persianiseDigits(input: string): string {
  return input.replace(/\d+/g, (run) => toFa(Number(run)));
}

function convert(node: React.ReactNode): React.ReactNode {
  if (typeof node === "number") return toFa(node);
  if (typeof node === "string") return persianiseDigits(node);
  if (Array.isArray(node)) return node.map((c, i) => <React.Fragment key={i}>{convert(c)}</React.Fragment>);
  return node;
}

export function Num({ children, latin = false, tabular = false, className }: NumProps) {
  const cls = cn(tabular && "hp-numeric", className);

  if (latin) {
    // Latin run: never converted, and marked so assistive tech switches language.
    return (
      <span lang="en" dir="ltr" className={cn("inline-block", cls)}>
        {children}
      </span>
    );
  }

  return <span className={cls}>{convert(children)}</span>;
}

export default Num;
