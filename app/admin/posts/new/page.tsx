"use client";
import { useEffect, useMemo, useState, Suspense } from "react";
import { moduleMeta, type ModuleSlug, getBySlug } from "@/lib/content";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button, ButtonLink } from "@/components/ui/button";
import { getCurrentUserClient } from "@/lib/auth";
import { ModuleBadge } from "@/components/ui/module-badge";
import { BlobUploadField } from "@/components/admin/BlobUploadField";

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

function linesToArray(input: string) {
 return input.split("\n").map((x) => x.trim()).filter(Boolean);
}

function formatBytes(bytes: number) {
 if (!Number.isFinite(bytes) || bytes <= 0) return "";
 const units = ["B", "KB", "MB", "GB"];
 let value = bytes;
 let unit = 0;
 while (value >= 1024 && unit < units.length - 1) { value /= 1024; unit += 1; }
 return `${value >= 10 || unit === 0 ? value.toFixed(0) : value.toFixed(1)} ${units[unit]}`;
}

function parseSpecs(input: string) {
 const trimmed = input.trim();
 if (!trimmed) return {};
 try {
   const parsed = JSON.parse(trimmed);
   return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
 } catch {
   return Object.fromEntries(trimmed.split("\n").map((line) => line.split(":"))
     .filter(([k, v]) => k?.trim() && v?.trim())
     .map(([k, ...rest]) => [k.trim(), rest.join(":").trim()]));
 }
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
 timeline: ["تاریخچه", "رویداد", "معماری", "سخت‌افزار", "نرم‌افزار"],
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
 const [published, setPublished] = useState(true);
 const [videoUrl, setVideoUrl] = useState("");
 const [videoDuration, setVideoDuration] = useState("");
 const [videoMimeType, setVideoMimeType] = useState("");
 const [videoFileSize, setVideoFileSize] = useState("");
 const [gallery, setGallery] = useState("");
 const [fileName, setFileName] = useState("");
 const [fileUrl, setFileUrl] = useState("");
 const [fileSize, setFileSize] = useState("");
 const [rating, setRating] = useState("");
 const [ratingCount, setRatingCount] = useState("");
 const [seoTitle, setSeoTitle] = useState("");
 const [seoDescription, setSeoDescription] = useState("");
 const [brand, setBrand] = useState("");
 const [model, setModel] = useState("");
 const [sku, setSku] = useState("");
 const [priceLabel, setPriceLabel] = useState("");
 const [availability, setAvailability] = useState("");
 const [warranty, setWarranty] = useState("");
 const [specs, setSpecs] = useState("");
 const [saving,setSaving] = useState(false);
 const [msg,setMsg] = useState("");
 const [lastDraftKey, setLastDraftKey] = useState("");

 useEffect(()=>{ getMe().then(setUser); },[]);
 useEffect(()=>{
 let mounted = true;
 async function loadEdit() {
   if (!editSlug) return;
   let it: any = null;
   try {
     const res = await fetch(`/api/posts?module=${encodeURIComponent(module)}&slug=${encodeURIComponent(editSlug)}`, { cache: "no-store" });
     if (res.ok) it = await res.json();
   } catch {}
   if (!it) it = getBySlug(module, editSlug);
   if (!mounted || !it) return;
   setTitle(it.title || "");
   setSlug(it.slug || "");
   setExcerpt(it.excerpt || "");
   setCategory(it.category || "");
   setTags((it.tags || []).join(", "));
   setContent(it.content || "");
   setImage(it.image || "");
   setPublished(typeof it.published === "boolean" ? it.published : true);
   setVideoUrl(it.videoUrl || "");
   setVideoDuration(it.videoDuration || "");
   setVideoMimeType(it.videoMimeType || "");
   setVideoFileSize(it.videoFileSize || "");
   setGallery((it.gallery || []).join("\n"));
   setFileName(it.fileName || "");
   setFileUrl(it.fileUrl || "");
   setFileSize(it.fileSize || "");
   setRating(typeof it.rating === "number" ? String(it.rating) : "");
   setRatingCount(typeof it.ratingCount === "number" ? String(it.ratingCount) : "");
   setSeoTitle(it.seoTitle || "");
   setSeoDescription(it.seoDescription || "");
   setBrand(it.brand || "");
   setModel(it.model || "");
   setSku(it.sku || "");
   setPriceLabel(it.priceLabel || "");
   setAvailability(it.availability || "");
   setWarranty(it.warranty || "");
   setSpecs(it.specs ? JSON.stringify(it.specs, null, 2) : "");
 }
 loadEdit();
 return () => { mounted = false; };
 }, [editSlug, module]);

 const parsedTags = useMemo(() => tags.split(",").map(t=>t.trim()).filter(Boolean), [tags]);
 const resolvedSlug = slug.trim() || slugify(title);

 if (!user) return <main className="p-10 text-center" dir="rtl">ابتدا <Link className="text-[var(--home)] underline" href="/admin/login">وارد شوید</Link></main>;

 const canEdit = user.role==="super_admin" || (user.modules||[]).includes(module);
 if (!canEdit) return <main className="p-10 text-center text-[var(--danger)]" dir="rtl">دسترسی به ماژول {moduleMeta[module]?.titleFa} ندارید.</main>;

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
 published,
 videoUrl: videoUrl.trim() || undefined,
 videoDuration: videoDuration.trim() || undefined,
 videoMimeType: videoMimeType.trim() || undefined,
 videoFileSize: videoFileSize.trim() || undefined,
 gallery: linesToArray(gallery),
 tags: parsedTags,
 category: category.trim() || undefined,
 rating: rating.trim() ? Number(rating) : undefined,
 ratingCount: ratingCount.trim() ? Number(ratingCount) : undefined,
 fileName: fileName.trim() || undefined,
 fileUrl: fileUrl.trim() || undefined,
 fileSize: fileSize.trim() || undefined,
 seoTitle: seoTitle.trim() || undefined,
 seoDescription: seoDescription.trim() || undefined,
 brand: brand.trim() || undefined,
 model: model.trim() || undefined,
 sku: sku.trim() || undefined,
 priceLabel: priceLabel.trim() || undefined,
 availability: availability.trim() || undefined,
 warranty: warranty.trim() || undefined,
 specs: parseSpecs(specs),
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
 const statusClass = isSuccess ? "text-[var(--success)]" : isDraft ? "text-[var(--warning)]" : "paragraph-color";
 
 return (
 <main className="mx-auto max-w-5xl px-4 py-10" dir="rtl">
 <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
 <div>
 <div className="mb-2 flex flex-wrap items-center gap-2">
 <ModuleBadge module={module}>{moduleMeta[module].titleFa}</ModuleBadge>
 {editSlug && <ModuleBadge module="warning">حالت ویرایش</ModuleBadge>}
 </div>
 <h1 className="text-[length:var(--h1-font-size)] text-[var(--h1-font-color)] font-extrabold ">{editSlug ? "ویرایش مطلب" : "مطلب جدید"}</h1>
 <p className="mt-1 text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] paragraph-color">{user.name} • {user.role==="super_admin"?"مدیر کل":"ویراستار"}</p>
 </div>
 <ButtonLink href={`/admin/posts?module=${module}`} variant="ghost" size="xs">بازگشت به مدیریت محتوا</ButtonLink>
 </div>

 <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
 <form onSubmit={save} className="bg-[var(--card-background)] text-[var(--primary-text)] border-[length:var(--border-size)] border-[var(--border-color)] rounded-[var(--corner-radius)] shadow-[var(--shadow-size)] space-y-4 p-5">
 <div className="grid gap-4 md:grid-cols-2">
 <div>
 <label className="text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] paragraph-color">ماژول *</label>
 <select value={module} onChange={e=>setModule(e.target.value as ModuleSlug)} className="input mt-1" required>
 {allowed.map(m => <option key={m} value={m}>{moduleMeta[m].titleFa} – /{m}</option>)}
 </select>
 </div>
 <div>
 <label className="text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] paragraph-color">دسته‌بندی</label>
 <input value={category} onChange={e=>setCategory(e.target.value)} list="category-hints" className="input mt-1" placeholder="مثلا امنیت، شبکه، فریم‌ور…" />
 <datalist id="category-hints">
 {categoryHints[module].map(c => <option key={c} value={c} />)}
 </datalist>
 </div>
 </div>

 <div>
 <label className="text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] paragraph-color">عنوان *</label>
 <input value={title} onChange={e=>setTitle(e.target.value)} className="input mt-1" required />
 </div>

 <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
 <div>
 <label className="text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] paragraph-color">اسلاگ</label>
 <input value={slug} onChange={e=>setSlug(e.target.value)} className="input mt-1" placeholder="auto از عنوان" dir="ltr" />
 </div>
 <Button type="button" variant="ghost" size="xs" onClick={()=>setSlug(slugify(title))} disabled={!title.trim()}>
 ساخت اسلاگ
 </Button>
 </div>

 <div>
 <label className="text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] paragraph-color">خلاصه</label>
 <textarea value={excerpt} onChange={e=>setExcerpt(e.target.value)} className="input mt-1 min-h-[80px]" placeholder="خلاصه کوتاه برای کارت‌ها، فیدها و سئو…" />
 </div>

 <div className="grid gap-3 md:grid-cols-3">
 <div className="md:col-span-2">
 <label className="text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] paragraph-color">برچسب‌ها – با , جدا کنید</label>
 <input value={tags} onChange={e=>setTags(e.target.value)} className="input mt-1" placeholder="QNAP-2277, nas, storage" />
 </div>
 <div>
 <label className="text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] paragraph-color">تصویر شاخص URL</label>
 <input value={image} onChange={e=>setImage(e.target.value)} className="input mt-1" placeholder="https://..." dir="ltr" />
 </div>
 </div>
 <BlobUploadField label="آپلود تصویر شاخص" kind="image" folder={module === "review" ? "review-images" : module === "news" ? "news-images" : "article-images"} accept="image/*" onUploaded={(r) => setImage(r.url)} />

 <div className="rounded-[var(--corner-radius)] border-[length:var(--border-size)] border-[var(--border-color)] bg-[var(--card-background)]/40 p-4 space-y-4">
 <h2 className="font-bold text-[var(--primary-text)]">فیلدهای حرفه‌ای محتوا</h2>
 <div className="grid gap-3 md:grid-cols-2">
 <label className="block"><span className="text-[length:var(--paragraph-font-size)] paragraph-color">SEO Title</span><input value={seoTitle} onChange={e=>setSeoTitle(e.target.value)} className="input mt-1" /></label>
 <label className="block"><span className="text-[length:var(--paragraph-font-size)] paragraph-color">SEO Description</span><input value={seoDescription} onChange={e=>setSeoDescription(e.target.value)} className="input mt-1" /></label>
 </div>

 {module === "media" && (
 <div className="space-y-3 border-t-[length:var(--border-size)] border-[var(--border-color)] pt-4">
 <label className="block"><span className="text-[length:var(--paragraph-font-size)] paragraph-color">Video URL</span><input value={videoUrl} onChange={e=>setVideoUrl(e.target.value)} className="input mt-1" dir="ltr" /></label>
 <div className="grid gap-3 md:grid-cols-3">
 <label className="block"><span className="text-[length:var(--paragraph-font-size)] paragraph-color">Duration</span><input value={videoDuration} onChange={e=>setVideoDuration(e.target.value)} className="input mt-1" placeholder="مثلاً 08:35" dir="ltr" /></label>
 <label className="block"><span className="text-[length:var(--paragraph-font-size)] paragraph-color">MIME Type</span><input value={videoMimeType} onChange={e=>setVideoMimeType(e.target.value)} className="input mt-1" placeholder="video/mp4" dir="ltr" /></label>
 <label className="block"><span className="text-[length:var(--paragraph-font-size)] paragraph-color">Video Size</span><input value={videoFileSize} onChange={e=>setVideoFileSize(e.target.value)} className="input mt-1" placeholder="50 MB" dir="ltr" /></label>
 </div>
 <BlobUploadField label="آپلود ویدیو" kind="video" folder="videos" accept="video/mp4,video/webm,video/quicktime" onUploaded={(r)=>{setVideoUrl(r.url); setVideoMimeType(r.contentType); setVideoFileSize(formatBytes(r.size));}} />
 </div>
 )}

 {module === "download" && (
 <div className="space-y-3 border-t-[length:var(--border-size)] border-[var(--border-color)] pt-4">
 <div className="grid gap-3 md:grid-cols-3">
 <label className="block"><span className="text-[length:var(--paragraph-font-size)] paragraph-color">File Name</span><input value={fileName} onChange={e=>setFileName(e.target.value)} className="input mt-1" dir="ltr" /></label>
 <label className="block"><span className="text-[length:var(--paragraph-font-size)] paragraph-color">File Size</span><input value={fileSize} onChange={e=>setFileSize(e.target.value)} className="input mt-1" dir="ltr" /></label>
 <label className="block"><span className="text-[length:var(--paragraph-font-size)] paragraph-color">File URL</span><input value={fileUrl} onChange={e=>setFileUrl(e.target.value)} className="input mt-1" dir="ltr" /></label>
 </div>
 <BlobUploadField label="آپلود فایل دانلود" kind="download" folder="archive/uploads" onUploaded={(r)=>{setFileUrl(r.url); setFileName(r.fileName); setFileSize(formatBytes(r.size));}} />
 </div>
 )}

 {module === "review" && (
 <div className="grid gap-3 md:grid-cols-2 border-t-[length:var(--border-size)] border-[var(--border-color)] pt-4">
 <label className="block"><span className="text-[length:var(--paragraph-font-size)] paragraph-color">Rating</span><input value={rating} onChange={e=>setRating(e.target.value)} className="input mt-1" type="number" min="0" max="5" step="0.1" /></label>
 <label className="block"><span className="text-[length:var(--paragraph-font-size)] paragraph-color">Rating Count</span><input value={ratingCount} onChange={e=>setRatingCount(e.target.value)} className="input mt-1" type="number" min="0" /></label>
 </div>
 )}

 {module === "shop" && (
 <div className="space-y-3 border-t-[length:var(--border-size)] border-[var(--border-color)] pt-4">
 <div className="grid gap-3 md:grid-cols-3">
 <label className="block"><span className="text-[length:var(--paragraph-font-size)] paragraph-color">Brand</span><input value={brand} onChange={e=>setBrand(e.target.value)} className="input mt-1" /></label>
 <label className="block"><span className="text-[length:var(--paragraph-font-size)] paragraph-color">Model</span><input value={model} onChange={e=>setModel(e.target.value)} className="input mt-1" /></label>
 <label className="block"><span className="text-[length:var(--paragraph-font-size)] paragraph-color">SKU</span><input value={sku} onChange={e=>setSku(e.target.value)} className="input mt-1" /></label>
 <label className="block"><span className="text-[length:var(--paragraph-font-size)] paragraph-color">Price Label</span><input value={priceLabel} onChange={e=>setPriceLabel(e.target.value)} className="input mt-1" /></label>
 <label className="block"><span className="text-[length:var(--paragraph-font-size)] paragraph-color">Availability</span><input value={availability} onChange={e=>setAvailability(e.target.value)} className="input mt-1" /></label>
 <label className="block"><span className="text-[length:var(--paragraph-font-size)] paragraph-color">Warranty</span><input value={warranty} onChange={e=>setWarranty(e.target.value)} className="input mt-1" /></label>
 </div>
 <label className="block"><span className="text-[length:var(--paragraph-font-size)] paragraph-color">Gallery URLs (one per line)</span><textarea value={gallery} onChange={e=>setGallery(e.target.value)} className="input mt-1 min-h-[90px]" dir="ltr" /></label>
 <BlobUploadField label="افزودن تصویر به گالری" kind="image" folder="products" accept="image/*" onUploaded={(r)=>setGallery(g => [g.trim(), r.url].filter(Boolean).join("\n"))} />
 <label className="block"><span className="text-[length:var(--paragraph-font-size)] paragraph-color">Specs JSON یا key:value هر خط</span><textarea value={specs} onChange={e=>setSpecs(e.target.value)} className="input mt-1 min-h-[110px] font-mono" dir="ltr" placeholder={'{"cpu":"..."}'} /></label>
 </div>
 )}
 </div>

 <div>
 <label className="text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] paragraph-color">محتوا</label>
 <textarea value={content} onChange={e=>setContent(e.target.value)} className="input mt-1 min-h-[260px]" placeholder="متن کامل / HTML / Markdown…" />
 </div>

 <label className="flex items-center gap-2 rounded-[var(--corner-radius)] border-[length:var(--border-size)] border-[var(--border-color)] p-3 text-sm paragraph-color">
 <input type="checkbox" checked={published} onChange={(e)=>setPublished(e.target.checked)} />
 <span>{published ? "انتشار عمومی" : "ذخیره به‌عنوان پیش‌نویس"}</span>
 </label>

 <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
 <div className={`text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] ${statusClass}`}>
 {msg || "POST → /api/posts – RBAC server-side؛ در خطا، پیش‌نویس لوکال ذخیره می‌شود."}
 {lastDraftKey && <span className="block text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] paragraph-color">کلید پیش‌نویس: <code>{lastDraftKey}</code></span>}
 </div>
 <div className="flex gap-2">
 <ButtonLink href={`/admin/posts?module=${module}`} variant="ghost" size="xs">انصراف</ButtonLink>
 <Button size="xs" disabled={saving || !title.trim()} type="submit">{saving ? "در حال ذخیره…" : (editSlug ? "ذخیره تغییرات" : (published ? "انتشار در تکباکس" : "ذخیره پیش‌نویس"))}</Button>
 </div>
 </div>
 </form>

 <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
 <div className="bg-[var(--card-background)] text-[var(--primary-text)] border-[length:var(--border-size)] border-[var(--border-color)] rounded-[var(--corner-radius)] shadow-[var(--shadow-size)] p-4">
 <h2 className="text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] ">پیش‌نمایش منبع</h2>
 <div className="mt-3 space-y-2 text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] paragraph-color">
 <div>مسیر: <code dir="ltr">/{module}/{resolvedSlug || "slug"}</code></div>
 <div>دسته: {category || "—"}</div>
 <div>برچسب‌ها: {parsedTags.length.toLocaleString("fa-IR")}</div>
 <div>خلاصه: {excerpt.length.toLocaleString("fa-IR")} کاراکتر</div>
 <div>محتوا: {content.length.toLocaleString("fa-IR")} کاراکتر</div>
 </div>
 <div className="mt-3 flex flex-wrap gap-1">
 {parsedTags.slice(0, 8).map(t => <span key={t} className="rounded-[var(--corner-radius)] border-[length:var(--border-size)] border-[var(--border-color)] px-2 py-0.5 text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] paragraph-color">{t}</span>)}
 {parsedTags.length > 8 && <ModuleBadge module="info">+{(parsedTags.length-8).toLocaleString("fa-IR")}</ModuleBadge>}
 </div>
 </div>

 <div className="bg-[var(--card-background)] text-[var(--primary-text)] border-[length:var(--border-size)] border-[var(--border-color)] rounded-[var(--corner-radius)] shadow-[var(--shadow-size)] overflow-hidden">
 {image && <div className="relative aspect-[16/9] bg-[var(--muted-background)]"><Image src={image} alt="preview" fill sizes="300px" className="object-cover" /></div>}
 <div className="p-4 space-y-2">
 <div className="flex flex-wrap gap-2"><ModuleBadge module={module}>{moduleMeta[module].titleFa}</ModuleBadge>{published ? <ModuleBadge module="success">منتشر می‌شود</ModuleBadge> : <ModuleBadge module="warning">پیش‌نویس</ModuleBadge>}</div>
 <h3 className="font-black text-[var(--primary-text)] line-clamp-2">{title || "عنوان مطلب"}</h3>
 <p className="paragraph-color text-xs line-clamp-3">{excerpt || "خلاصه مطلب اینجا دیده می‌شود."}</p>
 </div>
 </div>

 <div className="bg-[var(--card-background)] text-[var(--primary-text)] border-[length:var(--border-size)] border-[var(--border-color)] rounded-[var(--corner-radius)] shadow-[var(--shadow-size)] p-4 text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] paragraph-color">
 <b className="text-[var(--primary-text)]">راهنمای CMS</b><br/>
 • اسلاگ اگر خالی باشد از عنوان ساخته می‌شود.<br/>
 • دسته‌بندی اختیاری است ولی برای فیلتر و جدول مفید است.<br/>
 • برچسب‌های فارسی/انگلیسی باعث بهتر شدن جستجو و مطالب مرتبط می‌شوند.<br/>
 • اگر API/Prisma آماده نباشد، پیش‌نویس در مرورگر ذخیره می‌شود.
 </div>
 </aside>
 </div>

 <p className="mt-3 text-center text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] paragraph-color">
 دسترسی شما:
 <span className="mx-1 inline-flex flex-wrap justify-center gap-1 align-middle">{allowed.map(m=><ModuleBadge key={m} module={m}>{moduleMeta[m]?.titleFa}</ModuleBadge>)}</span>
 – نقش توسط مدیر کل در <Link href="/admin/roles" className="text-[var(--home)] underline">/admin/roles</Link> قابل تغییر است.
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
