"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { extractVideoFrames } from "@/components/admin/video-frame-extractor";

export type StorageUploadResult = {
  ok: boolean;
  kind: string;
  fileName: string;
  contentType: string;
  size: number;
  pathname: string;
  url: string;
  downloadUrl: string;
  videoFrames?: string[];
  videoDurationSeconds?: number;
};

function formatBytes(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${value >= 10 || unit === 0 ? value.toFixed(0) : value.toFixed(1)} ${units[unit]}`;
}

export function StorageUploadField({
  label = "آپلود به Supabase Storage",
  kind = "image",
  folder = "uploads/images",
  accept,
  generateVideoFrames = false,
  onUploaded,
}: {
  label?: string;
  kind?: "image" | "avatar" | "video" | "download" | "file";
  folder?: string;
  accept?: string;
  generateVideoFrames?: boolean;
  onUploaded?: (result: StorageUploadResult) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<StorageUploadResult | null>(null);
  const [error, setError] = useState("");
  const [frameStatus, setFrameStatus] = useState("");
  const [copied, setCopied] = useState(false);

  const upload = async () => {
    if (!file || busy) return;
    setBusy(true);
    setError("");
    setResult(null);
    setFrameStatus("");
    setCopied(false);

    const body = new FormData();
    body.set("file", file);
    body.set("kind", kind);
    body.set("folder", folder);

    try {
      const res = await fetch("/api/admin/upload", { method: "POST", body, credentials: "include" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || data?.error || "upload_failed");

      let completed: StorageUploadResult = data;
      if (generateVideoFrames && kind === "video") {
        try {
          setFrameStatus("در حال استخراج ۱۰ فریم واقعی از ویدیو…");
          const extracted = await extractVideoFrames(file, 10);
          const framesBody = new FormData();
          for (const frame of extracted.frames) framesBody.append("frames", frame);
          const framesResponse = await fetch("/api/admin/video-frames", {
            method: "POST",
            body: framesBody,
            credentials: "include",
          });
          const framesData = await framesResponse.json();
          if (!framesResponse.ok || !Array.isArray(framesData.urls)) {
            throw new Error(framesData?.error || "storyboard_upload_failed");
          }
          completed = {
            ...data,
            videoFrames: framesData.urls,
            videoDurationSeconds: extracted.duration,
          };
          setFrameStatus("۱۰ فریم WebP برای پیش‌نمایش هاور ساخته شد.");
        } catch {
          // Video upload remains successful when a local codec cannot be
          // decoded by the browser; the editor can still provide a poster.
          setFrameStatus("ویدیو آپلود شد، اما مرورگر نتوانست فریم‌های پیش‌نمایش را استخراج کند.");
        }
      }

      setResult(completed);
      onUploaded?.(completed);
    } catch (e: any) {
      setError(e?.message || "خطا در آپلود فایل");
    } finally {
      setBusy(false);
    }
  };

  const copyUrl = async () => {
    if (!result?.url) return;
    await navigator.clipboard.writeText(result.url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="rounded-[var(--corner-radius)] border-[length:var(--border-size)] border-[var(--border-color)] bg-[var(--card-background)] p-3 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="font-bold text-[var(--primary-text)]">{label}</div>
          <div className="text-xs paragraph-color" dir="ltr">{folder}/</div>
        </div>
        {result && <Button type="button" variant="ghost" size="xs" onClick={copyUrl}>{copied ? "کپی شد" : "کپی URL"}</Button>}
      </div>

      <input
        type="file"
        accept={accept}
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="block w-full text-xs paragraph-color file:me-3 file:rounded-[var(--corner-radius)] file:border-0 file:bg-[var(--button-background)] file:px-3 file:py-2 file:text-[var(--primary-text)]"
      />

      {file && <div className="text-xs paragraph-color">{file.name} • {formatBytes(file.size)} • {file.type || "unknown"}</div>}
      {error && <div className="text-xs text-[var(--danger)]">{error}</div>}
      {frameStatus && <div className="text-xs text-muted-foreground">{frameStatus}</div>}
      {result && (
        <div className="space-y-1 text-xs">
          <div className="font-mono text-[var(--primary-text)] break-all" dir="ltr">{result.url}</div>
          <div className="paragraph-color" dir="ltr">{result.pathname} • {formatBytes(result.size)}</div>
        </div>
      )}

      <Button type="button" size="xs" onClick={upload} disabled={!file || busy}>
        {busy ? "در حال آپلود…" : "آپلود"}
      </Button>
    </div>
  );
}
