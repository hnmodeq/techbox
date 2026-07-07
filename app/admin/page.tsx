"use client";
import { useEffect, useMemo, useState } from "react";
import { getCurrentUserClient, logout, type AppUser, canEdit, allUsers } from "@/lib/auth";
import { getModuleItems, moduleMeta, type ModuleSlug } from "@/lib/content";
import { useRouter } from "next/navigation";
import { Button, ButtonLink } from "@/components/ui/button";
import { ModuleBadge } from "@/components/ui/module-badge";
import { Badge } from "@/components/ui/badge";
import PageHeader from "@/components/effects/PageHeader";

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
 <div className="mx-auto max-w-md bg-[var(--card-background)] text-[var(--primary-text)] border-[length:var(--border-size)] border-[var(--border-color)] rounded-[var(--corner-radius)] shadow-[var(--shadow-size)] space-y-4 p-7 text-center">
 <h1 className="text-[length:var(--h1-font-size)] text-[var(--h1-font-color)] font-extrabold ">ورود ادمین</h1>
 <p className="text-[length:var(--h3-font-size)] text-[var(--h3-font-color)] font-semibold paragraph-color">برای مدیریت محتوا ابتدا وارد شوید.</p>
 <ButtonLink href="/admin/login" className="w-full">رفتن به صفحه ورود</ButtonLink>
 <div className="rounded-[var(--corner-radius)] border-[length:var(--border-size)] border-[var(--border-color)] bg-[var(--card-background)]/50 p-3 text-right text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] paragraph-color">
 <b className="text-[var(--primary-text)]">کاربران تست:</b><br/>
 {allUsers.slice(0, 6).map(u => <span key={u.id} className="block"><code>{u.username}</code> – {u.name}</span>)}
 </div>
 </div>
 </main>
 );
 }

 return (
 <main className="min-h-dvh px-4 py-10" dir="rtl">
 <section className="mx-auto max-w-6xl space-y-8">
 <PageHeader colorVar="--admin" title={`سلام، ${user.name}`} titleClassName="text-[var(--admin)]" description={`پنل مدیریت • نقش: ${user.role === "super_admin" ? "مدیر کل" : "ویراستار"}`}>
 <div className="flex flex-wrap gap-2">
 <ButtonLink href="/admin/posts" variant="ghost" size="sm">مدیریت محتوا</ButtonLink>
 {user.role === "super_admin" && <ButtonLink href="/admin/roles" variant="ghost" size="sm">نقش‌ها</ButtonLink>}
 {user.role === "super_admin" && <ButtonLink href="/admin/blob" variant="ghost" size="sm">فایل‌های Blob</ButtonLink>}
 <Button variant="ghost" size="sm" onClick={()=>{logout(); setUser(null); router.refresh();}} className="text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)]">خروج</Button>
 </div>
 </PageHeader>
 <div className="flex flex-wrap gap-1">
 {user.modules.map(m => (
 <ModuleBadge key={m} module={m as ModuleSlug}>{moduleMeta[m as ModuleSlug]?.titleFa || m}</ModuleBadge>
 ))}
 </div>

 <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
 <div className="bg-[var(--card-background)] text-[var(--primary-text)] border-[length:var(--border-size)] border-[var(--border-color)] rounded-[var(--corner-radius)] shadow-[var(--shadow-size)] p-4">
 <div className="text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] paragraph-color">ماژول قابل مدیریت</div>
 <div className="mt-1 text-[length:var(--h1-font-size)] text-[var(--h1-font-color)] font-extrabold ">{modules.length.toLocaleString("fa-IR")}</div>
 </div>
 <div className="bg-[var(--card-background)] text-[var(--primary-text)] border-[length:var(--border-size)] border-[var(--border-color)] rounded-[var(--corner-radius)] shadow-[var(--shadow-size)] p-4">
 <div className="text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] paragraph-color">محتوای قابل مدیریت</div>
 <div className="mt-1 text-[length:var(--h1-font-size)] text-[var(--h1-font-color)] font-extrabold ">{totals.count.toLocaleString("fa-IR")}</div>
 </div>
 <div className="bg-[var(--card-background)] text-[var(--primary-text)] border-[length:var(--border-size)] border-[var(--border-color)] rounded-[var(--corner-radius)] shadow-[var(--shadow-size)] p-4">
 <div className="text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] paragraph-color">بازدید منبع‌ها</div>
 <div className="mt-1 text-[length:var(--h1-font-size)] text-[var(--h1-font-color)] font-extrabold ">{totals.views.toLocaleString("fa-IR")}</div>
 </div>
 <div className="bg-[var(--card-background)] text-[var(--primary-text)] border-[length:var(--border-size)] border-[var(--border-color)] rounded-[var(--corner-radius)] shadow-[var(--shadow-size)] p-4">
 <div className="text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] paragraph-color">پیش‌نویس لوکال</div>
 <div className="mt-1 text-[length:var(--h1-font-size)] text-[var(--h1-font-color)] font-extrabold ">{drafts.reduce((s,d)=>s+d.count,0).toLocaleString("fa-IR")}</div>
 </div>
 </div>

 {drafts.length > 0 && (
 <div className="bg-[var(--card-background)] text-[var(--primary-text)] border-[length:var(--border-size)] border-[var(--border-color)] rounded-[var(--corner-radius)] shadow-[var(--shadow-size)] p-4">
 <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
 <h2 className="text-[length:var(--h3-font-size)] text-[var(--h3-font-color)] font-semibold ">پیش‌نویس‌های لوکال</h2>
 <Badge variant="warning">ذخیره‌شده در مرورگر</Badge>
 </div>
 <div className="flex flex-wrap gap-2 text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)]">
 {drafts.map(d => (
 <div key={d.module} className="rounded-[var(--corner-radius)] border-[length:var(--border-size)] border-[var(--border-color)] bg-[var(--card-background)]/50 p-3">
 <ModuleBadge module={d.module}>{moduleMeta[d.module].titleFa}</ModuleBadge>
 <div className="mt-2 paragraph-color">{d.count.toLocaleString("fa-IR")} پیش‌نویس</div>
 {d.latest && <div className="mt-1 text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] paragraph-color">آخرین: {d.latest}</div>}
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
 <ModuleBadge module={module}>{count.toLocaleString("fa-IR")} آیتم</ModuleBadge>
 </div>
 <div className="mt-4 grid grid-cols-2 gap-2 text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] paragraph-color">
 <div className="rounded-[var(--corner-radius)] bg-[var(--card-background)] p-2">بازدید: <b className="text-[var(--primary-text)]">{views.toLocaleString("fa-IR")}</b></div>
 <div className="rounded-[var(--corner-radius)] bg-[var(--card-background)] p-2">آخرین: <b className="text-[var(--primary-text)]">{latest || "—"}</b></div>
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
 <h3 className="">مدیریت کاربران (مدیر کل)</h3>
 <Badge variant="info">{allUsers.length.toLocaleString("fa-IR")} کاربر</Badge>
 </div>
 <div className="grid gap-2 text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] sm:grid-cols-2">
 {allUsers.map(u => (
 <div key={u.id} className="rounded-[var(--corner-radius)] border-[length:var(--border-size)] border-[var(--border-color)] bg-[var(--card-background)]/50 p-3">
 <div className="flex flex-wrap items-center justify-between gap-2">
 <div>
 <div className=" text-[var(--primary-text)]">{u.name}</div>
 <div className="mt-0.5 font-mono text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] paragraph-color">@{u.username} • {u.email}</div>
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
