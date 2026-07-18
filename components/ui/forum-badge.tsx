"use client";
import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { useStatEntry } from "@/providers/stats.provider";

export function ForumBadge({ slug, fallback = null, className = "" }: { slug: string; fallback?: boolean | null; className?: string }) {
  const [solved, setSolved] = useState<boolean | null>(fallback);
  const { entry: shared, status } = useStatEntry("forum", slug);

  useEffect(() => {
    if (shared && typeof shared.solved === "boolean") {
      setSolved(shared.solved);
    }
  }, [shared]);

  useEffect(() => {
    let mounted = true;
    // Only fall back once the bulk fetch has actually settled and this
    // item still isn't in it - not on a guessed timer.
    if (status === "loading" || shared) return () => { mounted = false; };

    fetch(`/api/stats?module=forum&slug=${encodeURIComponent(slug)}`)
      .then((r) => r.json())
      .then((d) => {
        if (mounted && typeof d.solved === "boolean") {
          setSolved(d.solved);
        }
      })
      .catch(() => {});
    return () => { mounted = false; };
  }, [slug, shared, status]);

  if (solved === null) {
    return (
      <Badge variant="ghost" className={`text-[11px] text-[var(--info)] ${className}`}>
        در حال بررسی…
      </Badge>
    );
  }

  return solved ? (
    <Badge variant="ghost" className={`text-[11px] text-[var(--success)] ${className}`}>
      حل‌شده ✓
    </Badge>
  ) : (
    <Badge variant="ghost" className={`text-[11px] text-[var(--warning)] ${className}`}>
      باز
    </Badge>
  );
}
