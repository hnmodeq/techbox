"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getCurrentUserClient, logout, type AppUser, canEdit, allUsers } from "@/lib/auth";
import { moduleMeta, type ModuleSlug } from "@/lib/content";
import { useRouter } from "next/navigation";
import { Button, ButtonLink } from "@/components/ui/Button";
import { ModuleBadge } from "@/components/ui/ModuleBadge";

export default function AdminPage() {
  const [user, setUser] = useState<AppUser | null>(null);
  const router = useRouter();

  useEffect(() => {
    setUser(getCurrentUserClient());
    const h = () => setUser(getCurrentUserClient());
    window.addEventListener("storage", h);
    return () => window.removeEventListener("storage", h);
  }, []);

  if (!user) {
    return (
      <main className="min-h-dvh px-4 py-16" dir="rtl">
        <div className="mx-auto max-w-md card p-7 text-center space-y-4">
          <h1 className="text-2xl font-black">ورود ادمین</h1>
          <p className="text-sm text-[var(--tb-muted-foreground)]">برای تست سریع یکی را انتخاب کنید:</p>
          <div className="grid gap-2 text-right text-sm">
            <Button onClick={()=>{location.href="/admin/login"}} className="w-full">رفتن به صفحه ورود</Button>
          </div>
          <div className="text-[11px] text-[var(--tb-muted-foreground)] leading-6">
            super_admin: admin<br/>
            blog_editor: sara<br/>
            news_editor: nima<br/>
            media/review: rojina<br/>
            tools/download: atiye<br/>
            shop/forum: nastaran
          </div>
        </div>
      </main>
    );
  }

  const modules = (Object.keys(moduleMeta) as ModuleSlug[]).filter(m => canEdit(user, m));

  return (
    <main className="min-h-dvh px-4 py-10" dir="rtl">
      <section className="mx-auto max-w-5xl space-y-8">
        <header className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-xs text-[var(--tb-muted-foreground)]">پنل مدیریت</p>
            <h1 className="text-2xl font-black">سلام، {user.name}</h1>
            <p className="text-xs text-[var(--tb-muted-foreground)] mt-1">
              نقش: {user.role === "super_admin" ? "مدیر کل" : "ویراستار"}
            </p>
            <div className="mt-2 flex flex-wrap gap-1">
              {user.modules.map(m => (
                <ModuleBadge key={m} module={m as ModuleSlug}>{moduleMeta[m as ModuleSlug]?.titleFa || m}</ModuleBadge>
              ))}
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={()=>{logout(); setUser(null); router.refresh();}} className="text-xs">خروج</Button>
        </header>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {modules.map(m => {
            const meta = moduleMeta[m];
            return (
              <div key={m} className="card p-5">
                <div className={`text-lg font-extrabold ${meta.color}`}>{meta.titleFa}</div>
                <div className="text-xs text-[var(--tb-muted-foreground)] mt-1">/{m}</div>
                <div className="flex gap-2 mt-4">
                  <ButtonLink href={`/admin/posts?module=${m}`} variant="ghost" size="xs" className="flex-1 text-center">مدیریت</ButtonLink>
                  <ButtonLink href={`/admin/posts/new?module=${m}`} size="xs" className="flex-1 text-center">جدید +</ButtonLink>
                </div>
              </div>
            );
          })}
        </div>

        {user.role === "super_admin" && (
          <div className="card p-5">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3 className="font-bold">مدیریت کاربران (مدیر کل)</h3>
              <ModuleBadge module="info">{allUsers.length.toLocaleString("fa-IR")} کاربر</ModuleBadge>
            </div>
            <div className="grid gap-2 text-xs">
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
