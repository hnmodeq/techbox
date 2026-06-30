"use client";
import { useEffect, useMemo, useState } from "react";
import { getCurrentUserClient, logout, type AppUser, canEdit, allUsers } from "@/lib/auth";
import { getModuleItems, moduleMeta, type ModuleSlug } from "@/lib/content";
import { useRouter } from "next/navigation";
import { Button, ButtonLink } from "@/components/ui/Button";
import { ModuleBadge } from "@/components/ui/ModuleBadge";
import { Badge } from "@/components/ui/Badge";

const moduleOrder = Object.keys(moduleMeta) as ModuleSlug[];

type DraftInfo = { module: ModuleSlug; count: number; latest?: string };

export default function AdminPage() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [drafts, setDrafts] = useState<DraftInfo[]>([]);
  const router = useRouter();

  useEffect(() => {
    setUser(getCurrentUserClient());
    const h = () => setUser(getCurrentUserClient());
    window.addEventListener("storage", h);
    return () => window.removeEventListener("storage", h);
  }, []);

  useEffect(() => {
    if (!user) return;
    const items = moduleOrder.map(module => {
      try {
        const saved = JSON.parse(localStorage.getItem(`tb_drafts_${module}`) || "[]") as Array<{ savedAtFa?: string }>;
        return { module, count: saved.length, latest: saved[0]?.savedAtFa };
      } catch {
        return { module, count: 0 };
      }
    }).filter(x => x.count > 0);
    setDrafts(items);
  }, [user]);

  const modules = useMemo(() => {
    if (!user) return [];
    return moduleOrder.filter(m => canEdit(user, m));
  }, [user]);

  const moduleStats = useMemo(() => {
    return modules.map(module => {
      const items = getModuleItems(module);
      const views = items.reduce((sum, item) => sum + item.views, 0);
      const latest = items[0]?.date_fa;
      return { module, items, count: items.length, views, latest };
    });
  }, [modules]);

  const totals = useMemo(() => {
    return moduleStats.reduce(
      (acc, stat) => ({ count: acc.count + stat.count, views: acc.views + stat.views }),
      { count: 0, views: 0 }
    );
  }, [moduleStats]);

  if (!user) {
    return (
      <main className="min-h-dvh px-4 py-16" dir="rtl">
        <div className="mx-auto max-w-md card space-y-4 p-7 text-center">
          <h1 className="text-2xl font-black">ورود ادمین</h1>
          <p className="text-sm text-[var(--tb-muted-foreground)]">برای مدیریت محتوا ابتدا وارد شوید.</p>
          <ButtonLink href="/admin/login" className="w-full">رفتن به صفحه ورود</ButtonLink>
          <div className="rounded-[var(--tb-radius-lg)] border border-[var(--tb-border)] bg-[var(--tb-surface-1)]/50 p-3 text-right text-[11px] leading-6 text-[var(--tb-muted-foreground)]">
            <b className="text-[var(--tb-foreground)]">کاربران تست:</b><br/>
            {allUsers.slice(0, 6).map(u => <span key={u.id} className="block"><code>{u.username}</code> – {u.name}</span>)}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-dvh px-4 py-10" dir="rtl">
      <section className="mx-auto max-w-6xl space-y-8">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs text-[var(--tb-muted-foreground)]">پنل مدیریت</p>
            <h1 className="text-2xl font-black">سلام، {user.name}</h1>
            <p className="mt-1 text-xs text-[var(--tb-muted-foreground)]">
              نقش: {user.role === "super_admin" ? "مدیر کل" : "ویراستار"}
            </p>
            <div className="mt-2 flex flex-wrap gap-1">
              {user.modules.map(m => (
                <ModuleBadge key={m} module={m as ModuleSlug}>{moduleMeta[m as ModuleSlug]?.titleFa || m}</ModuleBadge>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <ButtonLink href="/admin/posts" variant="ghost" size="sm">مدیریت محتوا</ButtonLink>
            {user.role === "super_admin" && <ButtonLink href="/admin/roles" variant="ghost" size="sm">نقش‌ها</ButtonLink>}
            <Button variant="ghost" size="sm" onClick={()=>{logout(); setUser(null); router.refresh();}} className="text-xs">خروج</Button>
          </div>
        </header>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="card p-4">
            <div className="text-[10px] text-[var(--tb-muted-foreground)]">ماژول قابل مدیریت</div>
            <div className="mt-1 text-2xl font-black">{modules.length.toLocaleString("fa-IR")}</div>
          </div>
          <div className="card p-4">
            <div className="text-[10px] text-[var(--tb-muted-foreground)]">محتوای قابل مدیریت</div>
            <div className="mt-1 text-2xl font-black">{totals.count.toLocaleString("fa-IR")}</div>
          </div>
          <div className="card p-4">
            <div className="text-[10px] text-[var(--tb-muted-foreground)]">بازدید منبع‌ها</div>
            <div className="mt-1 text-2xl font-black">{totals.views.toLocaleString("fa-IR")}</div>
          </div>
          <div className="card p-4">
            <div className="text-[10px] text-[var(--tb-muted-foreground)]">پیش‌نویس لوکال</div>
            <div className="mt-1 text-2xl font-black">{drafts.reduce((s,d)=>s+d.count,0).toLocaleString("fa-IR")}</div>
          </div>
        </div>

        {drafts.length > 0 && (
          <div className="card p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-[14px] font-black">پیش‌نویس‌های لوکال</h2>
              <Badge variant="warning">ذخیره‌شده در مرورگر</Badge>
            </div>
            <div className="flex flex-wrap gap-2 text-[11px]">
              {drafts.map(d => (
                <div key={d.module} className="rounded-[var(--tb-radius-lg)] border border-[var(--tb-border)] bg-[var(--tb-surface-1)]/50 p-3">
                  <ModuleBadge module={d.module}>{moduleMeta[d.module].titleFa}</ModuleBadge>
                  <div className="mt-2 text-[var(--tb-muted-foreground)]">{d.count.toLocaleString("fa-IR")} پیش‌نویس</div>
                  {d.latest && <div className="mt-1 text-[10px] text-[var(--tb-muted-foreground)]">آخرین: {d.latest}</div>}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {moduleStats.map(({ module, count, views, latest }) => {
            const meta = moduleMeta[module];
            return (
              <div key={module} className="card p-5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className={`text-lg font-extrabold ${meta.color}`}>{meta.titleFa}</div>
                    <div className="mt-1 text-xs text-[var(--tb-muted-foreground)]">/{module}</div>
                  </div>
                  <ModuleBadge module={module}>{count.toLocaleString("fa-IR")} آیتم</ModuleBadge>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2 text-[11px] text-[var(--tb-muted-foreground)]">
                  <div className="rounded-[var(--tb-radius-md)] bg-[var(--tb-surface-1)] p-2">بازدید: <b className="text-[var(--tb-foreground)]">{views.toLocaleString("fa-IR")}</b></div>
                  <div className="rounded-[var(--tb-radius-md)] bg-[var(--tb-surface-1)] p-2">آخرین: <b className="text-[var(--tb-foreground)]">{latest || "—"}</b></div>
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
          <div className="card p-5">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3 className="font-bold">مدیریت کاربران (مدیر کل)</h3>
              <Badge variant="info">{allUsers.length.toLocaleString("fa-IR")} کاربر</Badge>
            </div>
            <div className="grid gap-2 text-xs sm:grid-cols-2">
              {allUsers.map(u => (
                <div key={u.id} className="rounded-[var(--tb-radius-lg)] border border-[var(--tb-border)] bg-[var(--tb-surface-1)]/50 p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <div className="font-bold text-[var(--tb-foreground)]">{u.name}</div>
                      <div className="mt-0.5 font-mono text-[10px] text-[var(--tb-muted-foreground)]">@{u.username} • {u.email}</div>
                    </div>
                    <ModuleBadge module={u.role === "super_admin" ? "vip" : "info"}>{u.role === "super_admin" ? "مدیر کل" : "ویراستار"}</ModuleBadge>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {u.modules.map(m => <ModuleBadge key={m} module={m as ModuleSlug}>{moduleMeta[m as ModuleSlug]?.titleFa || m}</ModuleBadge>)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
