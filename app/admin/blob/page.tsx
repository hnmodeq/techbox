"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AdminGuard } from "@/components/admin/layout/admin-guard";
import { AdminLoading, AdminError, AdminEmpty } from "@/components/admin/admin-states";
import { Button, ButtonLink } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ChevronDown,
  ChevronRight,
  FolderOpen,
  File,
  Copy,
  ExternalLink,
  ArrowUp,
  Maximize2,
  Minimize2,
  Database,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

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

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatBytes(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) { value /= 1024; unit++; }
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
  const root: TreeFolder = { type: "folder", name: prefix || "root", path: prefix, size: 0, count: 0, folders: [], files: [] };
  const getOrCreate = (parent: TreeFolder, name: string, path: string) => {
    let f = parent.folders.find((x) => x.name === name);
    if (!f) { f = { type: "folder", name, path, size: 0, count: 0, folders: [], files: [] }; parent.folders.push(f); }
    return f;
  };
  for (const file of files) {
    const rel = file.pathname.startsWith(prefix) ? file.pathname.slice(prefix.length) : file.pathname;
    const parts = rel.split("/").filter(Boolean);
    if (!parts.length) continue;
    let cur = root, curPath = prefix;
    for (const part of parts.slice(0, -1)) { curPath += `${part}/`; cur = getOrCreate(cur, part, curPath); }
    cur.files.push(file);
  }
  const compute = (f: TreeFolder) => {
    f.folders.sort((a, b) => a.name.localeCompare(b.name));
    f.files.sort((a, b) => a.name.localeCompare(b.name));
    f.size = f.files.reduce((s, x) => s + x.size, 0);
    f.count = f.files.length;
    for (const c of f.folders) { compute(c); f.size += c.size; f.count += c.count; }
  };
  compute(root);
  return root;
}

function collectFolderPaths(folder: TreeFolder): string[] {
  return [folder.path, ...folder.folders.flatMap(collectFolderPaths)];
}

// ─── Tree View Component ─────────────────────────────────────────────────────

function TreeView({
  root, expanded, expandedFiles, copied,
  onToggleFolder, onToggleFile, onCopy,
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
          className="flex w-full items-center justify-between gap-3 px-3 py-2 text-right transition-colors hover:bg-muted/30"
          style={{ paddingInlineStart: `${12 + depth * 22}px` }}
        >
          <span className="inline-flex min-w-0 items-center gap-2">
            {isOpen ? <ChevronDown className="size-4 shrink-0 text-muted-foreground" /> : <ChevronRight className="size-4 shrink-0 text-muted-foreground" />}
            <FolderOpen className="size-4 shrink-0 text-primary" />
            <span className="truncate font-mono text-sm" dir="ltr">
              {folder.name || "root"}{folder.path ? "/" : ""}
            </span>
          </span>
          <span className="shrink-0 text-xs text-muted-foreground" dir="ltr">
            {folder.count} files · {formatBytes(folder.size)}
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
      <div key={file.pathname} className="border-t border-border/25">
        <div
          role="button"
          tabIndex={0}
          onClick={() => onToggleFile(file.pathname)}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onToggleFile(file.pathname); }}
          className="grid cursor-pointer gap-2 px-3 py-2 transition-colors hover:bg-muted/20 lg:grid-cols-[minmax(200px,1fr)_100px_80px_minmax(200px,1fr)_auto] lg:items-center"
          style={{ paddingInlineStart: `${12 + depth * 22}px` }}
        >
          <div className="min-w-0 flex items-center gap-2">
            {isOpen ? <ChevronDown className="size-3.5 shrink-0 text-muted-foreground" /> : <ChevronRight className="size-3.5 shrink-0 text-muted-foreground" />}
            <File className="size-3.5 shrink-0 text-muted-foreground" />
            <span className="truncate font-mono text-xs" dir="ltr">{file.name}</span>
          </div>
          <div className="hidden text-xs lg:block">
            <Badge variant="outline" className="text-[10px]">{fileKind(file.contentType)}</Badge>
          </div>
          <div className="hidden font-mono text-xs text-muted-foreground lg:block" dir="ltr">{formatBytes(file.size)}</div>
          <a href={file.url} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="hidden min-w-0 truncate font-mono text-xs text-primary hover:underline lg:block" dir="ltr" title={file.url}>
            {file.url.length > 50 ? file.url.slice(0, 50) + "…" : file.url}
          </a>
          <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
            <Button type="button" size="xs" variant="ghost" onClick={() => onCopy(file.url)}><Copy className="size-3" /></Button>
            <Button type="button" size="xs" variant="ghost" onClick={() => window.open(file.url, "_blank")}><ExternalLink className="size-3" /></Button>
          </div>
        </div>
        {isOpen && (
          <div className="space-y-1 bg-muted/10 px-3 py-3 text-xs text-muted-foreground" style={{ paddingInlineStart: `${36 + depth * 22}px` }}>
            <div><b className="text-foreground">Path:</b> <code dir="ltr" className="text-xs">{file.pathname}</code></div>
            <div><b className="text-foreground">URL:</b> <a href={file.url} target="_blank" rel="noreferrer" className="font-mono text-primary hover:underline" dir="ltr">{file.url}</a></div>
            <div><b className="text-foreground">Size:</b> <span dir="ltr">{formatBytes(file.size)}</span></div>
            <div><b className="text-foreground">Uploaded:</b> {new Date(file.uploadedAt).toLocaleString("fa-IR")}</div>
            {(copied === file.url || copied === file.pathname) && <div className="text-green-600 font-medium">کپی شد ✓</div>}
          </div>
        )}
      </div>
    );
  };

  return <div className="divide-y divide-border/20">{renderFolder(root)}</div>;
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function AdminBlobPage() {
  return (
    <AdminGuard superAdminOnly>
      {() => <BlobContent />}
    </AdminGuard>
  );
}

function BlobContent() {
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
      .then((body) => { if (mounted) { setData(body); setInputPrefix(body.prefix || ""); } })
      .catch((e) => { if (mounted) { setError(e?.message || "خطا در دریافت فایل‌های Blob"); setData(null); } })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
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
    for (const part of parts) { current += `${part}/`; out.push({ label: part, prefix: current }); }
    return out;
  }, [prefix]);

  const copy = async (value: string) => {
    await navigator.clipboard.writeText(value);
    setCopied(value);
    window.setTimeout(() => setCopied(""), 1600);
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
    <main className="p-4 md:p-6 space-y-6" dir="rtl">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
          <Database className="size-5" />
          فایل‌های Vercel Blob
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          نمای درختی فولدرها و فایل‌ها، اندازه، نوع، URL و ابزار کپی
        </p>
      </div>

      {/* Navigation + Search */}
      <Card className="p-4">
        <form
          className="flex flex-col gap-3 sm:flex-row sm:items-end"
          onSubmit={(e) => { e.preventDefault(); setPrefix(inputPrefix.replace(/^\/+/, "")); }}
        >
          <div className="flex-1 min-w-0 space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Prefix / فولدر</label>
            <Input
              value={inputPrefix}
              onChange={(e) => setInputPrefix(e.target.value)}
              placeholder="مثلاً media/videos/ یا avatars/"
              dir="ltr"
              className="font-mono"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="submit" size="sm">نمایش</Button>
            <Button type="button" variant="outline" size="sm" onClick={() => setPrefix("")}>Root</Button>
            {prefix && (
              <Button type="button" variant="outline" size="sm" onClick={() => setPrefix(getParentPrefix(prefix))}>
                <ArrowUp className="size-3 me-1" />
                بالا
              </Button>
            )}
            <Button type="button" variant="ghost" size="sm" onClick={() => setExpanded(new Set(collectFolderPaths(tree)))}>
              <Maximize2 className="size-3 me-1" />
              باز کردن همه
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => setExpanded(new Set([tree.path]))}>
              <Minimize2 className="size-3 me-1" />
              بستن همه
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={() => {
              const links = allFiles.map((f) => f.url).join("\n");
              if (links) copy(links);
            }} disabled={!allFiles.length}>
              <Copy className="size-3 me-1" />
              کپی همه لینک‌ها
            </Button>
          </div>
        </form>

        {/* Breadcrumbs */}
        <div className="mt-3 flex flex-wrap items-center gap-1 text-xs">
          {breadcrumbs.map((b, idx) => (
            <span key={b.prefix || "root"} className="flex items-center gap-1">
              {idx > 0 && <span className="text-muted-foreground">/</span>}
              <button
                type="button"
                onClick={() => setPrefix(b.prefix)}
                className="font-mono text-primary hover:underline"
              >
                {b.label}
              </button>
            </span>
          ))}
          {copied.includes("\n") && <span className="ms-2 text-green-600 font-medium">همه لینک‌ها کپی شد ✓</span>}
        </div>
      </Card>

      {/* Error */}
      {error && <AdminError message={error} />}

      {/* Stats */}
      <div className="grid gap-3 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground">کل فایل‌ها</div>
            <div className="text-xl font-bold mt-1">{loading ? "…" : allFiles.length.toLocaleString("fa-IR")}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground">فولدرها</div>
            <div className="text-xl font-bold mt-1">{loading ? "…" : (data?.folders.length ?? 0).toLocaleString("fa-IR")}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground">حجم کل</div>
            <div className="text-xl font-bold mt-1" dir="ltr">{loading ? "…" : formatBytes(data?.totalSize ?? 0)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tree */}
      <Card className="p-0 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <CardTitle className="text-sm">درخت فایل‌ها و فولدرها</CardTitle>
          <span className="text-xs text-muted-foreground">برای باز/بسته کردن کلیک کنید</span>
        </div>
        {loading ? (
          <div className="p-4"><AdminLoading rows={3} /></div>
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
          <div className="p-4"><AdminEmpty title="فایلی در این مسیر نیست." /></div>
        )}
      </Card>
    </main>
  );
}
