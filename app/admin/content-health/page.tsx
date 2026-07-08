"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import PageHeader from "@/components/effects/PageHeader";
import { Button, ButtonLink } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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

function labelIssue(issue: string) { return issueLabels[issue] || issue; }

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

  useEffect(() => { load(false); }, []);

  const postsWithIssues = useMemo(() => data?.postIssues.filter((p) => p.issues.length) ?? [], [data]);
  const usersWithIssues = useMemo(() => data?.userIssues.filter((u) => u.issues.length) ?? [], [data]);
  const brokenUrls = useMemo(() => data?.urlStatuses.filter((u) => !u.ok) ?? [], [data]);

  return (
    <main className="min-h-dvh px-4 py-10" dir="rtl">
      <section className="mx-auto max-w-7xl space-y-6">
        <PageHeader colorVar="--admin" title="سلامت محتوا" titleClassName="text-[var(--admin)]" description="بررسی کمبودهای محتوا، URLهای خراب Blob و وضعیت redirectها">
          <div className="flex flex-wrap gap-2">
            <ButtonLink href="/admin" variant="ghost" size="sm">داشبورد</ButtonLink>
            <ButtonLink href="/admin/redirects" variant="ghost" size="sm">مدیریت Redirect</ButtonLink>
            <Button type="button" size="sm" onClick={() => load(false)} disabled={loading}>به‌روزرسانی</Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => load(true)} disabled={checking}>{checking ? "در حال بررسی URL…" : "بررسی URLها"}</Button>
          </div>
        </PageHeader>

        {error && <div className="rounded-[var(--corner-radius)] border border-[var(--danger)]/40 p-4 text-[var(--danger)]">{error}</div>}
        {loading && <div className="paragraph-color p-6">در حال دریافت گزارش…</div>}

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
                <div key={label as string} className="rounded-[var(--corner-radius)] border-[length:var(--border-size)] border-[var(--border-color)] bg-[var(--card-background)] p-4">
                  <div className="paragraph-color text-xs">{label}</div>
                  <div className="mt-1 text-xl font-black text-[var(--primary-text)]">{Number(value).toLocaleString("fa-IR")}</div>
                </div>
              ))}
            </div>

            <section className="rounded-[var(--corner-radius)] border-[length:var(--border-size)] border-[var(--border-color)] bg-[var(--card-background)] overflow-hidden">
              <div className="border-b-[length:var(--border-size)] border-[var(--border-color)] p-4 font-bold">محتواهای دارای مسئله</div>
              {postsWithIssues.length ? postsWithIssues.map((p) => (
                <div key={p.id} className="border-b border-[var(--border-color)]/30 p-4 last:border-0">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <Link href={`/${p.module}/${p.slug}`} className="font-bold text-[var(--primary-text)] hover:text-[var(--admin)]">{p.title}</Link>
                    <span className="font-mono text-xs paragraph-color" dir="ltr">/{p.module}/{p.slug}</span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">{p.issues.map((issue) => <Badge key={issue} variant="warning">{labelIssue(issue)}</Badge>)}</div>
                </div>
              )) : <div className="p-4 paragraph-color">مشکلی در محتواها پیدا نشد.</div>}
            </section>

            <section className="rounded-[var(--corner-radius)] border-[length:var(--border-size)] border-[var(--border-color)] bg-[var(--card-background)] overflow-hidden">
              <div className="border-b-[length:var(--border-size)] border-[var(--border-color)] p-4 font-bold">کاربران دارای مسئله</div>
              {usersWithIssues.length ? usersWithIssues.map((u) => (
                <div key={u.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border-color)]/30 p-4 last:border-0">
                  <div><b>{u.name}</b> <span className="font-mono paragraph-color" dir="ltr">@{u.username}</span></div>
                  <div className="flex gap-2">{u.issues.map((issue) => <Badge key={issue} variant="warning">{labelIssue(issue)}</Badge>)}</div>
                </div>
              )) : <div className="p-4 paragraph-color">مشکلی در کاربران پیدا نشد.</div>}
            </section>

            {data.urlStatuses.length > 0 && (
              <section className="rounded-[var(--corner-radius)] border-[length:var(--border-size)] border-[var(--border-color)] bg-[var(--card-background)] overflow-hidden">
                <div className="border-b-[length:var(--border-size)] border-[var(--border-color)] p-4 font-bold">URLهای خراب</div>
                {brokenUrls.length ? brokenUrls.map((u) => (
                  <div key={`${u.field}-${u.url}`} className="border-b border-[var(--border-color)]/30 p-4 last:border-0">
                    <div className="font-bold text-[var(--danger)]">{u.field} • {u.module}/{u.slug}</div>
                    <div className="mt-1 truncate font-mono text-xs paragraph-color" dir="ltr">{u.url}</div>
                    <div className="mt-1 text-xs paragraph-color">status: {u.status || "—"} {u.error || ""}</div>
                  </div>
                )) : <div className="p-4 paragraph-color">همه URLهای بررسی‌شده سالم هستند.</div>}
              </section>
            )}
          </>
        )}
      </section>
    </main>
  );
}
