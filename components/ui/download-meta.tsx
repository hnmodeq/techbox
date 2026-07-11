"use client";

import { Icon } from "@/design/icons";
import { useStatEntry } from "@/providers/stats.provider";

export function DownloadMetaLine({
  slug,
  fallbackFileName = null,
  fallbackFileSize = null,
  fallbackDownloadCount = 0,
  showFileName = true,
  showFileSize = true,
}: {
  slug: string;
  fallbackFileName?: string | null;
  fallbackFileSize?: string | null;
  fallbackDownloadCount?: number;
  showFileName?: boolean;
  showFileSize?: boolean;
}) {
  const { entry } = useStatEntry("download", slug);
  const fileName = entry?.fileName ?? fallbackFileName;
  const fileSize = entry?.fileSize ?? fallbackFileSize;
  const downloadCount = typeof entry?.downloadCount === "number" ? entry.downloadCount : fallbackDownloadCount;

  return (
    <div className="flex flex-wrap items-center gap-3 text-xs paragraph-color font-bold" style={{ fontVariantNumeric: "tabular-nums" }}>
      {showFileName && fileName && (
        <span className="inline-flex min-w-0 items-center gap-1" title="نام فایل">
          <Icon name="download" size={15} className="text-[var(--download)]" />
          <span className="max-w-[180px] truncate text-[var(--primary-text)]" dir="ltr">{fileName}</span>
        </span>
      )}
      {showFileSize ? (
        <span className="inline-flex items-center gap-1" title="حجم فایل">
          <Icon name="disk" size={15} className="text-[var(--warning)]" />
          <span className="text-[var(--primary-text)]">{fileSize || "حجم ثبت نشده"}</span>
        </span>
      ) : (
        <span className="inline-flex items-center" title="فایل">
          <Icon name="file" size={15} className="text-[var(--warning)]" />
        </span>
      )}
      <span className="inline-flex items-center gap-1" title="تعداد دانلود">
        <Icon name="download" size={15} className="text-[var(--download)]" />
        <span className="text-[var(--primary-text)]">{downloadCount.toLocaleString("fa-IR")}</span>
        <span className="font-normal">دانلود</span>
      </span>
    </div>
  );
}
