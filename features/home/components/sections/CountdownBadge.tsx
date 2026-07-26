"use client";

/**
 * Live countdown for a discount deadline.
 *
 * Rendered as a client island inside the otherwise-static deal card so
 * that §7 stays a Server Component.
 *
 * Hydration safety: the server has no meaningful "now", so the first
 * client render deliberately outputs nothing and the timer appears after
 * mount. Rendering a server-side time here would guarantee a mismatch,
 * since the value changes every second.
 *
 * Docs: docs/homepage-upgrade/02-DESIGN-SPEC.md §7
 */
import * as React from "react";
import { faCountdown } from "@/lib/format-price";

export function CountdownBadge({ endsAt }: { endsAt: string | null }) {
  const [label, setLabel] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!endsAt) return;

    const tick = () => setLabel(faCountdown(endsAt));
    tick();

    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [endsAt]);

  // Expired, missing, or pre-hydration → render nothing at all rather
  // than a frozen ۰۰:۰۰:۰۰.
  if (!label) return null;

  return (
    <p className="hp-numeric mt-1 text-[12px] font-bold text-[color:var(--hp-deal)]">
      <span dir="ltr">{label}</span> تا پایان تخفیف
    </p>
  );
}

export default CountdownBadge;
