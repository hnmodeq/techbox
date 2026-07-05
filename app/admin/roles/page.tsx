"use client";
import { useEffect, useMemo, useState } from "react";
import { moduleMeta, type ModuleSlug } from "@/lib/content";
import { Button } from "@/components/ui/Button";
import { ModuleBadge } from "@/components/ui/ModuleBadge";
import { Badge } from "@/components/ui/Badge";

type RoleRow = { id:string; name:string; titleFa:string; modules:ModuleSlug[]; users:number };

const seedRoles: RoleRow[] = [
 {id:"r1", name:"super_admin", titleFa:"مدیر کل", modules:["blog","news","media","review","tools","download","shop","forum"], users:1},
 {id:"r2", name:"blog_editor", titleFa:"ویراستار مجله", modules:["blog"], users:1},
 {id:"r3", name:"news_editor", titleFa:"دبیر اخبار", modules:["news"], users:1},
 {id:"r4", name:"media_creator", titleFa:"تولیدکننده ویدیو", modules:["media","review"], users:1},
];

const STORAGE_KEY = "tb_roles_v4";
const protectedRoleIds = new Set(seedRoles.map(r => r.id));

function normalizeRoleName(value: string) {
 return value.trim().toLowerCase().replace(/\s+/g,"_").replace(/[^a-z0-9_\-]/g, "");
}

export default function RolesPage(){
 const [roles,setRoles]=useState<RoleRow[]>(seedRoles);
 const [name,setName]=useState("");
 const [titleFa,setTitleFa]=useState("");
 const [mods,setMods]=useState<Record<ModuleSlug,boolean>>({} as Record<ModuleSlug, boolean>);
 const [msg,setMsg]=useState("");

 useEffect(()=>{
 const saved = localStorage.getItem(STORAGE_KEY);
 if(saved){ try{ setRoles(JSON.parse(saved)); }catch{} }
 },[]);
 useEffect(()=>{ localStorage.setItem(STORAGE_KEY, JSON.stringify(roles)); },[roles]);

 const allMods = Object.keys(moduleMeta) as ModuleSlug[];
 const selectedModules = useMemo(() => Object.entries(mods).filter(([,v])=>v).map(([k])=>k as ModuleSlug), [mods]);
 const totalAssignments = roles.reduce((sum, role) => sum + role.modules.length, 0);
 const customRoles = roles.filter(r => !protectedRoleIds.has(r.id)).length;

 const toggleMod = (m:ModuleSlug)=> setMods(prev=>({...prev, [m]: !prev[m]}));
 const selectAllModules = () => setMods(Object.fromEntries(allMods.map(m => [m, true])) as Record<ModuleSlug, boolean>);
 const clearModules = () => setMods({} as Record<ModuleSlug, boolean>);

 const createRole = (e:React.FormEvent)=>{
 e.preventDefault();
 setMsg("");
 const normalized = normalizeRoleName(name);
 if(!normalized || !titleFa.trim() || selectedModules.length===0){
 setMsg("نام نقش، عنوان فارسی و حداقل یک ماژول الزامی است.");
 return;
 }
 if(roles.some(r => r.name === normalized)){
 setMsg("این نام نقش قبلاً ثبت شده است.");
 return;
 }
 setRoles(r=>[{ id:"r"+Date.now(), name: normalized, titleFa: titleFa.trim(), modules: selectedModules, users:0 }, ...r]);
 setName(""); setTitleFa(""); setMods({} as Record<ModuleSlug, boolean>);
 setMsg("نقش جدید به‌صورت لوکال ذخیره شد.");
 };

 const deleteRole = (role: RoleRow) => {
 if (protectedRoleIds.has(role.id)) {
 setMsg("نقش‌های پیش‌فرض قابل حذف نیستند.");
 return;
 }
 if (role.users > 0) {
 setMsg("نقشی که کاربر فعال دارد قابل حذف نیست.");
 return;
 }
 if (!confirm(`نقش «${role.titleFa}» حذف شود؟`)) return;
 setRoles(prev => prev.filter(r => r.id !== role.id));
 setMsg("نقش سفارشی حذف شد.");
 };

 const resetRoles = () => {
 if (!confirm("نقش‌های لوکال حذف و نقش‌های پیش‌فرض بازیابی شوند؟")) return;
 setRoles(seedRoles);
 setName(""); setTitleFa(""); setMods({} as Record<ModuleSlug, boolean>);
 localStorage.setItem(STORAGE_KEY, JSON.stringify(seedRoles));
 setMsg("نقش‌های پیش‌فرض بازیابی شدند.");
 };

 return (
 <main className="mx-auto max-w-6xl px-4 py-10" dir="rtl">
 <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
 <div>
 <h1 className="text-[length:var(--h1-font-size)] text-[var(--h1-font-color)] font-extrabold ">مدیریت نقش‌ها – RBAC</h1>
 <p className="mt-1 text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] paragraph-color">مدیر کل می‌تواند نقش بسازد و دسترسی ماژول‌ها را تعیین کند. این نسخه فعلاً لوکال و آماده اتصال به Prisma Role table است.</p>
 </div>
 <div className="flex flex-wrap gap-2">
 <ModuleBadge module="success">super_admin only</ModuleBadge>
 <Button variant="ghost" size="xs" onClick={resetRoles}>بازنشانی نقش‌ها</Button>
 </div>
 </div>

 <div className="mb-5 grid gap-3 sm:grid-cols-3">
 <div className="card p-3">
 <div className="text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] paragraph-color">کل نقش‌ها</div>
 <div className="mt-1 text-[length:var(--h2-font-size)] text-[var(--h2-font-color)] font-bold ">{roles.length.toLocaleString("fa-IR")}</div>
 </div>
 <div className="card p-3">
 <div className="text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] paragraph-color">نقش سفارشی</div>
 <div className="mt-1 text-[length:var(--h2-font-size)] text-[var(--h2-font-color)] font-bold ">{customRoles.toLocaleString("fa-IR")}</div>
 </div>
 <div className="card p-3">
 <div className="text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] paragraph-color">دسترسی ماژولی</div>
 <div className="mt-1 text-[length:var(--h2-font-size)] text-[var(--h2-font-color)] font-bold ">{totalAssignments.toLocaleString("fa-IR")}</div>
 </div>
 </div>

 <div className="grid items-start gap-5 lg:grid-cols-3">
 <form onSubmit={createRole} className="card space-y-3 p-4 lg:sticky lg:top-24 lg:col-span-1">
 <div className="flex items-center justify-between gap-2">
 <h3 className="text-[length:var(--h3-font-size)] text-[var(--h3-font-color)] font-semibold ">نقش جدید</h3>
 {selectedModules.length > 0 && <Badge variant="info">{selectedModules.length.toLocaleString("fa-IR")} ماژول</Badge>}
 </div>
 <div>
 <label className="text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] paragraph-color">نام نقش لاتین *</label>
 <input value={name} onChange={e=>setName(e.target.value)} className="input mt-1 text-[length:var(--h3-font-size)] text-[var(--h3-font-color)] font-semibold" placeholder="role_name – ex: blog_editor" dir="ltr" />
 {name && <div className="mt-1 text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] paragraph-color">ذخیره به صورت: <code>{normalizeRoleName(name) || "—"}</code></div>}
 </div>
 <div>
 <label className="text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] paragraph-color">عنوان فارسی *</label>
 <input value={titleFa} onChange={e=>setTitleFa(e.target.value)} className="input mt-1 text-[length:var(--h3-font-size)] text-[var(--h3-font-color)] font-semibold" placeholder="مثلا ویراستار مجله" />
 </div>
 <div>
 <div className="mb-2 flex items-center justify-between gap-2">
 <div className="text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] paragraph-color">دسترسی ماژول‌ها *</div>
 <div className="flex gap-1">
 <Button type="button" variant="link" size="xs" onClick={selectAllModules} className="text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)]">همه</Button>
 <Button type="button" variant="link" size="xs" onClick={clearModules} className="text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] text-[var(--tb-danger)]">پاک</Button>
 </div>
 </div>
 <div className="grid grid-cols-2 gap-2 text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)]">
 {allMods.map(m=>(
 <label key={m} className={`flex cursor-pointer items-center gap-2 rounded-[var(--corner-radius)] border p-2 transition-colors ${mods[m] ? "border-[color-mix(in_oklch,var(--home)_40%,transparent)] bg-[color-mix(in_oklch,var(--home)_10%,transparent)]" : "border-[var(--border-color)] hover:bg-[var(--muted-background)]"}`}>
 <input type="checkbox" checked={!!mods[m]} onChange={()=>toggleMod(m)} />
 <ModuleBadge module={m}>{moduleMeta[m].titleFa}</ModuleBadge>
 </label>
 ))}
 </div>
 </div>
 <Button size="xs" className="w-full">ایجاد نقش +</Button>
 <p className="text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] paragraph-color">
 ذخیره در: <code>{STORAGE_KEY}</code> + آماده POST <code>/api/roles</code> – در پروداکشن به Prisma Role table متصل می‌شود.
 </p>
 {msg && <p className={`text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] ${msg.includes("الزامی") || msg.includes("قبلاً") || msg.includes("قابل") ? "text-[var(--tb-warning)]" : "text-[var(--tb-success)]"}`}>{msg}</p>}
 </form>

 <div className="card overflow-hidden p-0 lg:col-span-2">
 <div className="overflow-x-auto">
 <table className="w-full min-w-[720px] text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)]">
 <thead className="bg-[var(--muted-background)]/50 text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] paragraph-color">
 <tr>
 <th className="p-3 text-right">نقش</th>
 <th className="p-3 text-right">دسترسی ماژول</th>
 <th className="p-3 text-right">وضعیت</th>
 <th className="p-3 text-right">کاربران</th>
 <th className="p-3 text-right">عملیات</th>
 </tr>
 </thead>
 <tbody>
 {roles.map(r=>{
 const protectedRole = protectedRoleIds.has(r.id);
 return (
 <tr key={r.id} className="border-t border-[var(--border-color)] hover:bg-[var(--muted-background)]/20">
 <td className="p-3 align-top">
 <div className="">{r.titleFa}</div>
 <div className="font-mono text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] paragraph-color">{r.name}</div>
 </td>
 <td className="p-3 align-top">
 <div className="flex flex-wrap gap-1">
 {r.modules.map(m=>(
 <ModuleBadge key={m} module={m} className="text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)]">{moduleMeta[m]?.titleFa || m}</ModuleBadge>
 ))}
 </div>
 </td>
 <td className="p-3 align-top">
 {protectedRole ? <Badge variant="secondary">پیش‌فرض</Badge> : <Badge variant="info">سفارشی</Badge>}
 </td>
 <td className="p-3 align-top text-center">{r.users.toLocaleString("fa-IR")}</td>
 <td className="p-3 align-top text-right text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)]">
 <div className="flex flex-wrap gap-2">
 <Button variant="link" size="xs" className="text-[var(--home)]" disabled>ویرایش</Button>
 <Button variant="link" size="xs" className="text-[var(--tb-danger)]" disabled={protectedRole || r.users > 0} onClick={()=>deleteRole(r)}>حذف</Button>
 </div>
 </td>
 </tr>
 );
 })}
 </tbody>
 </table>
 </div>
 </div>
 </div>

 <div className="card mt-6 p-4 text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] paragraph-color">
 <b className="text-[var(--primary-text)]">نقش‌های پیش‌فرض تکباکس:</b><br/>
 • <b>super_admin</b> (admin) – همه ۸ ماژول – مدیر کل<br/>
 • <b>blog_editor</b> (sara) – مجله<br/>
 • <b>news_editor</b> (nima) – اخبار<br/>
 • <b>media_creator</b> (rojina) – رسانه + نقد و بررسی<br/>
 • نقش‌های سفارشی فعلاً در مرورگر ذخیره می‌شوند و برای اتصال به API/Prisma آماده‌اند.
 </div>
 </main>
 );
}
