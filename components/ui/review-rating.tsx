"use client";

import { Icon } from "@/design/icons";
import { useStatEntry } from "@/providers/stats.provider";

export function ReviewRating({
  slug,
  fallbackRating = null,
  fallbackCount = 0,
  compact = false,
}: {
  slug: string;
  fallbackRating?: number | null;
  fallbackCount?: number;
  compact?: boolean;
}) {
  const { entry } = useStatEntry("review", slug);
  const rating = typeof entry?.rating === "number" ? entry.rating : fallbackRating;
  const ratingCount = typeof entry?.ratingCount === "number" ? entry.ratingCount : fallbackCount;

  if (typeof rating !== "number") {
    return (
      <span className="inline-flex items-center gap-1.5 text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] paragraph-color font-bold">
        امتیاز ثبت نشده
      </span>
    );
  }

  const clamped = Math.max(0, Math.min(5, rating));
  const full = Math.floor(clamped);
  const rounded = Math.round(clamped * 10) / 10;

  return (
    <span className="inline-flex items-center gap-1 text-[var(--warning)]" title={`${rounded.toFixed(1)} از ۵`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Icon
          key={i}
          name="star"
          size={compact ? 13 : 15}
          className={i < full ? "fill-current" : "opacity-35"}
          strokeWidth={1.5}
        />
      ))}
      <span className="ms-1.5 text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] font-bold text-[var(--primary-text)]">
        {rounded.toFixed(1)}
      </span>
      {ratingCount > 0 && !compact && (
        <span className="text-[11px] paragraph-color">({ratingCount.toLocaleString("fa-IR")})</span>
      )}
    </span>
  );
}
