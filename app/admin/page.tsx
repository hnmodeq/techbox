"use client";

import { useEffect, useMemo, useState } from "react";
import { getCurrentUserClient, logout, type AppUser, canEdit } from "@/lib/auth";
import { moduleMeta, type ModuleSlug } from "@/lib/content";
import { useRouter } from "next/navigation";
import { Button, ButtonLink } from "@/components/ui/button";
import { ModuleBadge } from "@/components/ui/module-badge";
import { Badge } from "@/components/ui/badge";
import PageHeader from "@/components/effects/PageHeader";

const moduleOrder = Object.keys(moduleMeta) as ModuleSlug[];

type DraftInfo = { module: ModuleSlug; count: number; latest?: string };
type DashboardModuleStat = { module: ModuleSlug; count: number; views: number; latest?: string };
type DashboardResponse = {
  modules: DashboardModuleStat[];
  totals: { count: number; views: number };
};

function formatNumber(value: number) {
  return value.toLocaleString("fa-IR");
}

export default function AdminPage() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [drafts, setDrafts] = useState<DraftInfo[]>([]);
  const [dashboardStats, setDashboardStats] = useState<Record<string, DashboardModuleStat>>({});
  const [dashboardTotals, setDashboardTotals] = useState({ count: 0, views: 0 });
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [dashboardLoaded, setDashboardLoaded] = useState(false);
  const [dashboardError, setDashboardError] = useState("");
  const router = useRouter();

  useEffect(() => {
    setUser(getCurrentUserClient());
    const h = () => setUser(getCurrentUserClient());
    window.addEventListener("storage", h);
    return () => window.removeEventListener("storage", h);
  }, []);

  useEffect(() => {
    if (!user) return;
    const items = moduleOrder
      .map((module) => {
        try {
          const saved = JSON.parse(localStorage.getItem(`tb_drafts_${module}`) || "[]") as Array<{ savedAtFa?: string }>;
          return { module, count: saved.length, latest: saved[0]?.savedAtFa };
        } catch {
          return { module, count: 0 };
        }
      })
      .filter((x) => x.count > 0);
    setDrafts(items);
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const controller = new AbortController();
    setDashboardLoading(true);
    setDashboardError("");

    fetch("/api/admin/dashboard", { cache: "no-store", signal: controller.signal })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.message || data?.error || "dashboard_unavailable");
        return data as DashboardResponse;
      })
      .then((data) => {
        const next: Record<string, DashboardModuleStat> = {};
        for (const item of data.modules || []) next[item.module] = item;
        setDashboardStats(next);
        setDashboardTotals(data.totals || { count: 0, views: 0 });
        setDashboardLoaded(true);
      })
      .catch((error) => {
        if (controller.signal.aborted) return;
        setDashboardError(error?.message || "خطا در دریافت آمار داشبورد");
        setDashboardStats({});
        setDashboardTotals({ count: 0, views: 0 });
        setDashboardLoaded(false);
      })
      .finally(() => {
        if (!controller.signal.aborted) setDashboardLoading(false);
      });

    return () => controller.abort();
  }, [user]);

  const fallbackModules = useMemo(() => {
    if (!user) return [];
    return moduleOrder.filter((module) => canEdit(user, module));
  }, [user]);

  const modules = useMemo(() => {
    const fromApi = moduleOrder.filter((module) => dashboardStats[module]);
    return fromApi.length > 0 ? fromApi : fallbackModules;
  }, [dashboardStats, fallbackModules]);

  const moduleStats = useMemo(() => {
    return modules.map((module) => dashboardStats[module] || { module, count: 0, views: 0, latest: "" });
  }, [dashboardStats, modules]);

  const totals = useMemo(() => {
    if (dashboardLoaded) return dashboardTotals;
    return moduleStats.reduce(
      (acc, stat) => ({ count: acc.count + stat.count, views: acc.views + stat.views }),
      { count: 0, views: 0 }
    );
  }, [dashboardLoaded, dashboardTotals, moduleStats]);

  if (!user) {
    return (
      <main className="min-h-dvh px-4 py-16" dir="rtl">
        <div className="mx-auto max-w-md bg-[var(--card-background)] text-[var(--primary-text)] border-[length:var(--border-size)] border-[var(--border-color)] rounded-[var(--corner-radius)] shadow-[var(--shadow-size)] space-y-4 p-7 text-center">
          <h1 className="text-[length:var(--h1-font-size)] text-[var(--h1-font-color)] font-extrabold">ورود ادمین</h1>
          <p className="text-[length:var(--h3-font-size)] text-[var(--h3-font-color)] font-semibold paragraph-color">برای مدیریت محتوا ابتدا وارد شوید.</p>
          <ButtonLink href="/admin/login" className="w-full">رفتن به صفحه ورود</ButtonLink>
        </div>
      </main>
    );
  }

  const dbNumber = (value: number) => (dashboardLoading && !dashboardLoaded ? "…" : formatNumber(value));

  return (
    <main className="min-h-dvh px-4 py-10" dir="rtl">
      <section className="mx-auto max-w-6xl space-y-8">
        <PageHeader colorVar="--admin" title={`سلام، ${user.name}`} titleClassName="text-[var(--admin)]" description={`پنل مدیریت • نقش: ${user.role === "super_admin" ? "مدیر کل" : "ویراستار"}`}>
          <div className="flex flex-wrap gap-2">
            <ButtonLink href="/admin/posts" variant="ghost" size="sm">مدیریت محتوا</ButtonLink>
            {user.role === "super_admin" && <ButtonLink href="/admin/roles" variant="ghost" size="sm">نقش‌ها</ButtonLink>}
            {user.role === "super_admin" && <ButtonLink href="/admin/modules" variant="ghost" size="sm">ماژول‌ها</ButtonLink>}
            {user.role === "super_admin" && <ButtonLink href="/admin/module-names" variant="ghost" size="sm">نام ماژول‌ها</ButtonLink>}
            {user.role === "super_admin" && <ButtonLink href="/admin/consultations" variant="ghost" size="sm">مشاوره‌ها</ButtonLink>}
            {user.role === "super_admin" && <ButtonLink href="/admin/holidays" variant="ghost" size="sm">تعطیلات</ButtonLink>}
            {user.role === "super_admin" && <ButtonLink href="/admin/settings" variant="ghost" size="sm">تنظیمات</ButtonLink>}
            {user.role === "super_admin" && <ButtonLink href="/admin/users" variant="ghost" size="sm">کاربران</ButtonLink>}
            {user.role === "super_admin" && <ButtonLink href="/admin/faq" variant="ghost" size="sm">FAQ</ButtonLink>}
            {user.role === "super_admin" && <ButtonLink href="/admin/design-system" variant="ghost" size="sm">🎨 دیزاین سیستم</ButtonLink>}
            {user.role === "super_admin" && <ButtonLink href="/admin/upload" variant="ghost" size="sm">آپلود Blob</ButtonLink>}
            {user.role === "super_admin" && <ButtonLink href="/admin/blob" variant="ghost" size="sm">فایل‌های Blob</ButtonLink>}
            {user.role === "super_admin" && <ButtonLink href="/admin/content-health" variant="ghost" size="sm">سلامت محتوا</ButtonLink>}
            {user.role === "super_admin" && <ButtonLink href="/admin/redirects" variant="ghost" size="sm">Redirectها</ButtonLink>}
            {user.role === "super_admin" && <ButtonLink href="/admin/moderation" variant="ghost" size="sm">Moderation</ButtonLink>}
            {user.role === "super_admin" && <ButtonLink href="/admin/newsletter" variant="ghost" size="sm">خبرنامه</ButtonLink>}
            {user.role === "super_admin" && <ButtonLink href="/admin/inbox" variant="ghost" size="sm">صندوق پیام‌ها</ButtonLink>}
            <Button variant="ghost" size="sm" onClick={() => { logout(); setUser(null); router.refresh(); }} className="text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)]">خروج</Button>
          </div>
        </PageHeader>

        <div className="flex flex-wrap gap-1">
          {user.modules.map((module) => (
            <ModuleBadge key={module} module={module as ModuleSlug}>{moduleMeta[module as ModuleSlug]?.titleFa || module}</ModuleBadge>
          ))}
        </div>

        {dashboardError && (
          <div className="rounded-[var(--corner-radius)] border-[length:var(--border-size)] border-[var(--danger)]/40 bg-[var(--danger)]/10 p-4 text-[length:var(--paragraph-font-size)] text-[var(--danger)]">
            آمار داشبورد از دیتابیس دریافت نشد: {dashboardError}. اگر این پیام در Vercel دیده می‌شود، اتصال session یا DATABASE_URL را بررسی کنید.
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-[var(--card-background)] text-[var(--primary-text)] border-[length:var(--border-size)] border-[var(--border-color)] rounded-[var(--corner-radius)] shadow-[var(--shadow-size)] p-4">
            <div className="text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] paragraph-color">ماژول قابل مدیریت</div>
            <div className="mt-1 text-[length:var(--h1-font-size)] text-[var(--h1-font-color)] font-extrabold">{formatNumber(modules.length)}</div>
          </div>
          <div className="bg-[var(--card-background)] text-[var(--primary-text)] border-[length:var(--border-size)] border-[var(--border-color)] rounded-[var(--corner-radius)] shadow-[var(--shadow-size)] p-4">
            <div className="text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] paragraph-color">محتوای قابل مدیریت</div>
            <div className="mt-1 text-[length:var(--h1-font-size)] text-[var(--h1-font-color)] font-extrabold">{dbNumber(totals.count)}</div>
          </div>
          <div className="bg-[var(--card-background)] text-[var(--primary-text)] border-[length:var(--border-size)] border-[var(--border-color)] rounded-[var(--corner-radius)] shadow-[var(--shadow-size)] p-4">
            <div className="text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] paragraph-color">بازدید منبع‌ها</div>
            <div className="mt-1 text-[length:var(--h1-font-size)] text-[var(--h1-font-color)] font-extrabold">{dbNumber(totals.views)}</div>
          </div>
          <div className="bg-[var(--card-background)] text-[var(--primary-text)] border-[length:var(--border-size)] border-[var(--border-color)] rounded-[var(--corner-radius)] shadow-[var(--shadow-size)] p-4">
            <div className="text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] paragraph-color">پیش‌نویس لوکال</div>
            <div className="mt-1 text-[length:var(--h1-font-size)] text-[var(--h1-font-color)] font-extrabold">{formatNumber(drafts.reduce((sum, draft) => sum + draft.count, 0))}</div>
          </div>
        </div>

        {drafts.length > 0 && (
          <div className="bg-[var(--card-background)] text-[var(--primary-text)] border-[length:var(--border-size)] border-[var(--border-color)] rounded-[var(--corner-radius)] shadow-[var(--shadow-size)] p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-[length:var(--h3-font-size)] text-[var(--h3-font-color)] font-semibold">پیش‌نویس‌های لوکال</h2>
              <Badge variant="warning">ذخیره‌شده در مرورگر</Badge>
            </div>
            <div className="flex flex-wrap gap-2 text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)]">
              {drafts.map((draft) => (
                <div key={draft.module} className="rounded-[var(--corner-radius)] border-[length:var(--border-size)] border-[var(--border-color)] bg-[var(--card-background)]/50 p-3">
                  <ModuleBadge module={draft.module}>{moduleMeta[draft.module].titleFa}</ModuleBadge>
                  <div className="mt-2 paragraph-color">{formatNumber(draft.count)} پیش‌نویس</div>
                  {draft.latest && <div className="mt-1 text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] paragraph-color">آخرین: {draft.latest}</div>}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {moduleStats.map(({ module, count, views, latest }) => {
            const meta = moduleMeta[module];
            return (
              <div key={module} className="bg-[var(--card-background)] text-[var(--primary-text)] border-[length:var(--border-size)] border-[var(--border-color)] rounded-[var(--corner-radius)] shadow-[var(--shadow-size)] p-5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className={`text-[length:var(--h2-font-size)] text-[var(--h2-font-color)] font-bold ${meta.color}`}>{meta.titleFa}</div>
                    <div className="mt-1 text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] paragraph-color">/{module}</div>
                  </div>
                  <ModuleBadge module={module}>{dashboardLoading && !dashboardLoaded ? "…" : formatNumber(count)} آیتم</ModuleBadge>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2 text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] paragraph-color">
                  <div className="rounded-[var(--corner-radius)] bg-[var(--card-background)] p-2">بازدید: <b className="text-[var(--primary-text)]">{dbNumber(views)}</b></div>
                  <div className="rounded-[var(--corner-radius)] bg-[var(--card-background)] p-2">آخرین: <b className="text-[var(--primary-text)]">{dashboardLoading && !dashboardLoaded ? "…" : latest || "—"}</b></div>
                </div>
                <div className="mt-4 flex gap-2">
                  <ButtonLink href={`/admin/posts?module=${module}`} variant="ghost" size="xs" className="flex-1 text-center">مدیریت</ButtonLink>
                  <ButtonLink href={`/admin/posts/new?module=${module}`} size="xs" className="flex-1 text-center">جدید +</ButtonLink>
                </div>
              </div>
            );
          })}
        </div>

        {user.role === "super_admin" && (
          <div className="bg-[var(--card-background)] text-[var(--primary-text)] border-[length:var(--border-size)] border-[var(--border-color)] rounded-[var(--corner-radius)] shadow-[var(--shadow-size)] p-5">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3>مدیریت کاربران (مدیر کل)</h3>
              <ButtonLink href="/admin/users" variant="outline" size="sm">ورود به صفحه کاربران</ButtonLink>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
