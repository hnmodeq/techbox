"use client";

import { useEffect, useState, useCallback } from "react";
import { AdminGuard } from "@/components/admin/layout/admin-guard";
import { canEdit, type AppUser } from "@/lib/auth";
import { useSearchParams } from "next/navigation";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

const STATUS_OPTIONS = [
  { value: "pending", label: "در انتظار", color: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20" },
  { value: "reviewed", label: "بررسی شده", color: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
  { value: "contacted", label: "تماس گرفته شده", color: "bg-green-500/10 text-green-600 border-green-500/20" },
  { value: "rejected", label: "رد شده", color: "bg-red-500/10 text-red-600 border-red-500/20" },
];

export default function AdminApplicationsPage() {
  return (
    <AdminGuard>
      {(user) => <ApplicationsContent user={user} />}
    </AdminGuard>
  );
}

function ApplicationsContent({ user }: { user: AppUser }) {
  const [apps, setApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const sp = useSearchParams();
  const jobId = sp.get("jobId");

  const loadApps = useCallback(async () => {
    setLoading(true);
    try {
      const url = jobId ? `/api/admin/jobs/applications?jobId=${jobId}` : "/api/admin/jobs/applications";
      const res = await fetch(url, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "load_failed");
      setApps(Array.isArray(data) ? data : []);
    } catch {
      // handled silently
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    if (canEdit(user, "workwithus")) loadApps();
  }, [user, loadApps]);

  const updateStatus = async (id: string, status: string) => {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/admin/jobs/applications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("خطا");
      setApps((prev) => prev.map((a) => a.id === id ? { ...a, status } : a));
      const label = STATUS_OPTIONS.find((s) => s.value === status)?.label || status;
      toast.success(`وضعیت به «${label}» تغییر کرد`);
    } catch {
      toast.error("خطا در تغییر وضعیت");
    }
    setUpdatingId(null);
  };

  if (!canEdit(user, "workwithus")) {
    return (
      <main className="p-10 text-center" dir="rtl">
        <p className="text-destructive">شما دسترسی به این بخش ندارید.</p>
      </main>
    );
  }

  const statusCounts = {
    pending: apps.filter((a) => a.status === "pending").length,
    reviewed: apps.filter((a) => a.status === "reviewed").length,
    contacted: apps.filter((a) => a.status === "contacted").length,
    rejected: apps.filter((a) => a.status === "rejected").length,
  };

  return (
    <main className="p-4 md:p-6 space-y-6" dir="rtl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight">رزومه‌های دریافتی</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {jobId ? "فیلتر شده برای یک موقعیت شغلی خاص" : "همه درخواست‌های همکاری"}
          </p>
        </div>
        <div className="flex gap-2">
          {jobId && <ButtonLink href="/admin/jobs/applications" variant="ghost" size="sm">نمایش همه</ButtonLink>}
          <ButtonLink href="/admin/jobs" variant="outline" size="sm">مدیریت مشاغل</ButtonLink>
        </div>
      </div>

      {/* Status summary */}
      <div className="flex flex-wrap gap-3">
        {STATUS_OPTIONS.map((s) => (
          <div key={s.value} className={`px-3 py-1.5 rounded-lg border text-xs font-medium ${s.color}`}>
            {s.label}: {(statusCounts as any)[s.value]}
          </div>
        ))}
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">متقاضی</TableHead>
                <TableHead className="text-right">شغل</TableHead>
                <TableHead className="text-right">تاریخ</TableHead>
                <TableHead className="text-right">رزومه</TableHead>
                <TableHead className="text-right">پیام</TableHead>
                <TableHead className="text-right">وضعیت</TableHead>
                <TableHead className="text-right">عملیات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={7}><Skeleton className="h-8 w-full" /></TableCell>
                  </TableRow>
                ))
              ) : apps.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="p-8 text-center text-muted-foreground">
                    هیچ درخواستی یافت نشد.
                  </TableCell>
                </TableRow>
              ) : (
                apps.map((app) => {
                  const statusInfo = STATUS_OPTIONS.find((s) => s.value === (app.status || "pending")) || STATUS_OPTIONS[0];
                  return (
                    <TableRow key={app.id} className="hover:bg-muted/20">
                      <TableCell>
                        <div className="font-medium text-sm">{app.name}</div>
                        <div className="text-xs text-muted-foreground">{app.email}</div>
                        <div className="text-xs text-muted-foreground" dir="ltr">{app.phone}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-medium">{app.job?.title}</div>
                        <div className="text-xs text-muted-foreground font-mono" dir="ltr">/{app.job?.slug}</div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {new Intl.DateTimeFormat("fa-IR").format(new Date(app.createdAt))}
                      </TableCell>
                      <TableCell>
                        <a
                          href={app.resumeDownloadUrl}
                          rel="noreferrer"
                          className="text-sm font-bold text-primary hover:underline"
                        >
                          دانلود
                        </a>
                        <div className="text-[10px] text-muted-foreground mt-1 max-w-[120px] truncate" title={app.resumeName}>
                          {app.resumeName}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs text-muted-foreground max-w-[160px] line-clamp-2" title={app.message}>
                          {app.message || "---"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-[10px] ${statusInfo.color}`}>
                          {statusInfo.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {STATUS_OPTIONS.filter((s) => s.value !== (app.status || "pending")).map((s) => (
                            <button
                              key={s.value}
                              onClick={() => updateStatus(app.id, s.value)}
                              disabled={updatingId === app.id}
                              className="text-[10px] text-muted-foreground hover:text-foreground transition-colors cursor-pointer text-right disabled:opacity-50"
                            >
                              → {s.label}
                            </button>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </main>
  );
}
