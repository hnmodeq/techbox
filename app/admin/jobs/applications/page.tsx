"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { getCurrentUserClient, canEdit, type AppUser } from "@/lib/auth";
import { useSearchParams } from "next/navigation";
import { Button, ButtonLink } from "@/components/ui/button";
function AdminApplicationsInner() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [apps, setApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const sp = useSearchParams();
  const jobId = sp.get("jobId");

  useEffect(() => {
    setUser(getCurrentUserClient());
  }, []);

  const loadApps = useCallback(async () => {
    setLoading(true);
    try {
      const url = jobId ? `/api/admin/jobs/applications?jobId=${jobId}` : "/api/admin/jobs/applications";
      const res = await fetch(url, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "load_failed");
      setApps(Array.isArray(data) ? data : []);
    } catch (e: any) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    if (user && canEdit(user, "workwithus")) {
      loadApps();
    }
  }, [user, loadApps]);

  if (!user) return <div className="p-10 text-center">در حال بارگذاری...</div>;
  if (!canEdit(user, "workwithus")) return <div className="p-10 text-center">عدم دسترسی</div>;

  return (
    <main className="mx-auto max-w-6xl px-4 py-10" dir="rtl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold">رزومه‌های دریافتی</h1>
          <p className="text-muted-foreground mt-1">
            {jobId ? `فیلتر شده برای یک موقعیت شغلی خاص` : "همه درخواست‌های همکاری"}
          </p>
        </div>
        <div className="flex gap-2">
          {jobId && <ButtonLink href="/admin/jobs/applications" variant="ghost" size="xs">نمایش همه</ButtonLink>}
          <ButtonLink href="/admin/jobs" variant="secondary" size="xs">مدیریت مشاغل</ButtonLink>
          <ButtonLink href="/admin" variant="ghost" size="xs">داشبورد</ButtonLink>
        </div>
      </div>

      <div className="bg-[var(--card-background)] border-[var(--border-color)] border rounded-[var(--corner-radius)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead className="bg-[var(--muted-background)]/50 text-muted-foreground text-sm">
              <tr>
                <th className="p-4">متقاضی</th>
                <th className="p-4">شغل درخواستی</th>
                <th className="p-4">تاریخ ارسال</th>
                <th className="p-4">رزومه</th>
                <th className="p-4">پیام</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="p-8 text-center">در حال دریافت...</td></tr>
              ) : apps.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center">هیچ درخواستی یافت نشد.</td></tr>
              ) : (
                apps.map((app) => (
                  <tr key={app.id} className="border-t border-[var(--border-color)] hover:bg-[var(--muted-background)]/20 transition-colors">
                    <td className="p-4">
                      <div className="font-bold">{app.name}</div>
                      <div className="text-xs text-muted-foreground">{app.email}</div>
                      <div className="text-xs text-muted-foreground" dir="ltr">{app.phone}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm font-medium">{app.job?.title}</div>
                      <div className="text-xs text-muted-foreground font-mono" dir="ltr">/{app.job?.slug}</div>
                    </td>
                    <td className="p-4 text-sm">
                      {new Intl.DateTimeFormat("fa-IR").format(new Date(app.createdAt))}
                    </td>
                    <td className="p-4">
                      <a
                        href={app.resumeDownloadUrl}
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[var(--home)] hover:underline text-sm font-bold"
                      >
                        📥 دانلود رزومه
                      </a>
                      <div className="text-[10px] text-muted-foreground mt-1 max-w-[150px] truncate" title={app.resumeName}>
                        {app.resumeName}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-xs text-muted-foreground max-w-[200px] line-clamp-2" title={app.message}>
                        {app.message || "---"}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}

export default function AdminApplicationsPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">در حال بارگذاری...</div>}>
      <AdminApplicationsInner />
    </Suspense>
  );
}
