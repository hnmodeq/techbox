"use client";

import { useStatEntry } from "@/providers/stats.provider";

export function DownloadAction({
  slug,
  fallbackFileName = null,
  className = "",
}: {
  slug: string;
  fallbackFileName?: string | null;
  className?: string;
}) {
  const { entry } = useStatEntry("download", slug);
  const fileName = entry?.fileName ?? fallbackFileName;

  if (!fileName) {
    return (
      <span className={`inline-flex items-center justify-center gap-2 rounded-[var(--corner-radius)] border-[length:var(--border-size)] border-[var(--border-color)] px-4 py-2 text-xs font-bold paragraph-color opacity-70 ${className}`}>
        فایل ثبت نشده
      </span>
    );
  }

  return (
    <a
      href={`/api/download/${encodeURIComponent(slug)}`}
      className={`inline-flex items-center justify-center gap-2 rounded-[var(--corner-radius)] bg-[var(--button-background)] px-4 py-2 text-xs font-bold text-[var(--primary-text)] border-[length:var(--border-size)] border-[var(--border-color)] hover:text-[var(--download)] transition-colors ${className}`}
    >
      دانلود فایل ↓
    </a>
  );
}
