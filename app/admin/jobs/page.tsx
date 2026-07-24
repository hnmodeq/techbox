"use client";

import { useEffect, useState, useCallback } from "react";
import { AdminGuard } from "@/components/admin/layout/admin-guard";
import { AdminLoading } from "@/components/admin/admin-states";
import { canEdit, type AppUser } from "@/lib/auth";
import Link from "next/link";
import { Button, ButtonLink } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";

export default function AdminJobsPage() {
  return (
    <AdminGuard>
      {(user) => <AdminJobsInner user={user} />}
    </AdminGuard>
  );
}

function AdminJobsInner({ user }: { user: AppUser }) {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

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
    if (canEdit(user, "workwithus")) {
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !job.active }),
      });
      if (res.ok) {
        loadJobs();
      }
    } catch (e: any) {
      setMsg(e.message);
    }
  };

  if (!canEdit(user, "workwithus")) {
    return (
      <main className="p-10 text-center space-y-4" dir="rtl">
        <p className="text-destructive">شما دسترسی به مدیریت مشاغل ندارید.</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 space-y-6" dir="rtl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">مدیریت مشاغل (Work with us)</h1>
          <p className="text-sm text-muted-foreground mt-1">مدیریت آگهی‌های استخدام و مشاهده رزومه‌ها</p>
        </div>
        <div className="flex gap-2">
          <ButtonLink href="/admin/jobs/applications" variant="secondary" size="sm">مشاهده رزومه‌ها</ButtonLink>
          <ButtonLink href="/admin/jobs/new" size="sm">آگهی جدید +</ButtonLink>
        </div>
      </div>

      {msg && <Card className="p-3 text-sm text-muted-foreground">{msg}</Card>}

      <Card className="p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">عنوان شغل / واحد</TableHead>
              <TableHead className="text-right">نوع / محل</TableHead>
              <TableHead className="text-right">وضعیت</TableHead>
              <TableHead className="text-right">درخواست‌ها</TableHead>
              <TableHead className="text-right">عملیات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
                <TableRow><TableCell colSpan={5} className="p-4"><AdminLoading rows={2} /></TableCell></TableRow>
            ) : jobs.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="p-8 text-center text-muted-foreground">هیچ موقعیت شغلی ثبت نشده است.</TableCell></TableRow>
            ) : (
              jobs.map((job) => (
                <TableRow key={job.id} className="hover:bg-muted/20">
                  <TableCell>
                    <div className="font-bold">{job.title}</div>
                    <div className="text-xs text-muted-foreground font-mono" dir="ltr">{job.slug}</div>
                    <div className="text-xs mt-1 text-primary">{job.team}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{job.type}</div>
                    <div className="text-xs text-muted-foreground">{job.remote ? "دورکاری" : "حضوری"}</div>
                  </TableCell>
                  <TableCell>{job.active ? <Badge variant="default">فعال</Badge> : <Badge variant="secondary">غیرفعال</Badge>}</TableCell>
                  <TableCell>
                    <Link href={`/admin/jobs/applications?jobId=${job.id}`} className="hover:underline">
                      <Badge variant="outline">{job._count?.applications || 0} رزومه</Badge>
                    </Link>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                      <ButtonLink href={`/admin/jobs/${job.id}/edit`} variant="ghost" size="xs">ویرایش</ButtonLink>
                      <ButtonLink href={`/work-with-us/${job.slug}`} target="_blank" variant="ghost" size="xs">مشاهده</ButtonLink>
                      <Button variant="ghost" size="xs" onClick={() => toggleActive(job)}>{job.active ? "غیرفعال‌سازی" : "فعال‌سازی"}</Button>
                      <Button size="xs" variant="ghost" onClick={() => deleteJob(job.id, job.title)} className="text-destructive hover:text-destructive">حذف</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </main>
  );
}
