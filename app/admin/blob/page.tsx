"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import PageHeader from "@/components/effects/PageHeader";
import { Button, ButtonLink } from "@/components/ui/button";
import { Icon } from "@/design/icons";

type BlobFolder = { name: string; prefix: string; count: number; size: number };
type BlobFile = {
  pathname: string;
  name: string;
  url: string;
  downloadUrl: string;
  size: number;
  uploadedAt: string;
  contentType: string;
};

type BlobResponse = {
  prefix: string;
  folders: BlobFolder[];
  files: BlobFile[];
  totalFiles: number;
  totalSize: number;
  hasMore: boolean;
  error?: string;
  message?: string;
};

function formatBytes(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${value >= 10 || unit === 0 ? value.toFixed(0) : value.toFixed(1)} ${units[unit]}`;
}

function getParentPrefix(prefix: string) {
  const clean = prefix.replace(/\/$/, "");
  const idx = clean.lastIndexOf("/");
  return idx >= 0 ? `${clean.slice(0, idx)}/` : "";
}

function fileKind(contentType: string) {
  if (contentType.startsWith("image/")) return "تصویر";
  if (contentType.startsWith("video/")) return "ویدیو";
  if (contentType.startsWith("audio/")) return "صدا";
  if (contentType.includes("pdf")) return "PDF";
  if (contentType.includes("zip") || contentType.includes("rar") || contentType.includes("7z")) return "آرشیو";
  if (contentType.startsWith("text/")) return "متن/کد";
  return "فایل";
}

export default function AdminBlobPage() {
  const [prefix, setPrefix] = useState("");
  const [inputPrefix, setInputPrefix] = useState("");
  const [data, setData] = useState<BlobResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError("");

    fetch(`/api/admin/blob?prefix=${encodeURIComponent(prefix)}`, { cache: "no-store" })
      .then(async (r) => {
        const body = await r.json();
        if (!r.ok) throw new Error(body?.message || body?.error || "blob_list_failed");
        return body as BlobResponse;
      })
      .then((body) => {
        if (!mounted) return;
        setData(body);
        setInputPrefix(body.prefix || "");
      })
      .catch((e) => {
        if (!mounted) return;
        setError(e?.message || "خطا در دریافت فایل‌های Blob");
        setData(null);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [prefix]);

  const breadcrumbs = useMemo(() => {
    const parts = prefix.split("/").filter(Boolean);
    const out: Array<{ label: string; prefix: string }> = [{ label: "root", prefix: "" }];
    let current = "";
    for (const part of parts) {
      current += `${part}/`;
      out.push({ label: part, prefix: current });
    }
    return out;
  }, [prefix]);

  const copy = async (value: string) => {
    await navigator.clipboard.writeText(value);
    setCopied(value);
    window.setTimeout(() => setCopied(""), 1600);
  };

  return (
    <main className="min-h-dvh px-4 py-10" dir="rtl">
      <section className="mx-auto max-w-7xl space-y-6">
        <PageHeader
          colorVar="--admin"
          title="فایل‌های Vercel Blob"
          titleClassName="text-[var(--admin)]"
          description="لیست امن فایل‌ها، فولدرها، حجم، نوع و URLهای آپلودشده در Blob"
        >
          <div className="flex flex-wrap gap-2">
            <ButtonLink href="/admin" variant="ghost" size="sm">داشبورد ادمین</ButtonLink>
            <ButtonLink href="/admin/posts" variant="ghost" size="sm">مدیریت محتوا</ButtonLink>
          </div>
        </PageHeader>

        <div className="rounded-[var(--corner-radius)] border-[length:var(--border-size)] border-[var(--border-color)] bg-[var(--card-background)] p-4 shadow-[var(--shadow-size)]">
          <form
            className="flex flex-col gap-3 sm:flex-row sm:items-center"
            onSubmit={(e) => {
              e.preventDefault();
              setPrefix(inputPrefix.replace(/^\/+/, ""));
            }}
          >
            <label className="min-w-0 flex-1">
              <span className="mb-1 block text-[length:var(--paragraph-font-size)] paragraph-color">Prefix / فولدر</span>
              <input
                value={inputPrefix}
                onChange={(e) => setInputPrefix(e.target.value)}
                placeholder="مثلاً media/videos/ یا avatars/"
                dir="ltr"
                className="input w-full text-left font-mono"
              />
            </label>
            <div className="flex gap-2 pt-5">
              <Button type="submit">نمایش</Button>
              <Button type="button" variant="ghost" onClick={() => setPrefix("")}>Root</Button>
              {prefix && <Button type="button" variant="ghost" onClick={() => setPrefix(getParentPrefix(prefix))}>بالا ←</Button>}
            </div>
          </form>

          <div className="mt-4 flex flex-wrap items-center gap-2 text-[length:var(--paragraph-font-size)] paragraph-color">
            {breadcrumbs.map((b, index) => (
              <button
                key={b.prefix || "root"}
                type="button"
                onClick={() => setPrefix(b.prefix)}
                className="font-mono text-[var(--admin)] hover:underline"
              >
                {index > 0 && <span className="paragraph-color">/</span>} {b.label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="rounded-[var(--corner-radius)] border-[length:var(--border-size)] border-[var(--danger)]/40 bg-[var(--card-background)] p-4 text-[var(--danger)]">
            {error}
            {error.includes("BLOB_READ_WRITE_TOKEN") && (
              <div className="mt-2 paragraph-color">
                در Vercel Storage → Blob را فعال کنید و env به نام <code>BLOB_READ_WRITE_TOKEN</code> را برای پروژه تنظیم کنید.
              </div>
            )}
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-[var(--corner-radius)] border-[length:var(--border-size)] border-[var(--border-color)] bg-[var(--card-background)] p-4">
            <div className="paragraph-color">فایل‌ها در این مسیر</div>
            <div className="mt-1 text-[length:var(--h1-font-size)] font-black text-[var(--primary-text)]">
              {loading ? "…" : (data?.files.length ?? 0).toLocaleString("fa-IR")}
            </div>
          </div>
          <div className="rounded-[var(--corner-radius)] border-[length:var(--border-size)] border-[var(--border-color)] bg-[var(--card-background)] p-4">
            <div className="paragraph-color">فولدرها</div>
            <div className="mt-1 text-[length:var(--h1-font-size)] font-black text-[var(--primary-text)]">
              {loading ? "…" : (data?.folders.length ?? 0).toLocaleString("fa-IR")}
            </div>
          </div>
          <div className="rounded-[var(--corner-radius)] border-[length:var(--border-size)] border-[var(--border-color)] bg-[var(--card-background)] p-4">
            <div className="paragraph-color">حجم کل prefix</div>
            <div className="mt-1 text-[length:var(--h1-font-size)] font-black text-[var(--primary-text)]" dir="ltr">
              {loading ? "…" : formatBytes(data?.totalSize ?? 0)}
            </div>
          </div>
        </div>

        <div className="rounded-[var(--corner-radius)] border-[length:var(--border-size)] border-[var(--border-color)] bg-[var(--card-background)] shadow-[var(--shadow-size)] overflow-hidden">
          <div className="border-b-[length:var(--border-size)] border-[var(--border-color)] px-4 py-3 font-bold text-[var(--primary-text)]">
            فولدرها
          </div>
          {loading ? (
            <div className="p-4 paragraph-color">در حال دریافت…</div>
          ) : data?.folders.length ? (
            <div className="divide-y divide-[var(--border-color)]/50">
              {data.folders.map((folder) => (
                <button
                  key={folder.prefix}
                  type="button"
                  onClick={() => setPrefix(folder.prefix)}
                  className="flex w-full items-center justify-between gap-3 px-4 py-3 text-right hover:bg-[var(--muted-background)]/30"
                >
                  <span className="inline-flex items-center gap-2 font-mono text-[var(--primary-text)]">
                    <Icon name="downloadModule" size={18} className="text-[var(--admin)]" />
                    {folder.name}/
                  </span>
                  <span className="paragraph-color" dir="ltr">{folder.count} files • {formatBytes(folder.size)}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-4 paragraph-color">فولدری در این مسیر نیست.</div>
          )}
        </div>

        <div className="rounded-[var(--corner-radius)] border-[length:var(--border-size)] border-[var(--border-color)] bg-[var(--card-background)] shadow-[var(--shadow-size)] overflow-hidden">
          <div className="border-b-[length:var(--border-size)] border-[var(--border-color)] px-4 py-3 font-bold text-[var(--primary-text)]">
            فایل‌ها
          </div>
          {loading ? (
            <div className="p-4 paragraph-color">در حال دریافت…</div>
          ) : data?.files.length ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[920px] text-sm">
                <thead className="bg-[var(--muted-background)]/30 paragraph-color">
                  <tr>
                    <th className="px-4 py-2 text-right">نام</th>
                    <th className="px-4 py-2 text-right">نوع</th>
                    <th className="px-4 py-2 text-right">حجم</th>
                    <th className="px-4 py-2 text-right">آپلود</th>
                    <th className="px-4 py-2 text-right">URL</th>
                    <th className="px-4 py-2 text-right">عملیات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-color)]/50">
                  {data.files.map((file) => (
                    <tr key={file.pathname} className="align-top">
                      <td className="px-4 py-3 font-mono text-[var(--primary-text)]" dir="ltr">{file.name}</td>
                      <td className="px-4 py-3">
                        <div className="text-[var(--primary-text)]">{fileKind(file.contentType)}</div>
                        <div className="font-mono text-xs paragraph-color" dir="ltr">{file.contentType}</div>
                      </td>
                      <td className="px-4 py-3 font-mono" dir="ltr">{formatBytes(file.size)}</td>
                      <td className="px-4 py-3 paragraph-color">{new Date(file.uploadedAt).toLocaleString("fa-IR")}</td>
                      <td className="max-w-[320px] px-4 py-3">
                        <div className="truncate font-mono text-xs paragraph-color" dir="ltr" title={file.url}>{file.url}</div>
                        {copied === file.url && <div className="mt-1 text-xs text-[var(--success)]">کپی شد</div>}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          <Button type="button" size="xs" variant="ghost" onClick={() => copy(file.url)}>کپی URL</Button>
                          <Button type="button" size="xs" variant="ghost" onClick={() => copy(file.pathname)}>کپی Path</Button>
                          <Link href={file.url} target="_blank" rel="noreferrer" className="text-xs font-bold text-[var(--admin)] hover:underline">باز کردن</Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-4 paragraph-color">فایلی در این مسیر نیست.</div>
          )}
        </div>
      </section>
    </main>
  );
}
