"use client";
import { useEffect, useState, Suspense } from "react";
import { moduleMeta, type ModuleSlug, getBySlug } from "@/lib/content";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button, ButtonLink } from "@/components/ui/Button";
import { ModuleBadge } from "@/components/ui/ModuleBadge";

export const dynamic = "force-dynamic";

async function getMe(){
  try{ const r = await fetch("/api/auth/me", {cache:"no-store"}); const j = await r.json(); return j.user; }catch{ return null; }
}

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
  const [tags, setTags] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState("");
  const [saving,setSaving] = useState(false);
  const [msg,setMsg] = useState("");

  useEffect(()=>{ getMe().then(setUser); },[]);
  useEffect(()=>{
    if (editSlug) {
      const it = getBySlug(module, editSlug);
      if (it) {
        setTitle(it.title); setSlug(it.slug); setExcerpt(it.excerpt);
        setTags(it.tags.join(", ")); setContent(it.content || ""); setImage(it.image||"");
      }
    }
  }, [editSlug, module]);

  if (!user) return <main className="p-10 text-center" dir="rtl">ابتدا <Link className="text-[var(--tb-brand)] underline" href="/admin/login">وارد شوید</Link></main>;

  const canEdit = user.role==="super_admin" || (user.modules||[]).includes(module);
  if (!canEdit) return <main className="p-10 text-center text-[var(--tb-danger)]" dir="rtl">دسترسی به ماژول {moduleMeta[module]?.titleFa} ندارید.</main>;

  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setMsg("");
    try{
      const payload = {
        module,
        slug: slug || title.toLowerCase().replace(/[^\w\u0600-\u06FF]+/g,"-").replace(/^-|-$/g,""),
        title: title.trim(),
        excerpt: excerpt.trim(),
        content,
        image: image || undefined,
        tags: tags.split(",").map(t=>t.trim()).filter(Boolean),
        category: undefined,
      };
      const res = await fetch("/api/posts", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify(payload),
        credentials:"include"
      });
      const data = await res.json();
      if(!res.ok) throw new Error(data.error || "save_failed");
      setMsg("منتشر شد ✓");
      setTimeout(()=> router.push(`/admin/posts?module=${module}`), 600);
    }catch(err:any){
      // fallback local draft – keeps admin usable offline
      const key = `tb_drafts_${module}`;
      const drafts = JSON.parse(localStorage.getItem(key) || "[]");
      drafts.push({ slug, title, excerpt, content, tags: tags.split(",").map(t=>t.trim()) });
      localStorage.setItem(key, JSON.stringify(drafts));
      setMsg("ذخیره لوکال شد (API خطا: "+err.message+")");
    }finally{ setSaving(false); }
  };

  const allowed: ModuleSlug[] = user.role==="super_admin" ? Object.keys(moduleMeta) as ModuleSlug[] : (user.modules||[]);
  
  return (
    <main className="max-w-3xl mx-auto px-4 py-10" dir="rtl">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-black">{editSlug ? "ویرایش مطلب" : "مطلب جدید"}</h1>
        <div className="text-[11px] text-[var(--tb-muted-foreground)]">{user.name} • {user.role==="super_admin"?"مدیر کل":"ویراستار"}</div>
      </div>
      <form onSubmit={save} className="card p-5 space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-[11px] text-[var(--tb-muted-foreground)]">ماژول *</label>
            <select value={module} onChange={e=>setModule(e.target.value as ModuleSlug)} className="input mt-1" required>
              {allowed.map(m => <option key={m} value={m}>{moduleMeta[m].titleFa} – /{m}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[11px] text-[var(--tb-muted-foreground)]">اسلاگ</label>
            <input value={slug} onChange={e=>setSlug(e.target.value)} className="input mt-1" placeholder="auto از عنوان" dir="ltr" />
          </div>
        </div>
        <div>
          <label className="text-[11px] text-[var(--tb-muted-foreground)]">عنوان *</label>
          <input value={title} onChange={e=>setTitle(e.target.value)} className="input mt-1" required />
        </div>
        <div>
          <label className="text-[11px] text-[var(--tb-muted-foreground)]">خلاصه</label>
          <textarea value={excerpt} onChange={e=>setExcerpt(e.target.value)} className="input min-h-[80px] mt-1" />
        </div>
        <div className="grid md:grid-cols-3 gap-3">
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
          <textarea value={content} onChange={e=>setContent(e.target.value)} className="input min-h-[220px] mt-1" placeholder="متن کامل / HTML / Markdown…" />
        </div>

        <div className="flex items-center justify-between gap-3 pt-2 flex-wrap">
          <div className={msg.includes("✓") ? "text-[11px] text-[var(--tb-success)]" : "text-[11px] text-[var(--tb-muted-foreground)]"}>{msg || "POST → /api/posts – RBAC server-side"}</div>
          <div className="flex gap-2">
            <ButtonLink href={`/admin/posts?module=${module}`} variant="ghost" size="xs">انصراف</ButtonLink>
            <Button size="xs" disabled={saving} type="submit">{saving ? "در حال انتشار…" : (editSlug ? "ذخیره تغییرات" : "انتشار در تکباکس")}</Button>
          </div>
        </div>
      </form>
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
