"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { getCurrentUserClient, canEdit, type AppUser } from "@/lib/auth";
import Link from "next/link";
import { Button, ButtonLink } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

function AdminJobsInner() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    setUser(getCurrentUserClient());
  }, []);

  const loadJobs = useCallback(async () => {
    setLoading(true);
    setMsg("");
    try {
      const res = await fetch("/api/admin/jobs", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "load_failed");
      setJobs(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setMsg(e.message || "خطا در دریافت لیست مشاغل");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user && canEdit(user, "workwithus")) {
      loadJobs();
    }
  }, [user, loadJobs]);

  const deleteJob = async (id: string, title: string) => {
    if (!confirm(`آیا از حذف موقعیت شغلی «${title}» اطمینان دارید؟`)) return;
    try {
      const res = await fetch(`/api/admin/jobs/${id}`, { method: "DELETE" });
      if (res.ok) {
        setMsg("موقعیت شغلی حذف شد");
        loadJobs();
      } else {
        throw new Error("حذف ناموفق بود");
      }
    } catch (e: any) {
      setMsg(e.message);
    }
  };

  const toggleActive = async (job: any) => {
    try {
      const res = await fetch(`/api/admin/jobs/${job.id}`, {
        method: "PATCH",
        body: JSON.stringify({ active: !job.active }),
      });
      if (res.ok) {
        loadJobs();
      }
    } catch (e: any) {
      setMsg(e.message);
    }
  };

  if (!user) return <div className="p-10 text-center">در حال بارگذاری...</div>;
  if (!canEdit(user, "workwithus")) {
    return (
      <main className="p-10 text-center" dir="rtl">
        <p className="text-[var(--danger)]">شما دسترسی به مدیریت مشاغل ندارید.</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10" dir="rtl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold">مدیریت مشاغل (Work with us)</h1>
          <p className="text-muted-foreground mt-1">مدیریت آگهی‌های استخدام و مشاهده رزومه‌ها</p>
        </div>
        <div className="flex gap-2">
          <ButtonLink href="/admin/jobs/applications" variant="secondary" size="xs">مشاهده رزومه‌ها</ButtonLink>
          <ButtonLink href="/admin/jobs/new" size="xs">آگهی جدید +</ButtonLink>
          <ButtonLink href="/admin" variant="ghost" size="xs">داشبورد</ButtonLink>
        </div>
      </div>

      {msg && (
        <div className="mb-4 bg-[var(--muted-background)] border border-[var(--border-color)] p-3 rounded-[var(--corner-radius)]">
          {msg}
        </div>
      )}

      <div className="bg-[var(--card-background)] border-[var(--border-color)] border rounded-[var(--corner-radius)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead className="bg-[var(--muted-background)]/50 text-muted-foreground text-sm">
              <tr>
                <th className="p-4">عنوان شغل / واحد</th>
                <th className="p-4">نوع / محل</th>
                <th className="p-4">وضعیت</th>
                <th className="p-4">درخواست‌ها</th>
                <th className="p-4">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="p-8 text-center">در حال دریافت داده‌ها...</td></tr>
              ) : jobs.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center">هیچ موقعیت شغلی ثبت نشده است.</td></tr>
              ) : (
                jobs.map((job) => (
                  <tr key={job.id} className="border-t border-[var(--border-color)] hover:bg-[var(--muted-background)]/20 transition-colors">
                    <td className="p-4">
                      <div className="font-bold">{job.title}</div>
                      <div className="text-xs text-muted-foreground font-mono" dir="ltr">{job.slug}</div>
                      <div className="text-xs mt-1 text-[var(--home)]">{job.team}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm">{job.type}</div>
                      <div className="text-xs text-muted-foreground">{job.remote ? "دورکاری" : "حضوری"}</div>
                    </td>
                    <td className="p-4">
                      {job.active ? (
                        <Badge variant="success">فعال</Badge>
                      ) : (
                        <Badge variant="secondary">غیرفعال</Badge>
                      )}
                    </td>
                    <td className="p-4">
                      <Link href={`/admin/jobs/applications?jobId=${job.id}`} className="hover:underline">
                        <Badge variant="brand">{job._count?.applications || 0} رزومه</Badge>
                      </Link>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <ButtonLink href={`/work-with-us/${job.slug}`} target="_blank" variant="ghost" size="xs">مشاهده</ButtonLink>
                        <Button variant="ghost" size="xs" onClick={() => toggleActive(job)}>
                          {job.active ? "غیرفعال‌سازی" : "فعال‌سازی"}
                        </Button>
                        <Button size="xs" variant="ghost" onClick={() => deleteJob(job.id, job.title)}>حذف</Button>
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

export default function AdminJobsPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">در حال بارگذاری...</div>}>
      <AdminJobsInner />
    </Suspense>
  );
}
