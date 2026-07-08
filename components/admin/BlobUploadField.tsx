"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export type BlobUploadResult = {
  ok: boolean;
  kind: string;
  fileName: string;
  contentType: string;
  size: number;
  pathname: string;
  url: string;
  downloadUrl: string;
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

export function BlobUploadField({
  label = "آپلود به Vercel Blob",
  kind = "image",
  folder = "uploads/images",
  accept,
  onUploaded,
}: {
  label?: string;
  kind?: "image" | "avatar" | "video" | "download" | "file";
  folder?: string;
  accept?: string;
  onUploaded?: (result: BlobUploadResult) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<BlobUploadResult | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const upload = async () => {
    if (!file || busy) return;
    setBusy(true);
    setError("");
    setResult(null);
    setCopied(false);

    const body = new FormData();
    body.set("file", file);
    body.set("kind", kind);
    body.set("folder", folder);

    try {
      const res = await fetch("/api/admin/upload", { method: "POST", body, credentials: "include" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || data?.error || "upload_failed");
      setResult(data);
      onUploaded?.(data);
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
