"use client";
import React, { useState, useEffect } from "react";

export function ForumBadge({ slug, fallback = false }: { slug: string; fallback?: boolean }) {
  const [solved, setSolved] = useState(fallback);

  useEffect(() => {
    let mounted = true;
    fetch(`/api/stats?module=forum&slug=${encodeURIComponent(slug)}`)
      .then((r) => r.json())
      .then((d) => {
        if (mounted && typeof d.solved === "boolean") {
          setSolved(d.solved);
        }
      })
      .catch(() => {});
    return () => { mounted = false; };
  }, [slug]);

  return solved ? (
    <span className="rounded-full bg-[color-mix(in_oklch,var(--success)_15%,transparent)] border-[length:var(--border-size)] border-[color-mix(in_oklch,var(--success)_30%,transparent)] px-2.5 py-0.5 text-[11px] font-bold text-[var(--success)]">
      حل‌شده ✓
    </span>
  ) : (
    <span className="rounded-full bg-[color-mix(in_oklch,var(--warning)_15%,transparent)] border-[length:var(--border-size)] border-[color-mix(in_oklch,var(--warning)_30%,transparent)] px-2.5 py-0.5 text-[11px] font-bold text-[var(--warning)]">
      باز
    </span>
  );
}
