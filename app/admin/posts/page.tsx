"use client";
import { useEffect, useState, useMemo, Suspense } from "react";
import { getCurrentUserClient, canEdit, type AppUser } from "@/lib/auth";
import { getModuleItems, moduleMeta, type ModuleSlug, type ContentItem } from "@/lib/content";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Button, ButtonLink } from "@/components/ui/Button";

export const dynamic = "force-dynamic";

function AdminPostsInner() {
  const [user, setUser] = useState<AppUser | null>(null);
  const sp = useSearchParams();
  const router = useRouter();
  const initialModule = (sp.get("module") as ModuleSlug) || "blog";
  const [module, setModule] = useState<ModuleSlug>(initialModule);

  useEffect(() => { setUser(getCurrentUserClient()); }, []);
  useEffect(() => {
    const m = sp.get("module") as ModuleSlug | null;
    if (m) setModule(m);
  }, [sp]);

  const allowedModules = useMemo(() => {
    if (!user) return [];
    return (Object.keys(moduleMeta) as ModuleSlug[]).filter(m => canEdit(user, m));
  }, [user]);

  const items: ContentItem[] = useMemo(() => {
    try { return getModuleItems(module); } catch { return []; }
  }, [module]);

  if (!user) {
    return <main className="p-10 text-center" dir="rtl"><p>لطفا ابتدا <Link href="/admin/login" className="text-brand underline">وارد شوید</Link>.</p></main>;
  }

  if (!canEdit(user, module)) {
    return <main className="p-10 text-center" dir="rtl"><p className="text-[var(--tb-danger)]">شما دسترسی به ماژول {moduleMeta[module]?.titleFa} ندارید.</p><p className="text-xs mt-3">دسترسی شما: {user.modules.join(", ")}</p></main>;
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-10" dir="rtl">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl font-black">مدیریت محتوا</h1>
        <ButtonLink href={`/admin/posts/new?module=${module}`} size="sm">+ مطلب جدید</ButtonLink>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
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
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-[11px] text-muted-foreground">
            <tr>
              <th className="text-right p-3">عنوان</th>
              <th className="text-right p-3 hidden sm:table-cell">تاریخ</th>
              <th className="text-right p-3 hidden md:table-cell">نویسنده</th>
              <th className="text-right p-3">بازدید</th>
              <th className="text-right p-3">عملیات</th>
            </tr>
          </thead>
          <tbody>
            {items.map(it => (
              <tr key={it.slug} className="border-t border-[color-mix(in_oklch,var(--tb-border)_60%,transparent)] hover:bg-[var(--tb-muted)]/20">
                <td className="p-3">
                  <div className="font-semibold">{it.title}</div>
                  <div className="text-[11px] text-muted-foreground">{it.slug}</div>
                </td>
                <td className="p-3 hidden sm:table-cell text-xs">{it.date_fa}</td>
                <td className="p-3 hidden md:table-cell text-xs">{it.author.name}</td>
                <td className="p-3 text-xs">{it.views.toLocaleString("fa-IR")}</td>
                <td className="p-3">
                  <div className="flex gap-2 text-[11px]">
                    <Link href={`/${module}/${it.slug}`} target="_blank" className="hover:text-brand">مشاهده</Link>
                    <Link href={`/admin/posts/new?module=${module}&edit=${it.slug}`} className="hover:text-brand">ویرایش</Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {items.length===0 && <div className="p-8 text-center text-muted-foreground text-sm">محتوایی نیست</div>}
      </div>

      <p className="text-[11px] text-muted-foreground mt-4">
        کاربر فعلی: <b>{user.name}</b> ({user.role}) – قابل ویرایش: {allowedModules.map(m=>moduleMeta[m].titleFa).join("، ")}
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
