"use client";

import { useEffect, useState, useCallback } from "react";
import { AdminGuard } from "@/components/admin/layout/admin-guard";
import { AdminLoading, AdminEmpty, AdminError } from "@/components/admin/admin-states";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollText, RefreshCw, Filter } from "lucide-react";

type LogEntry = {
  id: string;
  userId: string | null;
  userName: string;
  action: string;
  target: string | null;
  details: string | null;
  createdAt: string;
};

const ACTION_LABELS: Record<string, string> = {
  "post.create": "ایجاد مطلب",
  "post.update": "ویرایش مطلب",
  "post.delete": "حذف مطلب",
  "post.publish": "انتشار مطلب",
  "post.unpublish": "لغو انتشار",
  "user.update": "ویرایش کاربر",
  "user.ban": "مسدود کردن کاربر",
  "user.suspend": "تعلیق کاربر",
  "settings.update": "بروزرسانی تنظیمات",
  "newsletter.send": "ارسال خبرنامه",
  "verification.approve": "تایید هویت",
  "verification.deny": "رد هویت",
  "comment.delete": "حذف دیدگاه",
  "comment.status": "تغییر وضعیت دیدگاه",
};

function actionLabel(action: string) {
  return ACTION_LABELS[action] || action;
}

function actionVariant(action: string) {
  if (action.includes("delete") || action.includes("ban")) return "destructive" as const;
  if (action.includes("create") || action.includes("publish") || action.includes("approve")) return "default" as const;
  return "secondary" as const;
}

export default function AdminAuditLogPage() {
  return (
    <AdminGuard superAdminOnly>
      {() => <AuditLogContent />}
    </AdminGuard>
  );
}

function AuditLogContent() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [limit, setLimit] = useState("50");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ take: limit });
      if (actionFilter !== "all") params.set("action", actionFilter);
      const res = await fetch(`/api/admin/audit-log?${params}`, { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load");
      const data = await res.json();
      setLogs(data.logs || []);
      setTotal(data.total || 0);
    } catch (e: any) {
      setError(e?.message || "خطا در دریافت لاگ");
    } finally {
      setLoading(false);
    }
  }, [actionFilter, limit]);

  useEffect(() => { load(); }, [load]);

  return (
    <main className="p-4 md:p-6 space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <ScrollText className="size-5" />
            لاگ فعالیت‌ها
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {total.toLocaleString("fa-IR")} رویداد ثبت شده
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={load} className="gap-1.5">
          <RefreshCw className="size-3" />
          به‌روزرسانی
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-3">
        <div className="flex flex-wrap gap-3 items-end">
          <div className="space-y-1 flex-1 min-w-[140px]">
            <label className="text-xs text-muted-foreground">نوع عملیات</label>
            <Select value={actionFilter} onValueChange={(v) => setActionFilter(v ?? "all")}>
              <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">همه</SelectItem>
                {Object.entries(ACTION_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1 w-24">
            <label className="text-xs text-muted-foreground">تعداد</label>
            <Select value={limit} onValueChange={(v) => setLimit(v ?? "50")}>
              <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
                <SelectItem value="200">200</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Error */}
      {error && <AdminError message={error} onRetry={load} />}

      {/* Log List */}
      {loading ? (
        <AdminLoading rows={5} />
      ) : logs.length === 0 ? (
        <AdminEmpty title="لاگی ثبت نشده" description="فعالیت‌های مدیران اینجا ثبت می‌شود." />
      ) : (
        <Card className="p-0 overflow-hidden">
          <div className="divide-y">
            {logs.map((log) => (
              <div key={log.id} className="flex items-start gap-3 px-4 py-3 hover:bg-muted/20 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={actionVariant(log.action)} className="text-[10px]">
                      {actionLabel(log.action)}
                    </Badge>
                    {log.userName && (
                      <span className="text-xs font-medium">{log.userName}</span>
                    )}
                    <span className="text-[10px] text-muted-foreground" dir="ltr">
                      {log.userId?.slice(0, 8)}
                    </span>
                  </div>
                  {log.target && (
                    <div className="text-xs text-muted-foreground mt-1 font-mono" dir="ltr">
                      {log.target}
                    </div>
                  )}
                  {log.details && (
                    <div className="text-[10px] text-muted-foreground mt-1 max-w-lg truncate">
                      {log.details}
                    </div>
                  )}
                </div>
                <span className="text-[10px] text-muted-foreground shrink-0">
                  {new Date(log.createdAt).toLocaleString("fa-IR")}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </main>
  );
}
