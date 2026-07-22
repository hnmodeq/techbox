"use client";

import { useEffect, useState, useCallback } from "react";
import { AdminGuard } from "@/components/admin/layout/admin-guard";
import { canEdit, type AppUser } from "@/lib/auth";
import { useSearchParams } from "next/navigation";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

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

  if (!canEdit(user, "workwithus")) {
    return (
      <main className="p-10 text-center" dir="rtl">
        <p className="text-destructive">شما دسترسی به این بخش ندارید.</p>
      </main>
    );
  }

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

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">متقاضی</TableHead>
                <TableHead className="text-right">شغل درخواستی</TableHead>
                <TableHead className="text-right">تاریخ ارسال</TableHead>
                <TableHead className="text-right">رزومه</TableHead>
                <TableHead className="text-right">پیام</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={5}><Skeleton className="h-8 w-full" /></TableCell>
                  </TableRow>
                ))
              ) : apps.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="p-8 text-center text-muted-foreground">
                    هیچ درخواستی یافت نشد.
                  </TableCell>
                </TableRow>
              ) : (
                apps.map((app) => (
                  <TableRow key={app.id}>
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
                        دانلود رزومه
                      </a>
                      <div className="text-[10px] text-muted-foreground mt-1 max-w-[150px] truncate" title={app.resumeName}>
                        {app.resumeName}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs text-muted-foreground max-w-[200px] line-clamp-2" title={app.message}>
                        {app.message || "---"}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </main>
  );
}
