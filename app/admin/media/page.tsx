"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminGuard } from "@/components/admin/layout/admin-guard";
import { AdminLoading, AdminEmpty, AdminError } from "@/components/admin/admin-states";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Copy, ExternalLink, ImageIcon, Film, FileText, Music, Archive, File, RefreshCw, Search, Grid3X3, List } from "lucide-react";

type BlobFile = {
  pathname: string;
  name: string;
  url: string;
  downloadUrl: string;
  size: number;
  uploadedAt: string;
  contentType: string;
};

function formatBytes(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) { value /= 1024; unit++; }
  return `${value >= 10 || unit === 0 ? value.toFixed(0) : value.toFixed(1)} ${units[unit]}`;
}

function fileKind(contentType: string): { label: string; icon: typeof ImageIcon; color: string } {
  if (contentType.startsWith("image/")) return { label: "تصویر", icon: ImageIcon, color: "text-blue-500" };
  if (contentType.startsWith("video/")) return { label: "ویدیو", icon: Film, color: "text-purple-500" };
  if (contentType.startsWith("audio/")) return { label: "صدا", icon: Music, color: "text-green-500" };
  if (contentType.includes("pdf")) return { label: "PDF", icon: FileText, color: "text-red-500" };
  if (contentType.includes("zip") || contentType.includes("rar") || contentType.includes("7z")) return { label: "آرشیو", icon: Archive, color: "text-yellow-500" };
  return { label: "فایل", icon: File, color: "text-muted-foreground" };
}

export default function AdminMediaPage() {
  return (
    <AdminGuard superAdminOnly>
      {() => <MediaContent />}
    </AdminGuard>
  );
}

function MediaContent() {
  const [files, setFiles] = useState<BlobFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selected, setSelected] = useState<BlobFile | null>(null);
  const [copied, setCopied] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      // Fetch all files recursively
      const res = await fetch("/api/admin/blob?prefix=", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load");
      const data = await res.json();
      setFiles(data.allFiles || data.files || []);
    } catch (e: any) {
      setError(e?.message || "خطا در دریافت فایل‌ها");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return files.filter((f) => {
      if (typeFilter !== "all") {
        const kind = fileKind(f.contentType);
        if (typeFilter === "image" && !f.contentType.startsWith("image/")) return false;
        if (typeFilter === "video" && !f.contentType.startsWith("video/")) return false;
        if (typeFilter === "document" && !f.contentType.includes("pdf") && !f.contentType.startsWith("text/")) return false;
        if (typeFilter === "archive" && !f.contentType.includes("zip") && !f.contentType.includes("rar")) return false;
      }
      if (q) return f.name.toLowerCase().includes(q) || f.pathname.toLowerCase().includes(q);
      return true;
    });
  }, [files, query, typeFilter]);

  const stats = useMemo(() => {
    const images = files.filter((f) => f.contentType.startsWith("image/")).length;
    const videos = files.filter((f) => f.contentType.startsWith("video/")).length;
    const totalSize = files.reduce((s, f) => s + f.size, 0);
    return { images, videos, totalSize };
  }, [files]);

  const copyUrl = async (url: string) => {
    await navigator.clipboard.writeText(url);
    setCopied(url);
    window.setTimeout(() => setCopied(""), 1600);
  };

  return (
    <main className="p-4 md:p-6 space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <ImageIcon className="size-5" />
            کتابخانه رسانه
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {files.length.toLocaleString("fa-IR")} فایل • {formatBytes(stats.totalSize)}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={load} className="gap-1.5">
            <RefreshCw className="size-3" />
            به‌روزرسانی
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-3 grid-cols-3">
        <Card><CardContent className="p-3"><div className="text-xs text-muted-foreground">تصاویر</div><div className="text-lg font-bold">{stats.images.toLocaleString("fa-IR")}</div></CardContent></Card>
        <Card><CardContent className="p-3"><div className="text-xs text-muted-foreground">ویدیوها</div><div className="text-lg font-bold">{stats.videos.toLocaleString("fa-IR")}</div></CardContent></Card>
        <Card><CardContent className="p-3"><div className="text-xs text-muted-foreground">حجم کل</div><div className="text-lg font-bold" dir="ltr">{formatBytes(stats.totalSize)}</div></CardContent></Card>
      </div>

      {/* Filters */}
      <Card className="p-3">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex-1 min-w-[200px]">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="جستجو در نام فایل..."
              className="h-8"
            />
          </div>
          <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v ?? "all")}>
            <SelectTrigger className="w-32 h-8"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">همه نوع‌ها</SelectItem>
              <SelectItem value="image">تصاویر</SelectItem>
              <SelectItem value="video">ویدیوها</SelectItem>
              <SelectItem value="document">اسناد</SelectItem>
              <SelectItem value="archive">آرشیوها</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex gap-1">
            <Button variant={viewMode === "grid" ? "secondary" : "ghost"} size="icon-xs" onClick={() => setViewMode("grid")}><Grid3X3 className="size-3.5" /></Button>
            <Button variant={viewMode === "list" ? "secondary" : "ghost"} size="icon-xs" onClick={() => setViewMode("list")}><List className="size-3.5" /></Button>
          </div>
          <span className="text-xs text-muted-foreground">{filtered.length.toLocaleString("fa-IR")} فایل</span>
        </div>
      </Card>

      {/* Error */}
      {error && <AdminError message={error} onRetry={load} />}

      {/* Content */}
      {loading ? (
        <AdminLoading rows={4} />
      ) : filtered.length === 0 ? (
        <AdminEmpty title="فایلی پیدا نشد" />
      ) : viewMode === "grid" ? (
        /* Grid View */
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {filtered.map((file) => {
            const kind = fileKind(file.contentType);
            const Icon = kind.icon;
            const isImage = file.contentType.startsWith("image/");
            return (
              <Card
                key={file.pathname}
                className="overflow-hidden cursor-pointer hover:border-primary/30 transition-colors group"
                onClick={() => setSelected(file)}
              >
                <div className="aspect-square bg-muted flex items-center justify-center relative overflow-hidden">
                  {isImage ? (
                    <img src={file.url} alt={file.name} className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    <Icon className={`size-8 ${kind.color}`} />
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <Button
                      size="xs"
                      variant="ghost"
                      className="opacity-0 group-hover:opacity-100 text-white"
                      onClick={(e) => { e.stopPropagation(); copyUrl(file.url); }}
                    >
                      <Copy className="size-3" />
                    </Button>
                  </div>
                </div>
                <CardContent className="p-2">
                  <div className="text-[10px] font-mono truncate" dir="ltr" title={file.name}>{file.name}</div>
                  <div className="text-[9px] text-muted-foreground mt-0.5">{formatBytes(file.size)}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        /* List View */
        <Card className="p-0 overflow-hidden">
          <div className="divide-y">
            {filtered.map((file) => {
              const kind = fileKind(file.contentType);
              const Icon = kind.icon;
              return (
                <div
                  key={file.pathname}
                  className="flex items-center gap-3 px-4 py-2 hover:bg-muted/20 transition-colors cursor-pointer"
                  onClick={() => setSelected(file)}
                >
                  <Icon className={`size-4 shrink-0 ${kind.color}`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-mono truncate" dir="ltr">{file.name}</div>
                    <div className="text-[10px] text-muted-foreground truncate" dir="ltr">{file.pathname}</div>
                  </div>
                  <Badge variant="outline" className="text-[10px] shrink-0">{kind.label}</Badge>
                  <span className="text-xs text-muted-foreground w-16 text-left shrink-0" dir="ltr">{formatBytes(file.size)}</span>
                  <span className="text-[10px] text-muted-foreground w-20 text-left shrink-0">{new Date(file.uploadedAt).toLocaleDateString("fa-IR")}</span>
                  <Button size="xs" variant="ghost" onClick={(e) => { e.stopPropagation(); copyUrl(file.url); }}>
                    <Copy className="size-3" />
                  </Button>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* File Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={(o) => { if (!o) setSelected(null); }}>
        <DialogContent className="max-w-lg" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-sm">جزئیات فایل</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              {selected.contentType.startsWith("image/") && (
                <div className="rounded-lg overflow-hidden bg-muted">
                  <img src={selected.url} alt={selected.name} className="w-full max-h-64 object-contain" />
                </div>
              )}
              {selected.contentType.startsWith("video/") && (
                <video src={selected.url} controls className="w-full rounded-lg" />
              )}
              <div className="space-y-2 text-xs">
                <div><span className="font-medium text-muted-foreground">نام:</span> <span className="font-mono" dir="ltr">{selected.name}</span></div>
                <div><span className="font-medium text-muted-foreground">مسیر:</span> <code className="text-[11px]" dir="ltr">{selected.pathname}</code></div>
                <div><span className="font-medium text-muted-foreground">نوع:</span> <Badge variant="outline" className="text-[10px]">{fileKind(selected.contentType).label}</Badge> <span className="font-mono text-muted-foreground" dir="ltr">{selected.contentType}</span></div>
                <div><span className="font-medium text-muted-foreground">حجم:</span> <span dir="ltr">{formatBytes(selected.size)}</span></div>
                <div><span className="font-medium text-muted-foreground">آپلود:</span> {new Date(selected.uploadedAt).toLocaleString("fa-IR")}</div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="gap-1.5" onClick={() => copyUrl(selected.url)}>
                  <Copy className="size-3" />
                  {copied === selected.url ? "کپی شد ✓" : "کپی URL"}
                </Button>
                <Button size="sm" variant="outline" className="gap-1.5" onClick={() => window.open(selected.url, "_blank")}>
                  <ExternalLink className="size-3" />
                  باز کردن
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}
