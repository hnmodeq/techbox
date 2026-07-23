"use client";
import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
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
    // Don't show "در حال بررسی…" — just return null to avoid flash
    return null;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger render={<span className="inline-flex" />}>
          {solved ? (
            <Badge variant="ghost" className={`text-[11px] text-[var(--success)] cursor-default ${className}`}>
              حل‌شده ✓
            </Badge>
          ) : (
            <Badge variant="ghost" className={`text-[11px] text-[var(--warning)] cursor-default ${className}`}>
              باز
            </Badge>
          )}
        </TooltipTrigger>
        <TooltipContent dir="rtl">
          {solved
            ? "به این موضوع پاسخ داده شده"
            : "کاربر همچنان منتظر پاسخ بهتری است"}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
