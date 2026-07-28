"use client";

/**
 * ScrollRail — horizontal snap-scrolling row with Tom's Guide's arrow chips.
 *
 * The arrow styling is copied from TG's `wdn-listv2-action`, measured from
 * their live CSS:
 *     --wdn-listv2-action-bg: #1B1B1BD9;
 *     border: 1px solid <brand>;
 *     width / height: 56px;
 *     border-radius: 9999px;
 *     display: none  (below their md breakpoint)
 * That near-black chip is deliberate in both themes — it is TG's own
 * choice on a light page, and it still reads on dark.
 *
 * RTL: `scrollLeft` is NEGATIVE in right-to-left containers in Chromium
 * and Firefox. Rather than branch on browser quirks we use
 * `scrollBy({ left })` with a sign flip, which every modern engine
 * normalises correctly.
 *
 * Client Component — needs scroll position state for arrow enable/disable.
 *
 * Docs: docs/homepage-upgrade/02-DESIGN-SPEC.md §2, §7
 */
import * as React from "react";
import { cn } from "@/lib/utils";

export type ScrollRailProps = {
  children: React.ReactNode;
  /** Accessible name for the scroll region, e.g. "ویدیوهای تکباکس". */
  label: string;
  /** Gap between items in px. TG uses 10 on mobile, 20 on desktop. */
  gap?: number;
  /** Hide arrows entirely (short rails). */
  hideArrows?: boolean;
  /** Larger, borderless controls for the Video quick-takes rail. */
  bareArrows?: boolean;
  /** Keep the arrows visible below the md breakpoint. Rails that are the
   *  primary way to reach their items (the video quick-takes slider) need
   *  them on touch too, where there is no hover affordance. */
  arrowsOnMobile?: boolean;
  className?: string;
  railClassName?: string;
};

export function ScrollRail({
  children,
  label,
  gap = 20,
  hideArrows = false,
  bareArrows = false,
  arrowsOnMobile = false,
  className,
  railClassName,
}: ScrollRailProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = React.useState(true);
  const [atEnd, setAtEnd] = React.useState(false);
  const [overflows, setOverflows] = React.useState(false);

  const sync = React.useCallback(() => {
    const el = ref.current;
    if (!el) return;
    // In RTL, scrollLeft runs 0 → negative. abs() normalises both directions.
    const pos = Math.abs(el.scrollLeft);
    const max = el.scrollWidth - el.clientWidth;

    // Only ever call setState when a value actually CHANGES.
    //
    // These three setters run from a ResizeObserver. Showing/hiding the
    // arrows changes layout, which re-fires the observer — so setting
    // state unconditionally creates an observer -> render -> observer
    // feedback loop that never settles and pins the main thread.
    const nextOverflows = max > 4;
    const nextAtStart = pos <= 4;
    const nextAtEnd = pos >= max - 4;

    setOverflows((v) => (v === nextOverflows ? v : nextOverflows));
    setAtStart((v) => (v === nextAtStart ? v : nextAtStart));
    setAtEnd((v) => (v === nextAtEnd ? v : nextAtEnd));
  }, []);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;

    sync();
    el.addEventListener("scroll", sync, { passive: true });

    // Coalesce observer bursts into one measurement per frame. Without
    // this, a single layout pass can deliver several callbacks and each
    // one schedules another render.
    let frame = 0;
    const ro = new ResizeObserver(() => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        sync();
      });
    });
    ro.observe(el);

    return () => {
      el.removeEventListener("scroll", sync);
      if (frame) cancelAnimationFrame(frame);
      ro.disconnect();
    };
  }, [sync]);

  const nudge = (dir: "prev" | "next") => {
    const el = ref.current;
    if (!el) return;
    const step = Math.max(240, el.clientWidth * 0.8);
    // RTL: "next" (further along the reading direction) means scrolling
    // toward negative scrollLeft.
    const isRtl = getComputedStyle(el).direction === "rtl";
    const sign = dir === "next" ? 1 : -1;
    el.scrollBy({ left: (isRtl ? -sign : sign) * step, behavior: "smooth" });
  };

  const showArrows = !hideArrows && overflows;

  return (
    <div className={cn("relative", className)}>
      <div
        ref={ref}
        role="region"
        aria-label={label}
        tabIndex={0}
        className={cn("hp-rail focus:outline-none", railClassName)}
        style={{ gap: `${gap}px` }}
      >
        {children}
      </div>

      {showArrows && (
        <>
          <RailArrow dir="prev" disabled={atStart} bare={bareArrows} onMobile={arrowsOnMobile} onClick={() => nudge("prev")} />
          <RailArrow dir="next" disabled={atEnd} bare={bareArrows} onMobile={arrowsOnMobile} onClick={() => nudge("next")} />
        </>
      )}
    </div>
  );
}

function RailArrow({
  dir,
  disabled,
  bare = false,
  onMobile = false,
  onClick,
}: {
  dir: "prev" | "next";
  disabled: boolean;
  bare?: boolean;
  onMobile?: boolean;
  onClick: () => void;
}) {
  // RTL: "prev" (back toward the first item) sits on the RIGHT.
  const sideCls = dir === "prev" ? "end-0 sm:-end-4" : "start-0 sm:-start-4";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={dir === "prev" ? "موارد قبلی" : "موارد بعدی"}
      className={cn(
        "absolute top-1/2 z-10 -translate-y-1/2 items-center justify-center rounded-full",
        onMobile ? "flex" : "hidden md:flex",
        bare ? "size-11 text-foreground transition-colors duration-200 md:size-16" : "h-14 w-14 border transition-opacity duration-200", // 56px — TG exact
        bare ? "hover:text-primary" : "border-[color:var(--hp-brand)] bg-[var(--hp-arrow-bg)] text-white hover:opacity-100",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
        disabled ? "pointer-events-none opacity-0" : "opacity-90",
        sideCls,
      )}
    >
      <svg width="16" height="18" viewBox="0 0 16 18" fill="none" aria-hidden="true"
        className={dir === "prev" ? "rotate-180" : undefined}>
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M15.732 8.297a1 1 0 0 1 0 1.406l-8.058 8.03a1 1 0 1 1-1.41-1.418L13.605 9 6.264 1.685A1 1 0 1 1 7.674.267l8.058 8.03Z"
          fill="currentColor"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M9.855 8.297a1 1 0 0 1 0 1.406l-8.058 8.03a1 1 0 0 1-1.41-1.418L7.728 9 .387 1.685A1 1 0 0 1 1.797.267l8.058 8.03Z"
          fill="currentColor"
          opacity="0.55"
        />
      </svg>
    </button>
  );
}

export default ScrollRail;
