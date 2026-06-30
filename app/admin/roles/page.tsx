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
        <span className="text-[11px] px-2 py-1 rounded-full bg-[color-mix(in_oklch,var(--tb-success)_10%,transparent)] text-[var(--tb-success)] border border-[color-mix(in_oklch,var(--tb-success)_20%,transparent)]">super_admin only</span>
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
                    <button className="hover:text-[var(--tb-danger)]">حذف</button>
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
