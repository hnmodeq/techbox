"use client";
import { useEffect, useMemo, useState, Suspense } from "react";
import { moduleMeta, type ModuleSlug, getBySlug } from "@/lib/content";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button, ButtonLink } from "@/components/ui/Button";
import { getCurrentUserClient } from "@/lib/auth";
import { ModuleBadge } from "@/components/ui/ModuleBadge";

export const dynamic = "force-dynamic";

async function getMe(){
  try{
    const r = await fetch("/api/auth/me", {cache:"no-store"});
    const j = await r.json();
    return j.user || getCurrentUserClient();
  }catch{
    return getCurrentUserClient();
  }
}

function slugify(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^\w\u0600-\u06FF]+/g,"-")
    .replace(/^-|-$/g,"")
    .slice(0, 90);
}

const categoryHints: Record<ModuleSlug, string[]> = {
  blog: ["امنیت", "شبکه", "ذخیره‌سازی", "مجازی‌سازی", "مانیتورینگ"],
  news: ["زیرساخت", "امنیت", "شبکه", "سخت‌افزار", "هوش مصنوعی"],
  media: ["آموزش ویدیویی", "بررسی ویدیویی", "پادکست", "دموی عملی"],
  review: ["سرور", "شبکه", "ذخیره‌سازی", "امنیت", "برق و رک"],
  tools: ["شبکه", "ذخیره‌سازی", "ابزار"],
  download: ["سیستم‌عامل", "فریم‌ور", "درایور", "ابزار", "مانیتورینگ"],
  shop: ["سرور", "شبکه", "NAS", "امنیت", "برق و رک"],
  forum: ["پرسش", "شبکه", "امنیت", "بکاپ", "مانیتورینگ"],
};

function NewPostInner() {
  const sp = useSearchParams();
  const router = useRouter();
  const modParam = (sp.get("module") as ModuleSlug) || "blog";
  const editSlug = sp.get("edit");
  const [user, setUser] = useState<any>(null);
  const [module, setModule] = useState<ModuleSlug>(modParam);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState("");
  const [saving,setSaving] = useState(false);
  const [msg,setMsg] = useState("");
  const [lastDraftKey, setLastDraftKey] = useState("");

  useEffect(()=>{ getMe().then(setUser); },[]);
  useEffect(()=>{
    if (editSlug) {
      const it = getBySlug(module, editSlug);
      if (it) {
        setTitle(it.title);
        setSlug(it.slug);
        setExcerpt(it.excerpt);
        setCategory(it.category || "");
        setTags(it.tags.join(", "));
        setContent(it.content || "");
        setImage(it.image||"");
      }
    }
  }, [editSlug, module]);

  const parsedTags = useMemo(() => tags.split(",").map(t=>t.trim()).filter(Boolean), [tags]);
  const resolvedSlug = slug.trim() || slugify(title);

  if (!user) return <main className="p-10 text-center" dir="rtl">ابتدا <Link className="text-[var(--tb-brand)] underline" href="/admin/login">وارد شوید</Link></main>;

  const canEdit = user.role==="super_admin" || (user.modules||[]).includes(module);
  if (!canEdit) return <main className="p-10 text-center text-[var(--tb-danger)]" dir="rtl">دسترسی به ماژول {moduleMeta[module]?.titleFa} ندارید.</main>;

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { setMsg("عنوان الزامی است"); return; }
    setSaving(true); setMsg(""); setLastDraftKey("");
    const payload = {
      module,
      slug: resolvedSlug,
      title: title.trim(),
      excerpt: excerpt.trim(),
      content: content.trim(),
      image: image.trim() || undefined,
      tags: parsedTags,
      category: category.trim() || undefined,
    };
    try{
      const res = await fetch("/api/posts", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify(payload),
        credentials:"include"
      });
      const data = await res.json();
      if(!res.ok) throw new Error(data.error || "save_failed");
      setMsg("منتشر شد ✓ در حال انتقال به لیست محتوا…");
      setTimeout(()=> router.push(`/admin/posts?module=${module}`), 650);
    }catch(err:any){
      // fallback local draft – keeps admin usable offline
      const key = `tb_drafts_${module}`;
      const drafts = JSON.parse(localStorage.getItem(key) || "[]");
      const draft = {
        ...payload,
        savedAt: new Date().toISOString(),
        savedAtFa: new Intl.DateTimeFormat("fa-IR", { dateStyle:"medium", timeStyle:"short" }).format(new Date()),
        apiError: err.message,
      };
      drafts.unshift(draft);
      localStorage.setItem(key, JSON.stringify(drafts.slice(0, 30)));
      setLastDraftKey(key);
      setMsg("API در دسترس نبود؛ پیش‌نویس امن در مرورگر ذخیره شد.");
    }finally{ setSaving(false); }
  };

  const allowed: ModuleSlug[] = user.role==="super_admin" ? Object.keys(moduleMeta) as ModuleSlug[] : (user.modules||[]);
  const isSuccess = msg.includes("✓");
  const isDraft = msg.includes("پیش‌نویس");
  const statusClass = isSuccess ? "text-[var(--tb-success)]" : isDraft ? "text-[var(--tb-warning)]" : "text-[var(--tb-muted-foreground)]";
  
  return (
    <main className="mx-auto max-w-5xl px-4 py-10" dir="rtl">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <ModuleBadge module={module}>{moduleMeta[module].titleFa}</ModuleBadge>
            {editSlug && <ModuleBadge module="warning">حالت ویرایش</ModuleBadge>}
          </div>
          <h1 className="text-2xl font-black">{editSlug ? "ویرایش مطلب" : "مطلب جدید"}</h1>
          <p className="mt-1 text-[11px] text-[var(--tb-muted-foreground)]">{user.name} • {user.role==="super_admin"?"مدیر کل":"ویراستار"}</p>
        </div>
        <ButtonLink href={`/admin/posts?module=${module}`} variant="ghost" size="xs">بازگشت به مدیریت محتوا</ButtonLink>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
        <form onSubmit={save} className="card space-y-4 p-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-[11px] text-[var(--tb-muted-foreground)]">ماژول *</label>
              <select value={module} onChange={e=>setModule(e.target.value as ModuleSlug)} className="input mt-1" required>
                {allowed.map(m => <option key={m} value={m}>{moduleMeta[m].titleFa} – /{m}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[11px] text-[var(--tb-muted-foreground)]">دسته‌بندی</label>
              <input value={category} onChange={e=>setCategory(e.target.value)} list="category-hints" className="input mt-1" placeholder="مثلا امنیت، شبکه، فریم‌ور…" />
              <datalist id="category-hints">
                {categoryHints[module].map(c => <option key={c} value={c} />)}
              </datalist>
            </div>
          </div>

          <div>
            <label className="text-[11px] text-[var(--tb-muted-foreground)]">عنوان *</label>
            <input value={title} onChange={e=>setTitle(e.target.value)} className="input mt-1" required />
          </div>

          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
            <div>
              <label className="text-[11px] text-[var(--tb-muted-foreground)]">اسلاگ</label>
              <input value={slug} onChange={e=>setSlug(e.target.value)} className="input mt-1" placeholder="auto از عنوان" dir="ltr" />
            </div>
            <Button type="button" variant="ghost" size="xs" onClick={()=>setSlug(slugify(title))} disabled={!title.trim()}>
              ساخت اسلاگ
            </Button>
          </div>

          <div>
            <label className="text-[11px] text-[var(--tb-muted-foreground)]">خلاصه</label>
            <textarea value={excerpt} onChange={e=>setExcerpt(e.target.value)} className="input mt-1 min-h-[80px]" placeholder="خلاصه کوتاه برای کارت‌ها، فیدها و سئو…" />
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <div className="md:col-span-2">
              <label className="text-[11px] text-[var(--tb-muted-foreground)]">برچسب‌ها – با , جدا کنید</label>
              <input value={tags} onChange={e=>setTags(e.target.value)} className="input mt-1" placeholder="QNAP-2277, nas, storage" />
            </div>
            <div>
              <label className="text-[11px] text-[var(--tb-muted-foreground)]">تصویر شاخص URL</label>
              <input value={image} onChange={e=>setImage(e.target.value)} className="input mt-1" placeholder="/assets/..." dir="ltr" />
            </div>
          </div>

          <div>
            <label className="text-[11px] text-[var(--tb-muted-foreground)]">محتوا</label>
            <textarea value={content} onChange={e=>setContent(e.target.value)} className="input mt-1 min-h-[260px]" placeholder="متن کامل / HTML / Markdown…" />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className={`text-[11px] ${statusClass}`}>
              {msg || "POST → /api/posts – RBAC server-side؛ در خطا، پیش‌نویس لوکال ذخیره می‌شود."}
              {lastDraftKey && <span className="block text-[10px] text-[var(--tb-muted-foreground)]">کلید پیش‌نویس: <code>{lastDraftKey}</code></span>}
            </div>
            <div className="flex gap-2">
              <ButtonLink href={`/admin/posts?module=${module}`} variant="ghost" size="xs">انصراف</ButtonLink>
              <Button size="xs" disabled={saving || !title.trim()} type="submit">{saving ? "در حال ذخیره…" : (editSlug ? "ذخیره تغییرات" : "انتشار در تکباکس")}</Button>
            </div>
          </div>
        </form>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="card p-4">
            <h2 className="text-[13px] font-black">پیش‌نمایش منبع</h2>
            <div className="mt-3 space-y-2 text-[11px] text-[var(--tb-muted-foreground)]">
              <div>مسیر: <code dir="ltr">/{module}/{resolvedSlug || "slug"}</code></div>
              <div>دسته: {category || "—"}</div>
              <div>برچسب‌ها: {parsedTags.length.toLocaleString("fa-IR")}</div>
              <div>خلاصه: {excerpt.length.toLocaleString("fa-IR")} کاراکتر</div>
              <div>محتوا: {content.length.toLocaleString("fa-IR")} کاراکتر</div>
            </div>
            <div className="mt-3 flex flex-wrap gap-1">
              {parsedTags.slice(0, 8).map(t => <span key={t} className="rounded-[var(--tb-radius-full)] border border-[var(--tb-border)] px-2 py-0.5 text-[10px] text-[var(--tb-muted-foreground)]">{t}</span>)}
              {parsedTags.length > 8 && <ModuleBadge module="info">+{(parsedTags.length-8).toLocaleString("fa-IR")}</ModuleBadge>}
            </div>
          </div>

          <div className="card p-4 text-[11px] leading-6 text-[var(--tb-muted-foreground)]">
            <b className="text-[var(--tb-foreground)]">راهنمای CMS</b><br/>
            • اسلاگ اگر خالی باشد از عنوان ساخته می‌شود.<br/>
            • دسته‌بندی اختیاری است ولی برای فیلتر و جدول مفید است.<br/>
            • برچسب‌های فارسی/انگلیسی باعث بهتر شدن جستجو و مطالب مرتبط می‌شوند.<br/>
            • اگر API/Prisma آماده نباشد، پیش‌نویس در مرورگر ذخیره می‌شود.
          </div>
        </aside>
      </div>

      <p className="mt-3 text-center text-[10px] text-[var(--tb-muted-foreground)]">
        دسترسی شما:
        <span className="mx-1 inline-flex flex-wrap justify-center gap-1 align-middle">{allowed.map(m=><ModuleBadge key={m} module={m}>{moduleMeta[m]?.titleFa}</ModuleBadge>)}</span>
        – نقش توسط مدیر کل در <Link href="/admin/roles" className="text-[var(--tb-brand)] underline">/admin/roles</Link> قابل تغییر است.
      </p>
    </main>
  );
}

export default function NewPostPage(){
  return (
    <Suspense fallback={<div className="p-10 text-center">در حال بارگذاری…</div>}>
      <NewPostInner />
    </Suspense>
  );
}
