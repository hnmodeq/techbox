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
  allFiles?: BlobFile[];
  totalFiles: number;
  totalSize: number;
  hasMore: boolean;
  error?: string;
  message?: string;
};

type TreeFolder = {
  type: "folder";
  name: string;
  path: string;
  size: number;
  count: number;
  folders: TreeFolder[];
  files: BlobFile[];
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

function buildTree(files: BlobFile[], prefix: string): TreeFolder {
  const root: TreeFolder = {
    type: "folder",
    name: prefix || "root",
    path: prefix,
    size: 0,
    count: 0,
    folders: [],
    files: [],
  };

  const getOrCreateFolder = (parent: TreeFolder, name: string, path: string) => {
    let folder = parent.folders.find((f) => f.name === name);
    if (!folder) {
      folder = { type: "folder", name, path, size: 0, count: 0, folders: [], files: [] };
      parent.folders.push(folder);
    }
    return folder;
  };

  for (const file of files) {
    const relative = file.pathname.startsWith(prefix) ? file.pathname.slice(prefix.length) : file.pathname;
    const parts = relative.split("/").filter(Boolean);
    if (parts.length === 0) continue;

    let current = root;
    let currentPath = prefix;
    for (const part of parts.slice(0, -1)) {
      currentPath += `${part}/`;
      current = getOrCreateFolder(current, part, currentPath);
    }
    current.files.push(file);
  }

  const compute = (folder: TreeFolder) => {
    folder.folders.sort((a, b) => a.name.localeCompare(b.name));
    folder.files.sort((a, b) => a.name.localeCompare(b.name));
    folder.size = folder.files.reduce((sum, file) => sum + file.size, 0);
    folder.count = folder.files.length;
    for (const child of folder.folders) {
      compute(child);
      folder.size += child.size;
      folder.count += child.count;
    }
  };
  compute(root);
  return root;
}

function collectFolderPaths(folder: TreeFolder): string[] {
  return [folder.path, ...folder.folders.flatMap(collectFolderPaths)];
}

function TreeView({
  root,
  expanded,
  expandedFiles,
  copied,
  onToggleFolder,
  onToggleFile,
  onCopy,
}: {
  root: TreeFolder;
  expanded: Set<string>;
  expandedFiles: Set<string>;
  copied: string;
  onToggleFolder: (path: string) => void;
  onToggleFile: (path: string) => void;
  onCopy: (value: string) => void;
}) {
  const renderFolder = (folder: TreeFolder, depth = 0) => {
    const isOpen = expanded.has(folder.path);
    const childrenCount = folder.folders.length + folder.files.length;

    return (
      <div key={folder.path || "root"}>
        <button
          type="button"
          onClick={() => onToggleFolder(folder.path)}
          className="flex w-full items-center justify-between gap-3 px-3 py-2 text-right transition-colors hover:bg-[var(--muted-background)]/30"
          style={{ paddingInlineStart: `${12 + depth * 22}px` }}
        >
          <span className="inline-flex min-w-0 items-center gap-2">
            <Icon name={isOpen ? "chevronDown" : "chevronLeft"} size={16} className="shrink-0 paragraph-color" />
            <Icon name="downloadModule" size={18} className="shrink-0 text-[var(--admin)]" />
            <span className="truncate font-mono text-[var(--primary-text)]" dir="ltr">
              {folder.name || "root"}{folder.path ? "/" : ""}
            </span>
          </span>
          <span className="shrink-0 text-xs paragraph-color" dir="ltr">
            {folder.count} files • {formatBytes(folder.size)} • {childrenCount} items
          </span>
        </button>

        {isOpen && (
          <div>
            {folder.folders.map((child) => renderFolder(child, depth + 1))}
            {folder.files.map((file) => renderFile(file, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const renderFile = (file: BlobFile, depth: number) => {
    const isOpen = expandedFiles.has(file.pathname);
    return (
      <div key={file.pathname} className="border-t-[length:var(--border-size)] border-[var(--border-color)]/25">
        <div
          role="button"
          tabIndex={0}
          onClick={() => onToggleFile(file.pathname)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") onToggleFile(file.pathname);
          }}
          className="grid cursor-pointer gap-2 px-3 py-2 transition-colors hover:bg-[var(--muted-background)]/20 lg:grid-cols-[minmax(220px,1fr)_120px_90px_minmax(260px,1.2fr)_auto] lg:items-center"
          style={{ paddingInlineStart: `${12 + depth * 22}px` }}
        >
          <div className="min-w-0">
            <div className="flex min-w-0 items-center gap-2">
              <Icon name={isOpen ? "chevronDown" : "chevronLeft"} size={15} className="shrink-0 paragraph-color" />
              <Icon name="download" size={16} className="shrink-0 text-[var(--primary)]" />
              <span className="truncate font-mono text-[var(--primary-text)]" dir="ltr">{file.name}</span>
            </div>
            <div className="mt-1 text-xs paragraph-color lg:hidden" dir="ltr">
              {fileKind(file.contentType)} • {formatBytes(file.size)}
            </div>
          </div>

          <div className="hidden text-xs lg:block">
            <div className="text-[var(--primary-text)]">{fileKind(file.contentType)}</div>
            <div className="font-mono paragraph-color" dir="ltr">{file.contentType}</div>
          </div>
          <div className="hidden font-mono text-xs paragraph-color lg:block" dir="ltr">{formatBytes(file.size)}</div>

          <a
            href={file.url}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="min-w-0 truncate font-mono text-xs text-[var(--admin)] hover:underline"
            dir="ltr"
            title={file.url}
          >
            {file.url}
          </a>

          <div className="flex flex-wrap gap-2" onClick={(e) => e.stopPropagation()}>
            <Button type="button" size="xs" variant="ghost" onClick={() => onCopy(file.url)}>کپی URL</Button>
            <Button type="button" size="xs" variant="ghost" onClick={() => onCopy(file.pathname)}>کپی Path</Button>
            <Link href={file.url} target="_blank" rel="noreferrer" className="text-xs font-bold text-[var(--admin)] hover:underline">باز کردن</Link>
          </div>
        </div>

        {isOpen && (
          <div className="space-y-1 bg-[var(--muted-background)]/10 px-3 py-3 text-xs paragraph-color" style={{ paddingInlineStart: `${36 + depth * 22}px` }}>
            <div><b className="text-[var(--primary-text)]">Path:</b> <code dir="ltr">{file.pathname}</code></div>
            <div><b className="text-[var(--primary-text)]">URL:</b> <a href={file.url} target="_blank" rel="noreferrer" className="font-mono text-[var(--admin)] hover:underline" dir="ltr">{file.url}</a></div>
            <div><b className="text-[var(--primary-text)]">Size:</b> <span dir="ltr">{formatBytes(file.size)}</span></div>
            <div><b className="text-[var(--primary-text)]">Uploaded:</b> {new Date(file.uploadedAt).toLocaleString("fa-IR")}</div>
            {copied === file.url && <div className="text-[var(--success)]">URL کپی شد.</div>}
            {copied === file.pathname && <div className="text-[var(--success)]">Path کپی شد.</div>}
          </div>
        )}
      </div>
    );
  };

  return <div className="divide-y divide-[var(--border-color)]/30">{renderFolder(root)}</div>;
}

export default function AdminBlobPage() {
  const [prefix, setPrefix] = useState("");
  const [inputPrefix, setInputPrefix] = useState("");
  const [data, setData] = useState<BlobResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [expandedFiles, setExpandedFiles] = useState<Set<string>>(new Set());

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

  const allFiles = useMemo(() => data?.allFiles ?? data?.files ?? [], [data]);
  const tree = useMemo(() => buildTree(allFiles, data?.prefix ?? prefix), [allFiles, data?.prefix, prefix]);

  useEffect(() => {
    if (!data) return;
    setExpanded(new Set(collectFolderPaths(tree)));
    setExpandedFiles(new Set());
  }, [data, tree]);

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

  const copyAllLinks = async () => {
    const links = allFiles.map((file) => file.url).join("\n");
    if (!links) return;
    await copy(links);
  };

  const toggleFolder = (path: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  };

  const toggleFile = (path: string) => {
    setExpandedFiles((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  };

  return (
    <main className="min-h-dvh px-4 py-10" dir="rtl">
      <section className="mx-auto max-w-7xl space-y-6">
        <PageHeader
          colorVar="--admin"
          title="فایل‌های Vercel Blob"
          titleClassName="text-[var(--admin)]"
          description="نمای درختی فولدرها و فایل‌ها، اندازه، نوع، URL و ابزار کپی لینک‌ها"
        >
          <div className="flex flex-wrap gap-2">
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
            <div className="flex flex-wrap gap-2 pt-5">
              <Button type="submit">نمایش</Button>
              <Button type="button" variant="ghost" onClick={() => setPrefix("")}>Root</Button>
              {prefix && <Button type="button" variant="ghost" onClick={() => setPrefix(getParentPrefix(prefix))}>بالا ←</Button>}
              <Button type="button" variant="ghost" onClick={() => setExpanded(new Set(collectFolderPaths(tree)))}>باز کردن همه</Button>
              <Button type="button" variant="ghost" onClick={() => setExpanded(new Set([tree.path]))}>بستن همه</Button>
              <Button type="button" onClick={copyAllLinks} disabled={!allFiles.length}>کپی همه لینک‌ها</Button>
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
            {copied.includes("\n") && <span className="text-[var(--success)]">همه لینک‌ها کپی شد.</span>}
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
            <div className="paragraph-color">کل فایل‌های prefix</div>
            <div className="mt-1 text-[length:var(--h1-font-size)] font-black text-[var(--primary-text)]">
              {loading ? "…" : allFiles.length.toLocaleString("fa-IR")}
            </div>
          </div>
          <div className="rounded-[var(--corner-radius)] border-[length:var(--border-size)] border-[var(--border-color)] bg-[var(--card-background)] p-4">
            <div className="paragraph-color">فولدرهای مستقیم</div>
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
          <div className="flex flex-wrap items-center justify-between gap-3 border-b-[length:var(--border-size)] border-[var(--border-color)] px-4 py-3">
            <div className="font-bold text-[var(--primary-text)]">درخت فایل‌ها و فولدرها</div>
            <div className="text-xs paragraph-color">برای باز/بسته کردن، روی فولدر یا فایل کلیک کنید.</div>
          </div>

          {loading ? (
            <div className="p-4 paragraph-color">در حال دریافت…</div>
          ) : allFiles.length ? (
            <TreeView
              root={tree}
              expanded={expanded}
              expandedFiles={expandedFiles}
              copied={copied}
              onToggleFolder={toggleFolder}
              onToggleFile={toggleFile}
              onCopy={copy}
            />
          ) : (
            <div className="p-4 paragraph-color">فایلی در این مسیر نیست.</div>
          )}
        </div>
      </section>
    </main>
  );
}
