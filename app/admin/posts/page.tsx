"use client";
import { useEffect, useState, useMemo, Suspense } from "react";
import { getCurrentUserClient, canEdit, type AppUser } from "@/lib/auth";
import { getModuleItems, moduleMeta, type ModuleSlug, type ContentItem } from "@/lib/content";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Button, ButtonLink } from "@/components/ui/Button";
import { ModuleBadge } from "@/components/ui/ModuleBadge";
import { Badge } from "@/components/ui/Badge";

export const dynamic = "force-dynamic";

type DraftSummary = { count: number; latest?: string };

function AdminPostsInner() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [draftSummary, setDraftSummary] = useState<DraftSummary>({ count: 0 });
  const sp = useSearchParams();
  const router = useRouter();
  const initialModule = (sp.get("module") as ModuleSlug) || "blog";
  const [module, setModule] = useState<ModuleSlug>(initialModule);

  useEffect(() => { setUser(getCurrentUserClient()); }, []);
  useEffect(() => {
    const m = sp.get("module") as ModuleSlug | null;
    if (m) {
      setModule(m);
      setCategory("all");
      setQuery("");
    }
  }, [sp]);

  useEffect(() => {
    try {
      const drafts = JSON.parse(localStorage.getItem(`tb_drafts_${module}`) || "[]") as Array<{ savedAtFa?: string }>;
      setDraftSummary({ count: drafts.length, latest: drafts[0]?.savedAtFa });
    } catch {
      setDraftSummary({ count: 0 });
    }
  }, [module]);

  const allowedModules = useMemo(() => {
    if (!user) return [];
    return (Object.keys(moduleMeta) as ModuleSlug[]).filter(m => canEdit(user, m));
  }, [user]);

  const items: ContentItem[] = useMemo(() => {
    try { return getModuleItems(module); } catch { return []; }
  }, [module]);

  const categories = useMemo(() => {
    return Array.from(new Set(items.map(i => i.category).filter(Boolean))) as string[];
  }, [items]);

  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter(it => {
      if (category !== "all" && it.category !== category) return false;
      if (!q) return true;
      return `${it.title} ${it.excerpt} ${it.slug} ${it.category || ""} ${it.tags.join(" ")}`.toLowerCase().includes(q);
    });
  }, [items, query, category]);

  const stats = useMemo(() => {
    const views = filteredItems.reduce((s, it) => s + it.views, 0);
    const likes = filteredItems.reduce((s, it) => s + it.likes, 0);
    const tagCount = new Set(filteredItems.flatMap(it => it.tags)).size;
    return { views, likes, tagCount };
  }, [filteredItems]);

  if (!user) {
    return <main className="p-10 text-center" dir="rtl"><p>لطفا ابتدا <Link href="/admin/login" className="text-[var(--tb-brand)] underline">وارد شوید</Link>.</p></main>;
  }

  if (!canEdit(user, module)) {
    return <main className="p-10 text-center" dir="rtl"><p className="text-[var(--tb-danger)]">شما دسترسی به ماژول {moduleMeta[module]?.titleFa} ندارید.</p><p className="mt-3 text-xs text-[var(--tb-muted-foreground)]">دسترسی شما: {user.modules.join(", ")}</p></main>;
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10" dir="rtl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black">مدیریت محتوا</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <ModuleBadge module={module}>{moduleMeta[module].titleFa}</ModuleBadge>
            <Badge variant="secondary">{items.length.toLocaleString("fa-IR")} آیتم منبع</Badge>
            {draftSummary.count > 0 && <Badge variant="warning">{draftSummary.count.toLocaleString("fa-IR")} پیش‌نویس لوکال</Badge>}
          </div>
        </div>
        <ButtonLink href={`/admin/posts/new?module=${module}`} size="sm">+ مطلب جدید</ButtonLink>
      </div>

      <div className="mb-5 grid gap-3 rounded-[var(--tb-radius-xl)] border border-[var(--tb-border)] bg-[var(--tb-surface-1)]/50 p-4 md:grid-cols-[minmax(0,1fr)_180px]">
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="input"
          placeholder="جستجو در عنوان، اسلاگ، دسته یا برچسب‌ها…"
        />
        <select value={category} onChange={e => setCategory(e.target.value)} className="input">
          <option value="all">همه دسته‌ها</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card p-3">
          <div className="text-[10px] text-[var(--tb-muted-foreground)]">نتیجه فعلی</div>
          <div className="mt-1 text-xl font-black">{filteredItems.length.toLocaleString("fa-IR")}</div>
        </div>
        <div className="card p-3">
          <div className="text-[10px] text-[var(--tb-muted-foreground)]">بازدیدها</div>
          <div className="mt-1 text-xl font-black">{stats.views.toLocaleString("fa-IR")}</div>
        </div>
        <div className="card p-3">
          <div className="text-[10px] text-[var(--tb-muted-foreground)]">پسندها</div>
          <div className="mt-1 text-xl font-black">{stats.likes.toLocaleString("fa-IR")}</div>
        </div>
        <div className="card p-3">
          <div className="text-[10px] text-[var(--tb-muted-foreground)]">برچسب یکتا</div>
          <div className="mt-1 text-xl font-black">{stats.tagCount.toLocaleString("fa-IR")}</div>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {allowedModules.map(m => (
          <Button
            key={m}
            onClick={()=>{ setModule(m); router.push(`/admin/posts?module=${m}`); }}
            variant={m===module ? "primary" : "ghost"}
            size="xs"
          >
            {moduleMeta[m].titleFa}
          </Button>
        ))}
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="bg-[var(--tb-muted)]/40 text-[11px] text-[var(--tb-muted-foreground)]">
              <tr>
                <th className="p-3 text-right">عنوان</th>
                <th className="hidden p-3 text-right md:table-cell">دسته</th>
                <th className="hidden p-3 text-right lg:table-cell">تاریخ / نویسنده</th>
                <th className="p-3 text-right">آمار</th>
                <th className="p-3 text-right">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map(it => (
                <tr key={it.slug} className="border-t border-[color-mix(in_oklch,var(--tb-border)_60%,transparent)] hover:bg-[var(--tb-muted)]/20">
                  <td className="p-3 align-top">
                    <div className="font-semibold leading-6">{it.title}</div>
                    <div className="mt-1 font-mono text-[11px] text-[var(--tb-muted-foreground)]" dir="ltr">/{module}/{it.slug}</div>
                    <div className="mt-2 flex flex-wrap gap-1 lg:hidden">
                      {it.tags.slice(0, 3).map(t => <span key={t} className="rounded-[var(--tb-radius-full)] border border-[var(--tb-border)] bg-transparent px-2 py-0.5 text-[10px] text-[var(--tb-muted-foreground)]">{t}</span>)}
                    </div>
                  </td>
                  <td className="hidden p-3 align-top md:table-cell">
                    {it.category ? <Badge variant={module}>{it.category}</Badge> : <Badge variant="secondary">بدون دسته</Badge>}
                  </td>
                  <td className="hidden p-3 align-top text-xs lg:table-cell">
                    <div>{it.date_fa}</div>
                    <div className="mt-1 text-[var(--tb-muted-foreground)]">{it.author.name}</div>
                  </td>
                  <td className="p-3 align-top text-xs">
                    <div>👁 {it.views.toLocaleString("fa-IR")}</div>
                    <div className="mt-1 text-[var(--tb-muted-foreground)]">♥ {it.likes.toLocaleString("fa-IR")}</div>
                  </td>
                  <td className="p-3 align-top">
                    <div className="flex flex-wrap gap-2">
                      <ButtonLink href={`/${module}/${it.slug}`} target="_blank" variant="ghost" size="xs">مشاهده</ButtonLink>
                      <ButtonLink href={`/admin/posts/new?module=${module}&edit=${it.slug}`} size="xs">ویرایش</ButtonLink>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredItems.length===0 && (
          <div className="p-8 text-center text-sm text-[var(--tb-muted-foreground)]">
            نتیجه‌ای برای فیلتر فعلی پیدا نشد.
            <div className="mt-3"><Button variant="ghost" size="xs" onClick={()=>{setQuery(""); setCategory("all");}}>پاک کردن فیلترها</Button></div>
          </div>
        )}
      </div>

      <p className="mt-4 text-[11px] text-[var(--tb-muted-foreground)]">
        کاربر فعلی: <b>{user.name}</b> ({user.role}) – قابل ویرایش:
        <span className="mr-2 inline-flex flex-wrap gap-1 align-middle">{allowedModules.map(m=><ModuleBadge key={m} module={m}>{moduleMeta[m].titleFa}</ModuleBadge>)}</span>
        {draftSummary.latest && <span className="block mt-2">آخرین پیش‌نویس لوکال این ماژول: {draftSummary.latest}</span>}
      </p>
    </main>
  );
}

export default function AdminPostsPage(){
  return (
    <Suspense fallback={<div className="p-10 text-center">در حال بارگذاری...</div>}>
      <AdminPostsInner />
    </Suspense>
  );
}
