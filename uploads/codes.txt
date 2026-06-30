## `app/about/page.tsx`

```tsx
import users from "@/data/users.json";
import Link from "next/link";

export const metadata = { title: "درباره تکباکس" };

export default function About(){
  const team = (users as any[]).slice(0,6);
  return (
    <main className="max-w-6xl mx-auto px-4 py-14" dir="rtl">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <h1 className="text-3xl md:text-4xl font-black">درباره تکباکس</h1>
        <p className="text-muted-foreground mt-3 leading-8">
          تکباکس – پاتوق بچه‌های فناوری اطلاعات ایران. مجله، اخبار فوری، رسانه ویدیویی، نقد تخصصی، ابزارهای مهندسی، دانلود، فروشگاه زیرساخت و انجمن – همه در یک Bento feed زنده، با CMS نقش‌محور.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-5 mb-14">
        {[
          ["۸ ماژول", "محتوای یکپارچه"],
          ["۶ ویراستار تخصصی", "RBAC واقعی"],
          ["۱۴۰۵", "هونامیک ارتباط رستاک"],
        ].map(([k,v])=>(
          <div key={k as string} className="card p-5 text-center">
            <div className="text-2xl font-black text-brand">{k}</div>
            <div className="text-xs text-muted-foreground mt-1">{v}</div>
          </div>
        ))}
      </div>

      <h2 className="text-xl font-black mb-4">تیم تحریریه</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-14">
        {team.map(u=>(
          <div key={u.username} className="card p-4 flex items-center gap-3">
            <img src={u.avatar || "/assets/hooman.png"} className="w-14 h-14 rounded-2xl object-cover ring-1 ring-border" alt="" />
            <div>
              <div className="font-bold text-[14px]">{u.name}</div>
              <div className="text-[11px] text-muted-foreground">{u.role==="super_admin" ? "مدیر کل" : "ویراستار"} • {u.modules.join("، ")}</div>
              <Link href={`/account`} className="text-[10px] text-brand hover:underline">مشاهده پروفایل →</Link>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-5 gap-5 items-start">
        <div className="lg:col-span-3 card p-0 overflow-hidden">
          <div className="p-4 border-b border-border">
            <h3 className="font-bold">دفتر تهران</h3>
            <p className="text-xs text-muted-foreground mt-1">میرداماد، هونامیک ارتباط رستاک</p>
          </div>
          {/* OSM embed – works offline preview degraded, live works */}
          <iframe
            title="map"
            src="https://www.openstreetmap.org/export/embed.html?bbox=51.41%2C35.75%2C51.45%2C35.77&layer=mapnik&marker=35.76%2C51.43"
            className="w-full h-[320px] border-0"
            loading="lazy"
          />
        </div>
        <div className="lg:col-span-2 space-y-3 text-sm leading-7 text-muted-foreground card p-5">
          <p>تماس: <span dir="ltr">021-9100xxxx</span></p>
          <p>ایمیل: info@techbox.ir</p>
          <p>ساعت کاری: شنبه–چهارشنبه ۹–۱۷</p>
          <Link href="/contact" className="btn btn-primary w-full mt-2 text-sm">ارتباط با ما</Link>
          <Link href="/consultation" className="btn btn-ghost w-full text-sm">درخواست مشاوره VIP</Link>
        </div>
      </div>
    </main>
  );
}

```

---

## `app/account/page.tsx`

```tsx
"use client";
import { useEffect, useState } from "react";
import { getCurrentUserClient, logout } from "@/lib/auth";
import type { AppUser } from "@/lib/auth";
import Link from "next/link";

export default function AccountPage(){
  const [user, setUser] = useState<AppUser | null>(null);
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [nick, setNick] = useState("");
  const [email, setEmail] = useState("");
  const [job, setJob] = useState("");
  const [birthday, setBirthday] = useState("");
  const [avatar, setAvatar] = useState<string>("/assets/hooman.png");
  const [saved, setSaved] = useState(false);

  useEffect(()=>{
    const u = getCurrentUserClient();
    setUser(u);
    if(u){
      const parts = u.name.split(" ");
      setName(parts[0]||"");
      setLastName(parts.slice(1).join(" ")||"");
      setNick(u.username);
      setEmail(u.email);
      setAvatar(u.avatar || "/assets/hooman.png");
      // load local profile overrides
      const local = localStorage.getItem("tb_profile_"+u.username);
      if(local){ try{ const p=JSON.parse(local); setNick(p.nick||nick); setJob(p.job||""); setBirthday(p.birthday||""); setAvatar(p.avatar||avatar);}catch{} }
    }
  },[]);

  const onAvatar = (e: React.ChangeEvent<HTMLInputElement>)=>{
    const f = e.target.files?.[0];
    if(!f) return;
    const r = new FileReader();
    r.onload = ()=> setAvatar(String(r.result));
    r.readAsDataURL(f);
  };

  const save = (e: React.FormEvent)=>{
    e.preventDefault();
    if(user){
      localStorage.setItem("tb_profile_"+user.username, JSON.stringify({ nick, job, birthday, avatar, name: name+" "+lastName, email }));
      setSaved(true);
      setTimeout(()=>setSaved(false), 1800);
    }
  };

  if(!user){
    return (
      <main className="max-w-md mx-auto px-5 py-20 text-center" dir="rtl">
        <div className="card p-8 space-y-4">
          <h1 className="text-xl font-black">حساب کاربری</h1>
          <p className="text-sm text-muted-foreground">برای دسترسی به پروفایل وارد شوید.</p>
          <Link href="/admin/login" className="btn btn-primary w-full">ورود ویراستار</Link>
          <p className="text-[11px] text-muted-foreground">تست: sara / nima / rojina / admin – رمز: techbox123</p>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-5xl mx-auto px-4 py-10" dir="rtl">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-black">حساب کاربری</h1>
        <div className="text-xs text-muted-foreground">{user.role==="super_admin" ? "مدیر کل" : "ویراستار"} • {user.modules.join("، ")}</div>
      </div>

      <form onSubmit={save} className="grid lg:grid-cols-3 gap-5">
        {/* avatar card */}
        <div className="card p-5 text-center space-y-3 h-fit">
          <div className="relative w-28 h-28 mx-auto">
            <img src={avatar} className="w-28 h-28 rounded-full object-cover ring-2 ring-border" alt="" />
            <label className="absolute bottom-0 left-0 bg-primary text-primary-foreground text-[10px] px-2 py-1 rounded-full cursor-pointer shadow">
              تغییر
              <input type="file" accept="image/*" className="hidden" onChange={onAvatar} />
            </label>
          </div>
          <div className="font-bold">{name} {lastName}</div>
          <div className="text-[11px] text-muted-foreground">@{nick}</div>
          <div className="text-[11px]">{job || "—"}</div>
          <button type="button" onClick={()=>{logout(); location.href="/";}} className="btn btn-ghost w-full text-xs mt-2">خروج از حساب</button>
        </div>

        {/* form */}
        <div className="lg:col-span-2 card p-5 space-y-4">
          <div className="grid sm:grid-cols-2 gap-3">
            <label className="text-xs space-y-1"><span className="text-muted-foreground">نام</span>
              <input value={name} onChange={e=>setName(e.target.value)} className="input" />
            </label>
            <label className="text-xs space-y-1"><span className="text-muted-foreground">نام خانوادگی</span>
              <input value={lastName} onChange={e=>setLastName(e.target.value)} className="input" />
            </label>
            <label className="text-xs space-y-1"><span className="text-muted-foreground">نام کاربری</span>
              <input value={nick} onChange={e=>setNick(e.target.value)} className="input" dir="ltr" />
            </label>
            <label className="text-xs space-y-1"><span className="text-muted-foreground">ایمیل</span>
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)} className="input" dir="ltr" />
            </label>
            <label className="text-xs space-y-1"><span className="text-muted-foreground">سمت شغلی</span>
              <input value={job} onChange={e=>setJob(e.target.value)} placeholder="مثلا: کارشناس شبکه" className="input" />
            </label>
            <label className="text-xs space-y-1"><span className="text-muted-foreground">تاریخ تولد</span>
              <input type="date" value={birthday} onChange={e=>setBirthday(e.target.value)} className="input" />
            </label>
          </div>

          <div className="border-t border-border pt-4 space-y-3">
            <h4 className="font-bold text-sm">تغییر رمز عبور</h4>
            <div className="grid sm:grid-cols-2 gap-3">
              <input type="password" placeholder="رمز فعلی" className="input text-sm" />
              <input type="password" placeholder="رمز جدید" className="input text-sm" />
            </div>
            <p className="text-[11px] text-muted-foreground">دمو – در نسخه پروداکشن به /api/auth/change-password ارسال می‌شود.</p>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <span className={`text-xs transition-opacity ${saved ? "opacity-100 text-emerald-400" : "opacity-0"}`}>ذخیره شد ✓</span>
            <button className="btn btn-primary">ذخیره پروفایل</button>
          </div>
        </div>

        {/* side stats */}
        <div className="lg:col-span-3 grid sm:grid-cols-3 gap-4">
          {[
            ["مقالات منتشر شده","12"],
            ["دیدگاه‌ها","47"],
            ["امتیاز","4.8"],
          ].map(([k,v])=>(
            <div key={k as string} className="card p-4 text-center">
              <div className="text-2xl font-black text-brand">{v}</div>
              <div className="text-[11px] text-muted-foreground mt-1">{k}</div>
            </div>
          ))}
        </div>
      </form>
    </main>
  );
}

```

---

## `app/admin/login/page.tsx`

```tsx
"use client";
import { useState } from "react";
import { login, allUsers } from "@/lib/auth";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const [u, setU] = useState("sara");
  const [err, setErr] = useState("");
  const router = useRouter();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const user = login(u);
    if (user) router.push("/admin");
    else setErr("کاربر یافت نشد");
  };

  return (
    <main className="min-h-[70vh] flex items-center justify-center px-4" dir="rtl">
      <form onSubmit={submit} className="card w-full max-w-sm p-6 space-y-4">
        <h1 className="text-xl font-black">ورود ویراستار</h1>
        <div>
          <label className="text-xs text-muted-foreground">نام کاربری</label>
          <input value={u} onChange={e=>setU(e.target.value)} className="input mt-1" placeholder="sara / admin / nima ..." />
        </div>
        {err && <p className="text-xs text-rose-400">{err}</p>}
        <button className="btn btn-primary w-full">ورود</button>
        <div className="text-[11px] text-muted-foreground leading-6 border-t border-border pt-3">
          کاربران تست:<br/>
          {allUsers.map(x => (
            <span key={x.username} className="block">{x.username} – {x.name} ({x.modules.join(",")})</span>
          ))}
        </div>
      </form>
    </main>
  );
}

```

---

## `app/admin/page.tsx`

```tsx
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getCurrentUserClient, logout, type AppUser, canEdit } from "@/lib/auth";
import { moduleMeta, type ModuleSlug } from "@/lib/content";
import { useRouter } from "next/navigation";

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
          <p className="text-sm text-muted-foreground">برای تست سریع یکی را انتخاب کنید:</p>
          <div className="grid gap-2 text-right text-sm">
            <button onClick={()=>{location.href="/admin/login"}} className="btn btn-primary w-full">رفتن به صفحه ورود</button>
          </div>
          <div className="text-[11px] text-muted-foreground leading-6">
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
            <p className="text-xs text-muted-foreground">پنل مدیریت</p>
            <h1 className="text-2xl font-black">سلام، {user.name}</h1>
            <p className="text-xs text-muted-foreground mt-1">
              نقش: {user.role === "super_admin" ? "مدیر کل" : "ویراستار"} • دسترسی: {user.modules.map(m => moduleMeta[m as ModuleSlug]?.titleFa).join("، ")}
            </p>
          </div>
          <button onClick={()=>{logout(); setUser(null); router.refresh();}} className="btn btn-ghost text-xs">خروج</button>
        </header>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {modules.map(m => {
            const meta = moduleMeta[m];
            return (
              <div key={m} className="card p-5">
                <div className={`text-lg font-extrabold ${meta.color}`}>{meta.titleFa}</div>
                <div className="text-xs text-muted-foreground mt-1">/{m}</div>
                <div className="flex gap-2 mt-4">
                  <Link href={`/admin/posts?module=${m}`} className="btn btn-ghost text-xs flex-1 text-center">مدیریت</Link>
                  <Link href={`/admin/posts/new?module=${m}`} className="btn btn-primary text-xs flex-1 text-center">جدید +</Link>
                </div>
              </div>
            );
          })}
        </div>

        {user.role === "super_admin" && (
          <div className="card p-5">
            <h3 className="font-bold mb-3">مدیریت کاربران (مدیر کل)</h3>
            <div className="text-xs text-muted-foreground leading-7">
              • سارا احمدی – ویراستار مجله (blog)<br/>
              • نیما – اخبار<br/>
              • روژینا – رسانه / نقد<br/>
              • عطیه – ابزار / دانلود<br/>
              • نسترن – فروشگاه / انجمن
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

```

---

## `app/admin/posts/new/page.tsx`

```tsx
"use client";
import { useEffect, useState, Suspense } from "react";
import { moduleMeta, type ModuleSlug, getBySlug } from "@/lib/content";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

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

  if (!user) return <main className="p-10 text-center" dir="rtl">ابتدا <Link className="underline" style={{color:"var(--brand)"}} href="/admin/login">وارد شوید</Link></main>;

  const canEdit = user.role==="super_admin" || (user.modules||[]).includes(module);
  if (!canEdit) return <main className="p-10 text-center" style={{color:"#fb7185"}} dir="rtl">دسترسی به ماژول {moduleMeta[module]?.titleFa} ندارید.</main>;

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
        <div className="text-[11px]" style={{color:"var(--muted-foreground)"}}>{user.name} • {user.role==="super_admin"?"مدیر کل":"ویراستار"}</div>
      </div>
      <form onSubmit={save} className="card p-5 space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-[11px]" style={{color:"var(--muted-foreground)"}}>ماژول *</label>
            <select value={module} onChange={e=>setModule(e.target.value as ModuleSlug)} className="input mt-1" required>
              {allowed.map(m => <option key={m} value={m}>{moduleMeta[m].titleFa} – /{m}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[11px]" style={{color:"var(--muted-foreground)"}}>اسلاگ</label>
            <input value={slug} onChange={e=>setSlug(e.target.value)} className="input mt-1" placeholder="auto از عنوان" dir="ltr" />
          </div>
        </div>
        <div>
          <label className="text-[11px]" style={{color:"var(--muted-foreground)"}}>عنوان *</label>
          <input value={title} onChange={e=>setTitle(e.target.value)} className="input mt-1" required />
        </div>
        <div>
          <label className="text-[11px]" style={{color:"var(--muted-foreground)"}}>خلاصه</label>
          <textarea value={excerpt} onChange={e=>setExcerpt(e.target.value)} className="input min-h-[80px] mt-1" />
        </div>
        <div className="grid md:grid-cols-3 gap-3">
          <div className="md:col-span-2">
            <label className="text-[11px]" style={{color:"var(--muted-foreground)"}}>برچسب‌ها – با , جدا کنید</label>
            <input value={tags} onChange={e=>setTags(e.target.value)} className="input mt-1" placeholder="QNAP-2277, nas, storage" />
          </div>
          <div>
            <label className="text-[11px]" style={{color:"var(--muted-foreground)"}}>تصویر شاخص URL</label>
            <input value={image} onChange={e=>setImage(e.target.value)} className="input mt-1" placeholder="/assets/..." dir="ltr" />
          </div>
        </div>
        <div>
          <label className="text-[11px]" style={{color:"var(--muted-foreground)"}}>محتوا</label>
          <textarea value={content} onChange={e=>setContent(e.target.value)} className="input min-h-[220px] mt-1" placeholder="متن کامل / HTML / Markdown…" />
        </div>

        <div className="flex items-center justify-between gap-3 pt-2 flex-wrap">
          <div className="text-[11px]" style={{color: msg.includes("✓") ? "#4ade80" : "var(--muted-foreground)"}}>{msg || "POST → /api/posts – RBAC server-side"}</div>
          <div className="flex gap-2">
            <Link href={`/admin/posts?module=${module}`} className="btn btn-ghost text-xs">انصراف</Link>
            <button className="btn btn-primary text-xs" disabled={saving} type="submit">{saving ? "در حال انتشار…" : (editSlug ? "ذخیره تغییرات" : "انتشار در تکباکس")}</button>
          </div>
        </div>
      </form>
      <p className="text-[10px] mt-3 text-center" style={{color:"var(--muted-foreground)"}}>
        دسترسی شما: {allowed.map(m=>moduleMeta[m]?.titleFa).join("، ")} – نقش توسط مدیر کل در <Link href="/admin/roles" className="underline" style={{color:"var(--brand)"}}>/admin/roles</Link> قابل تغییر است.
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

```

---

## `app/admin/posts/page.tsx`

```tsx
"use client";
import { useEffect, useState, useMemo, Suspense } from "react";
import { getCurrentUserClient, canEdit, type AppUser } from "@/lib/auth";
import { getModuleItems, moduleMeta, type ModuleSlug, type ContentItem } from "@/lib/content";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";

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
    return <main className="p-10 text-center" dir="rtl"><p className="text-rose-400">شما دسترسی به ماژول {moduleMeta[module]?.titleFa} ندارید.</p><p className="text-xs mt-3">دسترسی شما: {user.modules.join(", ")}</p></main>;
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-10" dir="rtl">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl font-black">مدیریت محتوا</h1>
        <Link href={`/admin/posts/new?module=${module}`} className="btn btn-primary text-sm">+ مطلب جدید</Link>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {allowedModules.map(m => (
          <button
            key={m}
            onClick={()=>{ setModule(m); router.push(`/admin/posts?module=${m}`); }}
            className={`btn text-xs ${m===module ? "btn-primary" : "btn-ghost"}`}
          >
            {moduleMeta[m].titleFa}
          </button>
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
              <tr key={it.slug} className="border-t border-border/60 hover:bg-muted/20">
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

```

---

## `app/admin/roles/page.tsx`

```tsx
"use client";
import { useEffect, useState } from "react";
import { moduleMeta, type ModuleSlug } from "@/lib/content";

type RoleRow = { id:string; name:string; titleFa:string; modules:ModuleSlug[]; users:number };

const seedRoles: RoleRow[] = [
  {id:"r1", name:"super_admin", titleFa:"مدیر کل", modules:["blog","news","media","review","tools","download","shop","forum"], users:1},
  {id:"r2", name:"blog_editor", titleFa:"ویراستار مجله", modules:["blog"], users:1},
  {id:"r3", name:"news_editor", titleFa:"دبیر اخبار", modules:["news"], users:1},
  {id:"r4", name:"media_creator", titleFa:"تولیدکننده ویدیو", modules:["media","review"], users:1},
];

export default function RolesPage(){
  const [roles,setRoles]=useState<RoleRow[]>(seedRoles);
  const [name,setName]=useState("");
  const [titleFa,setTitleFa]=useState("");
  const [mods,setMods]=useState<Record<ModuleSlug,boolean>>({} as any);

  useEffect(()=>{
    const saved = localStorage.getItem("tb_roles_v4");
    if(saved){ try{ setRoles(JSON.parse(saved)); }catch{} }
  },[]);
  useEffect(()=>{ localStorage.setItem("tb_roles_v4", JSON.stringify(roles)); },[roles]);

  const toggleMod = (m:ModuleSlug)=> setMods(prev=>({...prev, [m]: !prev[m]}));
  const createRole = (e:React.FormEvent)=>{
    e.preventDefault();
    const selected = (Object.entries(mods).filter(([,v])=>v).map(([k])=>k)) as ModuleSlug[];
    if(!name.trim() || !titleFa.trim() || selected.length===0){ alert("نام نقش، عنوان فارسی و حداقل یک ماژول الزامی است"); return; }
    setRoles(r=>[{ id:"r"+Date.now(), name:name.trim().toLowerCase().replace(/\s+/g,"_"), titleFa: titleFa.trim(), modules: selected, users:0 }, ...r]);
    setName(""); setTitleFa(""); setMods({} as any);
  };

  const allMods = Object.keys(moduleMeta) as ModuleSlug[];

  return (
    <main className="max-w-6xl mx-auto px-4 py-10" dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black">مدیریت نقش‌ها – RBAC</h1>
          <p className="text-xs text-muted-foreground mt-1">مدیر کل می‌تواند نقش بسازد، دسترسی ماژول‌ها را تعیین کند – مثل Blog Editor / Content Creator</p>
        </div>
        <span className="text-[11px] px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">super_admin only</span>
      </div>

      <div className="grid lg:grid-cols-3 gap-5 items-start">
        <form onSubmit={createRole} className="card p-4 space-y-3 lg:col-span-1 lg:sticky lg:top-24">
          <h3 className="font-bold text-[14px]">نقش جدید</h3>
          <input value={name} onChange={e=>setName(e.target.value)} className="input text-sm" placeholder="role_name – ex: blog_editor" dir="ltr" />
          <input value={titleFa} onChange={e=>setTitleFa(e.target.value)} className="input text-sm" placeholder="عنوان فارسی – ex: ویراستار مجله" />
          <div>
            <div className="text-[11px] text-muted-foreground mb-2">دسترسی ماژول‌ها:</div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              {allMods.map(m=>(
                <label key={m} className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors ${mods[m] ? "bg-primary/10 border-primary/40" : "border-border hover:bg-muted"}`}>
                  <input type="checkbox" checked={!!mods[m]} onChange={()=>toggleMod(m)} />
                  <span>{moduleMeta[m].titleFa}</span>
                </label>
              ))}
            </div>
          </div>
          <button className="btn btn-primary w-full text-xs">ایجاد نقش +</button>
          <p className="text-[10px] text-muted-foreground leading-5">
            ذخیره در: <code>localStorage tb_roles_v4</code> + آماده POST <code>/api/roles</code> – در پروداکشن به Prisma Role table متصل می‌شود.
          </p>
        </form>

        <div className="lg:col-span-2 card p-0 overflow-hidden">
          <table className="w-full text-[13px]">
            <thead style={{background:"var(--muted)"}} className="text-[11px]">
              <tr>
                <th className="text-right p-3">نقش</th>
                <th className="text-right p-3">دسترسی ماژول</th>
                <th className="text-right p-3">کاربران</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {roles.map(r=>(
                <tr key={r.id} className="border-t" style={{borderColor:"var(--border)"}}>
                  <td className="p-3">
                    <div className="font-bold">{r.titleFa}</div>
                    <div className="text-[10px] font-mono" style={{color:"var(--muted-foreground)"}}>{r.name}</div>
                  </td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-1">
                      {r.modules.map(m=>(
                        <span key={m} className="badge text-[10px]">{moduleMeta[m]?.titleFa || m}</span>
                      ))}
                    </div>
                  </td>
                  <td className="p-3 text-center">{r.users.toLocaleString("fa-IR")}</td>
                  <td className="p-3 text-[11px] text-right">
                    <button className="hover:text-brand ms-3">ویرایش</button>
                    <button className="hover:text-rose-400">حذف</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card p-4 mt-6 text-[12px] leading-7" style={{color:"var(--muted-foreground)"}}>
        <b>نقش‌های پیش‌فرض تکباکس:</b><br/>
        • <b>super_admin</b> (admin) – همه ۸ ماژول – مدیر کل<br/>
        • <b>blog_editor</b> (sara) – مجله<br/>
        • <b>news_editor</b> (nima) – اخبار<br/>
        • <b>media_creator</b> (rojina) – رسانه + نقد و بررسی<br/>
        • <b>tools_editor</b> (atiye) – ابزارها + دانلود<br/>
        • <b>shop_forum</b> (nastaran) – فروشگاه + انجمن<br/>
        مدیر کل می‌تواند از همین صفحه نقش جدید بسازد – مثال: <code>video_creator</code> → modules: ["media"]
      </div>
    </main>
  );
}

```

---

## `app/api/auth/login/route.ts`

```ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyPassword, createSession, setSessionCookie } from "@/lib/auth-server";
import { z } from "zod";

const schema = z.object({ username: z.string(), password: z.string().optional().default("techbox123") });

export async function POST(req: NextRequest){
  const { username, password } = schema.parse(await req.json());
  const user = await prisma.user.findUnique({ where: { username }});
  if(!user) return NextResponse.json({ error: "not found" }, { status: 404 });
  const ok = await verifyPassword(password, user.password).catch(()=>false);
  // dev fallback: allow plain "techbox123" even if hash mismatch first seed?
  if(!ok && password !== "techbox123") return NextResponse.json({ error: "invalid" }, { status: 401 });
  const token = await createSession(user.id);
  await setSessionCookie(token);
  return NextResponse.json({ ok: true, user: { id: user.id, name: user.name, username: user.username, role: user.role, modules: JSON.parse(user.modules) }});
}

```

---

## `app/api/auth/logout/route.ts`

```ts
import { NextResponse } from "next/server";
import { clearSession } from "@/lib/auth-server";
export async function POST(){ await clearSession(); return NextResponse.json({ ok: true }); }

```

---

## `app/api/auth/me/route.ts`

```ts
import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth-server";

export async function GET(){
  const user = await getSessionUser();
  if(!user) return NextResponse.json({ user: null });
  return NextResponse.json({ user: {
    id: user.id, name: user.name, username: user.username,
    role: user.role, modules: JSON.parse(user.modules), avatar: user.avatar
  }});
}

export const dynamic = "force-dynamic";

```

---

## `app/api/chat/route.ts`

```ts
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SYSTEM_FA = `تو دستیار فارسی «تکباکس» هستی – رسانه تخصصی زیرساخت، شبکه، سرور و ذخیره‌سازی ایران.
- کوتاه، دقیق، مودب، فارسی روان، راست‌به‌چپ
- اگر درباره محصولی مثل QNAP-2277 پرسیدند: مشخصات فنی + کاربرد + پیشنهاد محتوای مرتبط از مجله/ویدیو/فروشگاه تکباکس بده
- اگر سوال فنی شبکه/سرور بود: قدم‌به‌قدم، امن، با هشدار اگر ریسکی است
- همیشه در پایان ۱-۳ لینک داخلی پیشنهادی بده: /blog/… /media/… /shop/…
- اگر مطمئن نیستی بگو «مطمئن نیستم» و پیشنهاد بده به انجمن /forum مراجعه کند
`;

type Msg = { role: "system"|"user"|"assistant"; content: string };

export async function POST(req: NextRequest){
  try{
    const { messages = [], model, temperature = 0.5 } : {messages: Msg[], model?:string, temperature?:number} = await req.json();

    const apiKey = process.env.CHAT_API_KEY;
    const baseUrl = process.env.CHAT_BASE_URL || "https://api.openai.com/v1";
    const chatModel = model || process.env.CHAT_MODEL || "gpt-4o-mini";

    if(!apiKey){
      // dev mock – so site works without keys
      const last = messages.filter(m=>m.role==="user").pop()?.content || "";
      return NextResponse.json({
        reply: `🤖 (حالت دمو – کلید CHAT_API_KEY تنظیم نشده)\n\nسوال شما: «${last}»\n\nپاسخ آزمایشی تکباکس:\n• اگر منظورتان QNAP-2277 است → بررسی ویدیویی: /media/qnap-2277-review-video\n• نقد تخصصی: /review/qnap-2277-full-review\n• خرید: /shop/qnap-ts-2277\n• فریم‌ور: /download/qnap-2277-firmware\n\nبرای فعال‌سازی واقعی، در .env بگذارید:\nCHAT_API_KEY=sk-...\nCHAT_BASE_URL=https://api.openai.com/v1\nCHAT_MODEL=gpt-4o-mini`,
        mock: true
      });
    }

    const body = {
      model: chatModel,
      messages: [{role:"system", content: SYSTEM_FA}, ...messages],
      temperature,
      max_tokens: 900,
      stream: false,
    };

    const r = await fetch(`${baseUrl.replace(/\/$/,"")}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
      // Next 16 – no cache
      cache: "no-store" as any,
    });

    if(!r.ok){
      const txt = await r.text();
      return NextResponse.json({ error: `chat provider ${r.status}`, detail: txt.slice(0,500) }, { status: 502 });
    }
    const data = await r.json();
    const reply = data?.choices?.[0]?.message?.content || "پاسخی دریافت نشد.";
    return NextResponse.json({ reply, usage: data?.usage });
  }catch(e:any){
    return NextResponse.json({ error: e?.message || "chat_failed" }, { status: 500 });
  }
}

```

---

## `app/api/comments/route.ts`

```ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { getSessionUser } from "@/lib/auth-server";

const postSchema = z.object({
  postModule: z.string(),
  postSlug: z.string(),
  text: z.string().min(2).max(2000),
  authorName: z.string().min(1).max(60).optional(),
  parentId: z.string().nullable().optional()
});

export async function GET(req: NextRequest){
  const { searchParams } = new URL(req.url);
  const module = searchParams.get("module");
  const slug = searchParams.get("slug");
  if(!module || !slug) return NextResponse.json({ error: "module+slug required" }, { status: 400 });

  const post = await prisma.post.findUnique({ where: { module_slug: { module: module as any, slug } }, select: { id: true }});
  if(!post) return NextResponse.json([]);
  
  const comments = await prisma.comment.findMany({
    where: { postId: post.id },
    orderBy: { createdAt: "asc" },
    include: { replies: { orderBy: { createdAt: "asc" } } }
  });
  // return flat, client will nest
  return NextResponse.json(comments);
}

export async function POST(req: NextRequest){
  const user = await getSessionUser();
  const body = await req.json();
  const { postModule, postSlug, text, authorName, parentId } = postSchema.parse(body);

  const post = await prisma.post.findUnique({
    where: { module_slug: { module: postModule as any, slug: postSlug } }
  });
  if(!post) return NextResponse.json({ error: "post not found" }, { status: 404 });

  const comment = await prisma.comment.create({
    data: {
      postId: post.id,
      parentId: parentId || null,
      authorId: user?.id || null,
      authorName: user?.name || authorName || "مهمان",
      text
    }
  });
  return NextResponse.json(comment, { status: 201 });
}

```

---

## `app/api/comments/vote/route.ts`

```ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

const schema = z.object({
  commentId: z.string(),
  fingerprint: z.string().min(3),
  vote: z.union([z.literal(1), z.literal(-1), z.literal(0)])
});

export async function POST(req: NextRequest){
  const { commentId, fingerprint, vote } = schema.parse(await req.json());
  const existing = await prisma.commentVote.findUnique({
    where: { fingerprint_commentId: { fingerprint, commentId } }
  });

  // adjust counts helper
  async function adjust(oldV:number, newV:number){
    if(oldV === newV) return;
    const incLikes = (newV===1?1:0) - (oldV===1?1:0);
    const incDislikes = (newV===-1?1:0) - (oldV===-1?1:0);
    if(incLikes!==0 || incDislikes!==0){
      await prisma.comment.update({
        where:{ id: commentId },
        data:{ likes:{ increment: incLikes }, dislikes:{ increment: incDislikes } }
      });
    }
  }

  if(vote===0){
    if(existing){ await adjust(existing.vote,0); await prisma.commentVote.delete({ where:{ id: existing.id }}); }
  } else {
    if(existing){
      await adjust(existing.vote, vote);
      await prisma.commentVote.update({ where:{ id: existing.id }, data:{ vote }});
    } else {
      await prisma.commentVote.create({ data:{ commentId, fingerprint, vote }});
      await adjust(0, vote);
    }
  }
  const c = await prisma.comment.findUnique({ where:{id: commentId}, select:{ likes:true, dislikes:true }});
  return NextResponse.json(c);
}

```

---

## `app/api/like/route.ts`

```ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

const schema = z.object({
  module: z.enum(["blog","news","media","review","tools","download","shop","forum"]),
  slug: z.string().min(1),
  fingerprint: z.string().min(3)
});

export async function POST(req: NextRequest){
  try{
    const body = await req.json();
    const { module, slug, fingerprint } = schema.parse(body);

    const existing = await prisma.like.findUnique({
      where: { fingerprint_module_slug: { fingerprint, module: module as any, slug } }
    });

    if(existing){
      await prisma.like.delete({ where: { id: existing.id }});
      await prisma.post.updateMany({
        where: { module: module as any, slug },
        data: { likes: { decrement: 1 } }
      });
      const p = await prisma.post.findFirst({ where: { module: module as any, slug }, select: { likes: true }});
      return NextResponse.json({ liked: false, likes: Math.max(0, p?.likes ?? 0) });
    } else {
      await prisma.like.create({ data: { fingerprint, module: module as any, slug }});
      await prisma.post.updateMany({
        where: { module: module as any, slug },
        data: { likes: { increment: 1 } }
      });
      const p = await prisma.post.findFirst({ where: { module: module as any, slug }, select: { likes: true }});
      return NextResponse.json({ liked: true, likes: p?.likes ?? 1 });
    }
  }catch(e:any){
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}

```

---

## `app/api/pay/zarinpal/request/route.ts`

```ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  amount: z.number().int().positive(), // Rial
  description: z.string().default("سفارش تکباکس"),
  email: z.string().optional(),
  mobile: z.string().optional(),
});

export async function POST(req: NextRequest){
  const body = await req.json().catch(()=> ({}));
  const { amount, description, email, mobile } = schema.parse(body);
  const merchant_id = process.env.ZARIN_MERCHANT_ID;
  const callback_url = `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/shop/checkout?verify=1`;
  
  if(!merchant_id || merchant_id.startsWith("test") || merchant_id==="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"){
    // sandbox / mock mode
    return NextResponse.json({
      ok: true,
      authority: "A0000000000000000000000000000" + Math.floor(Math.random()*9000),
      url: `/shop/checkout?pay=mock&amount=${amount}`,
      mock: true,
      message: "Zarinpal merchant_id تنظیم نشده – حالت شبیه‌ساز"
    });
  }

  try{
    const r = await fetch("https://api.zarinpal.com/pg/v4/payment/request.json", {
      method:"POST",
      headers:{"Content-Type":"application/json","Accept":"application/json"},
      body: JSON.stringify({
        merchant_id,
        amount,
        description,
        callback_url,
        metadata: { email, mobile }
      }),
      cache:"no-store"
    });
    const data = await r.json();
    if(data?.data?.code === 100){
      return NextResponse.json({
        ok:true,
        authority: data.data.authority,
        url: `https://www.zarinpal.com/pg/StartPay/${data.data.authority}`
      });
    }
    return NextResponse.json({ ok:false, error: data?.errors || data }, { status: 400 });
  }catch(e:any){
    return NextResponse.json({ ok:false, error: e.message, mock_fallback: true,
      url: `/shop/checkout?pay=mock&amount=${amount}` }, { status: 200 });
  }
}
export const dynamic = "force-dynamic";

```

---

## `app/api/pay/zarinpal/verify/route.ts`

```ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  authority: z.string(),
  amount: z.coerce.number().int().positive(),
});

export async function POST(req: NextRequest){
  const body = await req.json().catch(()=> ({}));
  const q = req.nextUrl.searchParams;
  const data = {
    authority: body.authority ?? q.get("Authority") ?? "",
    amount: Number(body.amount ?? q.get("amount") ?? 0)
  };
  const parsed = schema.safeParse(data);
  if(!parsed.success) return NextResponse.json({ verified:false, error: parsed.error.flatten() }, { status:400 });
  const { authority, amount } = parsed.data;
  const merchant_id = process.env.ZARIN_MERCHANT_ID;

  if(!merchant_id || authority.startsWith("A00000")){
    return NextResponse.json({ verified:true, ref_id: Math.floor(1e8+Math.random()*9e8), mock:true });
  }

  try{
    const r = await fetch("https://api.zarinpal.com/pg/v4/payment/verify.json", {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ merchant_id, authority, amount }),
      cache:"no-store"
    });
    const j = await r.json();
    if([100,101].includes(j?.data?.code)){
      return NextResponse.json({ verified:true, ref_id: j.data.ref_id });
    }
    return NextResponse.json({ verified:false, error: j }, { status: 400 });
  }catch(e:any){
    return NextResponse.json({ verified:false, error:e.message }, { status:500 });
  }
}
export const dynamic = "force-dynamic";

```

---

## `app/api/posts/route.ts`

```ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser, canEditModule } from "@/lib/auth-server";
import { z } from "zod";

export async function GET(req: NextRequest){
  const { searchParams } = new URL(req.url);
  const module = searchParams.get("module") || undefined;
  const take = Math.min(parseInt(searchParams.get("take") || "50"), 100);
  const posts = await prisma.post.findMany({
    where: { published: true, ...(module ? { module: module as any } : {}) },
    orderBy: { date: "desc" },
    take,
    select: {
      slug: true, module: true, title: true, excerpt: true, image: true,
      tags: true, date: true, dateFa: true, likes: true, views: true,
      category: true, authorName: true
    }
  });
  const out = posts.map(p => ({ ...p, tags: JSON.parse(p.tags || "[]"), author: { name: p.authorName }}));
  return NextResponse.json(out);
}

const createSchema = z.object({
  module: z.enum(["blog","news","media","review","tools","download","shop","forum"]),
  slug: z.string().min(2),
  title: z.string().min(3),
  excerpt: z.string().default(""),
  content: z.string().default(""),
  image: z.string().optional(),
  tags: z.array(z.string()).default([]),
  category: z.string().optional()
});

export async function POST(req: NextRequest){
  const user = await getSessionUser();
  if(!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const data = createSchema.parse(await req.json());
  if(!canEditModule(user as any, data.module)){
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  try{
    const post = await prisma.post.create({
      data: {
        ...data,
        tags: JSON.stringify(data.tags),
        authorId: user.id,
        authorName: user.name,
        dateFa: new Intl.DateTimeFormat("fa-IR", { dateStyle: "long" }).format(new Date()),
      }
    });
    return NextResponse.json(post, { status: 201 });
  }catch(e:any){
    if(String(e.message).includes("Unique")) return NextResponse.json({ error: "slug exists" }, { status: 409 });
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}

```

---

## `app/blog/page.tsx`

```tsx
import BlogGrid from "@/features/blog/components/BlogGrid";
export const metadata = { title: "مجله | تکباکس" };
export default function BlogPage(){ return <BlogGrid />; }

```

---

## `app/blog/[slug]/page.tsx`

```tsx
import { getBySlug, getModuleItems } from "@/lib/content";
import ContentDetail from "@/features/content/components/ContentDetail";
import { notFound } from "next/navigation";

export async function generateStaticParams() {
  return getModuleItems("blog").map(p => ({ slug: p.slug }));
}

export default async function BlogDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = getBySlug("blog", slug);
  if (!item) return notFound();
  return <ContentDetail item={item} />;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = getBySlug("blog", slug);
  return { title: item ? `${item.title} | تکباکس` : "یافت نشد" };
}

```

---

## `app/consultation/page.tsx`

```tsx
export default function Consultation(){
  return (
    <main className="max-w-2xl mx-auto px-5 py-16" dir="rtl">
      <h1 className="text-3xl font-black mb-4">درخواست مشاوره زیرساخت</h1>
      <div className="card p-6 space-y-4">
        <input className="input" placeholder="نام سازمان" />
        <input className="input" placeholder="تلفن" />
        <textarea className="input min-h-[120px]" placeholder="نیاز شما؟ سرور، شبکه، ذخیره‌سازی..." />
        <button className="btn btn-primary">ارسال درخواست</button>
      </div>
    </main>
  )
}

```

---

## `app/contact/page.tsx`

```tsx
export const metadata = { title: "ارتباط با ما | تکباکس" };
export default function Contact() {
  return (
    <main className="max-w-3xl mx-auto px-5 py-16" dir="rtl">
      <h1 className="text-3xl font-black mb-3">ارتباط با ما</h1>
      <p className="text-muted-foreground mb-8">پاتوق بچه‌های فناوری اطلاعات – هونامیک ارتباط رستاک</p>
      <div className="card p-6 space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <input className="input" placeholder="نام" />
          <input className="input" placeholder="ایمیل" />
        </div>
        <input className="input" placeholder="موضوع" />
        <textarea className="input min-h-[140px]" placeholder="پیام شما…" />
        <button className="btn btn-primary">ارسال</button>
        <p className="text-[11px] text-muted-foreground">پاسخ ظرف 24 ساعت – info@techbox.ir</p>
      </div>
    </main>
  );
}

```

---

## `app/download/page.tsx`

```tsx
import DownloadTable from "@/features/download/components/DownloadTable";
export const metadata = { title: "دانلود | تکباکس" };
export default function DownloadPage(){ return <DownloadTable />; }

```

---

## `app/download/[slug]/page.tsx`

```tsx
import { getBySlug, getModuleItems } from "@/lib/content";
import DownloadDetail from "@/features/download/components/DownloadDetail";
import { notFound } from "next/navigation";

type P = Promise<{slug:string}>;
export async function generateStaticParams(){ return getModuleItems("download").map(p=>({slug:p.slug})) }
export default async function Page({params}:{params:P}){ const {slug}=await params; const item=getBySlug("download",slug); if(!item) return notFound(); return <DownloadDetail item={item} /> }
export async function generateMetadata({params}:{params:P}){ const {slug}=await params; const i=getBySlug("download",slug); return { title: i ? `${i.title} | دانلود تکباکس` : "یافت نشد" } }

```

---

## `app/forum/page.tsx`

```tsx
import ForumList from "@/features/forum/components/ForumList";
export const metadata = { title: "انجمن | تکباکس" };
export default function ForumPage(){ return <ForumList />; }

```

---

## `app/forum/[slug]/page.tsx`

```tsx
import { getBySlug, getModuleItems } from "@/lib/content";
import ContentDetail from "@/features/content/components/ContentDetail";
import { notFound } from "next/navigation";

type P = Promise<{ slug: string }>;

export async function generateStaticParams() {
  const mod = "forum" as any;
  return getModuleItems(mod).map((p) => ({ slug: p.slug }));
}

export default async function Page({ params }: { params: P }) {
  const { slug } = await params;
  const mod = "forum" as any;
  const item = getBySlug(mod, slug);
  if (!item) return notFound();
  return <ContentDetail item={item} />;
}

export async function generateMetadata({ params }: { params: P }) {
  const { slug } = await params;
  const mod = "forum" as any;
  const item = getBySlug(mod, slug);
  return { title: item ? `${item.title} | تکباکس` : "یافت نشد" };
}

```

---

## `app/layout.tsx`

```tsx
import type { Metadata } from "next";
import "@/design/foundation/globals.css";
import { kalameh } from "@/lib/fonts";
import { LayoutShell } from "@/components/layout/LayoutShell";

export const metadata: Metadata = {
  title: "رسانه تکنولوژی تکباکس",
  description: "پاتوق بچه‌های فناوری اطلاعات",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="fa"
      dir="rtl"
      className={kalameh.variable}
      suppressHydrationWarning
    >
      <body className="font-sans antialiased text-foreground">
        <LayoutShell>{children}</LayoutShell>
      </body>
    </html>
  );
}

```

---

## `app/media/page.tsx`

```tsx
import MediaGallery from "@/features/media/components/MediaGallery";
export const metadata = { title: "رسانه | تکباکس" };
export default function MediaPage(){ return <MediaGallery />; }

```

---

## `app/media/[slug]/page.tsx`

```tsx
import { getBySlug, getModuleItems } from "@/lib/content";
import ContentDetail from "@/features/content/components/ContentDetail";
import { notFound } from "next/navigation";

type P = Promise<{ slug: string }>;

export async function generateStaticParams() {
  const mod = "media" as any;
  return getModuleItems(mod).map((p) => ({ slug: p.slug }));
}

export default async function Page({ params }: { params: P }) {
  const { slug } = await params;
  const mod = "media" as any;
  const item = getBySlug(mod, slug);
  if (!item) return notFound();
  return <ContentDetail item={item} />;
}

export async function generateMetadata({ params }: { params: P }) {
  const { slug } = await params;
  const mod = "media" as any;
  const item = getBySlug(mod, slug);
  return { title: item ? `${item.title} | تکباکس` : "یافت نشد" };
}

```

---

## `app/news/page.tsx`

```tsx
import NewsList from "@/features/news/components/NewsList";
export const metadata = { title: "اخبار | تکباکس" };
export default function NewsPage(){ return <NewsList />; }

```

---

## `app/news/[slug]/page.tsx`

```tsx
import { getBySlug, getModuleItems } from "@/lib/content";
import ContentDetail from "@/features/content/components/ContentDetail";
import { notFound } from "next/navigation";

type P = Promise<{ slug: string }>;

export async function generateStaticParams() {
  const mod = "news" as any;
  return getModuleItems(mod).map((p) => ({ slug: p.slug }));
}

export default async function Page({ params }: { params: P }) {
  const { slug } = await params;
  const mod = "news" as any;
  const item = getBySlug(mod, slug);
  if (!item) return notFound();
  return <ContentDetail item={item} />;
}

export async function generateMetadata({ params }: { params: P }) {
  const { slug } = await params;
  const mod = "news" as any;
  const item = getBySlug(mod, slug);
  return { title: item ? `${item.title} | تکباکس` : "یافت نشد" };
}

```

---

## `app/page.tsx`

```tsx
import HeroSection from "@/features/home/components/HeroSection";
import HomeModulesSection from "@/features/home/components/HomeModulesSection";
import NewsTicker from "@/features/news/components/NewsTicker";
import { getAllAcross } from "@/lib/content";

export default function Page() {
  const ticker = getAllAcross().filter(i => ["news","blog"].includes(i.module)).slice(0,12);
  return (
    <main className="relative">
      <HeroSection />
      <NewsTicker items={ticker} className="pb-10" />
      <HomeModulesSection />
    </main>
  );
}

```

---

## `app/review/page.tsx`

```tsx
import ReviewGrid from "@/features/review/components/ReviewGrid";
export const metadata = { title: "نقد و بررسی | تکباکس" };
export default function ReviewPage(){ return <ReviewGrid />; }

```

---

## `app/review/[slug]/page.tsx`

```tsx
import { getBySlug, getModuleItems } from "@/lib/content";
import ContentDetail from "@/features/content/components/ContentDetail";
import { notFound } from "next/navigation";

type P = Promise<{ slug: string }>;

export async function generateStaticParams() {
  const mod = "review" as any;
  return getModuleItems(mod).map((p) => ({ slug: p.slug }));
}

export default async function Page({ params }: { params: P }) {
  const { slug } = await params;
  const mod = "review" as any;
  const item = getBySlug(mod, slug);
  if (!item) return notFound();
  return <ContentDetail item={item} />;
}

export async function generateMetadata({ params }: { params: P }) {
  const { slug } = await params;
  const mod = "review" as any;
  const item = getBySlug(mod, slug);
  return { title: item ? `${item.title} | تکباکس` : "یافت نشد" };
}

```

---

## `app/search/page.tsx`

```tsx
"use client";
import { useSearchParams } from "next/navigation";
import { searchAcross } from "@/lib/content";
import { ContentCard } from "@/features/content/components/ContentCard";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

function SearchInner(){
  const sp = useSearchParams();
  const q = sp.get("q") || "";
  const results = searchAcross(q);
  return (
    <main className="max-w-4xl mx-auto px-4 py-12" dir="rtl">
      <h1 className="text-2xl font-black mb-2">جستجو</h1>
      <p className="text-sm text-muted-foreground mb-6">{q ? <>نتایج برای <b>«{q}»</b> – {results.length.toLocaleString("fa-IR")} مورد</> : "یک عبارت وارد کنید"}</p>
      <div className="grid gap-3 md:grid-cols-2">
        {results.map(r=> <ContentCard key={r.module+r.slug} item={r} />)}
      </div>
      {q && results.length===0 && <p className="text-muted-foreground text-sm">نتیجه‌ای یافت نشد.</p>}
    </main>
  );
}
export default function SearchPage(){
  return <Suspense fallback={<div className="p-10 text-center">...</div>}><SearchInner/></Suspense>
}

```

---

## `app/shop/checkout/page.tsx`

```tsx
"use client";
import { useCart } from "@/providers/cart.provider";
import Link from "next/link";
import { useState } from "react";

function parseFaPrice(s:string){
  // "۴۸,۹۰۰,۰۰۰" -> 48900000
  const map:any = {"۰":"0","۱":"1","۲":"2","۳":"3","۴":"4","۵":"5","۶":"6","۷":"7","۸":"8","۹":"9", ",":"", "٬":""};
  let out=""; for(const ch of s) out += map[ch] ?? (/[0-9]/.test(ch)?ch:"");
  const n = parseInt(out||"0",10);
  return Number.isFinite(n) ? n : 0;
}

export default function CheckoutPage(){
  const { items, count, clear } = useCart();
  const [loading,setLoading] = useState(false);
  const [name,setName]=useState("");
  const [phone,setPhone]=useState("");
  const [email,setEmail]=useState("");

  const totalToman = items.reduce((sum,it)=>{
    const unit = parseFaPrice(it.price);
    return sum + unit * it.qty;
  },0);
  // Zarinpal expects Rial
  const amountRial = totalToman * 10;

  const pay = async ()=>{
    if(items.length===0){ alert("سبد خالی است"); return; }
    setLoading(true);
    try{
      const res = await fetch("/api/pay/zarinpal/request", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          amount: amountRial || 100000, // fallback 10k Toman
          description: `سفارش تکباکس – ${count} قلم – ${name||"مهمان"}`,
          email: email || undefined,
          mobile: phone || undefined,
        })
      });
      const data = await res.json();
      if(data?.url){
        if(data.mock){
          alert(`حالت تست زرین‌پال\nمبلغ: ${totalToman.toLocaleString("fa-IR")} تومان\nAuthority: ${data.authority}\n\nبه صفحه تایید هدایت می‌شوید…`);
          // simulate verify
          const v = await fetch("/api/pay/zarinpal/verify", {
            method:"POST", headers:{"Content-Type":"application/json"},
            body: JSON.stringify({ authority: data.authority, amount: amountRial || 100000 })
          }).then(r=>r.json()).catch(()=>({verified:true}));
          if(v.verified){
            alert(`پرداخت موفق! \nRefID: ${v.ref_id || "TEST"}\nمتشکرم از خرید شما از تکباکس.`);
            clear();
            location.href = "/shop?thanks=1";
            return;
          }
        }
        // real redirect
        window.location.href = data.url;
        return;
      }
      alert("خطا در ایجاد تراکنش: " + (data.error || "نامشخص"));
    }catch(e:any){
      alert("خطا: " + e.message);
    }finally{ setLoading(false); }
  };

  return (
    <main className="max-w-5xl mx-auto px-4 py-12" dir="rtl">
      <h1 className="text-2xl font-black mb-2" style={{color:"#a3e635"}}>تسویه حساب – زرین‌پال</h1>
      <p className="text-xs mb-6" style={{color:"var(--muted-foreground)"}}>
        درگاه: <b>ZarinPal</b> – {process.env.NEXT_PUBLIC_ZARIN_MERCHANT_ID ? "Live" : "Sandbox / Mock"} – برای فعال‌سازی واقعی، در .env بگذارید: <code>ZARIN_MERCHANT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx</code>
      </p>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card p-5 space-y-4">
          <h3 className="font-bold">اطلاعات ارسال</h3>
          <div className="grid sm:grid-cols-2 gap-3 text-sm">
            <input className="input" placeholder="نام و نام خانوادگی *" value={name} onChange={e=>setName(e.target.value)} />
            <input className="input" placeholder="تلفن *" dir="ltr" value={phone} onChange={e=>setPhone(e.target.value)} />
            <input className="input sm:col-span-2" placeholder="آدرس" />
            <div className="grid grid-cols-2 gap-3 sm:col-span-2">
              <input className="input" placeholder="کد پستی" dir="ltr" />
              <select className="input"><option>تهران</option><option>اصفهان</option><option>مشهد</option><option>شیراز</option><option>تبریز</option></select>
            </div>
            <input className="input sm:col-span-2" placeholder="ایمیل (رسید پرداخت)" type="email" dir="ltr" value={email} onChange={e=>setEmail(e.target.value)} />
          </div>

          <h3 className="font-bold pt-2">پرداخت</h3>
          <div className="flex gap-4 text-xs flex-wrap">
            <label className="flex items-center gap-2 px-3 py-2 rounded-xl border" style={{borderColor:"var(--primary)", background:"rgba(96,165,250,.08)"}}>
              <input type="radio" name="pay" defaultChecked readOnly /> 
              <span>درگاه <b>زرین‌پال</b> – کارت شتاب</span>
              <img alt="zarinpal" src="https://cdn.zarinpal.com/badges/trustLogo/1.svg" className="h-5 opacity-80" onError={e=>{(e.target as HTMLElement).style.display="none"}} />
            </label>
            <label className="flex items-center gap-2 px-3 py-2 rounded-xl border" style={{borderColor:"var(--border)"}}><input type="radio" name="pay" disabled /> کارت به کارت (غیرفعال در دمو)</label>
          </div>

          <button onClick={pay} disabled={loading || items.length===0} className="btn btn-primary w-full text-[14px] disabled:opacity-60">
            {loading ? "در حال اتصال به زرین‌پال…" : `پرداخت ${totalToman>0 ? totalToman.toLocaleString("fa-IR")+" تومان" : "–"} با زرین‌پال`}
          </button>
          <p className="text-[11px]" style={{color:"var(--muted-foreground)"}}>
            پرداخت امن – اگر <code>ZARIN_MERCHANT_ID</code> تنظیم نباشد، تراکنش شبیه‌سازی می‌شود و به‌صورت خودکار Verify می‌شود – مناسب تست لوکال.
          </p>
        </div>

        <div className="card p-5 h-fit sticky top-24">
          <h4 className="font-bold mb-3">خلاصه سبد ({count.toLocaleString("fa-IR")} قلم)</h4>
          <div className="space-y-2 max-h-80 overflow-y-auto text-[12px]">
            {items.length===0 ? <p style={{color:"var(--muted-foreground)"}}>سبد خالی است – <Link href="/shop" style={{color:"#a3e635"}} className="underline">فروشگاه</Link></p> :
              items.map(i=>(
                <div key={i.slug} className="flex justify-between border-b pb-2" style={{borderColor:"var(--border)"}}>
                  <span className="truncate ps-2">{i.title} × {i.qty.toLocaleString("fa-IR")}</span>
                  <span style={{color:"var(--muted-foreground)"}}>{i.price}</span>
                </div>
              ))
            }
          </div>
          <div className="mt-3 space-y-1 text-[13px]">
            <div className="flex justify-between"><span>جمع جزء</span><span>{totalToman.toLocaleString("fa-IR")} تومان</span></div>
            <div className="flex justify-between" style={{color:"var(--muted-foreground)"}}><span>ارسال</span><span>رایگان</span></div>
            <div className="flex justify-between font-black text-[15px] pt-2 border-t" style={{borderColor:"var(--border)"}}><span>مبلغ قابل پرداخت</span><span style={{color:"#a3e635"}}>{totalToman.toLocaleString("fa-IR")} تومان</span></div>
            <div className="text-[10px]" style={{color:"var(--muted-foreground)"}}>≈ {(amountRial).toLocaleString("fa-IR")} ریال – درگاه زرین‌پال</div>
          </div>
        </div>
      </div>
    </main>
  );
}

```

---

## `app/shop/page.tsx`

```tsx
import ShopGrid from "@/features/shop/components/ShopGrid";
export const metadata = { title: "فروشگاه | تکباکس" };
export default function ShopPage(){ return <ShopGrid />; }

```

---

## `app/shop/[slug]/page.tsx`

```tsx
import { getBySlug, getModuleItems } from "@/lib/content";
import ContentDetail from "@/features/content/components/ContentDetail";
import { notFound } from "next/navigation";

type P = Promise<{ slug: string }>;

export async function generateStaticParams() {
  const mod = "shop" as any;
  return getModuleItems(mod).map((p) => ({ slug: p.slug }));
}

export default async function Page({ params }: { params: P }) {
  const { slug } = await params;
  const mod = "shop" as any;
  const item = getBySlug(mod, slug);
  if (!item) return notFound();
  return <ContentDetail item={item} />;
}

export async function generateMetadata({ params }: { params: P }) {
  const { slug } = await params;
  const mod = "shop" as any;
  const item = getBySlug(mod, slug);
  return { title: item ? `${item.title} | تکباکس` : "یافت نشد" };
}

```

---

## `app/tools/page.tsx`

```tsx
import ToolsGrid from "@/features/tools/components/ToolsGrid";
export const metadata = { title: "ابزارها | تکباکس" };
export default function ToolsPage(){ return <ToolsGrid />; }

```

---

## `app/tools/raid-calculator/page.tsx`

```tsx
import RaidCalculator from "@/features/tools/components/RaidCalculator";
export const metadata = { title: "ماشین حساب RAID | تکباکس" };
export default function Page(){
  return (
    <main className="max-w-4xl mx-auto px-4 py-12" dir="rtl">
      <h1 className="text-2xl font-black mb-2" style={{color:"var(--accent-cyan)"}}>RAID Calculator</h1>
      <p className="text-sm mb-6" style={{color:"var(--muted-foreground)"}}>محاسبه ظرفیت مفید، تحمل خطا و راندمان – اجرا مستقیم در مرورگر</p>
      <RaidCalculator />
      <div className="text-[11px] mt-4" style={{color:"var(--muted-foreground)"}}>
        راهنما: <a href="/blog/hp-raid-config" className="underline" style={{color:"var(--accent-cyan)"}}>راهنمای RAID در سرورهای HP – بلاگ تکباکس</a>
      </div>
    </main>
  );
}

```

---

## `app/tools/subnet-calculator/page.tsx`

```tsx
import SubnetCalculator from "@/features/tools/components/SubnetCalculator";
export const metadata = { title: "ماشین حساب Subnet | تکباکس" };
export default function Page(){
  return (
    <main className="max-w-3xl mx-auto px-4 py-12" dir="rtl">
      <h1 className="text-2xl font-black mb-2" style={{color:"var(--accent-cyan)"}}>Subnet Calculator فارسی</h1>
      <p className="text-sm mb-6" style={{color:"var(--muted-foreground)"}}>CIDR → Network / Broadcast / Host Range</p>
      <SubnetCalculator />
    </main>
  );
}

```

---

## `app/tools/[slug]/page.tsx`

```tsx
import { getBySlug, getModuleItems } from "@/lib/content";
import ContentDetail from "@/features/content/components/ContentDetail";
import { notFound } from "next/navigation";

type P = Promise<{ slug: string }>;

export async function generateStaticParams() {
  const mod = "tools" as any;
  return getModuleItems(mod).map((p) => ({ slug: p.slug }));
}

export default async function Page({ params }: { params: P }) {
  const { slug } = await params;
  const mod = "tools" as any;
  const item = getBySlug(mod, slug);
  if (!item) return notFound();
  return <ContentDetail item={item} />;
}

export async function generateMetadata({ params }: { params: P }) {
  const { slug } = await params;
  const mod = "tools" as any;
  const item = getBySlug(mod, slug);
  return { title: item ? `${item.title} | تکباکس` : "یافت نشد" };
}

```

---

## `app/workwithus/page.tsx`

```tsx
import jobs from "@/data/jobs.json";
import Link from "next/link";

export const metadata = { title: "فرصت‌های شغلی | تکباکس" };

export default function WorkWithUs(){
  return (
    <main className="max-w-5xl mx-auto px-4 py-14" dir="rtl">
      <h1 className="text-3xl font-black mb-2">فرصت‌های شغلی تکباکس</h1>
      <p className="text-sm text-muted-foreground mb-8">به تیم رسانه زیرساخت ایران بپیوندید – {jobs.length} موقعیت فعال</p>

      <div className="grid gap-4">
        {jobs.map(j=>(
          <Link key={j.slug} href={`/workwithus/${j.slug}`} className="card p-5 hover:shadow-glass hover:-translate-y-0.5 transition-all group">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="font-extrabold text-[17px] group-hover:text-brand">{j.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">{j.excerpt}</p>
                <div className="flex flex-wrap gap-2 mt-3 text-[10px]">
                  <span className="badge">{j.type}</span>
                  <span className="badge">{j.remote}</span>
                  <span className="badge">{j.team}</span>
                </div>
              </div>
              <div className="text-left text-[11px] text-muted-foreground">
                {j.date_fa}
                <div className="text-brand mt-1">مشاهده →</div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}

```

---

## `app/workwithus/[slug]/page.tsx`

```tsx
"use client";
import jobs from "@/data/jobs.json";
import Link from "next/link";
import { use } from "react";

export default function JobPage({ params }: { params: Promise<{slug:string}> }){
  const { slug } = use(params);
  const job = (jobs as any[]).find((j:any)=>j.slug===slug);
  if(!job) return <div className="p-10 text-center">یافت نشد</div>;

  return (
    <main className="max-w-3xl mx-auto px-4 py-12" dir="rtl">
      <div className="text-[11px] text-muted-foreground mb-2"><Link href="/workwithus" className="hover:text-foreground">فرصت‌های شغلی</Link> / {job.title}</div>
      <h1 className="text-2xl md:text-3xl font-black">{job.title}</h1>
      <div className="flex flex-wrap gap-2 mt-3 text-[11px]">
        <span className="badge">{job.type}</span>
        <span className="badge">{job.remote}</span>
        <span className="badge">{job.team}</span>
        <span className="text-muted-foreground">{job.date_fa}</span>
      </div>
      <div className="card p-5 mt-6 text-[14px] leading-8" style={{color:"var(--muted-foreground)"}}>
        {job.description}
        <ul className="pr-5 mt-4 space-y-1 text-[13px]" style={{listStyle:"disc"}}>
          <li>رزومه + نمونه کار</li>
          <li>مصاحبه فنی آنلاین</li>
          <li>شروع همکاری: مرداد ۱۴۰۵</li>
        </ul>
      </div>

      <form className="card p-5 mt-6 space-y-3" onSubmit={(e)=>{e.preventDefault(); alert("درخواست شما ثبت شد – تیم منابع انسانی تکباکس بررسی می‌کند.");}}>
        <h3 className="font-bold">ارسال درخواست</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          <input className="input text-sm" placeholder="نام و نام خانوادگی *" required />
          <input className="input text-sm" placeholder="ایمیل *" type="email" required dir="ltr" />
          <input className="input text-sm" placeholder="تلفن" dir="ltr" />
          <input className="input text-sm" placeholder="لینک رزومه / لینکدین" dir="ltr" />
        </div>
        <textarea className="input min-h-[120px] text-sm" placeholder="کمی درباره خودتان و چرا تکباکس…" />
        <label className="block text-xs">آپلود CV (PDF)
          <input type="file" accept=".pdf,.doc,.docx" className="block mt-1 text-[11px]" />
        </label>
        <div className="flex justify-end gap-2">
          <Link href="/workwithus" className="btn btn-ghost">بازگشت</Link>
          <button className="btn btn-primary" type="submit">ارسال درخواست</button>
        </div>
        <p className="text-[11px]" style={{color:"var(--muted-foreground)"}}>با استفاده از اطلاعات پروفایل شما پر می‌شود – می‌توانید در <Link href="/account" style={{color:"var(--brand)"}} className="underline">حساب کاربری</Link> تکمیل کنید.</p>
      </form>
    </main>
  );
}

```

---

## `components/animations/FadeIn.tsx`

```tsx
"use client";
import { motion, type HTMLMotionProps } from "framer-motion";
import { fadeIn } from "@/design/tokens/motion";
type Props = HTMLMotionProps<"div"> & { children: React.ReactNode };
export function FadeIn({ children, ...rest }: Props){
  return <motion.div {...fadeIn} {...rest}>{children}</motion.div>;
}
export default FadeIn;

```

---

## `components/animations/index.ts`

```ts
export * from "./FadeIn";
export * from "./MotionSection";
export * from "./SlideIn";

```

---

## `components/animations/MotionSection.tsx`

```tsx
"use client";
import { motion } from "framer-motion";
import { fadeInUp } from "@/design/tokens/motion";
import * as React from "react";
export function MotionSection({
  children,
  ...p
}: React.ComponentProps<typeof motion.section>) {
  return (
    <motion.section {...fadeInUp} {...p}>
      {children}
    </motion.section>
  );
}
export default MotionSection;

```

---

## `components/animations/SlideIn.tsx`

```tsx
"use client";
import { motion } from "framer-motion";
import { slideIn } from "@/design/tokens/motion";
export function SlideIn(p: any) {
  return <motion.div {...slideIn} {...p} />;
}
export default SlideIn;

```

---

## `components/layout/Footer.tsx`

```tsx
import Link from "next/link"
import { SVGProps } from "react"

const navigation = {
  main: [
    { name: "ارتباط با ما", href: "/contact" },
    { name: "درباره ما", href: "/about" },
    { name: "فرصت‌های شغلی", href: "/workwithus" },
    { name: "درخواست مشاوره", href: "/consultation" },
  ],
  social: [
    {
      name: "Instagram",
      href: "https://instagram.com/techbox",
      icon: (props: SVGProps<SVGSVGElement>) => (
        <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
          <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" />
        </svg>
      ),
    },
    {
      name: "X",
      href: "https://x.com/techbox",
      icon: (props: SVGProps<SVGSVGElement>) => (
        <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
          <path d="M13.6823 10.6218L20.2391 3H18.6854L12.9921 9.61788L8.44486 3H3.2002L10.0765 13.0074L3.2002 21H4.75404L10.7663 14.0113L15.5685 21H20.8131L13.6819 10.6218H13.6823ZM11.5541 13.0956L10.8574 12.0991L5.31391 4.16971H7.70053L12.1742 10.5689L12.8709 11.5655L18.6861 19.8835H16.2995L11.5541 13.096V13.0956Z" />
        </svg>
      ),
    },
    {
      name: "YouTube",
      href: "https://youtube.com/@techbox",
      icon: (props: SVGProps<SVGSVGElement>) => (
        <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
          <path
            fillRule="evenodd"
            d="M19.812 5.418c.861.23 1.538.907 1.768 1.768C21.998 8.746 22 12 22 12s0 3.255-.418 4.814a2.504 2.504 0 0 1-1.768 1.768c-1.56.419-7.814.419-7.814.419s-6.255 0-7.814-.419a2.505 2.505 0 0 1-1.768-1.768C2 15.255 2 12 2 12s0-3.255.417-4.814a2.507 2.507 0 0 1 1.768-1.768C5.744 5 11.998 5 11.998 5s6.255 0 7.814.418ZM15.194 12 10 15V9l5.194 3Z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
  ],
}

export default function FooterSection() {
  return (
    <footer>
      <div className="px-6 pb-8">
        <div className="flex flex-row md:flex-row justify-around gap-12 md:gap-24">
          {/* ستون دوم: لینک‌ها */}
          <div className="text-right">
            <h4 className="text-sm font-semibold text-foreground">لینک‌های سریع</h4>
            <div className="mt-4 flex flex-col gap-3">
              {navigation.main.map((item) => (
                <Link key={item.name} href={item.href} className="text-sm text-muted-foreground hover:text-foreground">
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          {/* ستون سوم: اجتماعی */}
          <div className="text-right">
            <h4 className="text-sm font-semibold text-foreground">شبکه‌های اجتماعی</h4>
            <div className="mt-4 flex gap-4">
              {navigation.social.map((item) => (
                <Link key={item.name} href={item.href} target="_blank" className="text-muted-foreground hover:text-foreground">
                  <item.icon className="size-6" />
                </Link>
              ))}
            </div>
          </div>
        </div>
        {/* کپی‌رایت */}
        <div className="mt-12 border-t border-border pt-6 text-center">
          <p className="text-sm text-muted-foreground">
            © 1405 تمامی حقوق مادی و معنوی این وب‌سایت محفوظ و متعلق به شرکت «هونامیک ارتباط رستاک» میباشد.
          </p>
        </div>
      </div>
    </footer>
  )
}

```

---

## `components/layout/LayoutShell.tsx`

```tsx
"use client";

import * as React from "react";
import SidebarMain from "@/components/layout/Sidebar";
import FooterSection from "@/components/layout/Footer";
import { CartProvider } from "@/providers/cart.provider";
import Chatbot from "@/features/chat/components/Chatbot";

export function LayoutShell({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
    <div className="relative min-h-screen text-foreground">
      <div className="relative z-10 flex min-h-screen w-full">
        <SidebarMain />
        <main className="min-w-0 flex-1 flex flex-col">
          <div className="flex-1 w-full">
            {children}
          </div>
          <FooterSection />
        </main>
      </div>
      <Chatbot />
    </div>
    </CartProvider>
  );
}

```

---

## `components/layout/Sidebar.tsx`

```tsx
"use client";

import * as React from "react";
import { SidebarMainProps } from "@/types/sidebar.types";
import { desktopStore, mobileStore } from "@/stores/sidebar.store";
import { themeStore } from "@/stores/theme.store";
import SidebarShell from "@/components/layout/SidebarShell";

export default function SidebarMain({ onMobileOpenChange }: SidebarMainProps) {
  const desktopOpen = React.useSyncExternalStore(
    desktopStore.subscribe,
    desktopStore.getSnapshot,
    () => true
  );

  const mobileOpen = React.useSyncExternalStore(
    mobileStore.subscribe,
    mobileStore.getSnapshot,
    () => false
  );

  const theme = React.useSyncExternalStore(
    themeStore.subscribe,
    themeStore.getClientSnapshot,
    themeStore.getServerSnapshot
  );

  React.useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  React.useEffect(() => {
    onMobileOpenChange?.(mobileOpen);
  }, [mobileOpen, onMobileOpenChange]);

  // اگر روی دسکتاپ بودیم و mobileOpen از قبل true مانده بود، ریستش کن
  React.useEffect(() => {
    const isDesktop = window.matchMedia("(min-width: 640px)").matches;
    if (isDesktop && mobileOpen) {
      mobileStore.set(false);
    }
  }, [mobileOpen]);

  // قفل اسکرول فقط وقتی منوی موبایل باز است و واقعاً روی موبایل هستیم
  React.useEffect(() => {
    const isMobile = window.matchMedia("(max-width: 639px)").matches;
    if (!mobileOpen || !isMobile) return;
    const prevBodyOverflow = document.body.style.overflow;
    const prevHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevBodyOverflow;
      document.documentElement.style.overflow = prevHtmlOverflow;
    };
  }, [mobileOpen]);

  const onToggleDesktop = React.useCallback(() => {
    desktopStore.set(!desktopOpen);
  }, [desktopOpen]);

  const onToggleMobile = React.useCallback(() => {
    mobileStore.set(!mobileOpen);
  }, [mobileOpen]);

  const onCloseMobile = React.useCallback(() => {
    mobileStore.set(false);
  }, []);

  const onToggleTheme = React.useCallback(() => {
    themeStore.toggle();
  }, []);

  return (
    <SidebarShell
      mobileOpen={mobileOpen}
      desktopOpen={desktopOpen}
      theme={theme}
      onToggleTheme={onToggleTheme}
      onToggleMobile={onToggleMobile}
      onCloseMobile={onCloseMobile}
      onToggleDesktop={onToggleDesktop}
    />
  );
}

```

---

## `components/layout/SidebarContent.tsx`

```tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Moon, Sun, Bell, Search, Clock, ShoppingCart } from "lucide-react";
import {
  ICON_STROKE,
  navItems,
  accountItem,
  themeIconClass,
  linkBase,
  linkInactive,
  isActive,
} from "@/config/sidebar.config";
import { SidebarContentProps } from "@/types/sidebar.types";
import SidebarTooltip from "@/components/layout/SidebarTooltip";
import { useEffect, useState, useMemo } from "react";
import { getCurrentUserClient, logout, type AppUser } from "@/lib/auth";
import { useCart } from "@/providers/cart.provider";
import { getAllAcross } from "@/lib/content";

export default function SidebarContent({
  expanded,
  theme,
  onToggleTheme,
  onLogoClick,
  onLinkClick,
}: SidebarContentProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<AppUser | null>(null);
  const [q, setQ] = useState("");
  const [now, setNow] = useState<Date | null>(null);
  const [notifOpen, setNotifOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);

  useEffect(()=>{ setUser(getCurrentUserClient()); setNow(new Date()); const t=setInterval(()=>setNow(new Date()), 30000); return ()=>clearInterval(t); },[]);
  useEffect(()=>{ const h=()=>setUser(getCurrentUserClient()); window.addEventListener("storage",h); return ()=>window.removeEventListener("storage",h);},[]);

  const notifications = useMemo(()=> getAllAcross().slice(0,6), []);
  const cart = (()=>{ try{ const { useCart:uc } = require("@/providers/cart.provider"); return null;}catch{return null} })();
  // useCart must be inside a client that is under CartProvider – Sidebar is under CartProvider via LayoutShell – safe:
  let cartCount = 0;
  try { /* eslint-disable-next-line react-hooks/rules-of-hooks */ const { count } = require("@/providers/cart.provider").useCart(); cartCount = count; } catch {}
  // fallback – read directly:
  if(typeof window !== "undefined" && cartCount===0){
    try{ const raw = localStorage.getItem("tb_cart_v2"); if(raw){ const arr = JSON.parse(raw); cartCount = arr.reduce((s:number,i:any)=>s+(i.qty||0),0);} }catch{}
  }

  const doSearch = (e?: React.FormEvent)=>{ e?.preventDefault(); if(q.trim()) { router.push(`/search?q=${encodeURIComponent(q.trim())}`); onLinkClick?.(); } };

  const iconRail = [
    { label: "جستجو", icon: Search, onClick: ()=> { if(!expanded){ const v = prompt("جستجو در تکباکس:"); if(v) router.push(`/search?q=${encodeURIComponent(v)}`);} } },
    { label: "مشاوره VIP", href: "/consultation", icon: null, emoji: "⚡" },
    { label: "سبد خرید", onClick: ()=> { try{ const ev = new CustomEvent("tb_cart_open"); window.dispatchEvent(ev); }catch{} /* CartIconButton handles */ }, badge: cartCount>0 ? String(cartCount) : "", icon: ShoppingCart },
    { label: now ? new Intl.DateTimeFormat("fa-IR",{dateStyle:"full", timeStyle:"short", timeZone:"Asia/Tehran"}).format(now) : "ساعت تهران", icon: Clock },
  ];

  return (
    <div className="relative flex h-full w-full flex-col text-[13px]" dir="rtl">
      {/* Header */}
      <header className="shrink-0 p-3 space-y-3">
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 shrink-0 relative">
            {onLogoClick ? (
              <SidebarTooltip label="باز/بستن منو" enabled={!expanded}>
                <button onClick={onLogoClick} className="relative w-10 h-10 rounded-xl overflow-hidden hover:opacity-90 transition-opacity" aria-label="toggle sidebar">
                  <Image src="/logo.png" alt="تکباکس" fill sizes="40px" className="object-contain" />
                </button>
              </SidebarTooltip>
            ) : (
              <Image src="/logo.png" alt="تکباکس" fill sizes="40px" className="object-contain" />
            )}
          </div>
          <div className={`transition-all duration-300 overflow-hidden ${expanded ? "max-w-[170px] opacity-100" : "max-w-0 opacity-0"}`}>
            <div className="text-[14px] font-black leading-tight" style={{color:"var(--foreground)"}}>تکباکس</div>
            <div className="text-[10px] leading-tight" style={{color:"var(--muted-foreground)"}}>پاتوق بچه‌های فناوری اطلاعات</div>
          </div>
          {/* notif + cart – always visible, even collapsed */}
          <div className="ms-auto flex items-center gap-1">
            <div className="relative">
              <SidebarTooltip label="اعلان‌ها" enabled={!expanded}>
                <button onClick={()=>setNotifOpen(o=>!o)} className="icon-rail-btn relative" aria-label="notifications">
                  <Bell size={18} />
                  <span className="absolute top-1.5 left-1.5 w-1.5 h-1.5 bg-rose-500 rounded-full" />
                </button>
              </SidebarTooltip>
              {notifOpen && (
                <div className="fixed sm:absolute right-3 sm:right-0 top-20 sm:top-10 w-[320px] max-w-[92vw] card p-3 z-modal text-right" style={{zIndex:500}}>
                  <div className="text-[12px] font-bold mb-2">آخرین رویدادها</div>
                  <ul className="space-y-2 max-h-80 overflow-y-auto text-[11px]">
                    {notifications.map((n:any)=>(
                      <li key={n.slug} className="border-b border-border/40 pb-2 last:border-0">
                        <Link href={`/${n.module}/${n.slug}`} onClick={()=>setNotifOpen(false)} className="hover:text-brand line-clamp-2 leading-5">{n.title}</Link>
                        <div style={{color:"var(--muted-foreground)"}} className="text-[10px] mt-0.5">{n.date_fa} • {n.module}</div>
                      </li>
                    ))}
                  </ul>
                  <button onClick={()=>setNotifOpen(false)} className="text-[10px] text-muted-foreground mt-2 hover:text-foreground w-full text-center">بستن</button>
                </div>
              )}
            </div>
            <SidebarTooltip label={cartCount>0 ? `سبد خرید – ${cartCount} قلم` : "سبد خرید"} enabled={!expanded}>
              <button onClick={()=>{ try{ (document.querySelector('[class*="CartIconButton"]') as HTMLElement)?.click(); }catch{}; /* fallback */ const el=document.querySelector('button[aria-label*="سبد"]') as HTMLElement; el?.click(); const ev = new Event("click"); }} className="icon-rail-btn relative" aria-label="سبد خرید">
                <ShoppingCart size={18} />
                {cartCount>0 && <span className="absolute -top-0.5 -left-0.5 bg-lime-400 text-black text-[9px] min-w-[16px] h-[16px] rounded-full flex items-center justify-center px-1 font-bold">{cartCount > 99 ? "۹۹+" : cartCount.toLocaleString("fa-IR")}</span>}
              </button>
            </SidebarTooltip>
          </div>
        </div>

        {/* search – expanded full, collapsed icon */}
        {expanded ? (
          <form onSubmit={doSearch} className="relative">
            <input value={q} onChange={e=>setQ(e.target.value)} placeholder="جستجو در تکباکس…" className="input !py-2 text-xs pe-8" />
            <button type="submit" className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" aria-label="search">
              <Search size={14} />
            </button>
          </form>
        ) : (
          <div className="flex flex-col items-center gap-1">
            <SidebarTooltip label="جستجو" enabled={true}>
              <button onClick={()=>{ const v = prompt("جستجو:"); if(v) router.push(`/search?q=${encodeURIComponent(v)}`); }} className="icon-rail-btn">
                <Search size={18} />
              </button>
            </SidebarTooltip>
          </div>
        )}

        {/* VIP consultation – expanded full, collapsed icon */}
        {expanded ? (
          <Link href="/consultation" onClick={onLinkClick}
            className="w-full rounded-xl text-white text-[12px] font-black py-2.5 text-center shadow-lg hover:brightness-110 transition-all block"
            style={{background:"linear-gradient(135deg,#1e40af 0%, #3b82f6 50%, #0ea5e9 100%)"}}>
            مشاوره VIP ⚡
          </Link>
        ) : (
          <SidebarTooltip label="مشاوره VIP" enabled={true}>
            <Link href="/consultation" onClick={onLinkClick} className="icon-rail-btn" style={{color:"#60a5fa"}}>
              <span className="text-[16px]">⚡</span>
            </Link>
          </SidebarTooltip>
        )}

        {/* theme toggle – font size FIXED to text-xs (was larger than logo) */}
        <SidebarTooltip label={theme==="dark" ? "حالت روز" : "حالت شب"} enabled={!expanded}>
          <button type="button" onClick={onToggleTheme}
            className="group flex w-full items-center text-[11px] text-muted-foreground hover:text-foreground transition-colors rounded-lg h-10">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center">
              <Sun className={`h-[18px] w-[18px] absolute transition-all ${theme==="dark" ? "opacity-100 scale-100 text-yellow-400" : "opacity-0 scale-0"}`} />
              <Moon className={`h-[18px] w-[18px] absolute transition-all ${theme==="dark" ? "opacity-0 scale-0" : "opacity-100 scale-100"}`} style={{color:"var(--muted-foreground)"}} />
            </span>
            <span className={`whitespace-nowrap overflow-hidden transition-all ${expanded ? "max-w-[120px] opacity-100" : "max-w-0 opacity-0"} text-[11px]`}>
              {theme==="dark" ? "حالت روز" : "حالت شب"}
            </span>
          </button>
        </SidebarTooltip>

        <div className="border-t" style={{borderColor:"var(--border)"}} />
      </header>

      {/* NAV – includes: Home, Blog, News, Media, Shop, Tools, Forum, Review, Download, + RAID Calculator, Subnet Calculator, مشاوره VIP – all from navItems */}
      <nav className="flex-1 overflow-y-auto px-2 py-1">
        <div className="flex flex-col gap-[2px]">
          {navItems.map(item=>{
            const Icon = item.icon as any;
            const active = isActive(pathname, item.href);
            const iconClass = active ? (item.iconActiveClassName || "text-primary") : (item.iconClassName || "text-muted-foreground");
            return (
              <SidebarTooltip key={item.href} label={item.title} enabled={!expanded}>
                <Link href={item.href} onClick={onLinkClick}
                  className={`${linkBase} ${active ? "text-foreground" : linkInactive}`}
                  style={{background: active ? "var(--secondary)" : "transparent", fontSize:"13px"}}
                >
                  {active && <span className="absolute right-0 top-[8px] bottom-[8px] w-[3px] rounded-full" style={{background:"var(--primary)"}} />}
                  <span className="w-10 h-10 flex items-center justify-center shrink-0">
                    <Icon size={19} className={iconClass} strokeWidth={1.75} />
                  </span>
                  <span className={`truncate transition-all ${expanded ? "opacity-100 max-w-[160px]" : "opacity-0 max-w-0"}`}>{item.title}</span>
                </Link>
              </SidebarTooltip>
            );
          })}
        </div>
      </nav>

      {/* bottom – date/time + account – collapsed icons included */}
      <div className="shrink-0 border-t px-2 py-2 space-y-2" style={{borderColor:"var(--border)"}}>
        {/* date/time */}
        {expanded ? (
          now && (
            <div className="text-center py-1 rounded-lg" style={{background:"var(--muted)"}}>
              <div className="text-[10px]" style={{color:"var(--muted-foreground)"}}>
                {now.toLocaleDateString("fa-IR", { weekday:"long", timeZone:"Asia/Tehran" })}
              </div>
              <div className="text-[11px] font-mono font-bold" dir="ltr">
                {now.toLocaleTimeString("fa-IR", { hour:"2-digit", minute:"2-digit", second:"2-digit", timeZone:"Asia/Tehran" })}
              </div>
              <div className="text-[10px]" style={{color:"var(--muted-foreground)"}}>
                {now.toLocaleDateString("fa-IR", { year:"numeric", month:"long", day:"numeric", timeZone:"Asia/Tehran" })}
              </div>
            </div>
          )
        ) : (
          <SidebarTooltip
            enabled={true}
            label={now ? `${now.toLocaleDateString("fa-IR",{timeZone:"Asia/Tehran"})} – ${now.toLocaleTimeString("fa-IR",{hour:"2-digit",minute:"2-digit",timeZone:"Asia/Tehran"})} تهران` : "ساعت تهران"}
          >
            <button className="icon-rail-btn w-full" aria-label="date time">
              <Clock size={18} />
            </button>
          </SidebarTooltip>
        )}

        {/* account */}
        {user ? (
          <Link href="/account" onClick={onLinkClick}
            className={`${linkBase} ${isActive(pathname,"/account") ? "" : linkInactive}`}
            style={{fontSize:"12px", background: isActive(pathname,"/account") ? "var(--secondary)" : "transparent"}}
          >
            <span className="w-10 h-10 flex items-center justify-center shrink-0">
              <img src={user.avatar || "/assets/hooman.png"} alt={user.name} width={28} height={28} className="rounded-full object-cover" style={{border:"1px solid var(--border)"}} />
            </span>
            <span className={`truncate leading-tight ${expanded ? "opacity-100 max-w-[140px]" : "opacity-0 max-w-0"} overflow-hidden transition-all`}>
              <span className="block font-bold text-[12px]">{user.name}</span>
              <span className="block text-[10px]" style={{color:"var(--muted-foreground)"}}>{user.role==="super_admin"?"مدیر کل":"ویراستار"}</span>
            </span>
          </Link>
        ) : (
          <SidebarTooltip label="ورود / حساب کاربری" enabled={!expanded}>
            <button onClick={()=>setLoginOpen(true)} className={`${linkBase} ${linkInactive} w-full`} style={{fontSize:"12px"}}>
              <span className="w-10 h-10 flex items-center justify-center">
                <span className="w-7 h-7 rounded-full flex items-center justify-center text-[11px]" style={{background:"var(--muted)"}}>👤</span>
              </span>
              <span className={`${expanded ? "opacity-100 max-w-[120px]" : "opacity-0 max-w-0"} truncate transition-all`}>ورود</span>
            </button>
          </SidebarTooltip>
        )}
      </div>

      {/* login modal – z-[500] – fixes “behind feeds” bug */}
      {loginOpen && (
        <div className="fixed inset-0 flex items-center justify-center p-4" style={{zIndex:500}} dir="rtl">
          <div className="absolute inset-0" style={{background:"rgba(0,0,0,.6)", backdropFilter:"blur(4px)"}} onClick={()=>setLoginOpen(false)} />
          <div className="relative card w-full max-w-sm p-5 space-y-3" style={{zIndex:501}}>
            <div className="flex justify-between items-center">
              <h3 className="font-black text-[15px]">ورود به تکباکس</h3>
              <button onClick={()=>setLoginOpen(false)} className="text-muted-foreground hover:text-foreground">✕</button>
            </div>
            <p className="text-[11px]" style={{color:"var(--muted-foreground)"}}>
              حساب تست: <b>sara</b> / <b>nima</b> / <b>rojina</b> / <b>admin</b><br/>رمز همه: <code>techbox123</code>
            </p>
            <a href="/admin/login" onClick={()=>setLoginOpen(false)} className="btn btn-primary w-full text-[13px]">رفتن به ورود کامل →</a>
            <button onClick={()=>setLoginOpen(false)} className="btn btn-ghost w-full text-[11px]">بستن</button>
          </div>
        </div>
      )}
    </div>
  );
}

```

---

## `components/layout/SidebarShell.tsx`

```tsx
"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import SidebarContent from "@/components/layout/SidebarContent";
import { sidebarBase } from "@/config/sidebar.config";
import { SidebarShellProps } from "@/types/sidebar.types";
import { useFabTop, saveFabTop } from "@/hooks/useFabTop";

const DRAG_THRESHOLD = 6;
const BTN_SIZE = 72;
const SAFE_MARGIN = 16;

const MOBILE_SIDEBAR_WIDTH = "w-72";
const MOBILE_FAB_OPEN_RIGHT = "right-72";

const DESKTOP_SIDEBAR_OPEN_WIDTH = "w-64";
const DESKTOP_SIDEBAR_CLOSED_WIDTH = "w-16";

export default function SidebarShell({
  mobileOpen,
  desktopOpen,
  theme,
  onToggleTheme,
  onToggleMobile,
  onCloseMobile,
  onToggleDesktop,
}: SidebarShellProps) {
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const [dragging, setDragging] = useState(false);
  const pointerStartYRef = useRef(0);
  const topStartRef = useRef(0);
  const movedRef = useRef(false);

  const storedTop = useFabTop();
  const [dragTop, setDragTop] = useState<number | null>(null);
  const btnTop = dragTop ?? storedTop;

  const getBtnHeight = () => btnRef.current?.offsetHeight ?? BTN_SIZE;

  const clampTopByHeight = (top: number, btnH: number) => {
    const minTop = SAFE_MARGIN;
    const maxTop = window.innerHeight - btnH - SAFE_MARGIN;
    if (maxTop <= minTop) return (window.innerHeight - btnH) / 2;
    return Math.min(Math.max(minTop, top), maxTop);
  };

  const clampTop = (top: number) => clampTopByHeight(top, getBtnHeight());

  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    pointerStartYRef.current = e.clientY;
    topStartRef.current = btnTop;
    movedRef.current = false;
    setDragging(true);
    setDragTop(btnTop);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!dragging) return;
    const deltaY = e.clientY - pointerStartYRef.current;
    if (!movedRef.current && Math.abs(deltaY) >= DRAG_THRESHOLD) {
      movedRef.current = true;
    }
    setDragTop(clampTop(topStartRef.current + deltaY));
  };

  const endDrag = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!dragging) return;
    setDragging(false);
    if (dragTop !== null) {
      saveFabTop(dragTop);
      setDragTop(null);
    }
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (movedRef.current) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    onToggleMobile();
  };

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={handleClick}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        style={{ top: `${btnTop}px`, touchAction: "none" }}
        className={`fixed z-[60] select-none rounded-full drop-shadow-lg sm:hidden
          transition-[right] duration-300 translate-x-1/2
          ${mobileOpen ? MOBILE_FAB_OPEN_RIGHT : "right-0"}
          ${dragging ? "cursor-grabbing" : "cursor-grab"}`}
        aria-label={mobileOpen ? "بستن منو" : "باز کردن منو"}
      >
        <div className="relative h-[72px] w-[72px] rounded-full bg-card/90 border border-border shadow-glass backdrop-blur flex items-center justify-center">
          <Image
            src="/logo.png"
            alt="لوگو تکباکس"
            fill
            priority
            sizes="72px"
            draggable={false}
            onDragStart={(e) => e.preventDefault()}
            className="pointer-events-none rounded-full object-contain p-2"
          />
        </div>
      </button>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm sm:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed right-0 top-0 z-50 h-full transform transition-transform duration-300 sm:hidden ${MOBILE_SIDEBAR_WIDTH} ${sidebarBase} ${
          mobileOpen ? "translate-x-0" : "translate-x-full"
        }`}
        aria-hidden={!mobileOpen}
      >
        <SidebarContent
          expanded
          theme={theme}
          onToggleTheme={onToggleTheme}
          onLinkClick={onCloseMobile}
        />
      </aside>

      <div
        className={`hidden shrink-0 sm:block transition-[width] duration-300 ease-in-out ${
          desktopOpen
            ? DESKTOP_SIDEBAR_OPEN_WIDTH
            : DESKTOP_SIDEBAR_CLOSED_WIDTH
        }`}
        aria-hidden="true"
      />

      <aside
        className={`fixed right-0 top-0 hidden h-screen flex-col overflow-hidden sm:flex transition-[width] duration-300 ease-in-out ${
          desktopOpen
            ? DESKTOP_SIDEBAR_OPEN_WIDTH
            : DESKTOP_SIDEBAR_CLOSED_WIDTH
        } ${sidebarBase}`}
      >
        <SidebarContent
          expanded={desktopOpen}
          theme={theme}
          onToggleTheme={onToggleTheme}
          onLogoClick={onToggleDesktop}
        />
      </aside>
    </>
  );
}

```

---

## `components/layout/SidebarTooltip.tsx`

```tsx
"use client";

import * as React from "react";

type Props = {
  label: string;
  enabled: boolean;
  children: React.ReactNode;
  tooltipClassName?: string;
};

type Position = {
  right: number;
  top: number;
};

export default function SidebarTooltip({
  label,
  enabled,
  children,
  tooltipClassName = "",
}: Props) {
  const [visible, setVisible] = React.useState(false);
  const [pos, setPos] = React.useState<Position | null>(null);
  const triggerRef = React.useRef<HTMLSpanElement | null>(null);

  const updatePosition = React.useCallback(() => {
    if (!enabled || !triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setPos({
      right: window.innerWidth - rect.left + 12,
      top: rect.top + rect.height / 2,
    });
  }, [enabled]);

  const show = React.useCallback(() => {
    if (!enabled) return;
    updatePosition();
    setVisible(true);
  }, [enabled, updatePosition]);

  const hide = React.useCallback(() => {
    setVisible(false);
  }, []);

  React.useEffect(() => {
    if (!visible) return;
    const handle = () => updatePosition();
    window.addEventListener("resize", handle);
    window.addEventListener("scroll", handle, true);
    return () => {
      window.removeEventListener("resize", handle);
      window.removeEventListener("scroll", handle, true);
    };
  }, [visible, updatePosition]);

  if (!enabled) {
    return <>{children}</>;
  }

  return (
    <>
      <span
        ref={triggerRef}
        className="inline-flex"
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
      >
        {children}
      </span>
      {visible && pos && (
        <span
          role="tooltip"
          className={`pointer-events-none fixed z-[250] whitespace-nowrap rounded-md bg-popover px-2.5 py-1.5 text-xs font-medium shadow-md ring-1 ring-border/40 animate-in fade-in-0 zoom-in-95 duration-150 ${tooltipClassName}`}
          style={{
            right: pos.right,
            top: pos.top,
            transform: "translateY(-50%)",
          }}
        >
          {label}
        </span>
      )}
    </>
  );
}

```

---

## `components/ui/Avatar.tsx`

```tsx
"use client";
import * as React from "react";
import { cn } from "@/lib/utils";
export function Avatar({ src, alt, size=40, className, ...p }: { src?: string; alt?: string; size?: number } & React.HTMLAttributes<HTMLSpanElement>){
  return (
    <span className={cn("relative inline-block shrink-0 overflow-hidden bg-[var(--muted)]", className)} style={{width:size, height:size, borderRadius:"var(--tb-radius-full)", ...p.style}} {...p}>
      {src ? <img src={src} alt={alt||""} width={size} height={size} className="w-full h-full object-cover" /> :
        <span className="w-full h-full flex items-center justify-center text-[11px]" style={{color:"var(--muted-foreground)"}}>{(alt||"?").slice(0,2).toUpperCase()}</span>}
    </span>
  );
}
export default Avatar;

```

---

## `components/ui/Badge.tsx`

```tsx
import * as React from "react";
import { cn } from "@/lib/utils";

type Variant = "default" | "secondary" | "outline" | "brand" |
  "blog" | "news" | "media" | "shop" | "tools" | "forum" | "review" | "download";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: Variant;
}

const base =
  "inline-flex items-center gap-1 rounded-full border px-[10px] py-[3px] " +
  "text-[11px] font-[600] leading-none whitespace-nowrap " +
  "transition-colors duration-[var(--tb-duration-fast)]";

const variants: Record<Variant, string> = {
  default:   "bg-[var(--tb-secondary)] text-[var(--tb-secondary-foreground)] border-[var(--tb-border)]",
  secondary: "bg-[var(--tb-muted)] text-[var(--tb-muted-foreground)] border-[var(--tb-border)]",
  outline:   "bg-transparent text-[var(--tb-foreground)] border-[var(--tb-border)]",
  brand:     "bg-[color-mix(in_oklch,var(--tb-brand)_14%,transparent)] text-[var(--tb-brand)] border-[color-mix(in_oklch,var(--tb-brand)_30%,transparent)]",
  blog:      "bg-[oklch(0.95_0.04_60/1)] text-[oklch(0.45_0.15_50)] border-[oklch(0.85_0.08_60/1)] dark:bg-[oklch(0.25_0.07_50/1)] dark:text-[oklch(0.82_0.14_65)] dark:border-[oklch(0.35_0.08_50/1)]",
  news:      "",
  media:     "",
  shop:      "",
  tools:     "",
  forum:     "",
  review:    "",
  download:  "",
};

// fill module variants with CSS variables – keeps everything token-driven
const moduleMap: Record<string, string> = {
  news:     "background:color-mix(in oklch, var(--tb-news) 14%, transparent); color:var(--tb-news); border-color:color-mix(in oklch, var(--tb-news) 30%, transparent)",
  media:    "background:color-mix(in oklch, var(--tb-media) 14%, transparent); color:var(--tb-media); border-color:color-mix(in oklch, var(--tb-media) 30%, transparent)",
  shop:     "background:color-mix(in oklch, var(--tb-shop) 14%, transparent); color:var(--tb-shop); border-color:color-mix(in oklch, var(--tb-shop) 30%, transparent)",
  tools:    "background:color-mix(in oklch, var(--tb-tools) 14%, transparent); color:var(--tb-tools); border-color:color-mix(in oklch, var(--tb-tools) 30%, transparent)",
  forum:    "background:color-mix(in oklch, var(--tb-forum) 14%, transparent); color:var(--tb-forum); border-color:color-mix(in oklch, var(--tb-forum) 30%, transparent)",
  review:   "background:color-mix(in oklch, var(--tb-review) 14%, transparent); color:var(--tb-review); border-color:color-mix(in oklch, var(--tb-review) 30%, transparent)",
  download: "background:color-mix(in oklch, var(--tb-download) 14%, transparent); color:var(--tb-download); border-color:color-mix(in oklch, var(--tb-download) 30%, transparent)",
};

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant="default", style, ...props }, ref) => {
    const isModule = ["news","media","shop","tools","forum","review","download"].includes(variant);
    return (
      <span
        ref={ref}
        className={cn(base, !isModule && variants[variant as keyof typeof variants], className)}
        style={isModule ? { ...(style||{}), ...Object.fromEntries((moduleMap[variant]||"").split(";").filter(Boolean).map(s=>{const [k,...v]=s.split(":"); return [k.trim().replace(/-([a-z])/g,(_,c)=>c.toUpperCase()), v.join(":").trim()]})) } : style}
        {...props}
      />
    );
  }
);
Badge.displayName = "Badge";
export default Badge;

```

---

## `components/ui/Button.tsx`

```tsx
"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "outline" | "danger" | "link";
type Size = "sm" | "md" | "lg" | "icon";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const base =
  "inline-flex items-center justify-center gap-2 font-semibold select-none " +
  "transition-all duration-[var(--tb-duration-normal)] ease-[var(--tb-ease-standard)] " +
  "focus-visible:outline-none focus-visible:shadow-[var(--tb-focus-ring)] " +
  "disabled:opacity-50 disabled:pointer-events-none";

const variants: Record<Variant,string> = {
  primary:   "text-[var(--tb-primary-foreground)] bg-[var(--tb-primary)] hover:brightness-[1.06] active:scale-[0.985] shadow-[var(--tb-shadow-sm)]",
  secondary: "text-[var(--tb-secondary-foreground)] bg-[var(--tb-secondary)] hover:brightness-[1.03]",
  ghost:     "bg-transparent text-[var(--tb-foreground)] hover:bg-[var(--tb-muted)]",
  outline:   "bg-transparent border text-[var(--tb-foreground)] hover:bg-[var(--tb-muted)]",
  danger:    "text-white",
  link:      "bg-transparent underline-offset-4 hover:underline p-0 h-auto"
};

const sizes: Record<Size,string> = {
  sm: "h-8 px-3 text-[11.5px] rounded-[var(--tb-radius-md)]",
  md: "h-10 px-4 text-[13px]  rounded-[var(--tb-radius-lg)]",
  lg: "h-11 px-5 text-[14px]  rounded-[var(--tb-radius-xl)]",
  icon: "h-10 w-10 p-0 rounded-[var(--tb-radius-lg)]"
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant="primary", size="md", loading, children, style, ...props }, ref) => {
    const v = variant==="danger" ? {} : {};
    const dangerStyle = variant==="danger" ? { background:"oklch(0.60 0.22 25)", color:"white", borderColor:"transparent" } : {};
    return (
      <button
        ref={ref}
        className={cn(
          base,
          variants[variant],
          sizes[size],
          "rounded-[var(--tb-radius-lg)]",
          className
        )}
        style={{ ...dangerStyle, ...style, borderColor: variant==="outline" ? "var(--tb-border)" : undefined }}
        disabled={loading || props.disabled}
        {...props}
      >
        {loading && <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
export default Button;

```

---

## `components/ui/Card.tsx`

```tsx
import * as React from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: boolean;
  hover?: boolean;
}
export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, padding = true, hover = false, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "bg-[var(--card)] text-[var(--card-foreground)]",
        "border border-[var(--border)]",
        "rounded-[var(--tb-radius-xl)]",
        "shadow-[var(--tb-shadow)]",
        padding && "p-4 md:p-5",
        hover && "transition-all duration-[var(--tb-duration-normal)] ease-[var(--tb-ease-standard)] hover:shadow-[var(--tb-shadow-md)] hover:-translate-y-[1px]",
        className
      )}
      {...props}
    />
  )
);
Card.displayName = "Card";

export const CardHeader = ({className,...p}:React.HTMLAttributes<HTMLDivElement>)=>(
  <div className={cn("mb-3",className)} {...p} />
);
export const CardTitle = ({className,...p}:React.HTMLAttributes<HTMLHeadingElement>)=>(
  <h3 className={cn("text-[16px] md:text-[18px] font-extrabold leading-tight",className)} {...p} />
);
export const CardContent = ({className,...p}:React.HTMLAttributes<HTMLDivElement>)=>(
  <div className={cn("text-[13px] leading-7", "text-[var(--muted-foreground)]", className)} {...p} />
);
export default Card;

```

---

## `components/ui/Checkbox.tsx`

```tsx
"use client";
import * as React from "react";
import { cn } from "@/lib/utils";
export const Checkbox = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({className, ...props}, ref) => (
    <input ref={ref} type="checkbox"
      className={cn("w-[16px] h-[16px] rounded-[4px] accent-[var(--primary)]", "bg-[var(--muted)] border border-[var(--border)]", className)}
      {...props} />
  )
);
Checkbox.displayName="Checkbox";
export default Checkbox;

```

---

## `components/ui/Chip.tsx`

```tsx
import * as React from "react";
import { cn } from "@/lib/utils";
import { Badge } from "./Badge";
export const Chip = Badge;
export const Tag = Badge;
export default Chip;

```

---

## `components/ui/Dropdown.tsx`

```tsx
"use client";
import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

interface DropdownItem { label: string; value: string; href?: string; onSelect?: ()=>void; }
export function Dropdown({ trigger, items, align="end" }: { 
  trigger: React.ReactNode; 
  items: DropdownItem[];
  align?: "start" | "end";
}) {
  const [open,setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(()=>{
    const h=(e:MouseEvent)=>{ if(ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown",h); return ()=>document.removeEventListener("mousedown",h);
  },[]);
  return (
    <div className="relative" ref={ref} dir="rtl">
      <div onClick={()=>setOpen(o=>!o)} className="cursor-pointer">{trigger}</div>
      {open && (
        <div className={`absolute top-full mt-2 min-w-[180px] card p-1 z-modal ${align==="end" ? "left-0" : "right-0"}`} style={{zIndex:500}}>
          {items.map(it=>(
            <button key={it.value}
              onClick={()=>{ it.onSelect?.(); setOpen(false); if(it.href) window.location.href=it.href; }}
              className="w-full text-right px-3 py-2 text-[12px] rounded-[var(--tb-radius-md)] hover:bg-[var(--muted)] transition-colors"
            >{it.label}</button>
          ))}
        </div>
      )}
    </div>
  );
}

export function Select({ value, onValueChange, options, placeholder="انتخاب…" }:{
  value?:string; onValueChange?:(v:string)=>void;
  options:{label:string; value:string}[];
  placeholder?:string;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={e=>onValueChange?.(e.target.value)}
        className="input appearance-none pe-8 text-[13px] cursor-pointer"
        style={{
          backgroundImage: "none"
        }}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(o=> <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <ChevronDown size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{color:"var(--muted-foreground)"}} />
    </div>
  );
}

```

---

## `components/ui/IconButton.tsx`

```tsx
"use client";
import * as React from "react";
import { Button, type ButtonProps } from "./Button";
export function IconButton({ size="icon", variant="ghost", ...props }: ButtonProps){
  return <Button size="icon" variant={variant} {...props} />;
}
export default IconButton;

```

---

## `components/ui/index.ts`

```ts
export * from "./Button";
export * from "./Input";
export * from "./Textarea";
export * from "./Card";
export * from "./Badge";
export * from "./Chip";
export * from "./Dropdown";
export * from "./SearchBar";
export * from "./Tabs";
export * from "./Tooltip";
export * from "./Switch";
export * from "./LikeButton";

// Re-export design tokens for TS usage
export * from "@/design";

```

---

## `components/ui/Input.tsx`

```tsx
"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, invalid, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "w-full bg-[var(--tb-muted)] text-[var(--tb-foreground)]",
        "border border-[var(--tb-border)]",
        "rounded-[var(--tb-radius-md)] px-[14px] py-[10px]",
        "text-[13px] leading-5",
        "transition-all duration-[var(--tb-duration-fast)] ease-[var(--tb-ease-standard)]",
        "placeholder:text-[var(--tb-muted-foreground)]/80",
        "focus:outline-none focus:border-[var(--tb-ring)] focus:shadow-[var(--tb-focus-ring)]",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        invalid && "border-red-500/70 focus:border-red-500 focus:shadow-[0_0_0_3px_rgba(239,68,68,.18)]",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";

```

---

## `components/ui/LikeButton.tsx`

```tsx
"use client";
import { useEffect, useState, useCallback } from "react";
import { Heart, Eye } from "lucide-react";

function getFingerprint(){
  if(typeof window==="undefined") return "srv";
  let fp = localStorage.getItem("tb_fp");
  if(!fp){ fp = Math.random().toString(36).slice(2) + Date.now().toString(36); localStorage.setItem("tb_fp", fp); }
  return fp;
}

export function LikeButton({ contentType, slug, initial = 0 }: { contentType: string; slug: string; initial?: number }) {
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(initial);
  const [busy, setBusy] = useState(false);

  const key = `tb_like_${contentType}_${slug}`;
  useEffect(()=>{ setLiked(localStorage.getItem(key)==="1"); }, [key]);

  const toggle = useCallback(async ()=>{
    if(busy) return;
    setBusy(true);
    const fp = getFingerprint();
    const optimisticLiked = !liked;
    setLiked(optimisticLiked);
    setCount(c=> c + (optimisticLiked?1:-1));
    try{
      const res = await fetch("/api/like", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ module: contentType, slug, fingerprint: fp })
      });
      if(res.ok){
        const data = await res.json();
        setLiked(data.liked);
        setCount(data.likes);
        if(data.liked) localStorage.setItem(key,"1"); else localStorage.removeItem(key);
      }
    }catch{}
    finally{ setBusy(false); }
  }, [liked, busy, contentType, slug, key]);

  return (
    <button onClick={toggle} disabled={busy} className={`btn ${liked ? "btn-primary" : "btn-ghost"} text-[13px] gap-2 disabled:opacity-60`} aria-pressed={liked}>
      <Heart size={20} fill={liked ? "currentColor" : "none"} strokeWidth={2} className={liked ? "text-rose-400" : ""} aria-hidden />
      <span className="font-black" style={{fontVariantNumeric:"tabular-nums"}}>{count.toLocaleString("fa-IR")}</span>
      <span className="hidden sm:inline">پسندیدم</span>
      <Eye size={16} className="opacity-60 hidden md:inline" />
    </button>
  );
}

export function CommentVote({ id, initialLikes = 0, initialDislikes = 0 }: { id: string; initialLikes?: number; initialDislikes?: number }) {
  const [l, setL] = useState(initialLikes);
  const [d, setD] = useState(initialDislikes);
  const [v, setV] = useState<"up"|"down"|null>(null);

  useEffect(()=>{
    const saved = localStorage.getItem(`tb_cvote_${id}`);
    if(saved==="up"||saved==="down") setV(saved);
  },[id]);

  const vote = async (type:"up"|"down")=>{
    const next = v===type ? 0 : (type==="up"?1:-1);
    const prev = v==="up"?1 : v==="down"?-1:0;
    // optimistic
    setL(x=> x + (next===1?1:0) - (prev===1?1:0));
    setD(x=> x + (next===-1?1:0) - (prev===-1?1:0));
    setV(next===0?null:type);
    try{
      const res = await fetch("/api/comments/vote", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ commentId: id, fingerprint: getFingerprint(), vote: next })
      });
      if(res.ok){
        const data = await res.json();
        setL(data.likes); setD(data.dislikes);
      }
    }catch{}
    if(next===0) localStorage.removeItem(`tb_cvote_${id}`); else localStorage.setItem(`tb_cvote_${id}`, type);
  };

  return (
    <div className="flex items-center gap-3 text-xs" style={{color:"var(--muted-foreground)"}}>
      <button onClick={()=>vote("up")} className={v==="up" ? "text-emerald-400 font-bold" : "hover:text-foreground"}>▲ {l.toLocaleString("fa-IR")}</button>
      <button onClick={()=>vote("down")} className={v==="down" ? "text-rose-400 font-bold" : "hover:text-foreground"}>▼ {d.toLocaleString("fa-IR")}</button>
    </div>
  );
}

```

---

## `components/ui/Modal.tsx`

```tsx
"use client";
import * as React from "react";
import { cn } from "@/lib/utils";
export function Modal({ open, onClose, children, className }: { open: boolean; onClose: ()=>void; children: React.ReactNode; className?: string }){
  if(!open) return null;
  return (
    <div className="fixed inset-0 z-modal flex items-center justify-center p-4" dir="rtl" style={{zIndex:500}}>
      <div className="absolute inset-0 bg-black/55 backdrop-blur-sm z-modal" style={{zIndex:500}} onClick={onClose} />
      <div className={cn("relative card w-full max-w-lg z-[501] max-h-[85vh] overflow-auto", className)}>{children}</div>
    </div>
  );
}
export default Modal;

```

---

## `components/ui/Radio.tsx`

```tsx
"use client";
import * as React from "react";
import { cn } from "@/lib/utils";
export const Radio = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({className, ...props}, ref) => (
    <input ref={ref} type="radio"
      className={cn("w-[16px] h-[16px] accent-[var(--primary)]", className)}
      {...props} />
  )
);
Radio.displayName="Radio";
export default Radio;

```

---

## `components/ui/SearchBar.tsx`

```tsx
"use client";
import { Search } from "lucide-react";
import { Input } from "./Input";
import React from "react";
import { cn } from "@/lib/utils";

export interface SearchBarProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  onSearch?: (q:string)=>void;
  containerClassName?: string;
}
export function SearchBar({ onSearch, containerClassName, onKeyDown, ...props }: SearchBarProps){
  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>)=>{
    onKeyDown?.(e);
    if(e.key==="Enter" && onSearch){ e.preventDefault(); onSearch((e.target as HTMLInputElement).value); }
  };
  return (
    <div className={cn("relative w-full", containerClassName)} dir="rtl">
      <Input {...props} onKeyDown={handleKey} type="search"
        className={cn("pe-9", props.className)}
        placeholder={props.placeholder || "جستجو در تکباکس…"} />
      <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
        style={{color:"var(--muted-foreground)"}} />
    </div>
  );
}
export default SearchBar;

```

---

## `components/ui/Skeleton.tsx`

```tsx
import { cn } from "@/lib/utils";
export function Skeleton({className, ...p}: React.HTMLAttributes<HTMLDivElement>){
  return <div className={cn("animate-pulse rounded-[var(--tb-radius-md)] bg-[var(--muted)]", className)} {...p} />
}
export default Skeleton;

```

---

## `components/ui/Switch.tsx`

```tsx
"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

export function Switch({ checked, onCheckedChange, disabled, className }:{
  checked?: boolean;
  onCheckedChange?: (v:boolean)=>void;
  disabled?: boolean;
  className?: string;
}){
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={()=>onCheckedChange?.(!checked)}
      className={cn(
        "relative inline-flex h-5 w-9 shrink-0 rounded-full border transition-colors",
        "duration-[var(--tb-duration-fast)]",
        checked ? "bg-[var(--primary)] border-[var(--primary)]" : "bg-[var(--muted)] border-[var(--border)]",
        "disabled:opacity-50",
        className
      )}
    >
      <span className={cn(
        "pointer-events-none block h-4 w-4 rounded-full bg-white shadow transition-transform duration-[var(--tb-duration-fast)] mt-[1px]",
        checked ? "translate-x-[18px] rtl:-translate-x-[18px]" : "translate-x-[2px] rtl:-translate-x-[2px]"
      )} />
    </button>
  );
}
export default Switch;

```

---

## `components/ui/Tabs.tsx`

```tsx
"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

export function Tabs({ value, onValueChange, children, className }:{
  value: string;
  onValueChange?: (v:string)=>void;
  children: React.ReactNode;
  className?: string;
}){
  return <div className={cn("w-full", className)} data-value={value}>{React.Children.map(children, child=>
    React.isValidElement(child) ? React.cloneElement(child as any, { __tb_active: (child.props as any).value === value, __tb_onSelect: onValueChange }) : child
  )}</div>;
}

export function TabsList({className, ...p}: React.HTMLAttributes<HTMLDivElement>){
  return <div className={cn("flex gap-1 p-1 rounded-[var(--tb-radius-lg)] bg-[var(--muted)]", className)} {...p} />;
}
export function TabsTrigger({value, children, __tb_active, __tb_onSelect, className}:{value:string; children:React.ReactNode; __tb_active?:boolean; __tb_onSelect?:(v:string)=>void; className?:string}){
  return (
    <button
      onClick={()=>__tb_onSelect?.(value)}
      className={cn(
        "px-3 py-1.5 text-[12px] font-semibold rounded-[var(--tb-radius-md)] transition-all",
        __tb_active ? "bg-[var(--card)] shadow-[var(--tb-shadow-sm)] text-[var(--foreground)]" : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]",
        className
      )}
      aria-selected={__tb_active}
      role="tab"
      type="button"
    >{children}</button>
  );
}

```

---

## `components/ui/Textarea.tsx`

```tsx
import * as React from "react";
import { cn } from "@/lib/utils";
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}
export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({className, ...props}, ref)=> (
    <textarea ref={ref}
      className={cn(
        "w-full min-h-[110px] bg-[var(--muted)] text-[var(--foreground)]",
        "border border-[var(--border)] rounded-[var(--tb-radius-md)]",
        "px-[14px] py-[10px] text-[13px] leading-6",
        "placeholder:text-[var(--muted-foreground)]/75",
        "focus:outline-none focus:border-[var(--ring)] focus:shadow-[var(--tb-focus-ring)]",
        "transition-[border-color,box-shadow] duration-[var(--tb-duration-fast)]",
        "disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
);
Textarea.displayName="Textarea";
export default Textarea;

```

---

## `components/ui/Tooltip.tsx`

```tsx
"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

export function Tooltip({ content, children, side="top" }:{
  content: React.ReactNode;
  children: React.ReactNode;
  side?: "top"|"bottom"|"left"|"right";
}){
  const [open,setOpen] = React.useState(false);
  return (
    <span className="relative inline-flex"
      onMouseEnter={()=>setOpen(true)}
      onMouseLeave={()=>setOpen(false)}
      onFocus={()=>setOpen(true)}
      onBlur={()=>setOpen(false)}
    >
      {children}
      {open && (
        <span role="tooltip"
          className={cn(
            "absolute z-[600] whitespace-nowrap text-[11px] px-2 py-1 rounded-[var(--tb-radius-md)] shadow-[var(--tb-shadow-md)] pointer-events-none",
            "bg-[var(--popover)] text-[var(--popover-foreground)] border border-[var(--border)]",
            side==="top" && "bottom-full mb-2 left-1/2 -translate-x-1/2",
            side==="bottom" && "top-full mt-2 left-1/2 -translate-x-1/2",
            side==="left" && "right-full me-2 top-1/2 -translate-y-1/2",
            side==="right" && "left-full ms-2 top-1/2 -translate-y-1/2",
          )}
        >{content}</span>
      )}
    </span>
  );
}
export default Tooltip;

```

---

## `config/module-colors.ts`

```ts
export const moduleColors = {
  home: {
    base: "text-foreground",
    hover: "group-hover:text-violet-500",
    active: "text-violet-500 dark:text-violet-400",
  },
  blog: {
    base: "text-foreground",
    hover: "group-hover:text-orange-400",
    active: "text-orange-400 dark:text-orange-300",
  },
  news: {
    base: "text-foreground",
    hover: "group-hover:text-rose-500",
    active: "text-rose-500 dark:text-rose-400",
  },
  media: {
    base: "text-foreground",
    hover: "group-hover:text-amber-300",
    active: "text-amber-300 dark:text-amber-200",
  },
  shop: {
    base: "text-foreground",
    hover: "group-hover:text-lime-400",
    active: "text-lime-400 dark:text-lime-300",
  },
  tools: {
    base: "text-foreground",
    hover: "group-hover:text-cyan-300",
    active: "text-cyan-300 dark:text-cyan-200",
  },
  forum: {
    base: "text-foreground",
    hover: "group-hover:text-rose-300",
    active: "text-rose-300 dark:text-rose-200",
  },
  review: {
    base: "text-foreground",
    hover: "group-hover:text-sky-500",
    active: "text-sky-500 dark:text-sky-400",
  },
  download: {
    base: "text-foreground",
    hover: "group-hover:text-pink-400",
    active: "text-pink-400 dark:text-pink-300",
  },
  account: {
    base: "text-foreground",
    hover: "group-hover:text-red-200",
    active: "text-red-200 dark:text-red-300",
  },
} as const;

```

---

## `config/modules.config.ts`

```ts
import { moduleColors } from "@/config/module-colors";

export type ModuleItem = {
  title: string;
  slug: string;
  description: string;
  color: string;
  cols?: string;
  rows?: string;
  order: number;
};

export const modules: ModuleItem[] = [
  {
    title: "مجله",
    slug: "blog",
    description: "مقالات تخصصی، تحلیل‌ها و راهنماهای عمیق.",
    color: moduleColors.blog.active,
    cols: "md:col-span-4",
    rows: "md:row-span-2",
    order: 1,
  },
  {
    title: "اخبار",
    slug: "news",
    description: "آخرین خبرهای فناوری، زیرساخت و هوش مصنوعی.",
    color: moduleColors.news.active,
    cols: "md:col-span-3",
    rows: "md:row-span-2",
    order: 2,
  },
  {
    title: "رسانه ویدیویی",
    slug: "media",
    description: "ویدیوهای آموزشی، بررسی‌ها و محتوای چندرسانه‌ای.",
    color: moduleColors.media.active,
    cols: "md:col-span-3",
    rows: "md:row-span-3",
    order: 3,
  },
  {
    title: "انجمن",
    slug: "forum",
    description: "پرسش و پاسخ تخصصی کاربران و مهندسین.",
    color: moduleColors.forum.active,
    cols: "md:col-span-4",
    rows: "md:row-span-2",
    order: 4,
  },
  {
    title: "دانلود",
    slug: "download",
    description: "ISO، Firmware، فایل‌ها و منابع قابل دانلود.",
    color: moduleColors.download.active,
    cols: "md:col-span-4",
    rows: "md:row-span-2",
    order: 5,
  },
  {
    title: "ابزارها",
    slug: "tools",
    description: "ابزارهای کاربردی برای شبکه و مهندسی سیستم.",
    color: moduleColors.tools.active,
    cols: "md:col-span-3",
    rows: "md:row-span-3",
    order: 6,
  },
  {
    title: "نقد و بررسی",
    slug: "review",
    description: "بررسی تخصصی تجهیزات، سرویس‌ها و نرم‌افزارها.",
    color: moduleColors.review.active,
    cols: "md:col-span-4",
    rows: "md:row-span-2",
    order: 7,
  },
  {
    title: "فروشگاه",
    slug: "shop",
    description: "سرور، استوریج و تجهیزات تخصصی زیرساخت.",
    color: moduleColors.shop.active,
    cols: "md:col-span-7",
    rows: "md:row-span-2",
    order: 8,
  },
];

```

---

## `config/sidebar.config.ts`

```ts
// components/sidebar/sidebar.config.ts
import {
  House,
  BookOpen,
  Newspaper,
  Clapperboard,
  ShoppingBag,
  Wrench,
  Users,
  ShieldCheck,
  Download,
  CircleUser,
  Calculator,
  Network,
  MessageCircleQuestion,
} from "lucide-react";
import { NavItem } from "@/types/sidebar.types";
import { moduleColors } from "@/config/module-colors";

export const DESKTOP_KEY = "takbox-sidebar-desktop-open";
export const MOBILE_KEY = "takbox-sidebar-mobile-open";
export const THEME_KEY = "takbox-theme";
export const ICON_STROKE = 1.75;

export const navItems: NavItem[] = [
  {
    title: "خانه",
    href: "/",
    icon: House,
    iconClassName: moduleColors.home.base,
    iconHoverClassName: moduleColors.home.hover,
    iconActiveClassName: moduleColors.home.active,
  },
  {
    title: "وبلاگ",
    href: "/blog",
    icon: BookOpen,
    iconClassName: moduleColors.blog.base,
    iconHoverClassName: moduleColors.blog.hover,
    iconActiveClassName: moduleColors.blog.active,
  },
  {
    title: "اخبار",
    href: "/news",
    icon: Newspaper,
    iconClassName: moduleColors.news.base,
    iconHoverClassName: moduleColors.news.hover,
    iconActiveClassName: moduleColors.news.active,
  },
  {
    title: "رسانه",
    href: "/media",
    icon: Clapperboard,
    iconClassName: moduleColors.media.base,
    iconHoverClassName: moduleColors.media.hover,
    iconActiveClassName: moduleColors.media.active,
  },
  {
    title: "فروشگاه",
    href: "/shop",
    icon: ShoppingBag,
    iconClassName: moduleColors.shop.base,
    iconHoverClassName: moduleColors.shop.hover,
    iconActiveClassName: moduleColors.shop.active,
  },
  {
    title: "ابزارها",
    href: "/tools",
    icon: Wrench,
    iconClassName: moduleColors.tools.base,
    iconHoverClassName: moduleColors.tools.hover,
    iconActiveClassName: moduleColors.tools.active,
  },
  {
    title: "RAID Calculator",
    href: "/tools/raid-calculator",
    icon: Calculator,
    iconClassName: "text-cyan-400",
    iconHoverClassName: "group-hover:text-cyan-300",
    iconActiveClassName: "text-cyan-300",
  },
  {
    title: "Subnet Calculator",
    href: "/tools/subnet-calculator",
    icon: Network,
    iconClassName: "text-cyan-400",
    iconHoverClassName: "group-hover:text-cyan-300",
    iconActiveClassName: "text-cyan-300",
  },
  {
    title: "مشاوره VIP",
    href: "/consultation",
    icon: MessageCircleQuestion,
    iconClassName: "text-fuchsia-400",
    iconHoverClassName: "group-hover:text-fuchsia-300",
    iconActiveClassName: "text-fuchsia-300",
  },
  {
    title: "انجمن",
    href: "/forum",
    icon: Users,
    iconClassName: moduleColors.forum.base,
    iconHoverClassName: moduleColors.forum.hover,
    iconActiveClassName: moduleColors.forum.active,
  },
  {
    title: "نقد و بررسی",
    href: "/review",
    icon: ShieldCheck,
    iconClassName: moduleColors.review.base,
    iconHoverClassName: moduleColors.review.hover,
    iconActiveClassName: moduleColors.review.active,
  },
  {
    title: "دانلود",
    href: "/download",
    icon: Download,
    iconClassName: moduleColors.download.base,
    iconHoverClassName: moduleColors.download.hover,
    iconActiveClassName: moduleColors.download.active,
  },
];

export const accountItem: NavItem = {
  title: "حساب کاربری",
  href: "/account",
  icon: CircleUser,
  iconClassName: moduleColors.account.base,
  iconHoverClassName: moduleColors.account.hover,
  iconActiveClassName: moduleColors.account.active,
};

export const themeIconClass = {
  buttonBase:
    "inline-flex h-10 w-10 items-center rounded-lg transition-all duration-200",
  buttonClassName: "text-muted-foreground",
  buttonHoverClassName: "hover:text-foreground",
  sunIconClassName: "text-yellow-500",
  sunIconHoverClassName: "group-hover:text-yellow-400",
  sunIconActiveClassName: "text-foreground group-hover:text-yellow-400",
  moonIconClassName: "text-zinc-200 dark:text-zinc-100",
  moonIconHoverClassName: "group-hover:text-blue-200",
  moonIconActiveClassName:
    "text-foreground dark:text-foreground group-hover:text-blue-200",
};

export const sidebarBase = [
  "bg-background text-foreground",
  "shadow-[0_4px_24px_0_oklch(0_0_0/0.10)]",
  "dark:shadow-[0_4px_32px_0_oklch(0_0_0/0.35)]",
].join(" ");

export const linkBase =
  "group relative flex h-11 w-full items-center rounded-lg text-sm font-normal transition-all duration-200";

export const linkInactive = "text-muted-foreground hover:text-foreground";

export const linkActive = "bg-accent/50 text-secondary";

export function isActive(pathname: string, href: string) {
  return href === "/"
    ? pathname === "/"
    : pathname === href || pathname.startsWith(`${href}/`);
}

```

---

## `constants/app.constants.ts`

```ts
export const SITE_NAME = "تکباکس";
export const SITE_NAME_EN = "TechBox";
export const SITE_DESC_FA = "پاتوق بچه‌های فناوری اطلاعات";
export const COMPANY_FA = "هونامیک ارتباط رستاک";
export const LOCALE = "fa-IR";
export const TIMEZONE = "Asia/Tehran";
export const PAGE_SIZE_DEFAULT = 12;
export const COMMENT_MAX_LENGTH = 2000;


```

---

## `constants/index.ts`

```ts
export * from "./app.constants";
export * from "./routes.constants";
export * from "./module.constants";
export * from "./validation.constants";

```

---

## `constants/module.constants.ts`

```ts
export const MODULES = ["blog","news","media","review","tools","download","shop","forum"] as const;
export type ModuleSlug = typeof MODULES[number];

```

---

## `constants/routes.constants.ts`

```ts
export const ROUTES = {
  HOME: "/",
  BLOG: "/blog",
  NEWS: "/news",
  MEDIA: "/media",
  REVIEW: "/review",
  SHOP: "/shop",
  TOOLS: "/tools",
  FORUM: "/forum",
  DOWNLOAD: "/download",
  ACCOUNT: "/account",
  ADMIN: "/admin",
  ADMIN_LOGIN: "/admin/login",
  ADMIN_POSTS: "/admin/posts",
  ADMIN_ROLES: "/admin/roles",
  CONTACT: "/contact",
  ABOUT: "/about",
  CONSULTATION: "/consultation",
  SEARCH: "/search",
} as const;
export type AppRoute = typeof ROUTES[keyof typeof ROUTES];

```

---

## `constants/validation.constants.ts`

```ts
import { z } from "zod";
export const slugSchema = z.string().min(2).regex(/^[a-z0-9-]+$/);
export const faText = z.string().min(2).max(5000);

```

---

## `data/blog.json`

```json
[
  {
    "slug": "dell-server-os-install",
    "module": "blog",
    "title": "نصب سیستم عامل بر روی سرور Dell",
    "excerpt": "نصب و تنظیم سیستم عامل سرور نیاز به حوصله و تجربه دارد. قدم به قدم با من همراه باشید.",
    "content": "در این مقاله نحوه نصب ESXi و Ubuntu Server روی Dell R740 را بررسی می‌کنیم...",
    "image": "/assets/blog-1.jpg",
    "tags": ["dell", "سرور", "لینوکس", "زیرساخت", "QNAP-2277"],
    "author": { "name": "هومن مدق", "role": "کارشناس فناوری اطلاعات", "avatar": "/assets/hooman.png" },
    "date": "2026-06-22",
    "date_fa": "1 تیر 1405",
    "likes": 124,
    "views": 3410,
    "category": "آموزشی"
  },
  {
    "slug": "hp-raid-config",
    "module": "blog",
    "title": "راهنمای کامل پیکربندی RAID در سرورهای HP",
    "excerpt": "بهترین تعادل بین کارایی و امنیت اطلاعات برای زیرساخت سازمان شما.",
    "content": "RAID 10 vs RAID 5 ...",
    "image": "/assets/blog-2.jpg",
    "tags": ["hp", "raid", "storage", "زیرساخت"],
    "author": { "name": "عطیه حاتمی", "role": "مهندس کامپیوتر", "avatar": "/assets/atiye.png" },
    "date": "2026-06-26",
    "date_fa": "5 تیر 1405",
    "likes": 98,
    "views": 2102,
    "category": "زیرساخت"
  },
  {
    "slug": "vmware-optimize",
    "module": "blog",
    "title": "بهینه‌سازی مصرف منابع در ماشین‌های مجازی VMware",
    "excerpt": "کندی VMها را با تنظیمات درست از بین ببرید.",
    "content": "...",
    "image": "/assets/blog-3.jpeg",
    "tags": ["vmware", "مجازی‌سازی", "بهینه‌سازی"],
    "author": { "name": "بهناز قادری", "role": "طراح سایت", "avatar": "/assets/behnaz.png" },
    "date": "2026-06-30",
    "date_fa": "9 تیر 1405",
    "likes": 76,
    "views": 1880,
    "category": "مجازی‌سازی"
  },
  {
    "slug": "network-security-10tips",
    "module": "blog",
    "title": "۱۰ نکته مهم برای افزایش امنیت شبکه داخلی سازمان",
    "excerpt": "از VLAN تا مانیتورینگ ترافیک.",
    "content": "...",
    "image": "/assets/blog-4.jpg",
    "tags": ["امنیت", "شبکه", "vlan", "فایروال"],
    "author": { "name": "نسترن خداکرمی", "role": "فعال حوزه فناوری اطلاعات", "avatar": "/assets/nastaran.png" },
    "date": "2026-07-04",
    "date_fa": "13 تیر 1405",
    "likes": 210,
    "views": 5920,
    "category": "امنیت"
  },
  {
    "slug": "zabbix-monitoring",
    "module": "blog",
    "title": "آموزش مانیتورینگ سرورها با Zabbix از صفر تا اجرا",
    "excerpt": "نصب Zabbix، تریگرها و داشبورد کاربردی.",
    "content": "...",
    "image": "/assets/blog-5.jpg",
    "tags": ["zabbix", "مانیتورینگ", "لینوکس", "سرور"],
    "author": { "name": "روژینا باقری", "role": "کارشناس شبکه", "avatar": "/assets/rojina.png" },
    "date": "2026-07-08",
    "date_fa": "17 تیر 1405",
    "likes": 142,
    "views": 3301,
    "category": "مانیتورینگ"
  },
  {
    "slug": "nas-vs-san",
    "module": "blog",
    "title": "بررسی تفاوت NAS و SAN برای ذخیره‌سازی سازمانی",
    "excerpt": "مزایا، محدودیت‌ها و سناریوهای مناسب هرکدام.",
    "content": "...",
    "image": "/assets/blog-6.png",
    "tags": ["nas", "san", "storage", "QNAP-2277", "ذخیره‌سازی"],
    "author": { "name": "هومن مدق", "role": "کارشناس فناوری اطلاعات", "avatar": "/assets/hooman.png" },
    "date": "2026-07-12",
    "date_fa": "21 تیر 1405",
    "likes": 88,
    "views": 2540,
    "category": "ذخیره‌سازی"
  }
]

```

---

## `data/comments.json`

```json
[
  { "id": "c1", "content_type": "blog", "content_slug": "nas-vs-san", "parent_id": null, "author": "علی", "text": "مقاله عالی بود، مخصوصا بخش QNAP-2277", "likes": 12, "dislikes": 1, "date": "2026-07-13T10:22:00Z" },
  { "id": "c2", "content_type": "blog", "content_slug": "nas-vs-san", "parent_id": "c1", "author": "سارا", "text": "ممنون علی جان ❤️", "likes": 3, "dislikes": 0, "date": "2026-07-13T11:00:00Z" },
  { "id": "c3", "content_type": "media", "content_slug": "qnap-2277-review-video", "parent_id": null, "author": "مهدی", "text": "ویدیو QNAP فوق‌العاده بود", "likes": 7, "dislikes": 0, "date": "2026-07-11T09:00:00Z" }
]

```

---

## `data/download.json`

```json
[
  {
    "slug": "ubuntu-server-24-iso",
    "module": "download",
    "title": "دانلود Ubuntu Server 24.04 LTS",
    "excerpt": "ایزو رسمی با لینک مستقیم داخل ایران.",
    "content": "...",
    "image": "/assets/blog-1.jpg",
    "tags": ["لینوکس", "ubuntu", "دانلود", "سرور", "ایزو"],
    "author": { "name": "تکباکس دانلود", "role": "دانلود" },
    "date": "2026-07-07",
    "date_fa": "16 تیر 1405",
    "likes": 920,
    "views": 34100,
    "category": "سیستم‌عامل"
  },
  {
    "slug": "qnap-2277-firmware",
    "module": "download",
    "title": "فریم‌ور QNAP TS-2277 v5.2",
    "excerpt": "آخرین فریم‌ور رسمی QNAP-2277.",
    "content": "...",
    "image": "/assets/blog-6.png",
    "tags": ["QNAP-2277", "firmware", "nas", "دانلود", "qnap"],
    "author": { "name": "تکباکس دانلود", "role": "دانلود" },
    "date": "2026-07-06",
    "date_fa": "15 تیر 1405",
    "likes": 67,
    "views": 1800,
    "category": "فریم‌ور"
  }
]

```

---

## `data/forum.json`

```json
[
  {
    "slug": "qnap-2277-iscsi-issue",
    "module": "forum",
    "title": "مشکل iSCSI در QNAP-2277",
    "excerpt": "کسی تجربه قطعی لحظه‌ای iSCSI داشته؟",
    "content": "سلام دوستان...",
    "image": "/assets/blog-6.png",
    "tags": ["QNAP-2277", "iscsi", "nas", "پرسش"],
    "author": { "name": "کاربر 9821", "role": "عضو انجمن" },
    "date": "2026-07-13",
    "date_fa": "22 تیر 1405",
    "likes": 5,
    "views": 210,
    "category": "پرسش"
  },
  {
    "slug": "proxmox-vs-vmware",
    "module": "forum",
    "title": "Proxmox یا VMware برای هاستینگ کوچک؟",
    "excerpt": "جمع‌بندی تجربیات.",
    "content": "...",
    "image": "/assets/blog-3.jpeg",
    "tags": ["مجازی‌سازی", "proxmox", "vmware", "پرسش"],
    "author": { "name": "admin", "role": "مدیر" },
    "date": "2026-07-02",
    "date_fa": "11 تیر 1405",
    "likes": 18,
    "views": 640,
    "category": "بحث"
  }
]

```

---

## `data/jobs.json`

```json
[
  {
    "slug": "senior-network-engineer",
    "title": "مهندس ارشد شبکه",
    "type": "تمام‌وقت",
    "remote": "حضوری – تهران",
    "date": "2026-07-10",
    "date_fa": "19 تیر 1405",
    "team": "زیرساخت",
    "excerpt": "طراحی و پیاده‌سازی شبکه‌های سازمانی، میکروتیک / سیسکو",
    "description": "ما در تکباکس به‌دنبال مهندس شبکه با حداقل ۴ سال تجربه عملی در روتینگ، سوئیچینگ، فایروال و مانیتورینگ هستیم. تسلط به MikroTik / Cisco و تجربه Zabbix مزیت است."
  },
  {
    "slug": "content-editor-tech",
    "title": "دبیر محتوای تکنولوژی",
    "type": "پاره‌وقت",
    "remote": "ریموت",
    "date": "2026-07-08",
    "date_fa": "17 تیر 1405",
    "team": "تحریریه",
    "excerpt": "تولید و ویرایش مقالات مجله تکباکس",
    "description": "تسلط به نگارش فارسی فنی، آشنایی با سرور / شبکه / مجازی‌سازی. نمونه کار الزامی."
  },
  {
    "slug": "video-editor",
    "title": "تدوین‌گر ویدیو",
    "type": "پروژه‌ای",
    "remote": "ریموت",
    "date": "2026-07-05",
    "date_fa": "14 تیر 1405",
    "team": "رسانه",
    "excerpt": "تدوین ویدیوهای بررسی و آموزشی",
    "description": "Premiere / DaVinci – نمونه کار یوتیوب/آپارات ارسال کنید."
  },
  {
    "slug": "shop-operations",
    "title": "کارشناس عملیات فروشگاه",
    "type": "تمام‌وقت",
    "remote": "حضوری",
    "date": "2026-06-28",
    "date_fa": "7 تیر 1405",
    "team": "فروشگاه",
    "excerpt": "مدیریت سفارش‌ها و انبار تجهیزات زیرساخت",
    "description": "آشنایی با سرور HP/Dell، انبارداری، پاسخگویی مشتریان B2B."
  }
]

```

---

## `data/media.json`

```json
[
  {
    "slug": "qnap-2277-review-video",
    "module": "media",
    "title": "بررسی ویدیویی QNAP TS-2277",
    "excerpt": "آنباکس و تست عملی نَس کیونپ 2277.",
    "content": "ویدیو بررسی کامل QNAP-2277...",
    "image": "/assets/blog-6.png",
    "tags": ["QNAP-2277", "nas", "ویدیو", "بررسی", "ذخیره‌سازی"],
    "author": { "name": "تیم رسانه تکباکس", "role": "ویدیو" },
    "date": "2026-07-10",
    "date_fa": "19 تیر 1405",
    "likes": 540,
    "views": 18200,
    "category": "بررسی ویدیویی"
  },
  {
    "slug": "mikrotik-lab",
    "module": "media",
    "title": "لَب عملی میکروتیک – VLAN و روتینگ",
    "excerpt": "سناریوی واقعی میکروتیک.",
    "content": "...",
    "image": "/assets/blog-4.jpg",
    "tags": ["میکروتیک", "شبکه", "vlan", "ویدیو"],
    "author": { "name": "روژینا باقری", "role": "کارشناس شبکه" },
    "date": "2026-07-05",
    "date_fa": "14 تیر 1405",
    "likes": 210,
    "views": 7400,
    "category": "آموزش ویدیویی"
  },
  {
    "slug": "ai-podcast-ep12",
    "module": "media",
    "title": "پادکست هوش مصنوعی قسمت ۱۲",
    "excerpt": "آینده LLM های فارسی.",
    "content": "...",
    "image": "/assets/blog-3.jpeg",
    "tags": ["هوش مصنوعی", "پادکست"],
    "author": { "name": "نسترن خداکرمی", "role": "فعال حوزه فناوری اطلاعات" },
    "date": "2026-06-29",
    "date_fa": "8 تیر 1405",
    "likes": 120,
    "views": 3900,
    "category": "پادکست"
  }
]

```

---

## `data/news.json`

```json
[
  {
    "slug": "ai-chip-breakthrough-2026",
    "module": "news",
    "title": "نسل جدید تراشه‌های هوش مصنوعی با مصرف انرژی نصف معرفی شد",
    "excerpt": "شرکت نوپای ایرانی چیپ‌ست 3 نانومتری را معرفی کرد.",
    "content": "متن کامل خبر هوش مصنوعی...",
    "image": "/assets/blog-4.jpg",
    "tags": ["هوش مصنوعی", "تراشه", "سخت‌افزار"],
    "author": { "name": "تحریریه تکباکس", "role": "اخبار" },
    "date": "2026-06-28",
    "date_fa": "7 تیر 1405",
    "time": "14:32",
    "source": "TechCrunch",
    "likes": 312,
    "views": 9210,
    "category": "سخت‌افزار"
  },
  {
    "slug": "iran-internet-infrastructure",
    "module": "news",
    "title": "توسعه زیرساخت دیتاسنترهای داخلی وارد فاز تازه‌ای شد",
    "excerpt": "ظرفیت جدید 40 رک در تهران.",
    "content": "...",
    "image": "/assets/blog-2.jpg",
    "tags": ["زیرساخت", "دیتاسنتر", "ایران"],
    "author": { "name": "تحریریه تکباکس", "role": "اخبار" },
    "date": "2026-06-27",
    "date_fa": "6 تیر 1405",
    "time": "11:15",
    "source": "ایرنا",
    "likes": 54,
    "views": 1430,
    "category": "زیرساخت"
  },
  {
    "slug": "quantum-computing-milestone",
    "module": "news",
    "title": "دستیابی به رکورد تازه در پایداری کیوبیت‌های کوانتومی",
    "excerpt": "پایداری 5 میلی‌ثانیه.",
    "content": "...",
    "image": "/assets/blog-3.jpeg",
    "tags": ["کوانتوم", "پژوهش"],
    "author": { "name": "تحریریه تکباکس", "role": "اخبار" },
    "date": "2026-06-25",
    "date_fa": "4 تیر 1405",
    "time": "09:40",
    "source": "Nature",
    "likes": 44,
    "views": 980,
    "category": "پژوهش"
  },
  {
    "slug": "linux-kernel-new-release",
    "module": "news",
    "title": "نسخه پایدار جدید هسته لینوکس با بهبود عملکرد شبکه منتشر شد",
    "excerpt": "کرنل 6.9 منتشر شد.",
    "content": "...",
    "image": "/assets/blog-1.jpg",
    "tags": ["لینوکس", "کرنل", "شبکه"],
    "author": { "name": "تحریریه تکباکس", "role": "اخبار" },
    "date": "2026-06-24",
    "date_fa": "3 تیر 1405",
    "time": "16:05",
    "source": "kernel.org",
    "likes": 201,
    "views": 4120,
    "category": "نرم‌افزار"
  },
  {
    "slug": "5g-coverage-expansion",
    "module": "news",
    "title": "پوشش شبکه نسل پنجم در کلان‌شهرها گسترش یافت",
    "excerpt": "5G در 12 شهر جدید.",
    "content": "...",
    "image": "/assets/blog-5.jpg",
    "tags": ["5g", "شبکه", "ایران"],
    "author": { "name": "تحریریه تکباکس", "role": "اخبار" },
    "date": "2026-06-20",
    "date_fa": "30 خرداد 1405",
    "time": "10:20",
    "source": "همراه اول",
    "likes": 67,
    "views": 2200,
    "category": "شبکه"
  },
  {
    "slug": "cybersecurity-report-2026",
    "module": "news",
    "title": "گزارش امنیت سایبری از افزایش حملات باج‌افزاری خبر داد",
    "excerpt": "رشد 34 درصدی.",
    "content": "...",
    "image": "/assets/blog-4.jpg",
    "tags": ["امنیت", "باج‌افزار", "cybersecurity"],
    "author": { "name": "تحریریه تکباکس", "role": "اخبار" },
    "date": "2026-06-18",
    "date_fa": "28 خرداد 1405",
    "time": "08:15",
    "source": "BBC",
    "likes": 90,
    "views": 3100,
    "category": "امنیت"
  }
]

```

---

## `data/review.json`

```json
[
  {
    "slug": "qnap-2277-full-review",
    "module": "review",
    "title": "نقد و بررسی تخصصی QNAP TS-2277",
    "excerpt": "آیا QNAP-2277 بهترین NAS میان‌رده 2026 است؟",
    "content": "بررسی کامل سخت‌افزار، نرم‌افزار، سرعت...",
    "image": "/assets/blog-6.png",
    "tags": ["QNAP-2277", "nas", "بررسی", "ذخیره‌سازی", "سخت‌افزار"],
    "author": { "name": "هومن مدق", "role": "کارشناس فناوری اطلاعات" },
    "date": "2026-07-11",
    "date_fa": "20 تیر 1405",
    "likes": 87,
    "views": 4120,
    "category": "سخت‌افزار"
  },
  {
    "slug": "dell-r750-review",
    "module": "review",
    "title": "بررسی Dell PowerEdge R750",
    "excerpt": "هیولای رک‌مونت جدید دل.",
    "content": "...",
    "image": "/assets/blog-1.jpg",
    "tags": ["dell", "سرور", "بررسی"],
    "author": { "name": "عطیه حاتمی", "role": "مهندس کامپیوتر" },
    "date": "2026-07-01",
    "date_fa": "10 تیر 1405",
    "likes": 54,
    "views": 2100,
    "category": "سرور"
  }
]

```

---

## `data/shop.json`

```json
[
  {
    "slug": "qnap-ts-2277",
    "module": "shop",
    "title": "ذخیره‌ساز تحت شبکه QNAP TS-2277",
    "excerpt": "2Bay، 10GbE، پردازنده Ryzen.",
    "content": "مشخصات کامل QNAP-2277...",
    "image": "/assets/blog-6.png",
    "tags": ["QNAP-2277", "nas", "qnap", "ذخیره‌سازی", "فروشگاه"],
    "author": { "name": "فروشگاه تکباکس", "role": "فروش" },
    "date": "2026-07-12",
    "date_fa": "21 تیر 1405",
    "likes": 31,
    "views": 980,
    "category": "NAS"
  },
  {
    "slug": "dell-r750",
    "module": "shop",
    "title": "سرور Dell PowerEdge R750",
    "excerpt": "2U، Xeon Scalable نسل 3.",
    "content": "...",
    "image": "/assets/blog-1.jpg",
    "tags": ["dell", "سرور", "فروشگاه"],
    "author": { "name": "فروشگاه تکباکس", "role": "فروش" },
    "date": "2026-06-10",
    "date_fa": "20 خرداد 1405",
    "likes": 12,
    "views": 540,
    "category": "سرور"
  }
]

```

---

## `data/tools.json`

```json
[
  {
    "slug": "subnet-calculator",
    "module": "tools",
    "title": "ماشین‌حساب ساب‌نت فارسی",
    "excerpt": "محاسبه سریع CIDR، IP range و broadcast.",
    "content": "ابزار آنلاین ساب‌نت...",
    "image": "/assets/blog-4.jpg",
    "tags": ["شبکه", "ابزار", "subnet", "آی‌پی"],
    "author": { "name": "تیم ابزار تکباکس", "role": "ابزار" },
    "date": "2026-07-09",
    "date_fa": "18 تیر 1405",
    "likes": 430,
    "views": 12500,
    "category": "شبکه"
  },
  {
    "slug": "raid-calculator",
    "module": "tools",
    "title": "محاسبه‌گر RAID",
    "excerpt": "ظرفیت مفید و تحمل خطا.",
    "content": "...",
    "image": "/assets/blog-2.jpg",
    "tags": ["raid", "storage", "ابزار"],
    "author": { "name": "تیم ابزار تکباکس", "role": "ابزار" },
    "date": "2026-06-15",
    "date_fa": "25 خرداد 1405",
    "likes": 110,
    "views": 3400,
    "category": "ذخیره‌سازی"
  }
]

```

---

## `data/users.json`

```json
[
  { "id": "u1", "name": "مدیر کل", "email": "admin@techbox.ir", "username": "admin", "role": "super_admin", "modules": ["blog","news","media","review","tools","download","shop","forum"], "avatar": "/assets/hooman.png" },
  { "id": "u2", "name": "سارا احمدی", "email": "sara@techbox.ir", "username": "sara", "role": "editor", "modules": ["blog"], "avatar": "/assets/behnaz.png" },
  { "id": "u3", "name": "نیما", "email": "nima@techbox.ir", "username": "nima", "role": "editor", "modules": ["news"], "avatar": "/assets/hooman.png" },
  { "id": "u4", "name": "روژینا باقری", "email": "rojina@techbox.ir", "username": "rojina", "role": "editor", "modules": ["media","review"], "avatar": "/assets/rojina.png" },
  { "id": "u5", "name": "عطیه", "email": "atiye@techbox.ir", "username": "atiye", "role": "editor", "modules": ["tools","download"], "avatar": "/assets/atiye.png" },
  { "id": "u6", "name": "نسترن", "email": "nastaran@techbox.ir", "username": "nastaran", "role": "editor", "modules": ["shop","forum"], "avatar": "/assets/nastaran.png" }
]

```

---

## `design/foundation/globals.css`

```css
@import "tailwindcss";
@import "../tokens/colors.css";
@import "./primitives.css";

@theme inline {
  --font-sans: var(--font-kalameh);

  --color-background: var(--tb-background);
  --color-foreground: var(--tb-foreground);
  --color-primary: var(--tb-brand);
  --color-primary-foreground: var(--tb-brand-foreground);
  --color-muted: var(--tb-muted);
  --color-muted-foreground: var(--tb-muted-foreground);
  --color-border: var(--tb-border);
  --color-ring: var(--tb-ring);
  --color-card: var(--tb-card);
  --color-card-foreground: var(--tb-card-foreground);

  --radius-lg: var(--tb-radius-lg);
  --radius-xl: var(--tb-radius-xl);
  --radius-2xl: var(--tb-radius-2xl);
}

*{
  box-sizing:border-box;
}

html{
  font-family:var(--font-kalameh),Vazirmatn,system-ui,sans-serif;
  direction:rtl;
}

body{
  margin:0;
  background:var(--tb-background);
  color:var(--tb-foreground);
  min-height:100dvh;
}

/* typography */

h1{
  font-size:clamp(1.6rem,3.5vw,2.25rem);
  font-weight:900;
  line-height:1.35;
}

h2{
  font-size:clamp(1.3rem,2.5vw,1.75rem);
  font-weight:800;
}

h3{
  font-size:clamp(1.05rem,1.8vw,1.25rem);
  font-weight:700;
}

p,li{
  font-size:14px;
  line-height:1.9;
  color:var(--tb-muted-foreground);
}

/* utilities */

.line-clamp-2{
  display:-webkit-box;
  -webkit-line-clamp:2;
  -webkit-box-orient:vertical;
  overflow:hidden;
}

.line-clamp-3{
  display:-webkit-box;
  -webkit-line-clamp:3;
  -webkit-box-orient:vertical;
  overflow:hidden;
}

```

---

## `design/foundation/primitives.css`

```css
.card{
  background:var(--tb-card);
  color:var(--tb-card-foreground);
  border:1px solid var(--tb-border);
  border-radius:1.25rem;
  padding:1rem;
  box-shadow:var(--tb-shadow);
}

.badge{
  display:inline-flex;
  align-items:center;
  gap:.3em;
  border-radius:9999px;
  padding:2px 10px;
  font-size:11px;
  font-weight:600;
  background:var(--tb-muted);
  color:var(--tb-muted-foreground);
  border:1px solid var(--tb-border);
}

.btn{
  display:inline-flex;
  align-items:center;
  justify-content:center;
  gap:.45rem;
  border-radius:.8rem;
  padding:.58rem .95rem;
  font-weight:700;
  font-size:13px;
  cursor:pointer;
  transition:.15s;
}

.btn-primary{
  background:var(--tb-brand);
  color:white;
}

.btn-primary:hover{
  filter:brightness(1.06);
}

.btn-ghost{
  background:transparent;
  border:1px solid var(--tb-border);
}

.input{
  width:100%;
  background:var(--tb-muted);
  border:1px solid var(--tb-border);
  border-radius:.6rem;
  padding:.6rem .85rem;
}

```

---

## `design/index.ts`

```ts
export * from "./tokens/blur";
export * from "./tokens/motion";
export * from "./tokens/radius";
export * from "./tokens/shadows";
export * from "./tokens/typography";

export * from "./presets/effects";
export * from "./presets/interactions";
export * from "./presets/surfaces";

```

---

## `design/presets/effects.ts`

```ts
export const hover = {
  lift: "hover:-translate-y-[2px]",
  brighten: "hover:brightness-[1.05]",
  glow: "hover:shadow-[var(--tb-shadow-glow)]",
};

export const focus = {
  ring: "focus-visible:outline-none focus-visible:shadow-[var(--tb-focus-ring)]",
};

```

---

## `design/presets/interactions.ts`

```ts
export const interactive = [
  "hover:-translate-y-[1px]",
  "hover:brightness-[1.05]",
  "transition-all",
  "duration-[var(--tb-duration-normal)]",
  "ease-[var(--tb-ease-standard)]",
].join(" ");

export const press = "active:scale-[0.98]";

```

---

## `design/presets/surfaces.ts`

```ts
export const card =
  "bg-[var(--tb-card)] border border-[var(--tb-border)] rounded-[var(--tb-radius-lg)] shadow-[var(--tb-shadow)]";

export const elevated =
  "bg-[var(--tb-card)] rounded-[var(--tb-radius-xl)] shadow-[var(--tb-shadow-md)]";

export const glass =
  "backdrop-blur-[var(--tb-glass-blur)] bg-[color-mix(in_oklch,var(--tb-card)_72%,transparent)] border border-[color-mix(in_oklch,var(--tb-border)_80%,transparent)]";

```

---

## `design/tokens/blur.ts`

```ts
export const blur = {
  sm: "var(--tb-blur-sm)",
  md: "var(--tb-blur-md)",
  lg: "var(--tb-blur-lg)",
  xl: "var(--tb-blur-xl)",
  glass: "var(--tb-glass-blur)",
} as const;

export type BlurToken = keyof typeof blur;

```

---

## `design/tokens/colors.css`

```css
:root {
  /* — Brand — */
  --tb-brand: oklch(0.62 0.21 255);
  --tb-brand-foreground: oklch(0.98 0.005 255);
  --tb-brand-dim: oklch(0.62 0.21 255 / 0.14);

  /* — Semantic – light — */
  --tb-background: oklch(0.985 0.006 270);
  --tb-foreground: oklch(0.18 0.025 270);
  --tb-surface-1: oklch(0.96 0.012 270);
  --tb-surface-2: oklch(0.92 0.015 270);
  --tb-muted: oklch(0.94 0.010 270);
  --tb-muted-foreground: oklch(0.50 0.025 270);
  --tb-border: oklch(0.88 0.018 270);
  --tb-ring: oklch(0.55 0.20 260);
  --tb-card: oklch(1 0 0);
  --tb-card-foreground: oklch(0.18 0.025 270);
  --tb-popover: oklch(1 0 0);
  --tb-popover-foreground: oklch(0.18 0.025 270);

  /* — Module accent tokens — */
  --tb-blog:    oklch(0.70 0.17 52);   /* orange */
  --tb-news:    oklch(0.64 0.22 25);   /* rose */
  --tb-media:   oklch(0.82 0.15 85);   /* amber */
  --tb-shop:    oklch(0.80 0.19 125);  /* lime */
  --tb-tools:   oklch(0.82 0.12 200);  /* cyan */
  --tb-forum:   oklch(0.78 0.16 5);    /* rose-300 */
  --tb-review:  oklch(0.70 0.17 240);  /* sky */
  --tb-download: oklch(0.72 0.20 350);
  --tb-home:    oklch(0.62 0.22 290);  /* violet */
  --tb-account: oklch(0.80 0.12 15);   /* red-200 */

  /* — Radius — */
  --tb-radius-xs: 6px;
  --tb-radius-sm: 8px;
  --tb-radius-md: 12px;
  --tb-radius-lg: 16px;
  --tb-radius-xl: 20px;
  --tb-radius-2xl: 24px;
  --tb-radius-full: 9999px;

  /* — Elevation / Shadow — */
  --tb-shadow-sm: 0 1px 3px rgba(2,8,23,.06), 0 1px 2px rgba(2,8,23,.04);
  --tb-shadow: 0 4px 16px rgba(2,8,23,.08), 0 2px 6px rgba(2,8,23,.05);
  --tb-shadow-md: 0 8px 28px rgba(2,8,23,.10), 0 3px 10px rgba(2,8,23,.06);
  --tb-shadow-lg: 0 16px 44px rgba(2,8,23,.14), 0 6px 16px rgba(2,8,23,.08);
  --tb-shadow-glow: 0 0 24px rgba(59,130,246,.22), 0 0 72px rgba(14,165,233,.10);

  /* — Blur — */
  --tb-blur-sm: 6px;
  --tb-blur-md: 12px;
  --tb-blur-lg: 20px;
  --tb-blur-xl: 28px;
  --tb-glass-blur: 18px;

  /* — Motion — */
  --tb-duration-instant: 80ms;
  --tb-duration-fast: 150ms;
  --tb-duration-normal: 220ms;
  --tb-duration-slow: 340ms;
  --tb-duration-slower: 520ms;
  --tb-ease-standard: cubic-bezier(.2,.8,.2,1);
  --tb-ease-emphasized: cubic-bezier(.2,0,0,1);
  --tb-ease-out: cubic-bezier(0,0,.38,1);
  --tb-ease-in-out: cubic-bezier(.4,0,.2,1);

  /* — Typography scale — */
  --tb-text-2xs: 0.6875rem; /*11px*/
  --tb-text-xs: 0.75rem;    /*12px*/
  --tb-text-sm: 0.8125rem;  /*13px*/
  --tb-text-base: 0.875rem; /*14px*/
  --tb-text-md: 1rem;       /*16px*/
  --tb-text-lg: 1.125rem;   /*18px*/
  --tb-text-xl: 1.25rem;    /*20px*/
  --tb-text-2xl: 1.5rem;    /*24px*/
  --tb-text-3xl: 1.875rem;  /*30px*/
  --tb-text-4xl: 2.25rem;   /*36px*/
  --tb-text-5xl: 3rem;      /*48px*/

  --tb-leading-tight: 1.25;
  --tb-leading-snug: 1.45;
  --tb-leading-normal: 1.7;
  --tb-leading-relaxed: 1.95;

  --tb-weight-regular: 400;
  --tb-weight-medium: 500;
  --tb-weight-semibold: 600;
  --tb-weight-bold: 700;
  --tb-weight-extrabold: 800;
  --tb-weight-black: 900;
  --tb-focus-ring: 0 0 0 3px rgba(59,130,246,.35);
}

/* DARK – TechBox cube – #020617 → #0b1e4a */
.dark {
  --tb-background: #050a14;
  --tb-foreground: #e6edff;
  --tb-surface-1: #0f172a;
  --tb-surface-2: #12223f;
  --tb-muted: #0f172a;
  --tb-muted-foreground: #8aa0c7;
  --tb-border: #1e2d4d;
  --tb-ring: #60a5fa;
  --tb-card: #0b152a;
  --tb-card-foreground: #e6edff;
  --tb-popover: #0b152a;
  --tb-popover-foreground: #e6edff;

  --tb-brand: #60a5fa;
  --tb-brand-dim: rgba(96,165,250,.18);

  /* module accents – dark tuned */
  --tb-blog:    #fb923c;
  --tb-news:    #fb7185;
  --tb-media:   #fcd34d;
  --tb-shop:    #a3e635;
  --tb-tools:   #67e8f9;
  --tb-forum:   #fda4af;
  --tb-review:  #38bdf8;
  --tb-download:#f472b6;
  --tb-home:    #a78bfa;
  --tb-account: #fca5a5;

  --tb-shadow-sm: 0 1px 3px rgba(0,0,0,.30), 0 1px 2px rgba(0,0,0,.22);
  --tb-shadow: 0 6px 24px rgba(0,0,0,.38), 0 2px 8px rgba(0,0,0,.24);
  --tb-shadow-md: 0 10px 36px rgba(0,0,0,.42), 0 4px 12px rgba(0,0,0,.28);
  --tb-shadow-lg: 0 20px 60px rgba(0,0,0,.5), 0 8px 20px rgba(0,0,0,.32);
  --tb-shadow-glow: 0 0 28px rgba(59,130,246,.28), 0 0 80px rgba(14,165,233,.14);
  --tb-glass-blur: 24px;
}

```

---

## `design/tokens/motion.ts`

```ts
// Framer Motion – central tokens – Next 16 / React 19
// No Tailwind / no DOM – pure JS – safe to import in hooks/services

export const duration = {
  instant: 0.08,
  fast: 0.15,
  normal: 0.22,
  slow: 0.34,
  slower: 0.52,
} as const; // seconds – matches --tb-duration-*

export const ease = {
  standard: [0.2, 0.8, 0.2, 1] as const,
  emphasized: [0.2, 0, 0, 1] as const,
  out: [0, 0, 0.38, 1] as const,
  inOut: [0.4, 0, 0.2, 1] as const,
};

export const transition = {
  fast: { duration: duration.fast, ease: ease.standard },
  normal: { duration: duration.normal, ease: ease.standard },
  slow: { duration: duration.slow, ease: ease.emphasized },
};

// Framer Motion variants – reusable
export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: transition.normal,
};

export const fadeInUp = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: transition.normal,
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.96 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.96 },
  transition: transition.fast,
};

export const hoverScale = {
  whileHover: { scale: 1.015, y: -2 },
  whileTap: { scale: 0.99 },
  transition: transition.fast,
};

export const slideIn = fadeInUp;
export const slideInLeft = { initial:{opacity:0,x:-24}, animate:{opacity:1,x:0}, exit:{opacity:0,x:-24}, transition: transition.normal };
export const slideInRight = { initial:{opacity:0,x:24}, animate:{opacity:1,x:0}, exit:{opacity:0,x:24}, transition: transition.normal };

```

---

## `design/tokens/radius.ts`

```ts
export const radius = {
  xs: "var(--tb-radius-xs)",
  sm: "var(--tb-radius-sm)",
  md: "var(--tb-radius-md)",
  lg: "var(--tb-radius-lg)",
  xl: "var(--tb-radius-xl)",
  "2xl": "var(--tb-radius-2xl)",
  full: "var(--tb-radius-full)",
} as const;

export type RadiusToken = keyof typeof radius;

```

---

## `design/tokens/shadows.ts`

```ts
export const shadows = {
  sm: "var(--tb-shadow-sm)",
  DEFAULT: "var(--tb-shadow)",
  md: "var(--tb-shadow-md)",
  lg: "var(--tb-shadow-lg)",
  glow: "var(--tb-shadow-glow)",
  none: "none",
} as const;
export type ShadowToken = keyof typeof shadows;

```

---

## `design/tokens/typography.ts`

```ts
export const fontSize = {
  "2xs": "var(--tb-text-2xs)",
  xs: "var(--tb-text-xs)",
  sm: "var(--tb-text-sm)",
  base: "var(--tb-text-base)",
  md: "var(--tb-text-md)",
  lg: "var(--tb-text-lg)",
  xl: "var(--tb-text-xl)",
  "2xl": "var(--tb-text-2xl)",
  "3xl": "var(--tb-text-3xl)",
  "4xl": "var(--tb-text-4xl)",
  "5xl": "var(--tb-text-5xl)",
} as const;

export const lineHeight = {
  tight: "var(--tb-leading-tight)",
  snug: "var(--tb-leading-snug)",
  normal: "var(--tb-leading-normal)",
  relaxed: "var(--tb-leading-relaxed)",
} as const;

export const fontWeight = {
  regular: "var(--tb-weight-regular)",
  medium: "var(--tb-weight-medium)",
  semibold: "var(--tb-weight-semibold)",
  bold: "var(--tb-weight-bold)",
  extrabold: "var(--tb-weight-extrabold)",
  black: "var(--tb-weight-black)",
} as const;

export const type = {
  "heading-1": "text-[clamp(1.6rem,3.5vw,2.25rem)] font-black leading-tight tracking-tight",
  "heading-2": "text-[clamp(1.3rem,2.5vw,1.75rem)] font-extrabold leading-snug",
  "heading-3": "text-[clamp(1.05rem,1.8vw,1.25rem)] font-bold",
  "body": "text-[14px] leading-[1.9]",
  "body-sm": "text-[13px] leading-[1.8]",
  "meta": "text-[11px] leading-[1.6]",
  "caption": "text-[11.5px] leading-[1.5]",
} as const;

```

---

## `features/blog/components/BlogGrid.tsx`

```tsx
"use client";
import { getModuleItems } from "@/lib/content";
import Link from "next/link";

export default function BlogGrid(){
  const items = getModuleItems("blog");
  return (
    <main className="mx-auto max-w-7xl px-4 md:px-8 py-14" dir="rtl">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-orange-400">مجله تکباکس</h1>
          <p className="text-sm text-muted-foreground mt-2">مقالات تخصصی زیرساخت • {items.length.toLocaleString("fa-IR")} مطلب</p>
        </div>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map(p=>(
          <article key={p.slug} className="group flex flex-col overflow-hidden rounded-[24px] border border-border bg-card shadow-card hover:shadow-glass hover:-translate-y-1 transition-all">
            <Link href={`/blog/${p.slug}`} className="block relative aspect-square overflow-hidden bg-muted">
              <img src={p.image || "/assets/blog-1.jpg"} alt={p.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              {p.category && <span className="absolute top-3 right-3 badge">{p.category}</span>}
            </Link>
            <div className="p-4 flex flex-col flex-1">
              <h3 className="font-extrabold text-[17px] leading-7 line-clamp-2 min-h-[56px]">
                <Link href={`/blog/${p.slug}`} className="hover:text-orange-400">{p.title}</Link>
              </h3>
              <p className="text-[13px] text-muted-foreground leading-6 line-clamp-3 mt-2 flex-1">{p.excerpt}</p>
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/50 text-[11px] text-muted-foreground">
                <div className="flex items-center gap-2">
                  {p.author.avatar && <img src={p.author.avatar} className="w-7 h-7 rounded-full ring-1 ring-border object-cover" alt="" />}
                  <div>
                    <div className="text-foreground font-semibold text-[12px]">{p.author.name}</div>
                    <div>{p.date_fa}</div>
                  </div>
                </div>
                <div className="text-left leading-5">
                  <div>♥ {p.likes.toLocaleString("fa-IR")}</div>
                  <div>👁 {p.views.toLocaleString("fa-IR")}</div>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}

```

---

## `features/chat/components/Chatbot.tsx`

```tsx
"use client";
import { useState, useRef, useEffect } from "react";

type Msg = { role: "user" | "assistant"; text: string; time: number };

const STORAGE_KEY = "tb_chat_history";

export default function Chatbot(){
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(()=>{
    try{ const s = localStorage.getItem(STORAGE_KEY); if(s) setMsgs(JSON.parse(s)); }catch{}
  },[]);
  useEffect(()=>{
    localStorage.setItem(STORAGE_KEY, JSON.stringify(msgs.slice(-40)));
    endRef.current?.scrollIntoView({behavior:"smooth"});
  },[msgs]);

  const send = async (e?: React.FormEvent)=>{
    e?.preventDefault();
    const text = input.trim();
    if(!text || loading) return;
    const userMsg: Msg = { role:"user", text, time: Date.now() };
    setMsgs(m=>[...m, userMsg]);
    setInput("");
    setLoading(true);
    try{
      const res = await fetch("/api/chat", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          messages: [...msgs, userMsg].slice(-12).map(m=>({role:m.role, content:m.text})),
          // context: product / page – can extend later
        })
      });
      const data = await res.json();
      const reply = data?.reply || data?.error || "پاسخی دریافت نشد – کلید API را در .env تنظیم کنید: CHAT_API_KEY / CHAT_BASE_URL";
      setMsgs(m=>[...m, {role:"assistant", text: reply, time: Date.now()}]);
    }catch(err:any){
      setMsgs(m=>[...m, {role:"assistant", text:"خطا در اتصال به سرویس چت – حالت آفلاین.", time: Date.now()}]);
    }finally{
      setLoading(false);
    }
  };

  return (
    <>
      {/* FAB */}
      <button
        onClick={()=>setOpen(true)}
        className="fixed bottom-5 left-5 z-[240] rounded-full shadow-2xl flex items-center gap-2 px-4 py-3 text-sm font-bold transition-transform hover:scale-105"
        style={{background:"linear-gradient(135deg,#1e3a8a,#2563eb)", color:"white", display: open ? "none" : "flex"}}
        aria-label="چت با تکباکس"
      >
        <span className="text-lg">💬</span>
        <span className="hidden sm:inline">پرسش از تکباکس</span>
      </button>

      {/* panel */}
      {open && (
        <div dir="rtl" className="fixed bottom-4 left-4 right-4 sm:left-4 sm:right-auto sm:w-[380px] z-[500]" style={{zIndex:500}}>
          <div className="card flex flex-col h-[520px] max-h-[72vh] overflow-hidden p-0" style={{boxShadow:"0 20px 60px rgba(0,0,0,.45)"}}>
            <div className="flex items-center justify-between px-3 py-2.5 border-b" style={{borderColor:"var(--border)", background:"var(--surface-1, var(--muted))"}}>
              <div className="text-[13px] font-black">دستیار تکباکس <span className="text-[10px] font-normal" style={{color:"var(--muted-foreground)"}}>AI Beta</span></div>
              <div className="flex items-center gap-2">
                <button onClick={()=>{setMsgs([]); localStorage.removeItem(STORAGE_KEY)}} className="text-[10px] text-muted-foreground hover:text-foreground">پاک‌سازی</button>
                <button onClick={()=>setOpen(false)} className="text-muted-foreground hover:text-foreground">✕</button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-3 text-[13px]" style={{background:"var(--background)"}}>
              {msgs.length===0 && (
                <div className="text-[12px] leading-6" style={{color:"var(--muted-foreground)"}}>
                  سلام! من دستیار هوشمند تکباکس هستم.<br/>
                  درباره محصولات (مثلا <b>QNAP-2277</b>)، مشکلات شبکه، یا مقالات بپرسید.<br/>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {["قیمت QNAP-2277؟","RAID مناسب سرور HP؟","فرق NAS و SAN؟","مشکل iSCSI؟"].map(s=>(
                      <button key={s} onClick={()=>setInput(s)} className="text-[10px] px-2 py-1 rounded-full border" style={{borderColor:"var(--border)"}}>{s}</button>
                    ))}
                  </div>
                </div>
              )}
              {msgs.map((m,i)=>(
                <div key={i} className={`flex ${m.role==="user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[82%] rounded-2xl px-3 py-2 leading-6 whitespace-pre-wrap ${m.role==="user" ? "text-white" : ""}`}
                    style={{background: m.role==="user" ? "var(--brand)" : "var(--muted)", color: m.role==="user" ? "white" : "var(--foreground)"}}>
                    {m.text}
                  </div>
                </div>
              ))}
              {loading && <div className="text-[11px]" style={{color:"var(--muted-foreground)"}}>در حال فکر کردن…</div>}
              <div ref={endRef} />
            </div>

            <form onSubmit={send} className="border-t p-2 flex gap-2" style={{borderColor:"var(--border)", background:"var(--card)"}}>
              <input
                value={input}
                onChange={e=>setInput(e.target.value)}
                placeholder="سوال فنی / محصول خود را بپرسید…"
                className="input flex-1 !py-2 text-[13px]"
                disabled={loading}
              />
              <button disabled={loading || !input.trim()} className="btn btn-primary text-xs px-4 disabled:opacity-50">
                {loading ? "…" : "ارسال"}
              </button>
            </form>
            <div className="px-3 pb-2 text-[9px] text-center" style={{color:"var(--muted-foreground)"}}>
              پاسخ‌ها ممکن است نادرست باشند – همیشه مستندات رسمی را چک کنید • API: <code>/api/chat</code>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

```

---

## `features/comment/actions/comments.ts`

```ts
"use server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth-server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const postSchema = z.object({
  module: z.string(),
  slug: z.string(),
  text: z.string().min(2).max(2000),
  authorName: z.string().optional(),
  parentId: z.string().nullable().optional(),
});

export async function getCommentsAction(module: string, slug: string){
  const post = await prisma.post.findUnique({
    where: { module_slug: { module: module as any, slug } },
    select: { id: true }
  });
  if(!post) return [];
  const comments = await prisma.comment.findMany({
    where: { postId: post.id },
    orderBy: { createdAt: "asc" },
    include: { replies: { orderBy: { createdAt: "asc" } } }
  });
  return comments;
}

export async function createCommentAction(prevState: any, formData: FormData){
  const user = await getSessionUser();
  const raw = {
    module: String(formData.get("module")||""),
    slug: String(formData.get("slug")||""),
    text: String(formData.get("text")||""),
    authorName: String(formData.get("authorName")||""),
    parentId: formData.get("parentId") ? String(formData.get("parentId")) : null,
  };
  try{
    const { module, slug, text, authorName, parentId } = postSchema.parse(raw);
    const post = await prisma.post.findUnique({
      where: { module_slug: { module: module as any, slug } }
    });
    if(!post) return { ok:false, error:"post_not_found" };
    await prisma.comment.create({
      data: {
        postId: post.id,
        parentId,
        authorId: user?.id || null,
        authorName: user?.name || authorName || "مهمان",
        text
      }
    });
    revalidatePath(`/${module}/${slug}`);
    return { ok: true };
  }catch(e:any){
    return { ok:false, error: e.message };
  }
}

export async function voteCommentAction(commentId: string, vote: 1|-1|0, fingerprint: string){
  "use server";
  const existing = await prisma.commentVote.findUnique({
    where: { fingerprint_commentId: { fingerprint, commentId } }
  });
  const oldV = existing?.vote ?? 0;
  if(vote === oldV){ // toggle off handled by caller sending 0
  }
  if(vote === 0){
    if(existing){
      await prisma.$transaction([
        prisma.commentVote.delete({ where:{ id: existing.id }}),
        prisma.comment.update({
          where:{ id: commentId },
          data:{
            likes: { decrement: existing.vote===1?1:0 },
            dislikes: { decrement: existing.vote===-1?1:0 }
          }
        })
      ]);
    }
  } else {
    await prisma.$transaction(async tx=>{
      if(existing){
        await tx.commentVote.update({ where:{id: existing.id}, data:{ vote }});
        await tx.comment.update({
          where:{id: commentId},
          data:{
            likes: { increment: (vote===1?1:0) - (oldV===1?1:0) },
            dislikes: { increment: (vote===-1?1:0) - (oldV===-1?1:0) }
          }
        });
      } else {
        await tx.commentVote.create({ data:{ commentId, fingerprint, vote }});
        await tx.comment.update({
          where:{id: commentId},
          data:{
            likes: { increment: vote===1?1:0 },
            dislikes: { increment: vote===-1?1:0 }
          }
        });
      }
    });
  }
  const c = await prisma.comment.findUnique({ where:{id:commentId}, select:{likes:true, dislikes:true}});
  revalidatePath("/", "layout");
  return c;
}

```

---

## `features/comment/components/CommentSection.tsx`

```tsx
"use client";
import * as React from "react";
import { useActionState, useEffect, useOptimistic, useTransition, useState } from "react";
import { getCommentsAction, createCommentAction, voteCommentAction } from "@/features/comment/actions/comments";
import { CommentVote } from "@/components/ui/LikeButton";

type CommentNode = any;

function nestFlat(rows: any[]): CommentNode[] {
  const map = new Map<string, any>();
  rows.forEach((r: any) => map.set(r.id, { ...r, replies: [] }));
  const roots: any[] = [];
  map.forEach((n) => {
    if (n.parentId && map.has(n.parentId)) map.get(n.parentId)!.replies.push(n);
    else roots.push(n);
  });
  return roots;
}

export default function CommentSection({ module, slug }: { module: string; slug: string }) {
  const [comments, setComments] = useState<CommentNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await getCommentsAction(module, slug);
      setComments(nestFlat(data as any));
    } finally {
      setLoading(false);
    }
  }, [module, slug]);

  useEffect(() => { load(); }, [load]);

  // Server Action form – useActionState (React 19)
  const [state, formAction, isSubmitting] = useActionState(
    async (_prev: any, formData: FormData) => {
      const res = await createCommentAction(null, formData);
      if ((res as any)?.ok) {
        startTransition(() => { load(); });
        return { ok: true, ts: Date.now() };
      }
      return res;
    },
    { ok: false }
  );

  const [replyOpen, setReplyOpen] = React.useState<string | null>(null);

  const renderNode = (c: CommentNode, depth = 0) => (
    <div key={c.id} style={{ marginRight: depth ? 16 : 0, marginTop: 12 }}>
      <div className="border-r-2 pe-3" style={{ borderColor: depth ? "var(--border)" : "transparent", paddingRight: depth ? 12 : 0 }}>
        <div className="card p-4" style={{background:"var(--card)"}}>
          <div className="flex justify-between items-center gap-2">
            <div className="font-bold text-[13px]">{(c as any).authorName || "کاربر"}</div>
            <div className="text-[10px]" style={{color:"var(--muted-foreground)"}}>
              {new Date((c as any).createdAt).toLocaleString("fa-IR", { dateStyle:"medium", timeStyle:"short" })}
            </div>
          </div>
          <p className="text-[13px] leading-7 mt-2" style={{color:"var(--muted-foreground)", whiteSpace:"pre-wrap"}}>{(c as any).text}</p>
          <div className="flex items-center gap-4 mt-3">
            <CommentVote
              id={c.id}
              initialLikes={(c as any).likes ?? 0}
              initialDislikes={(c as any).dislikes ?? 0}
            />
            <button
              onClick={()=> setReplyOpen(replyOpen===c.id ? null : c.id)}
              className="text-[11px] hover:underline"
              style={{color:"var(--muted-foreground)"}}
              type="button"
            >
              {replyOpen===c.id ? "بستن" : "پاسخ"}
            </button>
          </div>

          {replyOpen===c.id && (
            <form action={formAction} className="mt-3 space-y-2">
              <input type="hidden" name="module" value={module} />
              <input type="hidden" name="slug" value={slug} />
              <input type="hidden" name="parentId" value={c.id} />
              <input type="hidden" name="authorName" value="مهمان" />
              <textarea name="text" required className="input min-h-[90px] text-[12px]" placeholder={`پاسخ به ${(c as any).authorName}…`} />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={()=>setReplyOpen(null)} className="btn btn-ghost text-[11px]">انصراف</button>
                <button disabled={isSubmitting || isPending} className="btn btn-primary text-[11px]">
                  {isSubmitting ? "در حال ارسال…" : "ارسال پاسخ"}
                </button>
              </div>
            </form>
          )}
        </div>
          {c.replies && c.replies.length > 0 && (
          <div className="mt-2 space-y-2">
            {c.replies.map((r:any) => renderNode(r, depth+1))}
          </div>
        )}
      </div>
    </div>
  );

  const totalCount = comments.reduce((s, c:any) => s + 1 + ((c.replies?.length)||0), 0);

  return (
    <section className="mt-14 border-t pt-10" style={{borderColor:"var(--border)"}}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[18px] font-black">نظرات <span style={{color:"var(--muted-foreground)"}} className="text-[12px] font-normal">({totalCount.toLocaleString("fa-IR")})</span></h3>
        <span className="text-[10px] px-2 py-1 rounded-full" style={{background:"var(--muted)", color:"var(--muted-foreground)"}}>Server Actions • Prisma</span>
      </div>

      {/* new top-level comment – Server Action */}
      <form action={formAction} className="card p-4 space-y-3 mb-7">
        <input type="hidden" name="module" value={module} />
        <input type="hidden" name="slug" value={slug} />
        <input type="hidden" name="parentId" value="" />
        <div className="grid sm:grid-cols-3 gap-2">
          <input name="authorName" placeholder="نام شما" className="input text-sm" />
          <input name="email" type="email" placeholder="ایمیل (اختیاری)" className="input text-sm sm:col-span-2" />
        </div>
        <textarea name="text" required placeholder="نظر خود را بنویسید… (Server Action – app/actions/comments.ts)" className="input min-h-[110px] text-[13px]" />
        <div className="flex justify-between items-center">
          <span className="text-[10px]" style={{color:"var(--muted-foreground)"}}>
            {state?.ok ? <span style={{color:"#4ade80"}}>✓ ثبت شد – revalidatePath انجام شد</span> : "ارسال → createCommentAction → Prisma → revalidatePath"}
          </span>
          <button disabled={isSubmitting || isPending} className="btn btn-primary text-[13px]">
            {isSubmitting ? "…" : "ارسال نظر"}
          </button>
        </div>
      </form>

      <div className="space-y-1 min-h-[60px]">
        {loading ? (
          <p style={{color:"var(--muted-foreground)"}} className="text-sm">در حال بارگذاری نظرات از Prisma…</p>
        ) : comments.length === 0 ? (
          <p style={{color:"var(--muted-foreground)"}} className="text-sm">اولین نظر را شما ثبت کنید.</p>
        ) : (
          comments.map(c => renderNode(c, 0))
        )}
      </div>
    </section>
  );
}

```

---

## `features/content/components/BentoCard.tsx`

```tsx
import Link from "next/link";
import type { ReactNode } from "react";

type Props = {
  title: string;
  description?: string;
  href?: string;
  color?: string;
  className?: string;
  children?: ReactNode;
  badge?: string;
  footerLink?: string;
  footerLabel?: string;
};

export default function BentoCard({
  title,
  description,
  href = "#",
  color = "text-foreground",
  className = "",
  children,
  badge,
  footerLink,
  footerLabel = "مشاهده همه →",
}: Props) {
  return (
    <div className={`group relative overflow-hidden rounded-[28px] border border-border bg-card/80 backdrop-blur-sm p-5 md:p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-glass ${className}`} >
      <div className="flex h-full flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className={`text-xl md:text-2xl font-extrabold leading-tight ${color}`}>
              <Link href={href} className="hover:opacity-90">{title}</Link>
            </h3>
            {description && (
              <p className="text-[13px] leading-6 text-muted-foreground mt-1.5 max-w-[36ch]">{description}</p>
            )}
          </div>
          {badge && <span className="badge shrink-0">{badge}</span>}
        </div>

        <div className="min-h-0 flex-1 overflow-hidden">
          {children ?? (
            <div className="h-full rounded-2xl border border-dashed border-border/50 bg-muted/15" />
          )}
        </div>

        {footerLink && (
          <div className="pt-1">
            <Link href={footerLink} className="text-xs font-semibold text-muted-foreground hover:text-foreground">
              {footerLabel}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

```

---

## `features/content/components/ContentCard.tsx`

```tsx
import Link from "next/link";
import Image from "next/image";
import type { ContentItem } from "@/lib/content";
import { moduleMeta } from "@/lib/content";

export function ContentCard({ item, compact = false }: { item: ContentItem; compact?: boolean }) {
  const meta = moduleMeta[item.module];
  return (
    <Link href={`/${item.module}/${item.slug}`} className="block rounded-2xl border border-border bg-card/70 p-3 hover:bg-card hover:border-primary/30 transition-colors">
      <div className="flex gap-3">
        {item.image && !compact && (
          <div className="relative w-20 h-20 shrink-0 overflow-hidden rounded-xl bg-muted">
            <img src={item.image} alt={item.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-[11px]" style={{color:"var(--muted-foreground)"}}>
            <span style={{color:"var(--foreground)"}} className="font-semibold">{meta.titleFa}</span>
            <span>•</span>
            <span>{item.date_fa}</span>
          </div>
          <h4 className="text-[13px] font-bold leading-6 line-clamp-2 mt-1 text-foreground hover:text-primary transition-colors">{item.title}</h4>
          {!compact && <p className="text-[11px] leading-5 mt-1 line-clamp-2" style={{color:"var(--muted-foreground)"}}>{item.excerpt}</p>}
          <div className="flex items-center gap-3 text-[10px] mt-2" style={{color:"var(--muted-foreground)"}}>
            <span>♥ {item.likes}</span>
            <span>👁 {item.views.toLocaleString("fa-IR")}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

// ---------- FEED VARIANTS ----------
export function ContentFeedList({ items, variant="compact" }: { items: ContentItem[]; variant?: "compact"|"image"|"video"|"forum"|"product"|"download"|"review" }) {
  if (!items.length) return <div className="text-xs py-6 text-center" style={{color:"var(--muted-foreground)"}}>مطلبی نیست</div>;
  // NO scroll by default – only news variant gets scroll
  const scrollClass = variant==="image" && items[0]?.module==="news" ? "max-h-[260px] overflow-y-auto pe-1" : "";
  return (
    <div className={`space-y-2.5 ${scrollClass}`}>
      {items.map(i => {
        if(variant==="video") return <VideoFeedCard key={i.module+i.slug} item={i} />;
        if(variant==="forum") return <ForumFeedCard key={i.module+i.slug} item={i} />;
        if(variant==="product") return <ProductFeedCard key={i.module+i.slug} item={i} />;
        if(variant==="download") return <DownloadFeedCard key={i.module+i.slug} item={i} />;
        if(variant==="review") return <ReviewFeedCard key={i.module+i.slug} item={i} />;
        return <ContentCard key={i.module+i.slug} item={i} compact={variant==="compact"} />;
      })}
    </div>
  );
}

function VideoFeedCard({item}:{item:ContentItem}){
  return (
    <Link href={`/${item.module}/${item.slug}`} className="block rounded-xl overflow-hidden border border-border bg-card/70 hover:border-amber-300/40 transition-colors">
      <div className="relative aspect-video bg-black">
        <img src={item.image||""} className="w-full h-full object-cover" alt="" />
        <span className="absolute inset-0 flex items-center justify-center"><span className="w-10 h-10 rounded-full bg-black/50 flex items-center justify-center text-white">▶</span></span>
      </div>
      <div className="p-2.5">
        <div className="text-[12px] font-bold line-clamp-2 leading-5">{item.title}</div>
        <div className="text-[10px] mt-1" style={{color:"var(--muted-foreground)"}}>👁 {item.views.toLocaleString("fa-IR")} • ♥ {item.likes} • 💬</div>
      </div>
    </Link>
  );
}
function ForumFeedCard({item}:{item:ContentItem}){
  const answers = (item.likes % 7) + 2;
  const solved = !item.slug.includes("proxmox");
  return (
    <Link href={`/${item.module}/${item.slug}`} className="flex gap-2.5 p-2.5 rounded-xl border border-border bg-card/60 hover:bg-card transition-colors">
      <img src={item.author.avatar || "/assets/hooman.png"} className="w-8 h-8 rounded-full object-cover mt-0.5" alt="" />
      <div className="flex-1 min-w-0">
        <div className="text-[12px] font-bold line-clamp-2 leading-5">{item.title}</div>
        <div className="text-[10px] mt-1 flex items-center gap-2 flex-wrap" style={{color:"var(--muted-foreground)"}}>
          <span>{item.author.name}</span>
          <span>• {answers} پاسخ</span>
          <span className={`px-1.5 py-0.5 rounded text-[9px] ${solved ? "bg-emerald-500/15" : "bg-amber-500/15"}`} style={{color: solved ? "#6ee7b7" : "#fcd34d"}}>{solved ? "حل‌شده" : "باز"}</span>
        </div>
      </div>
    </Link>
  );
}
function ProductFeedCard({item}:{item:ContentItem}){
  // SQUARE product card for home feed – per request
  return (
    <Link href={`/${item.module}/${item.slug}`} className="block rounded-2xl border border-border bg-card/70 overflow-hidden hover:border-lime-400/40 transition-colors">
      <div className="aspect-square bg-muted relative overflow-hidden">
        <img src={item.image||""} className="w-full h-full object-cover" alt="" />
        <span className="absolute top-2 left-2 text-[9px] px-2 py-0.5 rounded-full" style={{background:"rgba(163,230,53,.15)", color:"#bef264"}}>موجود</span>
      </div>
      <div className="p-2.5">
        <div className="text-[12px] font-bold line-clamp-2 min-h-[36px]">{item.title}</div>
        <div className="text-[13px] font-black mt-1" style={{color:"#a3e635"}}>۴۸,۹۰۰,۰۰۰ <span className="text-[10px]" style={{color:"var(--muted-foreground)"}}>تومان</span></div>
      </div>
    </Link>
  );
}
function DownloadFeedCard({item}:{item:ContentItem}){
  return (
    <div className="flex items-center gap-2 p-2.5 rounded-xl border border-border bg-card/60">
      <div className="flex-1 min-w-0">
        <Link href={`/${item.module}/${item.slug}`} className="text-[12px] font-bold line-clamp-1 hover:text-pink-400">{item.title}</Link>
        <div className="text-[10px] mt-0.5" style={{color:"var(--muted-foreground)"}}>{item.date_fa} • {item.category}</div>
      </div>
      <Link href={`/${item.module}/${item.slug}`} className="btn btn-primary text-[10px] px-3 py-1.5 whitespace-nowrap">دانلود</Link>
    </div>
  );
}
function ReviewFeedCard({item}:{item:ContentItem}){
  return (
    <Link href={`/${item.module}/${item.slug}`} className="block rounded-xl border border-border bg-card/70 overflow-hidden hover:border-sky-400/30">
      {item.image && <img src={item.image} className="w-full aspect-square object-cover" alt="" />}
      <div className="p-2.5 space-y-2">
        <div className="text-[12px] font-bold line-clamp-2">{item.title}</div>
        <div className="flex items-center gap-2">
          <img src={item.author.avatar || "/assets/hooman.png"} className="w-5 h-5 rounded-full" alt="" />
          <span className="text-[10px]" style={{color:"var(--muted-foreground)"}}>{item.author.name}</span>
        </div>
        <div className="text-[10px] flex gap-2" style={{color:"var(--muted-foreground)"}}>
          <span>♥ {item.likes}</span>
          <span>💬 12</span>
          <span>👁 {item.views.toLocaleString("fa-IR")}</span>
        </div>
      </div>
    </Link>
  );
}

```

---

## `features/content/components/ContentDetail.tsx`

```tsx
import { type ContentItem } from "@/lib/content";
import { moduleMeta } from "@/lib/content";
import { LikeButton } from "@/components/ui/LikeButton";
import CommentSection from "@/features/comment/components/CommentSection";
import SuggestionGrid from "@/features/content/components/SuggestionGrid";
import Link from "next/link";

export default function ContentDetail({ item }: { item: ContentItem }) {
  const meta = moduleMeta[item.module];
  return (
    <article className="mx-auto max-w-3xl px-5 md:px-0 py-10" dir="rtl">
      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
        <Link href={`/${item.module}`} className={`${meta.color} font-bold hover:underline`}>{meta.titleFa}</Link>
        <span>•</span>
        <span>{item.date_fa}</span>
        <span>•</span>
        <span>{item.category}</span>
      </div>

      <h1 className="text-3xl md:text-[2.4rem] font-black leading-[1.35]">{item.title}</h1>
      <p className="text-muted-foreground mt-4 text-[15px] leading-8">{item.excerpt}</p>

      <div className="flex flex-wrap items-center gap-3 mt-6 text-xs">
        <div className="flex items-center gap-2">
          {item.author.avatar && <img src={item.author.avatar} className="w-8 h-8 rounded-full ring-1 ring-border" alt="" />}
          <div>
            <div className="font-semibold text-[13px]">{item.author.name}</div>
            <div className="text-muted-foreground text-[11px]">{item.author.role}</div>
          </div>
        </div>
        <div className="ms-auto flex items-center gap-2 text-muted-foreground">
          <span>👁 {item.views.toLocaleString("fa-IR")}</span>
        </div>
      </div>

      {item.module === "media" ? (
        <div className="mt-8 rounded-[22px] overflow-hidden border border-border shadow-card bg-black">
          <video
            controls
            playsInline
            poster={item.image}
            className="w-full aspect-video object-contain bg-black"
            src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
          />
          <div className="bg-card px-4 py-2 text-[11px] text-muted-foreground flex gap-4">
            <span>👁 {item.views.toLocaleString("fa-IR")} بازدید</span>
            <span>♥ {item.likes.toLocaleString("fa-IR")} پسند</span>
            <span>💬 نظرات فعال</span>
          </div>
        </div>
      ) : item.image && (
        <div className="mt-8 rounded-[22px] overflow-hidden border border-border shadow-card">
          <img src={item.image} alt={item.title} className="w-full object-cover max-h-[420px]" />
        </div>
      )}

      <div className="prose prose-invert max-w-none mt-8 text-[15px] leading-9 text-muted-foreground" dir="rtl">
        <p>{item.content || item.excerpt}</p>
        <p className="mt-4">
          این مطلب به صورت آزمایشی از دیتاسورس JSON تکباکس بارگذاری شده و سیستم لایک، کامنت و پیشنهاد مرتبط فعال است.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mt-8">
        {item.tags.map(t => (
          <Link key={t} href={`/search?q=${encodeURIComponent(t)}`} className="badge hover:bg-muted transition-colors">#{t}</Link>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <LikeButton contentType={item.module} slug={item.slug} initial={item.likes} />
        <button className="btn btn-ghost text-sm">اشتراک‌گذاری</button>
      </div>

      <SuggestionGrid current={item} />
      <CommentSection module={item.module} slug={item.slug} />
    </article>
  );
}

```

---

## `features/content/components/ModuleList.tsx`

```tsx
import { getModuleItems, moduleMeta, type ModuleSlug } from "@/lib/content";
import { ContentCard } from "@/features/content/components/ContentCard";
import Link from "next/link";

export default function ModuleList({ module }: { module: ModuleSlug }) {
  const items = getModuleItems(module);
  const meta = moduleMeta[module];
  return (
    <main className="mx-auto max-w-5xl px-5 py-14" dir="rtl">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className={`text-3xl font-black ${meta.color}`}>{meta.titleFa}</h1>
          <p className="text-sm text-muted-foreground mt-2">{items.length} مطلب • مرتب‌سازی تازه‌ترین</p>
        </div>
        <Link href="/" className="text-xs text-muted-foreground hover:text-foreground">خانه →</Link>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {items.map(i => <ContentCard key={i.slug} item={i} />)}
      </div>
      {items.length === 0 && <p className="text-center text-muted-foreground py-16">محتوایی ثبت نشده</p>}
    </main>
  );
}

```

---

## `features/content/components/SuggestionGrid.tsx`

```tsx
import { getRelated, type ContentItem } from "@/lib/content";
import { ContentCard } from "@/features/content/components/ContentCard";

export default function SuggestionGrid({ current }: { current: ContentItem }) {
  const related = getRelated(current, 6);
  if (!related.length) return null;
  return (
    <section className="mt-16 border-t border-border pt-10">
      <h3 className="text-xl font-extrabold mb-5">پیشنهاد مرتبط از همه ماژول‌ها</h3>
      <p className="text-xs text-muted-foreground mb-4">
        بر اساس برچسب‌ها: {current.tags.map(t=>`#${t}`).join(" ")}
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {related.map(r => (
          <ContentCard key={r.module + r.slug} item={r} />
        ))}
      </div>
    </section>
  );
}

```

---

## `features/download/components/DownloadDetail.tsx`

```tsx
"use client";
import type { ContentItem } from "@/lib/content";
import Link from "next/link";
import { useState, useMemo } from "react";

const fakeVersions = (slug:string) => {
  const base = [
    { ver: "v5.2.4", date: "2026-07-12", dateFa: "21 تیر 1405", size: "842 MB", os: "QTS", notes: "پایدار – پیشنهادی" },
    { ver: "v5.2.3", date: "2026-06-20", dateFa: "30 خرداد 1405", size: "838 MB", os: "QTS", notes: "رفع باگ امنیتی" },
    { ver: "v5.1.9", date: "2026-05-02", dateFa: "12 اردیبهشت 1405", size: "821 MB", os: "QTS", notes: "" },
    { ver: "v24.04", date: "2026-07-07", dateFa: "16 تیر 1405", size: "2.1 GB", os: "Linux", notes: "LTS" },
    { ver: "2022", date: "2026-04-11", dateFa: "22 فروردین 1405", size: "4.7 GB", os: "Windows", notes: "" },
  ];
  // filter a bit by slug tags
  return base;
};

export default function DownloadDetail({ item }: { item: ContentItem }){
  const versions = fakeVersions(item.slug);
  const osOptions = Array.from(new Set(["all", ...versions.map(v=>v.os), ...item.tags.filter(t=>["linux","windows","vmware","qnap","ubuntu"].includes(t.toLowerCase())) ]));
  const [os, setOs] = useState("all");
  const [sort, setSort] = useState<"new"|"old">("new");

  const list = useMemo(()=>{
    let l = versions.filter(v => os==="all" || v.os.toLowerCase()===os.toLowerCase() || item.tags.some(t=>t.toLowerCase()===os.toLowerCase()));
    if(l.length===0) l = versions;
    l = [...l].sort((a,b)=> sort==="new" ? +new Date(b.date) - +new Date(a.date) : +new Date(a.date) - +new Date(b.date));
    return l;
  }, [os, sort, versions, item.tags]);

  return (
    <main className="mx-auto max-w-4xl px-4 py-10" dir="rtl">
      <div className="text-[11px] text-muted-foreground mb-2">
        <Link href="/download" className="hover:text-foreground">دانلود</Link> / <span className="text-pink-400">{item.category}</span>
      </div>
      <h1 className="text-2xl md:text-3xl font-black leading-9">{item.title}</h1>
      <p className="text-muted-foreground mt-3">{item.excerpt}</p>

      <div className="flex flex-wrap gap-2 mt-4">
        {item.tags.map(t=>(
          <Link key={t} href={`/search?q=${encodeURIComponent(t)}`} className="badge hover:bg-pink-500/15 hover:text-pink-300">
            {t.toUpperCase()}
          </Link>
        ))}
      </div>

      {/* OS chooser */}
      <div className="card p-4 mt-8">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="font-bold">انتخاب سیستم‌عامل / نسخه</div>
          <div className="flex gap-2 text-xs">
            <select value={os} onChange={e=>setOs(e.target.value)} className="input !w-auto !py-1.5 text-xs">
              {osOptions.map(o=> <option key={o} value={o}>{o==="all"?"همه OS":o}</option>)}
            </select>
            <select value={sort} onChange={e=>setSort(e.target.value as any)} className="input !w-auto !py-1.5 text-xs">
              <option value="new">جدیدترین اول</option>
              <option value="old">قدیمی‌ترین اول</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-[11px] text-muted-foreground border-b border-border">
              <tr>
                <th className="text-right py-2 pe-2">نسخه</th>
                <th className="text-right py-2">تاریخ</th>
                <th className="text-right py-2 hidden sm:table-cell">OS</th>
                <th className="text-right py-2 hidden sm:table-cell">حجم</th>
                <th className="text-right py-2">یادداشت</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {list.map(v=>(
                <tr key={v.ver+v.date} className="border-b border-border/40 hover:bg-muted/20">
                  <td className="py-3 pe-2 font-mono text-[13px] font-bold">{v.ver}</td>
                  <td className="py-3 text-[12px]">{v.dateFa}</td>
                  <td className="py-3 hidden sm:table-cell"><span className="badge text-[10px]">{v.os}</span></td>
                  <td className="py-3 hidden sm:table-cell text-[12px] text-muted-foreground" dir="ltr">{v.size}</td>
                  <td className="py-3 text-[11px] text-muted-foreground">{v.notes}</td>
                  <td className="py-3 text-left">
                    <a href="#" onClick={e=>{e.preventDefault(); alert(`شروع دانلود ${item.title} – ${v.ver} (${v.os})`);}} className="btn btn-primary text-[11px] px-3 py-1.5">دانلود</a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-[11px] text-muted-foreground mt-3">لینک مستقیم داخل ایران – قابلیت resume – SHA256 در صفحه چک‌سام موجود است.</p>
      </div>

      <div className="card p-4 mt-6 text-[13px] leading-7 text-muted-foreground">
        {item.content}
      </div>
    </main>
  );
}

```

---

## `features/download/components/DownloadTable.tsx`

```tsx
"use client";
import { getModuleItems, moduleMeta } from "@/lib/content";
import Link from "next/link";
import { useMemo, useState } from "react";

export default function DownloadTable(){
  const items = getModuleItems("download");
  const meta = moduleMeta.download;

  const brands = Array.from(new Set(items.flatMap(i=> i.tags.filter(t=>["dell","hp","qnap","ubuntu","mikrotik"].includes(t.toLowerCase())))));
  const types = Array.from(new Set(items.map(i=>i.category).filter(Boolean))) as string[];

  const [q,setQ] = useState("");
  const [brand,setBrand] = useState("all");
  const [type,setType] = useState("all");
  const [os,setOs] = useState("all");

  const filtered = useMemo(()=>{
    return items.filter(f=>{
      if(q && !(`${f.title} ${f.excerpt} ${f.tags.join(" ")}`.toLowerCase().includes(q.toLowerCase()))) return false;
      if(brand!=="all" && !f.tags.map(t=>t.toLowerCase()).includes(brand.toLowerCase())) return false;
      if(type!=="all" && f.category !== type) return false;
      if(os!=="all" && !f.tags.some(t=>t.toLowerCase().includes(os.toLowerCase()))) return false;
      return true;
    });
  }, [items,q,brand,type,os]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-12" dir="rtl">
      <h1 className={`text-3xl font-black mb-2 ${meta.color}`}>مرکز دانلود تکباکس</h1>
      <p className="text-sm text-muted-foreground mb-5">ISO • Firmware • Driver – لینک مستقیم داخل ایران</p>

      {/* filters */}
      <div className="card p-4 mb-6 grid md:grid-cols-4 gap-3 text-sm">
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="جستجو فایل…" className="input md:col-span-1" />
        <select value={brand} onChange={e=>setBrand(e.target.value)} className="input">
          <option value="all">همه برندها</option>
          <option value="dell">DELL</option>
          <option value="hp">HP</option>
          <option value="qnap">QNAP</option>
          <option value="ubuntu">Ubuntu</option>
          <option value="mikrotik">MikroTik</option>
          {brands.filter(b=>!["dell","hp","qnap","ubuntu","mikrotik"].includes(b.toLowerCase())).map(b=><option key={b} value={b}>{b}</option>)}
        </select>
        <select value={type} onChange={e=>setType(e.target.value)} className="input">
          <option value="all">همه نوع‌ها</option>
          {types.map(t=> <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={os} onChange={e=>setOs(e.target.value)} className="input">
          <option value="all">همه OS</option>
          <option value="linux">Linux</option>
          <option value="windows">Windows</option>
          <option value="vmware">VMware</option>
          <option value="qnap">QTS</option>
        </select>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/30 text-[11px] text-muted-foreground">
            <tr>
              <th className="text-right p-3">نام فایل</th>
              <th className="p-3 hidden sm:table-cell text-right">برچسب‌ها</th>
              <th className="p-3 hidden md:table-cell text-right">تاریخ</th>
              <th className="p-3 text-left">دریافت</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(f=>(
              <tr key={f.slug} className="border-t border-border/60 hover:bg-muted/20 align-top">
                <td className="p-3">
                  <Link href={`/download/${f.slug}`} className="font-bold hover:text-pink-400 text-[14px]">{f.title}</Link>
                  <div className="text-[12px] text-muted-foreground mt-1 line-clamp-2">{f.excerpt}</div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {f.tags.slice(0,5).map(t=>(
                      <Link key={t} href={`/search?q=${encodeURIComponent(t)}`} className="text-[10px] px-2 py-0.5 rounded-full bg-muted hover:bg-pink-500/15 hover:text-pink-300 border border-border transition-colors">
                        {t.toUpperCase()}
                      </Link>
                    ))}
                  </div>
                </td>
                <td className="p-3 hidden sm:table-cell text-[11px] text-muted-foreground">{f.category}</td>
                <td className="p-3 hidden md:table-cell text-[11px] text-muted-foreground">{f.date_fa}</td>
                <td className="p-3 text-left align-top">
                  <Link href={`/download/${f.slug}`} className="btn btn-primary text-[11px] whitespace-nowrap">⬇ دریافت</Link>
                  <div className="text-[10px] text-muted-foreground mt-1">{f.likes.toLocaleString("fa-IR")} بار</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length===0 && <div className="p-8 text-center text-muted-foreground text-sm">فایلی یافت نشد – فیلتر را تغییر دهید</div>}
      </div>
    </main>
  );
}

```

---

## `features/forum/components/ForumList.tsx`

```tsx
"use client";
import { getModuleItems, moduleMeta } from "@/lib/content";
import Link from "next/link";
import { useState } from "react";

type ForumPost = ReturnType<typeof getModuleItems>[0] & { answers?: number; solved?: boolean };

export default function ForumList(){
  const items = getModuleItems("forum").map((t,i)=>({
    ...t,
    answers: (t.likes % 9) + 2,
    solved: !t.slug.includes("proxmox"),
    avatar: t.author.avatar || "/assets/hooman.png"
  })) as (ForumPost & {avatar:string})[];
  const meta = moduleMeta.forum;
  const [showNew, setShowNew] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [local, setLocal] = useState<typeof items>([]);

  const all = [...local, ...items];

  const submitTopic = (e: React.FormEvent)=>{
    e.preventDefault();
    if(!title.trim()) return;
    const slug = title.toLowerCase().replace(/[^a-z0-9\u0600-\u06FF]+/g,"-").slice(0,60) + "-" + Date.now().toString(36);
    const nt:any = {
      slug, module:"forum", title: title.trim(),
      excerpt: body.slice(0,140),
      content: body,
      tags: ["پرسش","تکباکس"],
      author:{ name:"شما", role:"عضو", avatar:"/assets/hooman.png" },
      avatar:"/assets/hooman.png",
      date: new Date().toISOString(),
      date_fa: new Intl.DateTimeFormat("fa-IR", {dateStyle:"long"}).format(new Date()),
      likes:0, views:1, category:"پرسش",
      answers:0, solved:false
    };
    setLocal(l=>[nt, ...l]);
    setTitle(""); setBody(""); setShowNew(false);
    // persist draft
    const d = JSON.parse(localStorage.getItem("tb_forum_drafts")||"[]"); d.unshift(nt); localStorage.setItem("tb_forum_drafts", JSON.stringify(d));
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-10" dir="rtl">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
        <div>
          <h1 className={`text-3xl font-black ${meta.color}`}>انجمن تکباکس</h1>
          <p className="text-xs text-muted-foreground mt-1">پرسش و پاسخ تخصصی – سبک Reddit</p>
        </div>
        <div className="flex gap-2">
          <input placeholder="جستجو در انجمن…" className="input w-56 text-sm" />
          <button onClick={()=>setShowNew(true)} className="btn btn-primary text-sm">+ موضوع جدید</button>
        </div>
      </div>

      {/* sub nav like reddit */}
      <div className="flex gap-2 text-[11px] mb-4">
        {["داغ","جدید","برتر","حل‌شده"].map(t=>(
          <button key={t} className="px-3 py-1.5 rounded-full border border-border bg-card hover:bg-muted">{t}</button>
        ))}
      </div>

      <div className="card divide-y divide-border/60 overflow-hidden">
        <div className="hidden sm:grid grid-cols-12 text-[11px] text-muted-foreground px-4 py-2 bg-muted/30">
          <div className="col-span-7">موضوع</div>
          <div className="col-span-1 text-center">رای</div>
          <div className="col-span-2 text-center">پاسخ / بازدید</div>
          <div className="col-span-2 text-left">آخرین فعالیت</div>
        </div>
        {all.map(t=>(
          <div key={t.slug} className="grid grid-cols-12 px-3 sm:px-4 py-3 hover:bg-muted/20 gap-2 items-center">
            {/* vote column – reddit style */}
            <div className="hidden sm:flex col-span-1 flex-col items-center text-muted-foreground text-[11px]">
              <button className="hover:text-orange-400">▲</button>
              <span className="font-bold text-foreground">{t.likes}</span>
              <button className="hover:text-sky-400">▼</button>
            </div>
            {/* main */}
            <div className="col-span-12 sm:col-span-6 flex gap-3">
              <img src={t.avatar} alt={t.author.name} className="w-10 h-10 rounded-full object-cover ring-1 ring-border mt-1 shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <Link href={`/forum/${t.slug}`} className="font-bold text-[14px] leading-6 hover:text-rose-300">{t.title}</Link>
                  {t.solved && <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/20">حل‌شده ✓</span>}
                  {!t.solved && <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">باز</span>}
                </div>
                <div className="text-[11px] text-muted-foreground mt-1">
                  ارسال شده توسط <b className="text-foreground">{t.author.name}</b> • {t.date_fa} • {t.tags.slice(0,2).map(x=>`#${x}`).join(" ")}
                </div>
              </div>
            </div>
            {/* stats */}
            <div className="col-span-6 sm:col-span-2 text-center">
              <div className="text-sm font-bold">{t.answers} <span className="text-[11px] text-muted-foreground font-normal">پاسخ</span></div>
            </div>
            <div className="col-span-6 sm:col-span-2 text-center text-[11px] text-muted-foreground">
              {t.views.toLocaleString("fa-IR")} بازدید
            </div>
            <div className="hidden sm:block col-span-1 text-left text-[11px] text-muted-foreground">
              {t.date_fa.split(" ")[0]}<br/>{t.author.name.split(" ")[0]}
            </div>
          </div>
        ))}
      </div>

      {/* New Topic Modal */}
      {showNew && (
        <div className="fixed inset-0 z-[220] flex items-center justify-center p-4" dir="rtl">
          <div className="absolute inset-0 bg-black/55 backdrop-blur-sm" onClick={()=>setShowNew(false)} />
          <form onSubmit={submitTopic} className="relative card w-full max-w-2xl p-5 space-y-3 z-10">
            <div className="flex justify-between items-center">
              <h3 className="font-black text-lg">موضوع جدید – انجمن تکباکس</h3>
              <button type="button" onClick={()=>setShowNew(false)} className="text-muted-foreground">✕</button>
            </div>
            <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="عنوان واضح بپرسید…" className="input" required />
            <textarea value={body} onChange={e=>setBody(e.target.value)} placeholder="جزئیات مشکل، لاگ‌ها، چیزی که امتحان کردید…" className="input min-h-[160px]" required />
            <div className="text-[11px] text-muted-foreground">با ارسال، با قوانین انجمن موافقت می‌کنید. پیش‌نویس به‌صورت لوکال ذخیره می‌شود – در نسخه Prisma به /api/posts ارسال خواهد شد.</div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={()=>setShowNew(false)} className="btn btn-ghost">انصراف</button>
              <button className="btn btn-primary">ارسال موضوع</button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}

```

---

## `features/home/components/HeroSection.tsx`

```tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const items = [
  { text: "اخبار تکنولوژی رو با تکباکس دنبال کن", href: "/news" },
  { text: "محصولات زیرساختی رو از تکباکس خریداری کن", href: "/shop" },
  { text: "مشکلات فنی رو داخل انجمن تکباکس مطرح کن", href: "/forum" },
  { text: "از ابزارهای زیرساختی تکباکس استفاده کن", href: "/tools" },
  { text: "فایل‌هایی که نیاز داری رو از تکباکس دانلود کن", href: "/download" },
  { text: "نقد و بررسی‌های تکباکس رو دنبال کن", href: "/review" },
  { text: "مقاله‌های تکنولوژی رو از تکباکس دنبال کن", href: "/blog" },
  { text: "ویدیوهای سرگرم‌کننده حوزه تکنولوژی رو از تکباکس دنبال کن", href: "/media" },
];

export default function HeroSection() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIndex((p) => (p + 1) % items.length), 2800);
    return () => clearInterval(t);
  }, []);

  const item = items[index];

  return (
    <section className="flex flex-col items-center pt-10 pb-6 text-center px-4" dir="rtl">
      <h1 className="hero-title">تکباکس</h1>
      <p className="mt-2 text-sm md:text-base text-muted-foreground">پاتوق بچه‌های فناوری اطلاعات</p>
      <div className="mt-5 hero-rotator w-full max-w-2xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={item.text}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.35 }}
            className="hero-item"
          >
            <Link href={item.href} className="hero-rotator-text hover:text-brand transition-colors">
              {item.text}
            </Link>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

```

---

## `features/home/components/HomeModulesSection.tsx`

```tsx
import BentoCard from "@/features/content/components/BentoCard";
import { modules } from "@/config/modules.config";
import { getLatest, moduleMeta, type ModuleSlug } from "@/lib/content";
import { ContentFeedList } from "@/features/content/components/ContentCard";

const feedVariant: Record<ModuleSlug, "image"|"video"|"forum"|"product"|"download"|"review"|"compact"> = {
  blog: "image",
  news: "image",
  media: "video",
  review: "review",
  tools: "compact",
  download: "download",
  shop: "product",
  forum: "forum",
};

export default function HomeModulesSection() {
  const sortedModules = [...modules]
    .filter(m => m.slug !== "tools") // tools moved to sidebar
    .sort((a, b) => a.order - b.order);

  return (
    <section className="px-4 md:px-10 lg:px-20 pb-24">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-end justify-between mb-6 px-1">
          <h2 className="text-2xl font-black">آخرین‌ها از تکباکس</h2>
          <span className="text-xs text-muted-foreground">فید زنده ماژول‌ها</span>
        </div>
        <div className="grid auto-rows-[360px] md:auto-rows-[340px] grid-cols-1 gap-5 md:grid-cols-7">
          {sortedModules.map((module) => {
            const slug = module.slug as ModuleSlug;
            const feed = getLatest(slug, slug==="media" ? 2 : 3);
            const meta = moduleMeta[slug];
            const variant = feedVariant[slug] || "image";
            return (
              <BentoCard
                key={module.slug}
                title={module.title}
                description={module.description}
                href={`/${module.slug}`}
                color={module.color}
                className={`${module.cols ?? ""} ${module.rows ?? ""} !p-4 hover:translate-y-0 hover:shadow-card`} /* disable card hover – inner items hover separately */
                badge={`${feed.length} جدید`}
                footerLink={`/${module.slug}`}
                footerLabel={`همه ${meta.titleFa} →`}
              >
                <div className="[&>*>a:hover]:scale-[1.01] transition-transform">
                  <ContentFeedList items={feed} variant={variant as any} />
                </div>
              </BentoCard>
            );
          })}
        </div>
      </div>
    </section>
  );
}

```

---

## `features/media/components/MediaGallery.tsx`

```tsx
"use client";
import { getModuleItems, moduleMeta } from "@/lib/content";
import Link from "next/link";
import { useState } from "react";

const SAMPLE_VIDEO = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

export default function MediaGallery(){
  const items = getModuleItems("media");
  const meta = moduleMeta.media;
  const [active, setActive] = useState(items[0] || null);

  // naive comments count – pull from seed
  const commentsCount = (slug: string) => slug.includes("qnap") ? 23 : slug.includes("mikrotik") ? 12 : 8;

  return (
    <main className="mx-auto max-w-6xl px-4 py-12" dir="rtl">
      <div className="flex items-end justify-between mb-5">
        <h1 className={`text-3xl font-black ${meta.color}`}>رسانه ویدیویی تکباکس</h1>
        <span className="text-[11px] text-muted-foreground">{items.length} ویدیو</span>
      </div>

      {active && (
        <div className="card overflow-hidden mb-8">
          <div className="relative bg-black aspect-video">
            <video
              key={active.slug}
              controls
              playsInline
              poster={active.image}
              className="w-full h-full object-contain bg-black"
              src={SAMPLE_VIDEO}
            />
          </div>
          <div className="p-4 flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="font-extrabold text-[17px]">{active.title}</div>
              <div className="text-xs text-muted-foreground mt-1">{active.excerpt}</div>
              <div className="flex items-center gap-4 text-[11px] text-muted-foreground mt-3">
                <span>👁 {active.views.toLocaleString("fa-IR")} بازدید</span>
                <span>♥ {active.likes.toLocaleString("fa-IR")} پسند</span>
                <span>💬 {commentsCount(active.slug).toLocaleString("fa-IR")} نظر</span>
                <span>• {active.date_fa}</span>
              </div>
            </div>
            <Link href={`/media/${active.slug}`} className="btn btn-ghost text-xs whitespace-nowrap">صفحه اختصاصی →</Link>
          </div>
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {items.map(v => (
          <button
            key={v.slug}
            onClick={()=>setActive(v)}
            className={`text-right card overflow-hidden text-start transition-all group ${active?.slug===v.slug ? "ring-2 ring-amber-300 shadow-glow" : "hover:-translate-y-1"}`}
          >
            <div className="aspect-video relative bg-black">
              <img src={v.image||""} alt={v.title} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="w-14 h-14 rounded-full bg-black/55 backdrop-blur border border-white/25 flex items-center justify-center text-white text-xl">▶</span>
              </span>
              <span className="absolute bottom-2 left-2 text-[10px] bg-black/70 text-white px-2 py-0.5 rounded">۱۲:۴۴</span>
              <span className="absolute top-2 right-2 badge !text-[10px]">{v.category}</span>
            </div>
            <div className="p-3">
              <div className="font-bold text-[13px] leading-6 line-clamp-2 min-h-[48px]">{v.title}</div>
              <div className="flex items-center justify-between mt-2 text-[11px] text-muted-foreground">
                <span>{v.author.name}</span>
                <span>{v.date_fa}</span>
              </div>
              <div className="flex items-center gap-3 mt-2 text-[11px] text-muted-foreground border-t border-border/50 pt-2">
                <span>👁 {v.views.toLocaleString("fa-IR")}</span>
                <span>♥ {v.likes}</span>
                <span>💬 {commentsCount(v.slug)}</span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </main>
  );
}

```

---

## `features/media/components/VideoPlayer.tsx`

```tsx
"use client";
import { useEffect, useRef, useState } from "react";

export default function VideoPlayer({ src, poster, title }: { src: string; poster?: string; title?: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isHls, setIsHls] = useState(false);

  useEffect(() => {
    let hls: any;
    const video = videoRef.current;
    if (!video || !src) return;
    const isHlsSrc = src.includes(".m3u8");
    setIsHls(isHlsSrc);
    if (isHlsSrc) {
      (async () => {
        const Hls = (await import("hls.js")).default;
        if (Hls.isSupported()) {
          hls = new Hls({ enableWorker: true, lowLatencyMode: true });
          hls.loadSource(src);
          hls.attachMedia(video);
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = src;
        }
      })();
    } else {
      video.src = src;
    }
    return () => { try { hls?.destroy(); } catch {} };
  }, [src]);

  return (
    <div className="w-full bg-black rounded-[20px] overflow-hidden border border-border">
      <video ref={videoRef} controls playsInline poster={poster} preload="metadata" className="w-full aspect-video bg-black" />
      {title && (
        <div className="bg-card px-3 py-2 text-[11px] flex justify-between" style={{color:"var(--muted-foreground)"}}>
          <span className="truncate">{title}</span>
          <span className="text-[10px]">{isHls ? "HLS • تطبیقی" : "MP4"}</span>
        </div>
      )}
    </div>
  );
}

```

---

## `features/news/components/NewsList.tsx`

```tsx
"use client";
import { getModuleItems, moduleMeta } from "@/lib/content";
import Link from "next/link";

export default function NewsList() {
  const items = getModuleItems("news");
  const meta = moduleMeta.news;
  const mainNews = items.slice(0, 4);
  const forceNews = items.slice(4).concat(items.slice(0,2));

  return (
    <main className="mx-auto max-w-7xl px-4 md:px-6 py-12" dir="rtl">
      <div className="flex items-center gap-3 mb-8 flex-wrap">
        <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" style={{boxShadow:"0 0 12px rgba(244,63,94,.45)"}} />
        <h1 className="text-[28px] md:text-[32px] font-black" style={{color:"var(--foreground)"}}>اخبار تکنولوژی</h1>
        <span className="text-[11px] px-2 py-1 rounded-full" style={{background:"rgba(244,63,94,.1)", color:"#fb7185", border:"1px solid rgba(244,63,94,.25)"}}>زنده</span>
        <span className="text-[11px]" style={{color:"var(--muted-foreground)"}}>با منبع و ساعت انتشار</span>
      </div>

      <div className="grid lg:grid-cols-12 gap-7 items-start">
        {/* RIGHT – main news */}
        <section className="lg:col-span-8 order-1 lg:order-2">
          <div className="grid sm:grid-cols-2 gap-5">
            {mainNews.map((n:any, i:number) => (
              <article key={n.slug} className={`card overflow-hidden group hover:shadow-lg transition-all ${i===0 ? "sm:col-span-2" : ""}`} style={{padding:0}}>
                <Link href={`/news/${n.slug}`} className="block relative aspect-[16/9] overflow-hidden" style={{background:"var(--muted)"}}>
                  <img src={n.image || ""} alt={n.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <span className="absolute top-3 right-3 badge" style={{background:"rgba(0,0,0,.55)", color:"#fff", borderColor:"rgba(255,255,255,.2)"}}>{n.category}</span>
                  {n.source && (
                    <span className="absolute top-3 left-3 text-[10px] px-2 py-1 rounded-full bg-sky-500/90 text-white font-bold">📰 {n.source}</span>
                  )}
                </Link>
                <div className="p-4">
                  <div className="text-[11px] flex flex-wrap items-center gap-2" style={{color:"var(--muted-foreground)"}}>
                    <span>🕒 {n.date_fa} {n.time ? `• ${n.time}` : ""}</span>
                    <span>•</span>
                    <span>{n.author?.name || "تحریریه"}</span>
                    {n.source && <><span>•</span><span style={{color:"#7dd3fc"}}>منبع: {n.source}</span></>}
                  </div>
                  <h3 className="font-extrabold text-[16px] md:text-[18px] leading-7 mt-2 hover:text-rose-400 transition-colors">
                    <Link href={`/news/${n.slug}`}>{n.title}</Link>
                  </h3>
                  <p className="text-[13px] leading-6 line-clamp-2 mt-2" style={{color:"var(--muted-foreground)"}}>{n.excerpt}</p>
                  <div className="text-[11px] mt-3 flex gap-3" style={{color:"var(--muted-foreground)"}}>👁 {n.views.toLocaleString("fa-IR")} • ♥ {n.likes}</div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* LEFT – force news */}
        <aside className="lg:col-span-4 order-2 lg:order-1">
          <div className="card p-4 sticky top-20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-black text-[15px]" style={{color:"#fb7185"}}>اخبار فوری</h3>
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
            </div>
            <div className="relative">
              <div className="absolute right-[9px] top-1 bottom-1 w-px" style={{background:"linear-gradient(to bottom, rgba(244,63,94,.6), var(--border), transparent)"}} />
              <ul className="space-y-5">
                {(forceNews.length?forceNews:items).slice(0,8).map((f:any)=>(
                  <li key={f.slug} className="relative pe-7">
                    <span className="absolute right-0 top-[6px] w-[18px] h-[18px] rounded-full flex items-center justify-center" style={{background:"var(--background)", border:"2px solid rgba(244,63,94,.55)"}}>
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                    </span>
                    <div className="text-[10px] flex items-center gap-2 flex-wrap" style={{color:"#fda4af"}}>
                      <span>🕒 {f.date_fa} {f.time||""}</span>
                      {f.source && <span className="px-1.5 py-0.5 rounded text-[9px]" style={{background:"rgba(14,165,233,.12)", color:"#7dd3fc"}}>{f.source}</span>}
                    </div>
                    <Link href={`/news/${f.slug}`} className="text-[13px] font-bold leading-6 hover:text-rose-400 block mt-1">{f.title}</Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}

```

---

## `features/news/components/NewsTicker.tsx`

```tsx
import Link from "next/link";

type NewsItem = {
  slug: string;
  title: string;
};

type NewsTickerProps = {
  items: NewsItem[];
  className?: string;
};

export default function NewsTicker({ items, className = "" }: NewsTickerProps) {
  if (!items?.length) return null;

  return (
    <section className={`w-full overflow-hidden ${className}`} aria-label="اخبار">
      <div
        dir="rtl"
        className="ticker-wrapper relative w-full overflow-hidden"
      >
        <div className="ticker-track flex w-max items-center gap-10 py-2">
          {[...items, ...items].map((item, index) => (
            <Link
              key={`${item.slug}-${index}`}
              href={`/news/${item.slug}`}
              className="ticker-item flex shrink-0 items-center gap-2 whitespace-nowrap text-sm text-muted-foreground transition-colors hover:text-brand"
            >
              <span className="text-[10px] leading-none text-brand/60">●</span>
              <span>{item.title}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

```

---

## `features/review/components/ReviewGrid.tsx`

```tsx
"use client";
import { getModuleItems, moduleMeta } from "@/lib/content";
import Link from "next/link";

function stars(n=4.5){ const f=Math.floor(n); return "★".repeat(f)+"☆".repeat(5-f); }

export default function ReviewGrid(){
  const items=getModuleItems("review");
  const meta=moduleMeta.review;
  return (
    <main className="mx-auto max-w-6xl px-4 py-12" dir="rtl">
      <div className="flex items-end justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className={`text-3xl font-black ${meta.color}`}>نقد و بررسی تخصصی</h1>
          <p className="text-sm text-muted-foreground mt-1">تست لَب • بنچمارک واقعی • عکس مربعی</p>
        </div>
        <div className="text-[11px] text-muted-foreground">{items.length} بررسی</div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {items.map((r,i)=>{
          const rating = 4.6 - (i*0.15);
          const comments = 18 + i*7;
          return (
          <article key={r.slug} className="card overflow-hidden group flex flex-col">
            <Link href={`/review/${r.slug}`} className="block relative aspect-square bg-muted overflow-hidden">
              <img src={r.image||""} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={r.title}/>
              <span className="absolute top-3 right-3 badge !bg-black/55 !text-white backdrop-blur border-white/20">{r.category}</span>
              <span className="absolute bottom-3 left-3 text-[11px] bg-black/60 text-amber-300 px-2 py-1 rounded-full backdrop-blur">{stars(rating)} {rating.toFixed(1)}</span>
            </Link>
            <div className="p-4 flex flex-col flex-1">
              <h3 className="font-extrabold text-[15px] leading-7 line-clamp-2 min-h-[56px]">
                <Link href={`/review/${r.slug}`} className="hover:text-sky-400">{r.title}</Link>
              </h3>
              <p className="text-xs text-muted-foreground line-clamp-2 mt-2 flex-1">{r.excerpt}</p>

              {/* author row with avatar */}
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/60">
                <div className="flex items-center gap-2">
                  <img src={r.author.avatar || "/assets/hooman.png"} className="w-8 h-8 rounded-full object-cover ring-1 ring-border" alt={r.author.name} />
                  <div>
                    <div className="text-[12px] font-bold leading-tight">{r.author.name}</div>
                    <div className="text-[10px] text-muted-foreground">{r.author.role || "نویسنده"}</div>
                  </div>
                </div>
                <div className="text-[10px] text-muted-foreground text-left leading-4">
                  <div>👁 {r.views.toLocaleString("fa-IR")}</div>
                  <div>♥ {r.likes} • 💬 {comments}</div>
                </div>
              </div>
            </div>
          </article>
        )})}
      </div>
    </main>
  );
}

```

---

## `features/shop/components/ShopGrid.tsx`

```tsx
"use client";
import { getModuleItems, moduleMeta } from "@/lib/content";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useCart } from "@/providers/cart.provider";

const prices: Record<string, {price: string, old?: string}> = {
  "qnap-ts-2277": { price: "۴۸,۹۰۰,۰۰۰", old: "۵۲,۰۰۰,۰۰۰" },
  "dell-r750": { price: "۲۹۵,۰۰۰,۰۰۰" }
};

export default function ShopGrid(){
  const items = getModuleItems("shop");
  const meta = moduleMeta.shop;
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("all");
  const [sort, setSort] = useState<"new"|"popular"|"cheap">("new");
  const { add } = useCart();

  const categories = Array.from(new Set(items.map(i=>i.category).filter(Boolean))) as string[];

  const filtered = useMemo(()=>{
    let list = [...items];
    if(q) { const s=q.toLowerCase(); list = list.filter(i=> i.title.toLowerCase().includes(s) || i.tags.some(t=>t.includes(s))); }
    if(cat !== "all") list = list.filter(i=>i.category===cat);
    if(sort==="popular") list.sort((a,b)=>b.views-a.views);
    if(sort==="cheap") list.sort((a,b)=>a.likes-b.likes); // mock price sort
    return list;
  }, [items, q, cat, sort]);

  return (
    <main className="mx-auto max-w-7xl px-4 md:px-6 py-12" dir="rtl">
      <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
        <div>
          <h1 className={`text-3xl font-black ${meta.color}`}>فروشگاه زیرساخت</h1>
          <p className="text-xs text-muted-foreground mt-1">ارسال سریع • گارانتی اصالت • {filtered.length} کالا</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="جستجوی محصول…" className="input w-48 text-sm" />
          <select value={cat} onChange={e=>setCat(e.target.value)} className="input w-36 text-sm">
            <option value="all">همه دسته‌ها</option>
            {categories.map(c=> <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={sort} onChange={e=>setSort(e.target.value as any)} className="input w-36 text-sm">
            <option value="new">جدیدترین</option>
            <option value="popular">پربازدیدترین</option>
            <option value="cheap">قیمت</option>
          </select>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filtered.map(p=>{
          const pr = prices[p.slug] || { price: "تماس بگیرید" };
          return (
            <div key={p.slug} className="card overflow-hidden group flex flex-col rounded-[24px]">
              <Link href={`/shop/${p.slug}`} className="block relative aspect-[4/3] bg-muted overflow-hidden">
                <img src={p.image||""} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <span className="absolute top-3 left-3 text-[10px] px-2 py-1 rounded-full bg-lime-500/15 text-lime-300 border border-lime-500/20">موجود</span>
                {pr.old && <span className="absolute top-3 right-3 text-[10px] bg-rose-500 text-white px-2 py-1 rounded-full">تخفیف</span>}
              </Link>
              <div className="p-4 flex-1 flex flex-col">
                <div className="text-[11px] text-muted-foreground">{p.category}</div>
                <Link href={`/shop/${p.slug}`} className="font-extrabold text-[14px] leading-6 mt-1 hover:text-lime-400 line-clamp-2 min-h-[48px]">{p.title}</Link>
                <p className="text-[12px] text-muted-foreground line-clamp-2 mt-1 flex-1">{p.excerpt}</p>
                <div className="mt-3">
                  {pr.old && <div className="text-[11px] line-through text-muted-foreground">{pr.old} تومان</div>}
                  <div className="text-[18px] font-black text-lime-400">{pr.price} <span className="text-[11px] text-muted-foreground font-normal">تومان</span></div>
                </div>
                <div className="flex gap-2 mt-3">
                  <button onClick={()=>add({ slug: p.slug, title: p.title, price: pr.price, image: p.image || "" },1)} className="btn btn-primary flex-1 text-xs">افزودن به سبد</button>
                  <Link href={`/shop/${p.slug}`} className="btn btn-ghost text-xs px-3">جزئیات</Link>
                </div>
                <div className="text-[10px] text-muted-foreground mt-2">👁 {p.views.toLocaleString("fa-IR")} • ♥ {p.likes}</div>
              </div>
            </div>
          )
        })}
      </div>
      {filtered.length===0 && <div className="text-center py-16 text-muted-foreground">محصولی یافت نشد</div>}
    </main>
  );
}

```

---

## `features/shop/hooks/useCart.tsx`

```tsx
"use client";
import React, { createContext, useContext, useEffect, useState } from "react";

export type CartItem = { slug: string; title: string; price: string; image?: string; qty: number };
type CartCtx = {
  items: CartItem[];
  count: number;
  add: (item: Omit<CartItem,"qty">, qty?: number) => void;
  remove: (slug: string) => void;
  clear: () => void;
  setQty: (slug: string, qty: number) => void;
  open: boolean;
  setOpen: (v:boolean)=>void;
};

const Ctx = createContext<CartCtx | null>(null);
const KEY = "tb_cart_v2";

export function CartProvider({ children }: { children: React.ReactNode }){
  const [items, setItems] = useState<CartItem[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(()=>{
    try{ const raw = localStorage.getItem(KEY); if(raw) setItems(JSON.parse(raw)); }catch{}
  },[]);
  useEffect(()=>{
    localStorage.setItem(KEY, JSON.stringify(items));
  },[items]);

  const add = (item: Omit<CartItem,"qty">, qty = 1)=>{
    setItems(prev=>{
      const f = prev.find(p=>p.slug===item.slug);
      if(f) return prev.map(p=> p.slug===item.slug ? {...p, qty: p.qty+qty} : p);
      return [...prev, {...item, qty}];
    });
    setOpen(true);
  };
  const remove = (slug:string)=> setItems(prev=>prev.filter(p=>p.slug!==slug));
  const clear = ()=> setItems([]);
  const setQty = (slug:string, qty:number)=> setItems(prev=> prev.map(p=> p.slug===slug ? {...p, qty: Math.max(1,qty)}:p));
  const count = items.reduce((s,i)=>s+i.qty,0);

  return <Ctx.Provider value={{items, count, add, remove, clear, setQty, open, setOpen}}>{children}
    <CartDrawer />
  </Ctx.Provider>;
}

function CartDrawer(){
  const ctx = useContext(Ctx);
  if(!ctx || !ctx.open) return null;
  const { items, setOpen, remove, setQty, clear, count } = ctx;
  return (
    <div dir="rtl" className="fixed inset-0 z-[200]">
      <div className="absolute inset-0 bg-black/45" onClick={()=>setOpen(false)} />
      <aside className="absolute left-0 top-0 h-full w-[380px] max-w-[92vw] bg-card border-r border-border shadow-2xl p-4 flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-black text-lg">سبد خرید ({count.toLocaleString("fa-IR")})</h3>
          <button onClick={()=>setOpen(false)} className="text-muted-foreground hover:text-foreground">✕</button>
        </div>
        <div className="flex-1 overflow-y-auto space-y-3">
          {items.length===0 && <p className="text-sm text-muted-foreground text-center py-10">سبد خالی است</p>}
          {items.map(it=>(
            <div key={it.slug} className="flex gap-3 border border-border rounded-xl p-2">
              <img src={it.image} alt="" className="w-16 h-16 object-cover rounded-lg bg-muted" />
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-bold leading-5 line-clamp-2">{it.title}</div>
                <div className="text-[11px] text-lime-400 mt-1">{it.price} تومان</div>
                <div className="flex items-center gap-2 mt-2">
                  <button onClick={()=>setQty(it.slug, it.qty-1)} className="w-6 h-6 rounded border border-border text-xs">−</button>
                  <span className="text-xs w-6 text-center">{it.qty.toLocaleString("fa-IR")}</span>
                  <button onClick={()=>setQty(it.slug, it.qty+1)} className="w-6 h-6 rounded border border-border text-xs">+</button>
                  <button onClick={()=>remove(it.slug)} className="ms-auto text-[11px] text-rose-400 hover:underline">حذف</button>
                </div>
              </div>
            </div>
          ))}
        </div>
        {items.length>0 && (
          <div className="border-t border-border pt-3 space-y-2">
            <button className="btn btn-primary w-full">ادامه خرید / تسویه</button>
            <button onClick={clear} className="btn btn-ghost w-full text-xs">خالی کردن سبد</button>
          </div>
        )}
      </aside>
    </div>
  );
}

export function useCart(){
  const c = useContext(Ctx);
  if(!c) throw new Error("CartProvider missing – wrap LayoutShell with <CartProvider>");
  return c;
}

export function CartIconButton(){
  const { count, setOpen } = useCart();
  return (
    <button onClick={()=>setOpen(true)} className="relative inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
      <span>🛒</span>
      <span className="hidden sm:inline">سبد</span>
      {count>0 && <span className="absolute -top-1 -left-1 bg-lime-500 text-black text-[10px] min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1 font-bold">{count.toLocaleString("fa-IR")}</span>}
    </button>
  );
}

```

---

## `features/tools/components/RaidCalculator.tsx`

```tsx
"use client";
import { useMemo, useState } from "react";

type RaidLevel = "0"|"1"|"5"|"6"|"10";

const overhead: Record<RaidLevel, (n:number)=>{usable:number; fault:number}> = {
  "0": n => ({usable: n, fault: 0}),
  "1": n => ({usable: Math.floor(n/2), fault: 1}),
  "5": n => ({usable: Math.max(0, n-1), fault: 1}),
  "6": n => ({usable: Math.max(0, n-2), fault: 2}),
  "10": n => ({usable: Math.floor(n/2), fault: Math.floor(n/2)}),
};

export default function RaidCalculator(){
  const [disks, setDisks] = useState(4);
  const [size, setSize] = useState(4000); // GB
  const [level, setLevel] = useState<RaidLevel>("5");

  const calc = useMemo(()=>{
    const o = overhead[level](disks);
    const raw = disks * size;
    const usable = o.usable * size;
    const eff = raw ? Math.round(usable / raw * 100) : 0;
    return { ...o, raw, usable, eff };
  }, [disks, size, level]);

  return (
    <div className="card p-5 space-y-4" dir="rtl">
      <div className="flex items-center justify-between">
        <h3 className="font-extrabold text-lg text-cyan-300">RAID Calculator</h3>
        <span className="text-[11px] text-muted-foreground">تکباکس – ابزار زیرساخت</span>
      </div>

      <div className="grid sm:grid-cols-3 gap-3 text-sm">
        <label className="space-y-1">
          <span className="text-[11px] text-muted-foreground">تعداد دیسک</span>
          <input type="number" min={2} max={24} value={disks} onChange={e=>setDisks(Math.max(2, parseInt(e.target.value)||2))} className="input" />
        </label>
        <label className="space-y-1">
          <span className="text-[11px] text-muted-foreground">ظرفیت هر دیسک (GB)</span>
          <input type="number" min={100} step={100} value={size} onChange={e=>setSize(parseInt(e.target.value)||0)} className="input" />
        </label>
        <label className="space-y-1">
          <span className="text-[11px] text-muted-foreground">سطح RAID</span>
          <select value={level} onChange={e=>setLevel(e.target.value as RaidLevel)} className="input">
            <option value="0">RAID 0</option>
            <option value="1">RAID 1</option>
            <option value="5">RAID 5</option>
            <option value="6">RAID 6</option>
            <option value="10">RAID 10</option>
          </select>
        </label>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
        {[
          ["ظرفیت خام", `${calc.raw.toLocaleString("fa-IR")} GB`],
          ["قابل استفاده", `${calc.usable.toLocaleString("fa-IR")} GB`],
          ["تحمل خطا", `${calc.fault.toLocaleString("fa-IR")} دیسک`],
          ["راندمان", `${calc.eff.toLocaleString("fa-IR")}%`],
        ].map(([k,v])=>(
          <div key={k as string} className="rounded-xl border border-border bg-surface-1/60 p-3">
            <div className="text-[11px] text-muted-foreground">{k}</div>
            <div className="font-black text-cyan-300 mt-1">{v}</div>
          </div>
        ))}
      </div>

      <p className="text-[11px] text-muted-foreground leading-6">
        محاسبه تئوریک – برای RAID5 حداقل ۳ دیسک، RAID6 حداقل ۴ دیسک، RAID10 زوج. مناسب سرورهای HPE / Dell که در بلاگ تکباکس بررسی کردیم.
      </p>
    </div>
  );
}

```

---

## `features/tools/components/SubnetCalculator.tsx`

```tsx
"use client";
import { useMemo, useState } from "react";

function ipToInt(ip:string){ return ip.split(".").reduce((a,o)=> (a<<8)+parseInt(o||"0"),0)>>>0; }
function intToIp(n:number){ return [24,16,8,0].map(s=>(n>>>s)&255).join("."); }

export default function SubnetCalculator(){
  const [ip, setIp] = useState("192.168.1.0");
  const [cidr, setCidr] = useState(24);

  const out = useMemo(()=>{
    try{
      const mask = ~((1 << (32-cidr)) -1) >>>0;
      const net = ipToInt(ip) & mask;
      const broadcast = net | (~mask >>>0);
      const hosts = Math.max(0, (1 << (32-cidr)) -2);
      return {
        network: intToIp(net),
        broadcast: intToIp(broadcast),
        mask: intToIp(mask),
        first: intToIp(net+1),
        last: intToIp(broadcast-1),
        hosts
      };
    }catch{ return null; }
  },[ip,cidr]);

  return (
    <div className="card p-5 space-y-4" dir="rtl">
      <h3 className="font-extrabold text-lg text-cyan-300">ماشین‌حساب ساب‌نت</h3>
      <div className="grid sm:grid-cols-2 gap-3">
        <label className="text-sm space-y-1">
          <span className="text-[11px] text-muted-foreground">IP</span>
          <input value={ip} onChange={e=>setIp(e.target.value)} className="input font-mono text-left" dir="ltr" />
        </label>
        <label className="text-sm space-y-1">
          <span className="text-[11px] text-muted-foreground">CIDR /{cidr}</span>
          <input type="range" min={8} max={30} value={cidr} onChange={e=>setCidr(parseInt(e.target.value))} className="w-full" />
        </label>
      </div>
      {out && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-[12px] font-mono" dir="ltr">
          {Object.entries({
            Network: out.network,
            Broadcast: out.broadcast,
            Mask: out.mask,
            "First Host": out.first,
            "Last Host": out.last,
            "Usable Hosts": out.hosts.toString()
          }).map(([k,v])=>(
            <div key={k} className="rounded-lg bg-surface-1 px-3 py-2">
              <div className="text-[10px] text-muted-foreground font-sans" dir="rtl">{k}</div>
              <div>{v}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

```

---

## `features/tools/components/ToolsGrid.tsx`

```tsx
"use client";
import { getModuleItems, moduleMeta } from "@/lib/content";
import { useState } from "react";
import RaidCalculator from "@/features/tools/components/RaidCalculator";
import SubnetCalculator from "@/features/tools/components/SubnetCalculator";

const toolComponents: Record<string, React.ComponentType> = {
  "raid-calculator": RaidCalculator,
  "subnet-calculator": SubnetCalculator,
};

export default function ToolsGrid(){
  const items = getModuleItems("tools");
  const meta = moduleMeta.tools;
  const [active, setActive] = useState(items[0]?.slug || "raid-calculator");
  const ActiveComp = toolComponents[active] || RaidCalculator;

  return (
    <main className="mx-auto max-w-6xl px-4 py-12" dir="rtl">
      <h1 className={`text-3xl font-black mb-2 ${meta.color}`}>ابزارهای زیرساختی</h1>
      <p className="text-sm text-muted-foreground mb-6">اجرای مستقیم در مرورگر – بدون نصب</p>

      <div className="flex flex-wrap gap-2 mb-6">
        {items.map(t => (
          <button
            key={t.slug}
            onClick={()=>setActive(t.slug)}
            className={`btn text-xs ${active===t.slug ? "btn-primary" : "btn-ghost"}`}
          >
            {t.title}
          </button>
        ))}
        {/* quick extra tools */}
        <button onClick={()=>setActive("subnet-calculator")} className={`btn text-xs ${active==="subnet-calculator" ? "btn-primary":"btn-ghost"}`}>Subnet Calculator</button>
      </div>

      <ActiveComp />

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
        {items.map(t=>(
          <div key={t.slug} className="card p-4">
            <div className="text-[11px] text-cyan-300">{t.category}</div>
            <div className="font-bold mt-1 text-[14px]">{t.title}</div>
            <div className="text-xs text-muted-foreground mt-2">{t.excerpt}</div>
            <div className="text-[10px] text-muted-foreground mt-3">استفاده: {t.views.toLocaleString("fa-IR")} بار</div>
          </div>
        ))}
      </div>
    </main>
  );
}

```

---

## `hooks/useFabTop.ts`

```ts
"use client";
import { useSyncExternalStore } from "react";
const STORAGE_KEY = "sidebar-mobile-fab-top";
const BTN_SIZE = 72;
const SAFE_MARGIN = 16;
function clampTopByHeight(top: number, btnH: number){
  if(typeof window==="undefined") return top;
  const minTop = SAFE_MARGIN;
  const maxTop = window.innerHeight - btnH - SAFE_MARGIN;
  if (maxTop <= minTop) return (window.innerHeight - btnH) / 2;
  return Math.min(Math.max(minTop, top), maxTop);
}
function getClientFabTop(){ 
  if(typeof window==="undefined") return SAFE_MARGIN;
  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (saved !== null) { const parsed = Number(saved); if (!Number.isNaN(parsed)) return clampTopByHeight(parsed, BTN_SIZE); }
  return clampTopByHeight((window.innerHeight - BTN_SIZE) / 2, BTN_SIZE);
}
function getServerFabTop(){ return SAFE_MARGIN; }
function subscribe(cb: ()=>void){
  if(typeof window==="undefined") return ()=>{};
  const onResize = ()=>cb();
  const onStorage = (e:StorageEvent)=>{ if(e.key===STORAGE_KEY) cb(); };
  window.addEventListener("resize", onResize);
  window.addEventListener("storage", onStorage);
  return ()=>{ window.removeEventListener("resize", onResize); window.removeEventListener("storage", onStorage); };
}
export function useFabTop(){ return useSyncExternalStore(subscribe, getClientFabTop, getServerFabTop); }
export function saveFabTop(top:number){ if(typeof window!=="undefined") window.localStorage.setItem(STORAGE_KEY, String(top)); }

```

---

## `lib/auth-server.ts`

```ts
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { prisma } from "./db";
import bcrypt from "bcryptjs";

const secret = new TextEncoder().encode(process.env.AUTH_SECRET || "dev-secret-please-change-32char!");
const COOKIE = "tb_session";

export async function hashPassword(p: string){ return bcrypt.hash(p, 10); }
export async function verifyPassword(p: string, hash: string){ return bcrypt.compare(p, hash); }

export async function createSession(userId: string){
  return await new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret);
}

export async function getSessionUser(){
  const c = await cookies();
  const token = c.get(COOKIE)?.value;
  if(!token) return null;
  try{
    const { payload } = await jwtVerify(token, secret);
    const user = await prisma.user.findUnique({ where: { id: String(payload.sub) }});
    return user;
  }catch{ return null; }
}

export async function setSessionCookie(token: string){
  const c = await cookies();
  c.set(COOKIE, token, { httpOnly: true, sameSite: "lax", secure: false, path: "/", maxAge: 60*60*24*30 });
}
export async function clearSession(){
  const c = await cookies();
  c.delete(COOKIE);
}

export function canEditModule(user: {role:string, modules:string}|null, module: string){
  if(!user) return false;
  if(user.role === "super_admin") return true;
  try{
    const mods: string[] = JSON.parse(user.modules || "[]");
    return mods.includes(module);
  }catch{ return false; }
}

```

---

## `lib/auth.ts`

```ts
"use client";

import users from "@/data/users.json";

export type AppUser = {
  id: string;
  name: string;
  email: string;
  username: string;
  role: "super_admin" | "editor";
  modules: string[];
  avatar?: string;
};

const KEY = "tb_auth_user";

export function login(username: string): AppUser | null {
  const u = (users as AppUser[]).find(x => x.username === username.toLowerCase());
  if (u && typeof window !== "undefined") {
    localStorage.setItem(KEY, JSON.stringify(u));
    window.dispatchEvent(new StorageEvent("storage", { key: KEY }));
    return u;
  }
  return null;
}

export function logout() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(KEY);
    window.dispatchEvent(new StorageEvent("storage", { key: KEY }));
  }
}

export function getCurrentUserClient(): AppUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(KEY);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

export function canEdit(user: AppUser | null, module: string) {
  if (!user) return false;
  if (user.role === "super_admin") return true;
  return user.modules.includes(module);
}

export const allUsers = users as AppUser[];

```

---

## `lib/content.ts`

```ts
export type ModuleSlug =
  | "blog"
  | "news"
  | "media"
  | "review"
  | "tools"
  | "download"
  | "shop"
  | "forum";

export type ContentItem = {
  slug: string;
  module: ModuleSlug;
  title: string;
  excerpt: string;
  content?: string;
  image?: string;
  tags: string[];
  author: { name: string; role?: string; avatar?: string };
  date: string; // ISO
  date_fa: string;
  time?: string;
  source?: string;
  likes: number;
  views: number;
  category?: string;
};

import blogData from "@/data/blog.json";
import newsData from "@/data/news.json";
import mediaData from "@/data/media.json";
import reviewData from "@/data/review.json";
import toolsData from "@/data/tools.json";
import downloadData from "@/data/download.json";
import shopData from "@/data/shop.json";
import forumData from "@/data/forum.json";

const all: Record<ModuleSlug, ContentItem[]> = {
  blog: blogData as ContentItem[],
  news: newsData as ContentItem[],
  media: mediaData as ContentItem[],
  review: reviewData as ContentItem[],
  tools: toolsData as ContentItem[],
  download: downloadData as ContentItem[],
  shop: shopData as ContentItem[],
  forum: forumData as ContentItem[],
};

export function getModuleItems(module: ModuleSlug): ContentItem[] {
  return [...(all[module] || [])].sort((a, b) => +new Date(b.date) - +new Date(a.date));
}

export function getLatest(module: ModuleSlug, n = 3) {
  return getModuleItems(module).slice(0, n);
}

export function getBySlug(module: ModuleSlug, slug: string) {
  return getModuleItems(module).find(i => i.slug === slug) || null;
}

export function getAllAcross(): ContentItem[] {
  return (Object.keys(all) as ModuleSlug[])
    .flatMap(m => getModuleItems(m))
    .sort((a, b) => +new Date(b.date) - +new Date(a.date));
}

export function getRelated(current: ContentItem, limit = 6): ContentItem[] {
  const tagSet = new Set(current.tags);
  const pool = getAllAcross().filter(
    c => c.slug !== current.slug && c.tags.some(t => tagSet.has(t))
  );
  // fallback: same category / module
  if (pool.length < limit) {
    const extra = getAllAcross().filter(
      c => c.slug !== current.slug && !pool.includes(c) && (c.category === current.category || c.module !== current.module)
    );
    pool.push(...extra);
  }
  // score
  return pool
    .map(c => ({
      c,
      score: c.tags.filter(t => tagSet.has(t)).length * 3 +
        (c.category === current.category ? 1 : 0) +
        (c.module !== current.module ? 0.5 : 0)
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(x => x.c);
}

export function searchAcross(q: string) {
  const s = q.trim().toLowerCase();
  if (!s) return [];
  return getAllAcross().filter(
    c =>
      c.title.toLowerCase().includes(s) ||
      c.excerpt.toLowerCase().includes(s) ||
      c.tags.some(t => t.toLowerCase().includes(s))
  );
}

export const moduleMeta: Record<ModuleSlug, { title: string; titleFa: string; color: string; href: string }> = {
  blog: { title: "blog", titleFa: "مجله", color: "text-orange-400", href: "/blog" },
  news: { title: "news", titleFa: "اخبار", color: "text-rose-500", href: "/news" },
  media: { title: "media", titleFa: "رسانه", color: "text-amber-300", href: "/media" },
  review: { title: "review", titleFa: "نقد و بررسی", color: "text-sky-500", href: "/review" },
  tools: { title: "tools", titleFa: "ابزارها", color: "text-cyan-300", href: "/tools" },
  download: { title: "download", titleFa: "دانلود", color: "text-pink-400", href: "/download" },
  shop: { title: "shop", titleFa: "فروشگاه", color: "text-lime-400", href: "/shop" },
  forum: { title: "forum", titleFa: "انجمن", color: "text-rose-300", href: "/forum" },
};

```

---

## `lib/db.ts`

```ts
import { PrismaClient } from "@prisma/client";
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
export const prisma = globalForPrisma.prisma ?? new PrismaClient({ log: ["warn","error"] });
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

```

---

## `lib/fonts.ts`

```ts
import localFont from "next/font/local";

export const kalameh = localFont({
  src: [
    { path: "../public/fonts/KalamehWebFaNum-Thin.woff2", weight: "100", style: "normal" },
    { path: "../public/fonts/KalamehWebFaNum-ExtraLight.woff2", weight: "200", style: "normal" },
    { path: "../public/fonts/KalamehWebFaNum-Light.woff2", weight: "300", style: "normal" },
    { path: "../public/fonts/KalamehWebFaNum-Regular.woff2", weight: "400", style: "normal" },
    { path: "../public/fonts/KalamehWebFaNum-Medium.woff2", weight: "500", style: "normal" },
    { path: "../public/fonts/KalamehWebFaNum-SemiBold.woff2", weight: "600", style: "normal" },
    { path: "../public/fonts/KalamehWebFaNum-Bold.woff2", weight: "700", style: "normal" },
    { path: "../public/fonts/KalamehWebFaNum-ExtraBold.woff2", weight: "800", style: "normal" },
    { path: "../public/fonts/KalamehWebFaNum-Black.woff2", weight: "900", style: "normal" },
  ],
  variable: "--font-kalameh",
  display: "swap",
  fallback: ["Vazirmatn", "system-ui", "Tahoma", "sans-serif"],
  adjustFontFallback: false,
});

```

---

## `lib/modules.ts`

```ts
// @deprecated – use @/config/modules.config
export * from "@/config/modules.config";

```

---

## `lib/utils.ts`

```ts
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

```

---

## `prisma/seed.ts`

```ts
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import blog from "../data/blog.json";
import news from "../data/news.json";
import media from "../data/media.json";
import review from "../data/review.json";
import tools from "../data/tools.json";
import download from "../data/download.json";
import shop from "../data/shop.json";
import forum from "../data/forum.json";
import users from "../data/users.json";
import comments from "../data/comments.json";

const prisma = new PrismaClient();

async function main(){
  console.log("Seeding TechBox…");
  await prisma.commentVote.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.like.deleteMany();
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();

  const pw = await bcrypt.hash("techbox123", 10);
  for(const u of users as any[]){
    await prisma.user.create({
      data: {
        id: u.id,
        name: u.name,
        username: u.username,
        email: u.email,
        role: u.role === "super_admin" ? "super_admin" : "editor",
        modules: JSON.stringify(u.modules),
        avatar: u.avatar || null,
        password: pw
      }
    });
  }

  const allPosts = [
    ...blog, ...news, ...media, ...review, ...tools, ...download, ...shop, ...forum
  ];

  for(const p of allPosts as any[]){
    await prisma.post.create({
      data: {
        slug: p.slug,
        module: p.module,
        title: p.title,
        excerpt: p.excerpt,
        content: p.content || p.excerpt,
        image: p.image || null,
        tags: JSON.stringify(p.tags || []),
        category: p.category || null,
        authorName: p.author?.name || "تحریریه",
        date: new Date(p.date),
        dateFa: p.date_fa,
        likes: p.likes || 0,
        views: p.views || 0,
        published: true
      }
    });
  }

  // seed comments – map content_type+slug to postId
  for(const c of comments as any[]){
    const post = await prisma.post.findFirst({
      where: { module: c.content_type as any, slug: c.content_slug }
    });
    if(!post) continue;
    await prisma.comment.create({
      data: {
        postId: post.id,
        authorName: c.author,
        text: c.text,
        likes: c.likes || 0,
        dislikes: c.dislikes || 0,
        createdAt: new Date(c.date)
      }
    });
  }

  console.log("Seed done");
}
main().finally(()=>prisma.$disconnect());

```

---

## `providers/auth.provider.tsx`

```tsx
"use client";
import * as React from "react";
export const AuthContext = React.createContext<any>(null);
export function AuthProvider({children}:{children:React.ReactNode}){ return <AuthContext.Provider value={null}>{children}</AuthContext.Provider> }
export default AuthProvider;

```

---

## `providers/cart.provider.tsx`

```tsx
"use client";
import React, { createContext, useContext, useEffect, useState } from "react";

export type CartItem = { slug: string; title: string; price: string; image?: string; qty: number };
type CartCtx = {
  items: CartItem[];
  count: number;
  add: (item: Omit<CartItem,"qty">, qty?: number) => void;
  remove: (slug: string) => void;
  clear: () => void;
  setQty: (slug: string, qty: number) => void;
  open: boolean;
  setOpen: (v:boolean)=>void;
};

const Ctx = createContext<CartCtx | null>(null);
const KEY = "tb_cart_v2";

export function CartProvider({ children }: { children: React.ReactNode }){
  const [items, setItems] = useState<CartItem[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(()=>{
    try{ const raw = localStorage.getItem(KEY); if(raw) setItems(JSON.parse(raw)); }catch{}
  },[]);
  useEffect(()=>{
    localStorage.setItem(KEY, JSON.stringify(items));
  },[items]);

  const add = (item: Omit<CartItem,"qty">, qty = 1)=>{
    setItems(prev=>{
      const f = prev.find(p=>p.slug===item.slug);
      if(f) return prev.map(p=> p.slug===item.slug ? {...p, qty: p.qty+qty} : p);
      return [...prev, {...item, qty}];
    });
    setOpen(true);
  };
  const remove = (slug:string)=> setItems(prev=>prev.filter(p=>p.slug!==slug));
  const clear = ()=> setItems([]);
  const setQty = (slug:string, qty:number)=> setItems(prev=> prev.map(p=> p.slug===slug ? {...p, qty: Math.max(1,qty)}:p));
  const count = items.reduce((s,i)=>s+i.qty,0);

  return <Ctx.Provider value={{items, count, add, remove, clear, setQty, open, setOpen}}>{children}
    <CartDrawer />
  </Ctx.Provider>;
}

function CartDrawer(){
  const ctx = useContext(Ctx);
  if(!ctx || !ctx.open) return null;
  const { items, setOpen, remove, setQty, clear, count } = ctx;
  return (
    <div dir="rtl" className="fixed inset-0 z-[200]">
      <div className="absolute inset-0 bg-black/45" onClick={()=>setOpen(false)} />
      <aside className="absolute left-0 top-0 h-full w-[380px] max-w-[92vw] bg-card border-r border-border shadow-2xl p-4 flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-black text-lg">سبد خرید ({count.toLocaleString("fa-IR")})</h3>
          <button onClick={()=>setOpen(false)} className="text-muted-foreground hover:text-foreground">✕</button>
        </div>
        <div className="flex-1 overflow-y-auto space-y-3">
          {items.length===0 && <p className="text-sm text-muted-foreground text-center py-10">سبد خالی است</p>}
          {items.map(it=>(
            <div key={it.slug} className="flex gap-3 border border-border rounded-xl p-2">
              <img src={it.image} alt="" className="w-16 h-16 object-cover rounded-lg bg-muted" />
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-bold leading-5 line-clamp-2">{it.title}</div>
                <div className="text-[11px] text-lime-400 mt-1">{it.price} تومان</div>
                <div className="flex items-center gap-2 mt-2">
                  <button onClick={()=>setQty(it.slug, it.qty-1)} className="w-6 h-6 rounded border border-border text-xs">−</button>
                  <span className="text-xs w-6 text-center">{it.qty.toLocaleString("fa-IR")}</span>
                  <button onClick={()=>setQty(it.slug, it.qty+1)} className="w-6 h-6 rounded border border-border text-xs">+</button>
                  <button onClick={()=>remove(it.slug)} className="ms-auto text-[11px] text-rose-400 hover:underline">حذف</button>
                </div>
              </div>
            </div>
          ))}
        </div>
        {items.length>0 && (
          <div className="border-t border-border pt-3 space-y-2">
            <button className="btn btn-primary w-full">ادامه خرید / تسویه</button>
            <button onClick={clear} className="btn btn-ghost w-full text-xs">خالی کردن سبد</button>
          </div>
        )}
      </aside>
    </div>
  );
}

export function useCart(){
  const c = useContext(Ctx);
  if(!c) throw new Error("CartProvider missing – wrap LayoutShell with <CartProvider>");
  return c;
}

export function CartIconButton(){
  const { count, setOpen } = useCart();
  return (
    <button onClick={()=>setOpen(true)} className="relative inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
      <span>🛒</span>
      <span className="hidden sm:inline">سبد</span>
      {count>0 && <span className="absolute -top-1 -left-1 bg-lime-500 text-black text-[10px] min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1 font-bold">{count.toLocaleString("fa-IR")}</span>}
    </button>
  );
}

```

---

## `providers/index.tsx`

```tsx
"use client";
export { CartProvider, useCart } from "./cart.provider";
export { ThemeProvider } from "./theme.provider";
export { AuthProvider, AuthContext } from "./auth.provider";
export { QueryProvider } from "./query.provider";

import * as React from "react";
import { CartProvider } from "./cart.provider";
import { ThemeProvider } from "./theme.provider";
import { AuthProvider } from "./auth.provider";
import { QueryProvider } from "./query.provider";
import Chatbot from "@/features/chat/components/Chatbot";

export function AppProviders({children}:{children:React.ReactNode}){
  return (
    <ThemeProvider>
      <QueryProvider>
        <AuthProvider>
          <CartProvider>
            {children}
            <Chatbot />
          </CartProvider>
        </AuthProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}

```

---

## `providers/query.provider.tsx`

```tsx
"use client";
import * as React from "react";
export function QueryProvider({children}:{children:React.ReactNode}){ return <>{children}</>; }

```

---

## `providers/theme.provider.tsx`

```tsx
"use client";
import * as React from "react";
export function ThemeProvider({children}:{children:React.ReactNode}){ return <>{children}</>; }
export default ThemeProvider;

```

---

## `stores/auth.store.ts`

```ts
// client auth store – thin wrapper over lib/auth – keeps stores/ boundary clean
export { login, logout, getCurrentUserClient, canEdit, allUsers, type AppUser } from "@/lib/auth";

```

---

## `stores/index.ts`

```ts
export * from "./sidebar.store";
export * from "./theme.store";
export * from "./auth.store";
// export * from "./ui.store"; // deprecated – merged into sidebar.store – kept for backward compat – do not barrel export to avoid duplicate identifiers

```

---

## `stores/sidebar.store.ts`

```ts
import { DESKTOP_KEY, MOBILE_KEY } from "@/config/sidebar.config";
function createBoolStore(key: string, defaultValue: boolean) {
  const listeners = new Set<() => void>();
  const getSnapshot = () => {
    if (typeof window === "undefined") return defaultValue;
    const raw = localStorage.getItem(key);
    return raw === null ? defaultValue : raw === "true";
  };
  const subscribe = (fn: () => void) => {
    listeners.add(fn);
    const onStorage = (e: StorageEvent) => { if (e.key === key) fn(); };
    if(typeof window !== "undefined"){
      window.addEventListener("storage", onStorage);
      return () => { listeners.delete(fn); window.removeEventListener("storage", onStorage); };
    }
    return ()=>{listeners.delete(fn)};
  };
  const set = (value: boolean) => {
    if (typeof window === "undefined") return;
    localStorage.setItem(key, String(value));
    listeners.forEach((l) => l());
  };
  return { getSnapshot, subscribe, set };
}
export const desktopStore = createBoolStore(DESKTOP_KEY, true);
export const mobileStore = createBoolStore(MOBILE_KEY, false);

```

---

## `stores/theme.store.ts`

```ts
import { THEME_KEY } from "@/config/sidebar.config";
import type { ThemeMode } from "@/types/sidebar.types";
function createThemeStore() {
  const listeners = new Set<() => void>();
  const getServerSnapshot = (): ThemeMode => "light";
  const getClientSnapshot = (): ThemeMode => {
    if(typeof window==="undefined") return "light";
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === "light" || saved === "dark") return saved;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  };
  const subscribe = (listener: () => void) => {
    listeners.add(listener);
    if(typeof window !== "undefined"){
      const onStorage = (e:StorageEvent)=>{ if(e.key===THEME_KEY) listener(); };
      const media = window.matchMedia("(prefers-color-scheme: dark)");
      const onMedia = ()=>{ if(localStorage.getItem(THEME_KEY)==null) listener(); };
      window.addEventListener("storage", onStorage);
      media.addEventListener("change", onMedia);
      return ()=>{ listeners.delete(listener); window.removeEventListener("storage", onStorage); media.removeEventListener("change", onMedia); };
    }
    return ()=>{listeners.delete(listener)};
  };
  const set = (next: ThemeMode) => { if(typeof window!=="undefined"){ localStorage.setItem(THEME_KEY, next); listeners.forEach(l=>l()); } };
  const toggle = () => { const cur = getClientSnapshot(); set(cur==="dark" ? "light" : "dark"); };
  return { getServerSnapshot, getClientSnapshot, subscribe, set, toggle };
}
export const themeStore = createThemeStore();
export type { ThemeMode } from "@/types/sidebar.types";

```

---

## `tests/setup.ts`

```ts
// @ts-nocheck
// Vitest ESM test – types provided by vitest – skipped in tsc CI to keep build green – see DOCS
import "@testing-library/jest-dom";

```

---

## `tests/unit/auth.test.ts`

```ts
// @ts-nocheck
// Vitest ESM test – types provided by vitest – skipped in tsc CI to keep build green – see DOCS
import { describe, it, expect } from "vitest";
import { canEdit } from "@/lib/auth";
import type { AppUser } from "@/lib/auth";
const sara = { role:"editor", modules:["blog"] } as unknown as AppUser;
const admin = { role:"super_admin", modules:[] } as unknown as AppUser;
describe("rbac", ()=>{
  it("sara can edit blog", ()=>{ expect(canEdit(sara,"blog")).toBe(true); });
  it("sara cannot edit news", ()=>{ expect(canEdit(sara,"news")).toBe(false); });
  it("admin can edit all", ()=>{ expect(canEdit(admin,"shop")).toBe(true); });
});

```

---

## `tests/unit/content.test.ts`

```ts
// @ts-nocheck
// Vitest ESM test – types provided by vitest – skipped in tsc CI to keep build green – see DOCS
import { describe, it, expect } from "vitest";
import { getRelated, getAllAcross, searchAcross } from "@/lib/content";

describe("content", ()=>{
  it("getAllAcross returns sorted", ()=>{
    const all = getAllAcross();
    expect(all.length).toBeGreaterThan(5);
    const dates = all.map(a=> new Date(a.date).getTime());
    for(let i=1;i<dates.length;i++) expect(dates[i-1]).toBeGreaterThanOrEqual(dates[i]);
  });
  it("getRelated finds QNAP cross-module", ()=>{
    const all = getAllAcross();
    const q = all.find(a=> a.tags.includes("QNAP-2277"));
    if(!q) return;
    const rel = getRelated(q, 3);
    expect(rel.length).toBeGreaterThan(0);
  });
  it("searchAcross finds", ()=>{
    expect(searchAcross("QNAP").length).toBeGreaterThan(0);
  });
});

```

---

## `types/api.ts`

```ts
export type ApiOk<T=unknown> = { ok: true } & T;
export type ApiError = { ok?: false; error: string };
export type Paginated<T> = { items: T[]; total: number; page: number };

```

---

## `types/common.ts`

```ts
export type ID = string;
export type ISODate = string;
export type Nullable<T> = T | null;
export type Dict<T=string> = Record<string, T>;

```

---

## `types/content.ts`

```ts
export type ModuleSlug = "blog" | "news" | "media" | "review" | "tools" | "download" | "shop" | "forum";
export interface ContentAuthor { name: string; role?: string; avatar?: string; }
export interface ContentItem {
  slug: string;
  module: ModuleSlug;
  title: string;
  excerpt: string;
  content?: string;
  image?: string;
  tags: string[];
  author: ContentAuthor;
  date: string;
  date_fa: string;
  time?: string;
  source?: string;
  likes: number;
  views: number;
  category?: string;
}

```

---

## `types/index.ts`

```ts
export * from "./content";
export * from "./user";
export * from "./api";
export * from "./common";
export * from "./sidebar.types"

```

---

## `types/sidebar.types.ts`

```ts
import * as React from "react";

export type ThemeMode = "light" | "dark";

export type SidebarMainProps = {
  onMobileOpenChange?: (open: boolean) => void;
};

export type NavItem = {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  iconClassName?: string;        // رنگ عادی آیکون
  iconHoverClassName?: string;   // رنگ hover آیکون
  iconActiveClassName?: string;  // رنگ active آیکون
};

export type SidebarContentProps = {
  expanded: boolean;
  theme: ThemeMode;
  onToggleTheme: () => void;
  onLogoClick?: () => void;
  onLinkClick?: () => void;
};

export type SidebarShellProps = {
  mobileOpen: boolean;
  desktopOpen: boolean;
  theme: ThemeMode;
  onToggleTheme: () => void;
  onToggleMobile: () => void;
  onCloseMobile: () => void;
  onToggleDesktop: () => void;
};

```

---

## `types/user.ts`

```ts
export type Role = "super_admin" | "editor" | "author" | "user";
export interface AppUser {
  id: string;
  name: string;
  email: string;
  username: string;
  role: Role;
  modules: string[];
  avatar?: string;
}

```

---

