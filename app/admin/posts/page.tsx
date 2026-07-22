"use client";
import { useEffect, useState, useMemo, Suspense, useCallback } from "react";
import { getCurrentUserClient, canEdit, type AppUser } from "@/lib/auth";
import { moduleMeta, type ModuleSlug } from "@/lib/content";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Button, ButtonLink } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

import { ModuleBadge } from "@/components/ui/module-badge";

export const dynamic = "force-dynamic";

type DraftSummary = { count: number; latest?: string };
type AdminPost = {
  slug: string;
  module: ModuleSlug;
  title: string;
  excerpt: string;
  category?: string;
  tags: string[];
  date_fa: string;
  author: { name: string };
  views: number;
  likes: number;
  published: boolean;
};

function AdminPostsInner() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState<"all" | "published" | "draft">("all");
  const [items, setItems] = useState<AdminPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [draftSummary, setDraftSummary] = useState<DraftSummary>({ count: 0 });
  const sp = useSearchParams();
  const router = useRouter();
  const initialModule = (sp.get("module") as ModuleSlug) || "blog";
  const [module, setModule] = useState<ModuleSlug>(initialModule);

  useEffect(() => {
    setUser(getCurrentUserClient());
  }, []);
  useEffect(() => {
    const m = sp.get("module") as ModuleSlug | null;
    if (m) {
      setModule(m);
      setCategory("all");
      setQuery("");
      setStatus("all");
    }
  }, [sp]);

  const loadItems = useCallback(async () => {
    setLoading(true);
    setMsg("");
    try {
      const res = await fetch(`/api/posts?module=${encodeURIComponent(module)}&published=all&take=200`, { cache: "no-store", credentials: "include" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "load_failed");
      setItems(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setItems([]);
      setMsg(e?.message || "خطا در دریافت محتوای دیتابیس");
    } finally {
      setLoading(false);
    }
  }, [module]);

  useEffect(() => {
    if (user && canEdit(user, module)) loadItems();
  }, [user, module, loadItems]);

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
    return (Object.keys(moduleMeta) as ModuleSlug[]).filter((m) => canEdit(user, m));
  }, [user]);

  const categories = useMemo(() => Array.from(new Set(items.map((i) => i.category).filter(Boolean))) as string[], [items]);

  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((it) => {
      if (category !== "all" && it.category !== category) return false;
      if (status === "published" && !it.published) return false;
      if (status === "draft" && it.published) return false;
      if (!q) return true;
      return `${it.title} ${it.excerpt} ${it.slug} ${it.category || ""} ${(it.tags || []).join(" ")}`.toLowerCase().includes(q);
    });
  }, [items, query, category, status]);

  const stats = useMemo(() => {
    const views = filteredItems.reduce((s, it) => s + (it.views || 0), 0);
    const likes = filteredItems.reduce((s, it) => s + (it.likes || 0), 0);
    const tagCount = new Set(filteredItems.flatMap((it) => it.tags || [])).size;
    return { views, likes, tagCount };
  }, [filteredItems]);

  const setPublished = async (post: AdminPost, next: boolean) => {
    const res = await fetch("/api/posts", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ module: post.module, slug: post.slug, published: next }),
    });
    setMsg(res.ok ? (next ? "منتشر شد" : "پیش‌نویس شد") : "خطا در تغییر وضعیت انتشار");
    loadItems();
  };

  const deletePost = async (post: AdminPost) => {
    if (!confirm(`حذف «${post.title}»؟`)) return;
    const res = await fetch(`/api/posts?module=${encodeURIComponent(post.module)}&slug=${encodeURIComponent(post.slug)}`, {
      method: "DELETE",
      credentials: "include",
    });
    setMsg(res.ok ? "حذف شد" : "خطا در حذف محتوا");
    loadItems();
  };

  if (!user)
    return (
      <main className="p-10 text-center" dir="rtl">
        <p>
          لطفا ابتدا{" "}
          <Link href="/admin/login" className="text-primary underline">
            وارد شوید
          </Link>
          .
        </p>
      </main>
    );
  if (!canEdit(user, module))
    return (
      <main className="p-10 text-center" dir="rtl">
        <p className="text-destructive">شما دسترسی به ماژول {moduleMeta[module]?.titleFa} ندارید.</p>
        <p className="mt-3 text-sm text-muted-foreground">دسترسی شما: {user.modules.join(", ")}</p>
      </main>
    );

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 space-y-6" dir="rtl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">مدیریت محتوا</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <ModuleBadge module={module}>{moduleMeta[module].titleFa}</ModuleBadge>
            <Badge variant="secondary">{items.length.toLocaleString("fa-IR")} آیتم دیتابیس</Badge>
            {draftSummary.count > 0 && <Badge variant="outline">{draftSummary.count.toLocaleString("fa-IR")} پیش‌نویس لوکال</Badge>}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="ghost" onClick={loadItems}>
            به‌روزرسانی
          </Button>
          <ButtonLink href={`/admin/posts/new?module=${module}`} size="sm">
            مطلب جدید +
          </ButtonLink>
          <ButtonLink href="/admin" variant="ghost" size="sm">
            داشبورد
          </ButtonLink>
        </div>
      </div>

      <Card className="p-4">
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_180px_160px_100px]">
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="جستجو در عنوان، اسلاگ، برچسب…" />
          <Select value={category} onValueChange={(v) => setCategory((v as string) || "all")}>
            <SelectTrigger><SelectValue placeholder="دسته" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">همه دسته‌ها</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={(v) => setStatus(v as any)}>
            <SelectTrigger><SelectValue placeholder="وضعیت" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">همه وضعیت‌ها</SelectItem>
              <SelectItem value="published">منتشرشده</SelectItem>
              <SelectItem value="draft">پیش‌نویس</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="ghost"
            onClick={() => {
              setQuery("");
              setCategory("all");
              setStatus("all");
            }}
          >
            پاک کردن
          </Button>
        </div>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-3"><div className="text-xs text-muted-foreground">نتیجه فیلتر</div><div className="font-bold text-xl">{filteredItems.length.toLocaleString("fa-IR")}</div></Card>
        <Card className="p-3"><div className="text-xs text-muted-foreground">بازدیدها</div><div className="font-bold text-xl">{stats.views.toLocaleString("fa-IR")}</div></Card>
        <Card className="p-3"><div className="text-xs text-muted-foreground">پسندها</div><div className="font-bold text-xl">{stats.likes.toLocaleString("fa-IR")}</div></Card>
        <Card className="p-3"><div className="text-xs text-muted-foreground">برچسب یکتا</div><div className="font-bold text-xl">{stats.tagCount.toLocaleString("fa-IR")}</div></Card>
      </div>

      {msg && <Card className="p-3 text-sm text-muted-foreground">{msg}</Card>}

      <div className="flex flex-wrap gap-2">
        {allowedModules.map((m) => (
          <Button key={m} onClick={() => { setModule(m); router.push(`/admin/posts?module=${m}`); }} variant={m === module ? "secondary" : "ghost"} size="xs">
            {moduleMeta[m].titleFa}
          </Button>
        ))}
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">عنوان</TableHead>
                <TableHead className="text-right">وضعیت</TableHead>
                <TableHead className="text-right hidden md:table-cell">دسته</TableHead>
                <TableHead className="text-right hidden lg:table-cell">تاریخ / نویسنده</TableHead>
                <TableHead className="text-right">آمار</TableHead>
                <TableHead className="text-right">عملیات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} className="p-8 text-center text-muted-foreground">در حال دریافت از دیتابیس…</TableCell></TableRow>
              ) : (
                filteredItems.map((it) => (
                  <TableRow key={it.slug} className="hover:bg-muted/20">
                    <TableCell className="align-top">
                      <div className="font-medium">{it.title}</div>
                      <div className="mt-1 font-mono text-xs text-muted-foreground" dir="ltr">/{it.module}/{it.slug}</div>
                      <div className="mt-2 flex flex-wrap gap-1 lg:hidden">
                        {(it.tags || []).slice(0, 3).map((t) => (
                          <Badge key={t} variant="outline" className="text-[10px]">{t}</Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="align-top">{it.published ? <Badge variant="default">منتشرشده</Badge> : <Badge variant="outline">پیش‌نویس</Badge>}</TableCell>
                    <TableCell className="align-top hidden md:table-cell">{it.category ? <Badge variant="secondary">{it.category}</Badge> : <Badge variant="outline">بدون دسته</Badge>}</TableCell>
                    <TableCell className="align-top hidden lg:table-cell text-xs"><div>{it.date_fa}</div><div className="mt-1 text-muted-foreground">{it.author?.name}</div></TableCell>
                    <TableCell className="align-top text-xs"><div>👁 {it.views.toLocaleString("fa-IR")}</div><div className="mt-1 text-muted-foreground">♥ {it.likes.toLocaleString("fa-IR")}</div></TableCell>
                    <TableCell className="align-top">
                      <div className="flex flex-wrap gap-1">
                        <ButtonLink href={`/${it.module}/${it.slug}`} target="_blank" variant="ghost" size="xs">مشاهده</ButtonLink>
                        <ButtonLink href={`/admin/posts/new?module=${it.module}&edit=${it.slug}`} size="xs">ویرایش</ButtonLink>
                        <Button size="xs" variant="ghost" onClick={() => setPublished(it, !it.published)}>{it.published ? "پیش‌نویس" : "انتشار"}</Button>
                        <Button size="xs" variant="ghost" onClick={() => deletePost(it)} className="text-destructive hover:text-destructive">حذف</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        {filteredItems.length === 0 && !loading && <div className="p-8 text-center text-sm text-muted-foreground">نتیجه‌ای برای فیلتر فعلی پیدا نشد.</div>}
      </Card>

      <p className="text-xs text-muted-foreground">
        کاربر فعلی: <b>{user.name}</b> ({user.role}) – قابل ویرایش:{" "}
        <span className="mr-2 inline-flex flex-wrap gap-1 align-middle">
          {allowedModules.map((m) => (
            <ModuleBadge key={m} module={m}>
              {moduleMeta[m].titleFa}
            </ModuleBadge>
          ))}
        </span>
        {draftSummary.latest && <span className="block mt-2">آخرین پیش‌نویس لوکال این ماژول: {draftSummary.latest}</span>}
      </p>
    </main>
  );
}

export default function AdminPostsPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">در حال بارگذاری...</div>}>
      <AdminPostsInner />
    </Suspense>
  );
}
