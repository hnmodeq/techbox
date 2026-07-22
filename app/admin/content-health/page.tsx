"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import PageHeader from "@/components/effects/PageHeader";
import { Button, ButtonLink } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";

type Health = {
  summary: { posts: number; users: number; redirects: number; postsWithIssues: number; usersWithIssues: number; checkedUrls: number; brokenUrls: number };
  postIssues: Array<{ id: string; module: string; slug: string; title: string; issues: string[]; image?: string; videoUrl?: string; fileUrl?: string; comments: number; likes: number; views: number }>;
  userIssues: Array<{ id: string; username: string; name: string; role: string; avatar?: string; issues: string[] }>;
  urlStatuses: Array<{ field: string; url: string; ok: boolean; status?: number; error?: string; module?: string; slug?: string; title?: string }>;
};

const issueLabels: Record<string, string> = {
  missing_title: "عنوان ندارد",
  missing_excerpt: "خلاصه ندارد",
  missing_author: "نویسنده ندارد",
  missing_image: "تصویر ندارد",
  missing_videoUrl: "ویدیو ندارد",
  missing_fileUrl: "فایل ندارد",
  missing_fileName: "نام فایل ندارد",
  missing_fileSize: "حجم فایل ندارد",
  missing_rating: "امتیاز ندارد",
  missing_gallery: "گالری ندارد",
  missing_content: "متن ندارد",
  missing_avatar: "آواتار ندارد",
  missing_name: "نام ندارد",
};

function labelIssue(issue: string) {
  return issueLabels[issue] || issue;
}

export default function ContentHealthPage() {
  const [data, setData] = useState<Health | null>(null);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState("");

  const load = async (checkUrls = false) => {
    setLoading(!checkUrls);
    setChecking(checkUrls);
    setError("");
    try {
      const res = await fetch(`/api/admin/content-health${checkUrls ? "?checkUrls=1" : ""}`, { cache: "no-store" });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error || "content_health_failed");
      setData(body);
    } catch (e: any) {
      setError(e?.message || "خطا در بررسی سلامت محتوا");
    } finally {
      setLoading(false);
      setChecking(false);
    }
  };

  useEffect(() => {
    load(false);
  }, []);

  const postsWithIssues = useMemo(() => data?.postIssues.filter((p) => p.issues.length) ?? [], [data]);
  const usersWithIssues = useMemo(() => data?.userIssues.filter((u) => u.issues.length) ?? [], [data]);
  const brokenUrls = useMemo(() => data?.urlStatuses.filter((u) => !u.ok) ?? [], [data]);

  return (
    <main className="min-h-dvh px-4 py-10 space-y-6" dir="rtl">
      <section className="mx-auto max-w-7xl space-y-6">
        <PageHeader colorVar="--admin" title="سلامت محتوا" titleClassName="text-[var(--admin)]" description="بررسی کمبودهای محتوا، URLهای خراب Blob و وضعیت redirectها">
          <div className="flex flex-wrap gap-2">
            <ButtonLink href="/admin/redirects" variant="ghost" size="sm">مدیریت Redirect</ButtonLink>
            <Button type="button" size="sm" onClick={() => load(false)} disabled={loading}>به‌روزرسانی</Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => load(true)} disabled={checking}>{checking ? "در حال بررسی URL…" : "بررسی URLها"}</Button>
          </div>
        </PageHeader>

        {error && <Card className="p-4 border-destructive/40 text-destructive text-sm">{error}</Card>}
        {loading && <Card className="p-6 text-sm text-muted-foreground">در حال دریافت گزارش…</Card>}

        {data && (
          <>
            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {[
                ["کل محتوا", data.summary.posts],
                ["کاربران", data.summary.users],
                ["Redirect", data.summary.redirects],
                ["محتوای ناقص", data.summary.postsWithIssues],
                ["کاربر ناقص", data.summary.usersWithIssues],
                ["URL خراب", data.summary.brokenUrls],
              ].map(([label, value]) => (
                <Card key={label as string} className="p-4"><div className="text-xs text-muted-foreground">{label}</div><div className="mt-1 text-xl font-black">{Number(value).toLocaleString("fa-IR")}</div></Card>
              ))}
            </div>

            <Card className="p-0 overflow-hidden">
              <CardHeader className="border-b p-4"><CardTitle className="text-base">محتواهای دارای مسئله</CardTitle></CardHeader>
              <CardContent className="p-0">
                {postsWithIssues.length ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-right">عنوان</TableHead>
                        <TableHead className="text-right">مسیر</TableHead>
                        <TableHead className="text-right">مشکلات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {postsWithIssues.map((p) => (
                        <TableRow key={p.id}>
                          <TableCell><Link href={`/${p.module}/${p.slug}`} className="font-bold hover:text-primary text-sm">{p.title}</Link></TableCell>
                          <TableCell className="font-mono text-xs" dir="ltr">/{p.module}/{p.slug}</TableCell>
                          <TableCell><div className="flex flex-wrap gap-1">{p.issues.map((issue) => <Badge key={issue} variant="secondary" className="text-[10px]">{labelIssue(issue)}</Badge>)}</div></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="p-4 text-sm text-muted-foreground">مشکلی در محتواها پیدا نشد.</div>
                )}
              </CardContent>
            </Card>

            <Card className="p-0 overflow-hidden">
              <CardHeader className="border-b p-4"><CardTitle className="text-base">کاربران دارای مسئله</CardTitle></CardHeader>
              <CardContent className="p-0">
                {usersWithIssues.length ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-right">کاربر</TableHead>
                        <TableHead className="text-right">مشکلات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {usersWithIssues.map((u) => (
                        <TableRow key={u.id}>
                          <TableCell><b>{u.name}</b> <span className="font-mono text-xs text-muted-foreground" dir="ltr">@{u.username}</span></TableCell>
                          <TableCell><div className="flex gap-1 flex-wrap">{u.issues.map((issue) => <Badge key={issue} variant="outline" className="text-[10px]">{labelIssue(issue)}</Badge>)}</div></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="p-4 text-sm text-muted-foreground">مشکلی در کاربران پیدا نشد.</div>
                )}
              </CardContent>
            </Card>

            {data.urlStatuses.length > 0 && (
              <Card className="p-0 overflow-hidden">
                <CardHeader className="border-b p-4"><CardTitle className="text-base">URLهای خراب</CardTitle></CardHeader>
                <CardContent className="p-0">
                  {brokenUrls.length ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-right">فیلد</TableHead>
                          <TableHead className="text-right">URL</TableHead>
                          <TableHead className="text-right">وضعیت</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {brokenUrls.map((u) => (
                          <TableRow key={`${u.field}-${u.url}`}>
                            <TableCell className="text-xs"><Badge variant="destructive">{u.field}</Badge> {u.module}/{u.slug}</TableCell>
                            <TableCell className="font-mono text-xs truncate max-w-[300px]" dir="ltr">{u.url}</TableCell>
                            <TableCell className="text-xs text-muted-foreground">status: {u.status || "—"} {u.error || ""}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="p-4 text-sm text-muted-foreground">همه URLهای بررسی‌شده سالم هستند.</div>
                  )}
                </CardContent>
              </Card>
            )}
          </>
        )}
      </section>
    </main>
  );
}
